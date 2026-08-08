import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SearchableDropdown = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const filteredOptions = options.filter(opt => {
    const label = typeof opt === 'string' ? opt : opt.label;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      const item = listRef.current.children[highlightedIndex];
      const list = listRef.current;
      
      if (item.offsetTop < list.scrollTop) {
        list.scrollTop = item.offsetTop;
      } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.offsetHeight) {
        list.scrollTop = item.offsetTop + item.offsetHeight - list.offsetHeight;
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectOption = (opt) => {
    onChange(opt);
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = value ? (typeof value === 'string' ? value : value.label) : '';

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', opacity: disabled ? 0.5 : 1 }}>
      <div 
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setSearchTerm(''); // Clear search when opening to see full list
          }
        }}
        style={{ position: 'relative' }}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={isOpen ? searchTerm : displayValue}
          autoComplete="new-password"
          spellCheck="false"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
            if (!e.target.value) onChange(''); // Clear value if they delete everything
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchTerm('');
            }
          }}
          disabled={disabled}
          style={{ 
            width: '100%', 
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            color: 'white', 
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'text'
          }}
        />
        <ChevronDown 
          size={18} 
          color="var(--text-secondary)" 
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
        />
      </div>

      {isOpen && !disabled && (
        <div 
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const isSelected = displayValue === label;
              const isHighlighted = index === highlightedIndex;
              
              return (
                <div
                  key={label}
                  onClick={() => selectOption(opt)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    color: 'white',
                    background: isHighlighted ? 'var(--accent)' : 'transparent',
                    borderLeft: isSelected && !isHighlighted ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'background 0.1s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  {label}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
