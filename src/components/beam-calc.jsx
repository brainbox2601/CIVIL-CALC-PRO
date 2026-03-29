import React, { useState } from 'react';

const BeamCalc = () => {
  const [inputs, setInputs] = useState({ load: '', length: '' });
  const [result, setResult] = useState(null);

  const calculateAndSave = async () => {
    const moment = (inputs.load * Math.pow(inputs.length, 2)) / 8;
    const finalResult = moment.toFixed(2);
    setResult(finalResult);

    await fetch('/api/calculations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        calc_type: 'Beam Analysis',
        input_values: inputs,
        result_value: `${finalResult} kNm`
      })
    });
  };

  return (
    <div className="p-4 bg-slate-800 text-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold border-b border-slate-600 mb-3">Beam Max Moment (UDL)</h3>
      <input type="number" placeholder="Load (kN/m)" className="w-full p-2 mb-2 bg-slate-700 border-none rounded" onChange={(e) => setInputs({...inputs, load: e.target.value})} />
      <input type="number" placeholder="Span (m)" className="w-full p-2 mb-4 bg-slate-700 border-none rounded" onChange={(e) => setInputs({...inputs, length: e.target.value})} />
      <button onClick={calculateAndSave} className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded font-bold">Calculate & Save</button>
      {result && <div className="mt-4 p-2 bg-blue-900 rounded text-center">Result: {result} kNm</div>}
    </div>
  );
};

export default BeamCalc;
