import React, { useState } from 'react';

const PileCalc = () => {
  const [r, setR] = useState('');
  const [res, setRes] = useState(null);

  const calculate = async () => {
    const area = Math.PI * Math.pow(r, 2);
    setRes(area.toFixed(3));

    await fetch('/api/calculations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        calc_type: 'Circular Area',
        input_values: { radius: r },
        result_value: `${area.toFixed(3)} m²`
      })
    });
  };

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">Circular Pile Area</h3>
      <input type="number" placeholder="Radius (m)" className="w-full p-2 mb-4 bg-slate-700 rounded" onChange={(e) => setR(e.target.value)} />
      <button onClick={calculate} className="w-full bg-orange-600 p-2 rounded font-bold">Calculate Area</button>
      {res && <div className="mt-4 text-center font-mono">Area: {res} m²</div>}
    </div>
  );
};

export default PileCalc;
