import React from 'react';
import Input from './Input';

export default function DateSportSelector({ date, sport, onDateChange, onSportChange, sports }) {
  return (
    <div className="flex gap-4 items-center mb-4">
      <Input
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-40"
      />
      <label className="flex flex-col text-sm">
        Deporte
        <select
          value={sport}
          onChange={(e) => onSportChange(e.target.value)}
          className="border rounded px-2 py-1 mt-1 dark:bg-gray-800"
        >
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
