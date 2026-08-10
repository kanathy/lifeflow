import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Tag } from 'lucide-react';

const SearchWithSuggestions = ({
  value = '',
  onChange = () => {},
  suggestions = [],
  placeholder = 'Search...',
  onSelect = () => {},
  style = {},
  inputStyle = {},
  iconSize = 16
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Normalize suggestions: can be array of strings or objects { label, category, sublabel }
  const normalizedSuggestions = suggestions.map((item) => {
    if (typeof item === 'string') {
      return { label: item, category: 'Item' };
    }
    return {
      label: item.label || item.title || item.name || String(item),
      category: item.category || item.type || 'Result',
      sublabel: item.sublabel || item.subtitle || ''
    };
  });

  // Filter suggestions based on input value
  const filteredSuggestions = value.trim() === '' 
    ? [] 
    : normalizedSuggestions.filter(item => 
        item.label.toLowerCase().includes(value.toLowerCase()) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(value.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(value.toLowerCase()))
      ).slice(0, 7);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (item) => {
    onChange(item.label);
    if (onSelect) onSelect(item.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        display: 'inline-block',
        ...style 
      }}
    >
      {/* Search Input Container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <Search 
          size={iconSize} 
          color="var(--text-light, #94a3b8)" 
          style={{ position: 'absolute', left: '12px', zIndex: 2, pointerEvents: 'none' }} 
        />

        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.trim() !== '' && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '9px 36px 9px 38px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-input, #ffffff)',
            color: 'var(--text-primary, #0f172a)',
            outline: 'none',
            transition: 'all 0.2s ease',
            ...inputStyle
          }}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--text-light, #94a3b8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '50%',
              zIndex: 2
            }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          overflow: 'hidden',
          maxHeight: '280px',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '6px 12px',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-light, #94a3b8)',
            borderBottom: '1px solid var(--border-color, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Suggestions ({filteredSuggestions.length})</span>
            <span style={{ fontSize: '0.65rem', textTransform: 'none', fontWeight: 500 }}>Use ↑ ↓ to navigate</span>
          </div>

          {filteredSuggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={idx}
                onClick={() => handleSelectSuggestion(item)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isHighlighted ? 'var(--bg-hover, #f1f5f9)' : 'transparent',
                  borderBottom: idx === filteredSuggestions.length - 1 ? 'none' : '1px solid var(--border-color, #f8fafc)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Search size={13} color="var(--primary-color, #e11d48)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                      {item.label}
                    </div>
                    {item.sublabel && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                </div>

                {item.category && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-tag, #fee2e2)',
                    color: 'var(--tag-text, #991b1b)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}>
                    {item.category}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchWithSuggestions;
