'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { STATE_NAMES, getCitiesForState } from '@/lib/nigeria-locations';

// --- Searchable Select ---------------------------------------------------------

function SearchableSelect({
  id, value, onChange, options, placeholder, disabled = false, forceLight = false,
}: {
  id: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; disabled?: boolean; forceLight?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const base = forceLight
    ? 'bg-white border-mist text-forest'
    : 'bg-white dark:bg-dark-surface border-mist dark:border-white/10 text-foreground';

  function select(opt: string) { onChange(opt); setQuery(''); setOpen(false); }

  return (
    <div ref={ref} className="relative w-full">
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          flex items-center gap-1.5 w-full rounded-xl border px-3.5 py-3 text-base cursor-pointer
          transition-colors focus-within:ring-2 focus-within:ring-emerald/30 focus-within:border-emerald
          ${base} ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        {open ? (
          <input
            id={id}
            autoFocus
            className="flex-1 min-w-0 outline-none bg-transparent text-base"
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 truncate text-base ${value ? '' : 'opacity-40'}`}>
            {value || placeholder}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''} opacity-40`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <ul className={`
          absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border shadow-xl
          ${forceLight ? 'bg-white border-mist' : 'bg-white dark:bg-dark-surface border-mist dark:border-white/10'}
        `}>
          {filtered.length > 0 ? filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); select(opt); }}
              className={`
                px-3.5 py-2.5 text-base cursor-pointer transition-colors
                ${opt === value
                  ? 'bg-forest text-white'
                  : forceLight
                    ? 'text-forest hover:bg-mist'
                    : 'text-foreground hover:bg-mist dark:hover:bg-white/5'}
              `}
            >
              {opt}
            </li>
          )) : (
            <li className="px-3 py-2 text-sm opacity-40">No results</li>
          )}
        </ul>
      )}
    </div>
  );
}

// --- Custom Calendar Picker ----------------------------------------------------

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DOW    = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CalendarPicker({
  value, onChange, forceLight = false,
}: {
  value: string; onChange: (v: string) => void; forceLight?: boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [open, setOpen]         = useState(false);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + 'T00:00:00') : null;

  const openCalendar = () => {
    const d = selected || today;
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setOpen(true);
  };

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (d < today) return;
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  }

  const formatDisplay = (s: string) => {
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const base = forceLight
    ? 'bg-white border-mist text-forest'
    : 'bg-white dark:bg-dark-surface border-mist dark:border-white/10 text-foreground';

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={openCalendar}
        className={`
          flex items-center gap-2.5 w-full rounded-xl border px-3.5 py-3 text-base text-left
          transition-colors focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald
          ${base}
        `}
      >
        <svg className="w-5 h-5 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={value ? '' : 'opacity-40'}>
          {value ? formatDisplay(value) : 'Pick a date'}
        </span>
      </button>

      {open && (
        <div className={`
          absolute z-50 mt-1 left-0 w-72 rounded-2xl border shadow-2xl p-4
          ${forceLight ? 'bg-white border-mist' : 'bg-white dark:bg-dark-surface border-mist dark:border-white/10'}
        `}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 rounded-lg hover:bg-mist dark:hover:bg-white/10 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold font-body">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 rounded-lg hover:bg-mist dark:hover:bg-white/10 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold opacity-40 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const cellDate = new Date(viewYear, viewMonth, day);
              const isPast   = cellDate < today;
              const isToday  = cellDate.getTime() === today.getTime();
              const selIso   = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSel    = value === selIso;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDay(day)}
                  className={`
                    w-full aspect-square rounded-lg text-xs font-medium transition-colors
                    ${isSel   ? 'bg-forest text-white font-bold' :
                      isToday ? 'ring-2 ring-emerald text-forest dark:text-emerald font-bold' :
                      isPast  ? 'opacity-20 cursor-not-allowed' :
                      'hover:bg-mist dark:hover:bg-white/10 text-foreground'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => { onChange(today.toISOString().split('T')[0]); setOpen(false); }}
            className="mt-3 w-full text-xs font-semibold text-emerald hover:underline"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}

// --- Time of Day --------------------------------------------------------------

const TIME_OF_DAY = [
  { value: 'morning',   emoji: 'AM', label: 'Morning',   sub: '5AM-12PM'  },
  { value: 'afternoon', emoji: 'PM', label: 'Afternoon', sub: '12PM-5PM'  },
  { value: 'evening',   emoji: 'EVE', label: 'Evening',  sub: '5PM-10PM'  },
];

// --- Label --------------------------------------------------------------------

function Label({ children, forceLight }: { children: React.ReactNode; forceLight?: boolean }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-widest mb-2.5 ${forceLight ? 'text-forest/50' : 'text-foreground/40'}`}>
      {children}
    </p>
  );
}

// --- Main Component -----------------------------------------------------------

