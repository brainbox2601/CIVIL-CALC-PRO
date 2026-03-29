import React, { useState } from 'react';

const UnitConverter = () => {
  const [val, setVal] = useState('');
  const [res, setRes] = useState('');

  const toFeet = () => setRes((val * 3.28).toFixed(2) + " ft");
  const toMeters = () => setRes((val / 3.28).toFixed(2) + " m");

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">m/ft Converter</h3>
      <input type="number" placeholder="Value" className="w-full p-2 mb-2 bg-slate-700 rounded" onChange={(e) => setVal(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={toFeet} className="flex-1 bg-purple-600 p-2 rounded">To Feet</button>
        <button onClick={toMeters} className="flex-1 bg-purple-800 p-2 rounded">To Meters</button>
      </div>
      {res && <div className="mt-4 text-center font-bold text-purple-400">{res}</div>}
    </div>
  );
};

export default UnitConverter;
