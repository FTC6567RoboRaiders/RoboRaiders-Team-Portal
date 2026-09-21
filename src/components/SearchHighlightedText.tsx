import React from 'react';
import { tokenizeText } from '../utils/journalSearchIndex';

interface SearchHighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export const SearchHighlightedText: React.FC<SearchHighlightedTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-yellow-200/90 dark:bg-amber-500/30 text-slate-900 dark:text-amber-200 font-bold px-0.5 rounded-xs'
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const queryTokens = tokenizeText(query).filter(t => t.length > 1);
  if (queryTokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape regex special chars in tokens
  const regexPattern = queryTokens
    .map(token => token.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'))
    .join('|');

  try {
    const regex = new RegExp(`(${regexPattern})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, i) => {
          const isMatch = queryTokens.some(
            t => t.toLowerCase() === part.toLowerCase()
          );
          if (isMatch) {
            return (
              <mark key={i} className={highlightClassName}>
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  } catch {
    return <span className={className}>{text}</span>;
  }
};
