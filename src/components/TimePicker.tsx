import React, { useEffect, useState } from 'react';

interface TimePickerProps {
  value: string; // "HH:MM" format
  onChange: (newValue: string) => void;
  label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  // Parse initial values
  const parseValue = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) {
      return { hour12: 12, minute: 0, ampm: 'PM' };
    }
    const [h24, m] = timeStr.split(':').map(Number);
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let hour12 = h24 % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour12, minute: m, ampm };
  };

  const initial = parseValue(value);
  const [selectedHour, setSelectedHour] = useState(initial.hour12);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedAmpm, setSelectedAmpm] = useState(initial.ampm);

  // Sync state if external value changes
  useEffect(() => {
    const updated = parseValue(value);
    setSelectedHour(updated.hour12);
    setSelectedMinute(updated.minute);
    setSelectedAmpm(updated.ampm);
  }, [value]);

  // Combine and emit change
  const handleTimeChange = (hour: number, minute: number, ampm: string) => {
    let h24 = hour;
    if (ampm === 'PM') {
      if (h24 !== 12) h24 += 12;
    } else {
      if (h24 === 12) h24 = 0;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const newTimeStr = `${pad(h24)}:${pad(minute)}`;
    onChange(newTimeStr);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedHour(val);
    handleTimeChange(val, selectedMinute, selectedAmpm);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setSelectedMinute(val);
    handleTimeChange(selectedHour, val, selectedAmpm);
  };

  const handleAmpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAmpm(val);
    handleTimeChange(selectedHour, selectedMinute, val);
  };

  // Generate lists
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <span className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700/80 rounded p-1">
        {/* Hour Select */}
        <select
          value={selectedHour}
          onChange={handleHourChange}
          className="flex-1 min-w-0 bg-transparent text-xs text-slate-800 dark:text-slate-100 font-mono font-bold py-1 px-1.5 outline-none cursor-pointer border-0 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
        >
          {hours.map((h) => (
            <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {String(h).padStart(2, '0')}
            </option>
          ))}
        </select>

        <span className="text-slate-400 dark:text-slate-500 font-bold font-mono text-xs select-none">:</span>

        {/* Minute Select */}
        <select
          value={selectedMinute}
          onChange={handleMinuteChange}
          className="flex-1 min-w-0 bg-transparent text-xs text-slate-800 dark:text-slate-100 font-mono font-bold py-1 px-1.5 outline-none cursor-pointer border-0 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
        >
          {minutes.map((m) => (
            <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {String(m).padStart(2, '0')}
            </option>
          ))}
        </select>

        {/* Period Selector */}
        <select
          value={selectedAmpm}
          onChange={handleAmpmChange}
          className="flex-shrink-0 bg-brand/10 dark:bg-brand/20 text-brand border-0 rounded px-2 py-1 text-[11px] font-black tracking-wider outline-none cursor-pointer"
        >
          <option value="AM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans">AM</option>
          <option value="PM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans">PM</option>
        </select>
      </div>
    </div>
  );
}
