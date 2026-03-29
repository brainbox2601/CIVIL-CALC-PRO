import React, { useState } from 'react';

const SoilCalc = () => {
  const [inputs, setInputs] = useState({ spt: '' });
  const [result, setResult] = useState(null);

  const calculate = async () => {
    const q_all = inputs.spt * 12.5; // Terzaghi approximation
    setResult(q_all);

    await fetch('/api/calculations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        calc_type: 'Soil Bearing',
        input_values: inputs,
        result_value: `${q_all} kPa`
      })
    });
  };

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">Soil Bearing (N-Value)</h3>
      <input type="number" placeholder="Enter SPT N-Value" className="w-full p-2 mb-4 bg-slate-700 rounded text-white" onChange={(e) => setInputs({spt: e.target.value})} />
      <button onClick={calculate} className="w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded font-bold text-slate-900">Estimate Pressure</button>
      {result && <div className="mt-4 p-2 bg-yellow-900 text-white rounded text-center">{result} kPa (Allowable)</div>}
    </div>
  );
};

export default SoilCalc;
