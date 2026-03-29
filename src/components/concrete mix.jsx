import React, { useState } from 'react';

const ConcreteMix = () => {
  const [inputs, setInputs] = useState({ l: '', w: '', t: '' });
  const [result, setResult] = useState(null);

  const calculate = async () => {
    const volume = (inputs.l * inputs.w * (inputs.t / 12)) / 27;
    const finalVal = volume.toFixed(2);
    setResult(finalVal);

    await fetch('/api/calculations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        calc_type: 'Concrete Volume',
        input_values: inputs,
        result_value: `${finalVal} cu yd`
      })
    });
  };

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">Slab Volume (Cubic Yards)</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <input type="number" placeholder="L (ft)" className="p-2 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, l: e.target.value})} />
        <input type="number" placeholder="W (ft)" className="p-2 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, w: e.target.value})} />
        <input type="number" placeholder="T (in)" className="p-2 bg-slate-700 rounded" onChange={(e) => setInputs({...inputs, t: e.target.value})} />
      </div>
      <button onClick={calculate} className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-bold text-white">Get Volume</button>
      {result && <div className="mt-4 p-2 bg-green-900 rounded text-center font-mono">{result} cu.yd.</div>}
    </div>
  );
};

export default ConcreteMix;
