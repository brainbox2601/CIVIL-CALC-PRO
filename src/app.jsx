import React from 'react';
// These match the small-letter filenames in your screenshot
import BeamCalc from './components/beam-calc';
import ColumnCalc from './components/column-calc';
import ConcreteMix from './components/concrete-mix';
import LoadCalc from './components/load-calc';
import PileCalc from './components/pile-calc';
import SoilCalc from './components/soil-calc';
import UnitConverter from './components/unit-converter';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="mb-10 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">CivilCalc Pro</h1>
        <p className="text-slate-400">Engineering Suite v1.0</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Each of your 7 calculators rendered as a card */}
        <BeamCalc />
        <ColumnCalc />
        <ConcreteMix />
        <LoadCalc />
        <PileCalc />
        <SoilCalc />
        <UnitConverter />
      </main>
      
      <footer className="mt-20 text-center text-slate-500 text-sm">
        Logged in as Engineer | Secure Backend via Supabase
      </footer>
    </div>
  );
}

export default App;
