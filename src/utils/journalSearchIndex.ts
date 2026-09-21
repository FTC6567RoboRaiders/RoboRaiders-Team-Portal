import { JournalEntry, Subteam } from '../types';

export type SearchableField = 'title' | 'planned' | 'accomplished' | 'all';

export interface FieldMatchFlags {
  title: boolean;
  planned: boolean;
  accomplished: boolean;
  other: boolean;
}

export interface SearchResultItem {
  entry: JournalEntry;
  score: number;
  matches: FieldMatchFlags;
  matchedFieldNames: string[];
  snippets: {
    title?: string;
    planned?: string;
    accomplished?: string;
  };
}

export interface SearchIndexOptions {
  fields?: ('title' | 'planned' | 'accomplished')[];
  matchMode?: 'all' | 'any' | 'exact';
  subteam?: Subteam | 'All';
  status?: string;
  startDate?: string;
  endDate?: string;
  author?: string;
  entryType?: 'All' | 'subteam' | 'general_meeting';
}

/**
 * Tokenize and normalize text for inverted indexing.
 * Strips punctuation, handles diacritics, splits into word tokens.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Split by non-alphanumeric characters (except keep words)
  const tokens = normalized
    .replace(/[^\w\s-]/g, ' ')
    .split(/[\s-]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return tokens;
}

/**
 * Extract tokens with frequency counts
 */
function getTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

interface IndexedDoc {
  entry: JournalEntry;
  titleTokens: Map<string, number>;
  plannedTokens: Map<string, number>;
  accomplishedTokens: Map<string, number>;
  otherTokens: Map<string, number>;
  rawTitle: string;
  rawPlanned: string;
  rawAccomplished: string;
  allRawText: string;
}

export class JournalFullTextIndex {
  private docs: Map<string, IndexedDoc> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private entriesCount: number = 0;

  constructor(entries: JournalEntry[] = []) {
    this.buildIndex(entries);
  }

  /**
   * Rebuild the full inverted index from an array of JournalEntry documents
   */
  public buildIndex(entries: JournalEntry[]): void {
    this.docs.clear();
    this.invertedIndex.clear();
    this.entriesCount = entries.length;

    for (const entry of entries) {
      this.indexEntry(entry);
    }
  }

  /**
   * Index a single journal entry across title, planned, and accomplished fields
   */
  private indexEntry(entry: JournalEntry): void {
    const rawTitle = entry.title || '';
    const rawPlanned = entry.planned || '';
    const rawAccomplished = entry.accomplished || '';
    
    // Supplementary metadata
    const problems = Array.isArray(entry.problemsAndSolutions) ? entry.problemsAndSolutions.join(' ') : '';
    const planNext = entry.planNextTime || '';
    const agenda = entry.agenda || '';
    const abcs = (entry.abcs || []).map(a => `${a.name} ${a.accomplishments} ${a.blockers} ${a.commitments}`).join(' ');
    const todos = (entry.finalTodoList || []).map(t => `${t.task} ${t.assignee || ''}`).join(' ');
    const author = entry.author || '';
    const subteam = entry.subteam || '';
    const date = entry.date || '';

    const titleTokens = getTermFrequencies(tokenizeText(rawTitle));
    const plannedTokens = getTermFrequencies(tokenizeText(rawPlanned));
    const accomplishedTokens = getTermFrequencies(tokenizeText(rawAccomplished));
    const otherTokens = getTermFrequencies(tokenizeText(`${problems} ${planNext} ${agenda} ${abcs} ${todos} ${author} ${subteam} ${date}`));

    const allRawText = [
      rawTitle,
      rawPlanned,
      rawAccomplished,
      problems,
      planNext,
      agenda,
      abcs,
      todos,
      author,
      subteam,
      date
    ].join(' ').toLowerCase();

    const indexedDoc: IndexedDoc = {
      entry,
      titleTokens,
      plannedTokens,
      accomplishedTokens,
      otherTokens,
      rawTitle,
      rawPlanned,
      rawAccomplished,
      allRawText
    };

    this.docs.set(entry.id, indexedDoc);

    // Populate inverted index
    const allUniqueTokens = new Set([
      ...titleTokens.keys(),
      ...plannedTokens.keys(),
      ...accomplishedTokens.keys(),
      ...otherTokens.keys()
    ]);

    for (const token of allUniqueTokens) {
      let docSet = this.invertedIndex.get(token);
      if (!docSet) {
        docSet = new Set();
        this.invertedIndex.set(token, docSet);
      }
      docSet.add(entry.id);
    }
  }

