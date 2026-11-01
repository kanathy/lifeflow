import React, { useState, useEffect, useRef } from 'react';
import { Building2, Check } from 'lucide-react';

const HospitalNameAutocomplete = ({
  value = '',
  onChange = () => {},
  onSelect = () => {},
  suggestions = [],
  placeholder = 'e.g. National Hospital of Sri Lanka',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter unique suggestions based on input value
  const uniqueSuggestions = Array.from(new Set(suggestions.filter(Boolean)));
  const filteredSuggestions = value.trim() === ''
    ? uniqueSuggestions.slice(0, 8)
    : uniqueSuggestions.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);

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
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (name) => {
    onChange(name);
    if (onSelect) onSelect(name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="form-control"
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        style={{ width: '100%' }}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color, #e2e8f0)',
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '6px 0'
          }}
        >
          <div style={{ padding: '4px 12px 6px', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Existing Hospitals ({filteredSuggestions.length})
          </div>
          {filteredSuggestions.map((name, index) => {
            const isSelected = value.trim().toLowerCase() === name.toLowerCase();
            const isHighlighted = highlightedIndex === index;
            return (
              <div
                key={name}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents input blur before click
                  handleSelect(name);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  backgroundColor: isHighlighted ? '#f1f5f9' : isSelected ? '#eff6ff' : 'transparent',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--color-primary, #e11d48)' : '#334155',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Building2 size={14} color={isSelected ? 'var(--color-primary, #e11d48)' : '#64748b'} />
                  <span>{name}</span>
                </div>
                {isSelected && <Check size={14} color="var(--color-primary, #e11d48)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HospitalNameAutocomplete;

