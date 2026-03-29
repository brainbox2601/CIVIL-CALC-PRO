import React, { useState } from 'react';

const LoadCalc = () => {
  const [inputs, setInputs] = useState({ d: '', v: '' });
  const [result, setResult] = useState(null);

  const calculate = async () => {
    const total = inputs.d * inputs.v;
    setResult(total.toFixed(2));
    
    await fetch('/api/calculations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        calc_type: 'Dead Load',
        input_values: inputs,
        result_value: `${total.toFixed(2)} kg`
      })
    });
  };

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">Dead Load Estimate</h3>
      <input type="number" placeholder="Density (kg/m³)" className="w-full p-2 mb-2 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, d: e.target.value})} />
      <input type="number" placeholder="Volume (m³)" className="w-full p-2 mb-4 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, v: e.target.value})} />
      <button onClick={calculate} className="w-full bg-slate-600 hover:bg-slate-500 p-2 rounded font-bold">Calculate Weight</button>
      {result && <div className="mt-4 text-center">Result: {result} kg</div>}
    </div>
  );
};

export default LoadCalc;
