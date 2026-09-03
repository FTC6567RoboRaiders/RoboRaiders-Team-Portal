import { JournalEntry } from '../types';

export const getEntryReferenceCode = (entry: JournalEntry, allEntries: JournalEntry[] = []): string => {
  // If the entry already has a custom id format (e.g., demo-1), use a neat fallback
  if (entry.id === 'demo-1') return 'FTC-BUIL-0001';
  if (entry.id === 'demo-2') return 'FTC-PROG-0002';
  
  const subteamStr = (entry.subteam || '').toUpperCase();
  let prefix = 'MISC';
  if (subteamStr.startsWith('DESIGN') || subteamStr.includes('FABRICATION') || subteamStr.includes('BUILD')) {
    prefix = 'DESI';
  } else if (subteamStr.startsWith('PROGRAM')) {
    prefix = 'PROG';
  } else if (subteamStr.startsWith('OUTREACH')) {
    prefix = 'OUTR';
  } else if (subteamStr.startsWith('BUSINESS') || subteamStr.includes('MEDIA')) {
    prefix = 'BUSI';
  } else if (subteamStr.startsWith('INSPIRE')) {
    prefix = 'INSP';
  } else if (subteamStr.startsWith('STRATEGY')) {
    prefix = 'STRA';
  } else if (subteamStr.startsWith('MENTOR')) {
    prefix = 'MENT';
  } else {
    prefix = subteamStr.substring(0, 4).toUpperCase();
    if (prefix.length < 4) prefix = prefix.padEnd(4, 'X');
  }

  // Ensure unique reference index chronologically by filtering and sorting allEntries
  const filterList = allEntries && allEntries.length > 0 ? allEntries : [entry];
  const sameSubteamEntries = filterList
    .filter((e) => {
      const eSubStr = (e.subteam || '').toUpperCase();
      let ePrefix = 'MISC';
      if (eSubStr.startsWith('DESIGN') || eSubStr.includes('FABRICATION') || eSubStr.includes('BUILD')) {
        ePrefix = 'DESI';
      } else if (eSubStr.startsWith('PROGRAM')) {
        ePrefix = 'PROG';
      } else if (eSubStr.startsWith('OUTREACH')) {
        ePrefix = 'OUTR';
      } else if (eSubStr.startsWith('BUSINESS') || eSubStr.includes('MEDIA')) {
        ePrefix = 'BUSI';
      } else if (eSubStr.startsWith('INSPIRE')) {
        ePrefix = 'INSP';
      } else if (eSubStr.startsWith('STRATEGY')) {
        ePrefix = 'STRA';
      } else if (eSubStr.startsWith('MENTOR')) {
        ePrefix = 'MENT';
      } else {
        ePrefix = eSubStr.substring(0, 4).toUpperCase();
        if (ePrefix.length < 4) ePrefix = ePrefix.padEnd(4, 'X');
      }
      return ePrefix === prefix;
    })
    .sort((a, b) => {
      // Sort chronologically by date first, then by createdAt or id
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return (a.id || '').localeCompare(b.id || '');
    });

  const idx = sameSubteamEntries.findIndex((e) => e.id === entry.id);
  const numVal = idx !== -1 ? idx + 1 : 1;
  const paddedNum = String(numVal).padStart(4, '0');

  return `FTC-${prefix}-${paddedNum}`;
};
