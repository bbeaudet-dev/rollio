/**
 * Description Formatter
 * 
 * Simple markup-based formatter:
 * - [value PTS/MLT/EXP] - Scoring elements (bold + colored)
 * - {Concept} - Game concepts (bold + colored)
 * - [number] - Dynamic values (replaced with actual value from values prop)
 * - {key} - Dynamic values (replaced with actual value from values prop)
 * 
 * Example: "Increment [+20 PTS] per {Straight} played (Current: +[20] PTS)"
 */

import React from 'react';
import { SCORING_ELEMENT_COLORS, GAME_CONCEPT_COLORS } from './colors';

export interface FormatValues {
  [key: string]: string | number | undefined;
}

/**
 * Parse and format a description string with markup
 */
export function formatDescription(
  description: string,
  values?: FormatValues
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const matches: Array<{
    type: 'scoring' | 'concept' | 'dynamic';
    start: number;
    end: number;
    value?: string;
    unit?: string;
    key?: string;
    originalText: string;
  }> = [];
  
  // Find all scoring elements: [value PTS/MLT/EXP/MONEY] or +value PTS, 2x MLT, ^1.1 EXP, +2^n MLT, $5 MONEY
  // Handle +[number] PTS format for dynamic values FIRST (highest priority)
  // This pattern matches: +[20] PTS or [20] PTS
  const dynamicBracketPattern = /(\+?)\[(\d+(?:\.\d+)?)\]\s+(PTS|MLT|EXP|MONEY)/g;
  let match: RegExpExecArray | null;
  while ((match = dynamicBracketPattern.exec(description)) !== null) {
    const prefix = match[1]; // The + sign if present (empty string if not)
    const value = match[2]; // The number inside brackets
    const unit = match[3]; // PTS/MLT/EXP
    const originalText = match[0]; // e.g., "+[20] PTS" or "[20] PTS"
    
    // Check if already matched
    const overlaps = matches.some(m => 
      match!.index < m.end && match!.index + match![0].length > m.start
    );
    if (overlaps) continue;
    
    // This is a dynamic value placeholder like [20] - always try to replace it
    const dynamicValue = values?.currentValue;
    if (dynamicValue !== undefined) {
      matches.push({
        type: 'scoring',
        start: match.index,
        end: match.index + match[0].length,
        value: String(dynamicValue),
        unit,
        originalText: originalText // Keep original to detect + prefix
      });
    } else {
      // No value provided, show placeholder as static (fallback)
      matches.push({
        type: 'scoring',
        start: match.index,
        end: match.index + match[0].length,
        value,
        unit,
        originalText
      });
    }
  }
  
  // Find money patterns: $5, +$2, $amount (check before other patterns to avoid conflicts)
  const moneyPattern = /([+-]?)\$(\d+(?:\.\d+)?)/g;
  match = null;
  moneyPattern.lastIndex = 0;
  while ((match = moneyPattern.exec(description)) !== null) {
    const prefix = match[1]; // The + or - sign if present (empty string if not)
    const value = match[2];
    const originalText = match[0];
    
    // Check if already matched
    const overlaps = matches.some(m => 
      match!.index < m.end && match!.index + match![0].length > m.start
    );
    if (overlaps) continue;
    
    matches.push({
      type: 'scoring',
      start: match.index,
      end: match.index + match[0].length,
      value: prefix ? `${prefix}$${value}` : `$${value}`,
      unit: 'MONEY',
      originalText
    });
  }
  
  // Find other scoring elements
  const scoringPatterns = [
    /\[([^\]]+)\s+(PTS|MLT|EXP|MONEY)\]/g,  // [value PTS] format
    /([+-]\d+(?:\.\d+)?)\s+(PTS|MLT|EXP|MONEY)/g,  // +25 PTS format
    /(\d+(?:\.\d+)?)x\s+(MLT|EXP)/g,  // 2x MLT format
    /\^(\d+(?:\.\d+)?)\s+EXP/g,  // ^1.1 EXP format
    /([+-]\d+\^[a-z])\s+(MLT|EXP)/g,  // +2^n MLT format
  ];
  
  for (const pattern of scoringPatterns) {
    match = null;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(description)) !== null) {
      const value = match[1];
      const unit = match[2];
      const originalText = match[0];
      
      // Check if already matched
      const overlaps = matches.some(m => 
        match!.index < m.end && match!.index + match![0].length > m.start
      );
      if (overlaps) continue;
      
      // Check if this is a dynamic placeholder {key}
      const braceMatch = /\{([^}]+)\}/.exec(value);
      if (braceMatch) {
        const key = braceMatch[1];
        const dynamicValue = values?.[key];
        if (dynamicValue !== undefined) {
          matches.push({
            type: 'scoring',
            start: match.index,
            end: match.index + match[0].length,
            value: String(dynamicValue),
            unit,
            originalText
          });
        } else {
          // No value provided, show as static
          matches.push({
            type: 'scoring',
            start: match.index,
            end: match.index + match[0].length,
            value,
            unit,
            originalText
          });
        }
      } else {
        // Static scoring element
        matches.push({
          type: 'scoring',
          start: match.index,
          end: match.index + match[0].length,
          value,
          unit,
          originalText
        });
      }
    }
  }
  
  // Find material names in descriptions (case-insensitive, whole word)
  // Materials: Plastic, Crystal, Flower, Golden, Volcano, Mirror, Rainbow, Ghost, Lead
  const materialNames = ['plastic', 'crystal', 'flower', 'golden', 'volcano', 'mirror', 'rainbow', 'ghost', 'lead'];
  const materialPattern = new RegExp(`\\b(${materialNames.join('|')})\\b`, 'gi');
  match = null;
  while ((match = materialPattern.exec(description)) !== null) {
    const materialText = match[1];
    const lowerMaterial = materialText.toLowerCase();
    
    // Check if already matched
    const overlaps = matches.some(m => 
      match!.index < m.end && match!.index + match![0].length > m.start
    );
    
    if (overlaps) continue;
    
    // Check if it's inside a {Concept} pattern (if so, skip - it will be handled by concept pattern)
    const before = description.substring(Math.max(0, match.index - 1), match.index);
    const after = description.substring(match.index + match[0].length, Math.min(description.length, match.index + match[0].length + 1));
    if (before === '{' && after === '}') continue;
    
    matches.push({
      type: 'concept',
      start: match.index,
      end: match.index + match[0].length,
      originalText: materialText, // Preserve original capitalization
      key: lowerMaterial // Use lowercase for color lookup
    });
  }
  
  // Find game concepts: {Concept} - only format if it's a known concept
  const conceptPattern = /\{([A-Z][a-z]+(?:s|ing)?)\}/g;
  match = null;
  while ((match = conceptPattern.exec(description)) !== null) {
    const conceptText = match[1];
    const lowerConcept = conceptText.toLowerCase();
    
    // Check if already matched
    const overlaps = matches.some(m => 
      match!.index < m.end && match!.index + match![0].length > m.start
    );
    
    if (overlaps) continue;
    
    // Check if it's a known concept - use stem-based matching for better word variation handling
    // Remove common suffixes (s, es, ing, ed) to find the base word
    const stem = lowerConcept.replace(/(s|es|ing|ed)$/, '');
    const conceptKey = Object.keys(GAME_CONCEPT_COLORS).find(key => {
      const keyStem = key.replace(/(s|es|ing|ed)$/, '');
      // Direct match, stem match, or if one is a prefix of the other
      return lowerConcept === key || 
             stem === key || 
             stem === keyStem || 
             keyStem === stem ||
             lowerConcept.startsWith(key) ||
             key.startsWith(lowerConcept) ||
             stem.startsWith(keyStem) ||
             keyStem.startsWith(stem);
    });
    
    if (conceptKey) {
      matches.push({
        type: 'concept',
        start: match.index,
        end: match.index + match[0].length,
        originalText: conceptText,
        key: conceptKey
      });
    } else if (values && values[conceptText] !== undefined) {
      // It's a dynamic value, not a concept
      matches.push({
        type: 'dynamic',
        start: match.index,
        end: match.index + match[0].length,
        originalText: conceptText,
        key: conceptText
      });
    }
  }
  
  // Find standalone dynamic values: [number] (not part of scoring elements)
  // Check for both currentValue and remaining values
  const bracketNumberPattern = /\[(\d+(?:\.\d+)?)\]/g;
  match = null;
  while ((match = bracketNumberPattern.exec(description)) !== null) {
    const overlaps = matches.some(m => 
      match!.index < m.end && match!.index + match![0].length > m.start
    );
    
    if (overlaps) continue;
    
    // Check if this is in a "Remaining:" context - look backwards for "Remaining:"
    const beforeMatch = description.substring(Math.max(0, match.index - 20), match.index);
    const isRemaining = /Remaining:\s*$/.test(beforeMatch);
    
    if (isRemaining && values?.remaining !== undefined) {
      matches.push({
        type: 'dynamic',
        start: match.index,
        end: match.index + match[0].length,
        originalText: match[0],
        key: 'remaining'
      });
    } else if (!isRemaining && values?.currentValue !== undefined) {
      matches.push({
        type: 'dynamic',
        start: match.index,
        end: match.index + match[0].length,
        originalText: match[0],
        key: 'currentValue'
      });
    }
  }
  
  // Find dynamic values in braces that don't match concept pattern (lowercase keys)
  // This handles things like {generatorCategory}
  const dynamicBracePattern = /\{([a-z][a-zA-Z0-9]*)\}/g;
  match = null;
  while ((match = dynamicBracePattern.exec(description)) !== null) {
    const key = match[1];
    
    // Check if already matched
    const overlaps = matches.some(m => 
      match!.index < m.end && match!.index + match![0].length > m.start
    );
    
    if (overlaps) continue;
    
    // Check if it's a dynamic value (not a concept)
    if (values && values[key] !== undefined) {
      matches.push({
        type: 'dynamic',
        start: match.index,
        end: match.index + match[0].length,
        originalText: match[0],
        key: key
      });
    }
  }
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build parts array
  let currentIndex = 0;
  let textPartIndex = 0;
  for (const m of matches) {
    // Add text before this match
    if (m.start > currentIndex) {
      const text = description.substring(currentIndex, m.start);
      if (text) {
        parts.push(<React.Fragment key={`text-${textPartIndex++}`}>{text}</React.Fragment>);
      }
    }
    
    // Add formatted match
    if (m.type === 'scoring') {
      const color = SCORING_ELEMENT_COLORS[m.unit! as keyof typeof SCORING_ELEMENT_COLORS];
      if (!color) {
        // Fallback if color is undefined (shouldn't happen, but safety check)
        parts.push(<span key={`scoring-${m.start}`}>{m.originalText}</span>);
        currentIndex = m.end;
        continue;
      }
      const originalText = m.originalText;
      let displayValue = m.value!;
      
      // Preserve format - check if original had a + prefix or $ prefix
      const hadPlusPrefix = originalText.startsWith('+') || (m.start > 0 && description[m.start - 1] === '+');
      const hadDollarPrefix = originalText.startsWith('$') || (m.start > 0 && description[m.start - 1] === '$');
      if (originalText.includes('x')) {
        displayValue = `${m.value}x`;
      } else if (originalText.startsWith('^')) {
        displayValue = `^${m.value}`;
      } else if (originalText.includes('^')) {
        displayValue = m.value!; // Keep as-is for +2^n patterns
      } else if (hadDollarPrefix && !m.value!.startsWith('$')) {
        displayValue = `$${m.value}`;
      } else if (hadPlusPrefix && !m.value!.startsWith('+') && !m.value!.startsWith('-') && !m.value!.startsWith('$')) {
        displayValue = `+${m.value}`;
      }
      
      parts.push(
        <span
          key={`scoring-${m.start}`}
          style={{
            fontWeight: 'bold',
            color: color.text,
            backgroundColor: color.background,
            padding: '2px 4px',
            borderRadius: '3px',
            whiteSpace: 'nowrap' // Prevent number and unit from being separated
          }}
        >
          {m.unit === 'MONEY' ? displayValue : `${displayValue} ${m.unit}`}
        </span>
      );
    } else if (m.type === 'concept') {
      // Use the original text exactly as written in the description
      // Only use the key for color lookup
      const lookupKey = (m.key === 'rerolls' ? 'reroll' : m.key) as keyof typeof GAME_CONCEPT_COLORS;
      const color = GAME_CONCEPT_COLORS[lookupKey];
      if (!color) {
        // Fallback if color is undefined
        parts.push(<span key={`concept-${m.start}`}>{m.originalText}</span>);
        currentIndex = m.end;
        continue;
      }
      
      // Display the original text exactly as written in the description
      // No transformations - if they wrote {Bank}, show "Bank". If they wrote {Banks}, show "Banks".
      // The key is only used for color lookup, not for display text
      const displayText = m.originalText;
      
      parts.push(
        <span
          key={`concept-${m.start}`}
          style={{
            fontWeight: 'bold',
            color: color
          }}
        >
          {displayText}
        </span>
      );
    } else if (m.type === 'dynamic') {
      const actualValue = values?.[m.key!];
      if (actualValue !== undefined) {
        parts.push(
          <span
            key={`dynamic-${m.start}`}
            style={{ fontWeight: 'bold' }}
          >
            {actualValue}
          </span>
        );
      } else {
        parts.push(<React.Fragment key={`dynamic-text-${m.start}`}>{m.originalText}</React.Fragment>);
      }
    }
    
    currentIndex = m.end;
  }
  
  // Add remaining text
  if (currentIndex < description.length) {
    const text = description.substring(currentIndex);
    if (text) {
      // Check if text contains "(Current:" or "(Remaining:" and split it onto a new line
      const currentMatch = text.match(/(.*?)(\(Current:.*?\))/);
      const remainingMatch = text.match(/(.*?)(\(Remaining:.*?\))/);
      const match = currentMatch || remainingMatch;
      
      if (match) {
        const beforeMatch = match[1];
        const matchPart = match[2];
        if (beforeMatch) {
          parts.push(<React.Fragment key={`text-${textPartIndex++}`}>{beforeMatch}</React.Fragment>);
        }
        // Add line break before "(Current:" or "(Remaining:"
        parts.push(<br key={`br-${textPartIndex}`} />);
        parts.push(<React.Fragment key={`text-${textPartIndex++}`}>{matchPart}</React.Fragment>);
      } else {
        parts.push(<React.Fragment key={`text-${textPartIndex++}`}>{text}</React.Fragment>);
      }
    }
  }
  
  return parts.length > 0 ? parts : [description];
}