  /**
   * Search simultaneously across title, planned, and accomplished fields
   */
  public search(
    query: string,
    options: SearchIndexOptions = {}
  ): SearchResultItem[] {
    const trimmedQuery = query.trim();
    const activeFields = options.fields && options.fields.length > 0 
      ? options.fields 
      : ['title', 'planned', 'accomplished'];
    const matchMode = options.matchMode || 'all';

    const results: SearchResultItem[] = [];

    // If query is empty, return all matching filters with base score
    if (!trimmedQuery) {
      for (const doc of this.docs.values()) {
        if (!this.matchesGeneralFilters(doc.entry, options)) continue;
        results.push({
          entry: doc.entry,
          score: 1,
          matches: { title: false, planned: false, accomplished: false, other: false },
          matchedFieldNames: [],
          snippets: {}
        });
      }
      return results;
    }

    const queryTokens = tokenizeText(trimmedQuery);
    const lowerQuery = trimmedQuery.toLowerCase();

    for (const doc of this.docs.values()) {
      if (!this.matchesGeneralFilters(doc.entry, options)) continue;

      let totalScore = 0;
      let titleMatched = false;
      let plannedMatched = false;
      let accomplishedMatched = false;
      let otherMatched = false;

      // Check field matches for each query token
      let tokensMatchedCount = 0;

      for (const qToken of queryTokens) {
        let tokenFoundInAnyField = false;

        // 1. Check Title (Weight: 3.5)
        if (activeFields.includes('title')) {
          const tf = this.findTokenFrequency(doc.titleTokens, qToken);
          if (tf > 0) {
            totalScore += tf * 3.5;
            titleMatched = true;
            tokenFoundInAnyField = true;
          }
        }

        // 2. Check Planned (Weight: 2.5)
        if (activeFields.includes('planned')) {
          const tf = this.findTokenFrequency(doc.plannedTokens, qToken);
          if (tf > 0) {
            totalScore += tf * 2.5;
            plannedMatched = true;
            tokenFoundInAnyField = true;
          }
        }

        // 3. Check Accomplished (Weight: 2.5)
        if (activeFields.includes('accomplished')) {
          const tf = this.findTokenFrequency(doc.accomplishedTokens, qToken);
          if (tf > 0) {
            totalScore += tf * 2.5;
            accomplishedMatched = true;
            tokenFoundInAnyField = true;
          }
        }

        // 4. Other metadata fields
        const tfOther = this.findTokenFrequency(doc.otherTokens, qToken);
        if (tfOther > 0) {
          totalScore += tfOther * 1.0;
          otherMatched = true;
          tokenFoundInAnyField = true;
        }

        if (tokenFoundInAnyField) {
          tokensMatchedCount++;
        }
      }

      // Check match mode
      if (matchMode === 'all' && tokensMatchedCount < queryTokens.length) {
        // Did not match all tokens across fields
        continue;
      }

      if (matchMode === 'any' && tokensMatchedCount === 0) {
        continue;
      }

      // Exact substring bonuses
      if (doc.rawTitle.toLowerCase().includes(lowerQuery)) {
        totalScore += 10.0;
        titleMatched = true;
      }
      if (doc.rawPlanned.toLowerCase().includes(lowerQuery)) {
        totalScore += 8.0;
        plannedMatched = true;
      }
      if (doc.rawAccomplished.toLowerCase().includes(lowerQuery)) {
        totalScore += 8.0;
        accomplishedMatched = true;
      }

      // Simultaneous Multi-field Match Bonus:
      // If matches occur simultaneously in multiple core fields, boost score!
      const activeCoreMatches = [titleMatched, plannedMatched, accomplishedMatched].filter(Boolean).length;
      if (activeCoreMatches === 3) {
        totalScore *= 2.2; // Triple field bonus (matched title, planned, and accomplished simultaneously)
      } else if (activeCoreMatches === 2) {
        totalScore *= 1.6; // Dual field bonus
      }

      if (totalScore > 0 || (tokensMatchedCount > 0 && matchMode === 'any')) {
        const matchedFieldNames: string[] = [];
        if (titleMatched) matchedFieldNames.push('Title');
        if (plannedMatched) matchedFieldNames.push('Planned');
        if (accomplishedMatched) matchedFieldNames.push('Accomplished');
        if (otherMatched && matchedFieldNames.length === 0) matchedFieldNames.push('Notes');

        results.push({
          entry: doc.entry,
          score: totalScore,
          matches: {
            title: titleMatched,
            planned: plannedMatched,
            accomplished: accomplishedMatched,
            other: otherMatched
          },
          matchedFieldNames,
          snippets: {
            title: titleMatched ? this.createSnippet(doc.rawTitle, queryTokens) : undefined,
            planned: plannedMatched ? this.createSnippet(doc.rawPlanned, queryTokens) : undefined,
            accomplished: accomplishedMatched ? this.createSnippet(doc.rawAccomplished, queryTokens) : undefined
          }
        });
      }
    }

    // Sort by highest relevance score first, then newest date
    return results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (b.entry.createdAt || 0) - (a.entry.createdAt || 0);
    });
  }

  /**
   * Helper to check partial prefix/exact token frequency
   */
  private findTokenFrequency(tokenMap: Map<string, number>, queryToken: string): number {
    // 1. Exact match
    const exact = tokenMap.get(queryToken);
    if (exact !== undefined) return exact * 2;

    // 2. Prefix / Substring match
    let count = 0;
    for (const [token, freq] of tokenMap.entries()) {
      if (token.startsWith(queryToken)) {
        count += freq * 1.2;
      } else if (token.includes(queryToken) && queryToken.length >= 3) {
        count += freq * 0.8;
      }
    }
    return count;
  }

  /**
   * Filter check for non-text filters
   */
  private matchesGeneralFilters(entry: JournalEntry, options: SearchIndexOptions): boolean {
    if (options.entryType && options.entryType !== 'All') {
      const currentType = entry.entryType || 'subteam';
      if (currentType !== options.entryType) return false;
    }
    if (options.subteam && options.subteam !== 'All' && entry.subteam !== options.subteam) {
      return false;
    }
    if (options.author && options.author.trim() && !entry.author.toLowerCase().includes(options.author.toLowerCase())) {
      return false;
    }
    if (options.startDate && entry.date < options.startDate) {
      return false;
    }
    if (options.endDate && entry.date > options.endDate) {
      return false;
    }
    if (options.status && options.status !== 'All') {
      const s = entry.status || 'Pending Review';
      if (s !== options.status) return false;
    }
    return true;
  }

  /**
   * Generate contextual snippet around matched terms
   */
  private createSnippet(text: string, queryTokens: string[], maxLength: number = 140): string {
    if (!text) return '';
    const lower = text.toLowerCase();
    
    // Find first occurrence of any query token
    let firstIdx = -1;
    for (const token of queryTokens) {
      const idx = lower.indexOf(token);
      if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
        firstIdx = idx;
      }
    }

    if (firstIdx === -1) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    const start = Math.max(0, firstIdx - 40);
    const end = Math.min(text.length, start + maxLength);
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    return snippet;
  }

  public getIndexStats() {
    return {
      entriesCount: this.entriesCount,
      uniqueTermsCount: this.invertedIndex.size
    };
  }
}

/**
 * Generate normalized search tokens array for saving on JournalEntry records
 */
export function generateSearchTokens(entry: Partial<JournalEntry>): string[] {
  const parts = [
    entry.title || '',
    entry.planned || '',
    entry.accomplished || '',
    entry.planNextTime || '',
    entry.author || '',
    entry.subteam || '',
    entry.date || '',
    Array.isArray(entry.problemsAndSolutions) ? entry.problemsAndSolutions.join(' ') : ''
  ];
  const allTokens = tokenizeText(parts.join(' '));
  return Array.from(new Set(allTokens));
}