export function SearchForm({
  forceLight       = false,
  defaultFromState = '',
  defaultFromCity  = '',
  defaultToState   = '',
  defaultToCity    = '',
  defaultDate      = '',
  defaultTimeOfDay = '',
}: {
  forceLight?: boolean;
  defaultFromState?: string;  defaultFromCity?: string;
  defaultToState?: string;    defaultToCity?: string;
  defaultDate?: string;       defaultTimeOfDay?: string;
}) {
  const router = useRouter();

  const [fromState, setFromState] = useState(defaultFromState);
  const [fromCity,  setFromCity]  = useState(defaultFromCity);
  const [toState,   setToState]   = useState(defaultToState);
  const [toCity,    setToCity]    = useState(defaultToCity);
  const [date,      setDate]      = useState(defaultDate);
  const [timeOfDay, setTimeOfDay] = useState(defaultTimeOfDay);

  useEffect(() => { setFromCity(''); }, [fromState]);
  useEffect(() => { setToCity('');   }, [toState]);

  const fromCities = getCitiesForState(fromState);
  const toCities   = getCitiesForState(toState);
  const canSearch  = fromState && fromCity && toState && toCity && date && timeOfDay;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!canSearch) return;
    const params = new URLSearchParams({
      from_state: fromState, from_city: fromCity,
      to_state:   toState,   to_city:   toCity,
      date, time_of_day: timeOfDay,
    });
    router.push(`/search?${params.toString()}`);
  }

  const div = forceLight ? 'border-mist' : 'border-mist dark:border-white/10';

  // Icon styles for time buttons
  const timeIcons: Record<string, React.ReactNode> = {
    morning:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" /></svg>,
    afternoon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
    evening:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">

      {/* -- Row 1: From | To ------------------------------------------------ */}
      {/* Mobile: stacked. sm+: From and To side by side, each with [State | City] in a 2-col grid */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0">

        {/* FROM */}
        <div className="flex-1 sm:pr-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-4 h-4 rounded-full bg-emerald flex items-center justify-center shrink-0">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>
            </span>
            <Label forceLight={forceLight}>From</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SearchableSelect
              id="from-state" value={fromState} onChange={setFromState}
              options={STATE_NAMES} placeholder="State" forceLight={forceLight}
            />
            <SearchableSelect
              id="from-city" value={fromCity} onChange={setFromCity}
              options={fromCities}
              placeholder={fromState ? 'City' : 'City'}
              disabled={!fromState} forceLight={forceLight}
            />
          </div>
        </div>

        {/* Dividers */}
        <div className={`hidden sm:block w-px self-stretch border-l ${div}`} />
        <div className={`sm:hidden border-t ${div}`} />

        {/* TO */}
        <div className="flex-1 sm:pl-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`w-4 h-4 rounded-full border-2 border-emerald flex items-center justify-center shrink-0 ${forceLight ? 'bg-forest/20' : 'bg-pine/40'}`}>
              <svg className="w-2 h-2 text-emerald" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            </span>
            <Label forceLight={forceLight}>To</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SearchableSelect
              id="to-state" value={toState} onChange={setToState}
              options={STATE_NAMES} placeholder="State" forceLight={forceLight}
            />
            <SearchableSelect
              id="to-city" value={toCity} onChange={setToCity}
              options={toCities}
              placeholder={toState ? 'City' : 'City'}
              disabled={!toState} forceLight={forceLight}
            />
          </div>
        </div>
      </div>

      {/* -- Separator ------------------------------------------------------- */}
      <div className={`border-t ${div}`} />

      {/* -- Row 2: Date | Time of Day --------------------------------------- */}
      {/* Mobile: stacked. sm+: Date on left, Time of Day on right */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0">

        {/* Travel Date */}
        <div className="flex-1 sm:pr-4">
          <Label forceLight={forceLight}>Travel Date</Label>
          <CalendarPicker value={date} onChange={setDate} forceLight={forceLight} />
        </div>

        {/* Dividers */}
        <div className={`hidden sm:block w-px self-stretch border-l ${div}`} />
        <div className={`sm:hidden border-t ${div}`} />

        {/* Time of Day */}
        <div className="flex-1 sm:pl-4">
          <Label forceLight={forceLight}>Time of Day</Label>
          <div className="grid grid-cols-3 gap-2 h-[54px]">
            {[
              { value: 'morning',   label: 'Morning',   sub: '5AM – 12PM' },
              { value: 'afternoon', label: 'Afternoon', sub: '12 – 5PM'   },
              { value: 'evening',   label: 'Evening',   sub: '5 – 10PM'   },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTimeOfDay(t.value)}
                className={`
                  flex items-center justify-center gap-2 rounded-xl border font-semibold
                  font-body transition-all cursor-pointer h-full px-2
                  ${timeOfDay === t.value
                    ? 'bg-forest border-forest text-white shadow-sm'
                    : forceLight
                      ? 'bg-white border-mist text-forest/60 hover:border-emerald hover:text-forest'
                      : 'bg-white dark:bg-dark-surface border-mist dark:border-white/10 text-foreground/60 hover:border-emerald'}
                `}
              >
                {timeIcons[t.value]}
                <span className="leading-tight text-center">
                  <span className="block text-sm">{t.label}</span>
                  <span className="block text-[10px] opacity-70 font-normal">{t.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -- Search ---------------------------------------------------------- */}
      <Button
        type="submit"
        className={`w-full ${forceLight ? 'dark:bg-forest dark:hover:bg-pine dark:text-white' : ''}`}
        size="lg"
        disabled={!canSearch}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Buses
      </Button>
    </form>
  );
}
