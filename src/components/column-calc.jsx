import React, { useState } from 'react';

const ColumnCalc = () => {
  const [inputs, setInputs] = useState({ fc: '', area: '' });
  const [result, setResult] = useState(null);

  const calculate = async () => {
    // Simplified: P = 0.85 * fc * Ag * reduction_factor
    const capacity = 0.85 * inputs.fc * inputs.area * 0.65;
    const finalVal = Math.round(capacity);
    setResult(finalVal);

    await fetch('/api/calculations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        calc_type: 'Column Capacity',
        input_values: inputs,
        result_value: `${finalVal} kN`
      })
    });
  };

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">Axial Column Capacity</h3>
      <input type="number" placeholder="Concrete Grade (MPa)" className="w-full p-2 mb-2 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, fc: e.target.value})} />
      <input type="number" placeholder="Gross Area (mm²)" className="w-full p-2 mb-4 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, area: e.target.value})} />
      <button onClick={calculate} className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-bold text-white text-center">Check Capacity</button>
      {result && <div className="mt-4 p-2 bg-red-900 rounded text-center">Limit: {result} kN</div>}
    </div>
  );
};

export default ColumnCalc;
