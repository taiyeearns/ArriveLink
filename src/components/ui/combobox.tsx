'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ComboboxOption {
  id: string;
  label: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
}

export function Combobox({ value, onChange, options, placeholder = 'Select an option', disabled = false }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync input value with selected option when not open or typing
  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption ? selectedOption.label : '');
    }
  }, [isOpen, selectedOption]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = query === '' && !isOpen
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  // If we open and have a value, try to highlight the selected item initially
  useEffect(() => {
    if (isOpen) {
      const idx = filteredOptions.findIndex(o => o.id === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]); // Only run on open

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  function handleSelect(optionId: string) {
    onChange(optionId);
    setIsOpen(false);
    
    // Update local query to match selected option to avoid flash
    const opt = options.find(o => o.id === optionId);
    if (opt) setQuery(opt.label);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : (selectedOption ? selectedOption.label : query)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (!isOpen) {
              setQuery(''); // Clear text to show all items, or allow typing fresh
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3.5 pr-10 rounded-xl border border-gray-200 dark:border-white/5 font-body text-base text-foreground bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-pine/30 focus:border-pine transition-all duration-200 disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 py-1 max-h-60 overflow-auto rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-surface shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-body text-center">
              No routes found
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.id === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-2.5 text-sm font-body cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-mist dark:bg-dark-bg text-foreground'
                      : 'text-foreground hover:bg-mist/50 dark:hover:bg-dark-bg/50'
                  } ${isSelected ? 'font-semibold text-pine dark:text-emerald' : ''}`}
                >
                  {option.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
