import React from 'react';

/**
 * Utility to convert plain text URLs into clickable links.
 */
export const linkify = (text, isMine = false) => {
  if (!text) return text;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`underline break-all font-bold ${isMine ? 'text-white hover:text-blue-100' : 'text-primary hover:text-primary/70'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};
