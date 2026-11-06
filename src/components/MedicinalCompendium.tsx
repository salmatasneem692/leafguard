import React, { useState } from 'react';
import { MEDICINAL_PLANTS, PLANT_DISEASES } from '../data/medicinalPlants.ts';
import { PlantSpeciesId } from '../types/index.ts';
import { Search, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';

interface MedicinalCompendiumProps {
  onSelectSampleToAnalyze: (sampleId: PlantSpeciesId) => void;
}

export const MedicinalCompendium: React.FC<MedicinalCompendiumProps> = ({
  onSelectSampleToAnalyze,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<PlantSpeciesId>('neem');

  const plants = Object.values(MEDICINAL_PLANTS);
  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.activePhytochemicals.some((chem) => chem.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activePlant = MEDICINAL_PLANTS[selectedPlantId] || plants[0];
  const activeDiseases = PLANT_DISEASES[selectedPlantId] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Medicinal Plant Compendium & Knowledge Base
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authoritative botanical taxonomy, active phytoconstituents, and disease vulnerability records
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plant or compound..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Plant Selector Strip */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {filteredPlants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlantId(plant.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedPlantId === plant.id
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <span>{plant.name}</span>
              <span className={`text-[10px] font-mono ${selectedPlantId === plant.id ? 'text-emerald-200' : 'text-slate-400'}`}>
                {plant.family.split(' ')[0]}
              </span>
            </button>
          ))}

          {/* Modular Class Extensibility Badge */}
          <div className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Modular: +N classes extensible</span>
          </div>
        </div>
      </div>

      {/* Selected Plant Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leaf Photo & Morphology */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={activePlant.sampleImage}
              alt={activePlant.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
              Specimen: {activePlant.name}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-semibold block">
              Leaf Morphology & Structure
            </span>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {activePlant.leafMorphology}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block mb-1">
              Natural Habitat & Distribution
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activePlant.habitat}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onSelectSampleToAnalyze(activePlant.id)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load {activePlant.name} Specimen into Analyzer
            </button>
          </div>
        </div>

        {/* Right Column (2 cols wide): Full Pharmacology & Diseases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Taxonomy & Ayurvedic Energetics */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{activePlant.name}</h3>
                <p className="text-sm font-serif italic text-slate-600">
                  {activePlant.scientificName} · Family {activePlant.family}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Common: {activePlant.commonName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Classical Ayurvedic Qualities
                </span>
                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 font-mono text-slate-700 border border-slate-100">
                  <div><span className="text-slate-400">Rasa (Taste):</span> {activePlant.ayurvedicQualities.rasa}</div>
                  <div><span className="text-slate-400">Virya (Potency):</span> {activePlant.ayurvedicQualities.virya}</div>
                  <div><span className="text-slate-400">Vipaka:</span> {activePlant.ayurvedicQualities.vipaka}</div>
                  <div><span className="text-slate-400">Dosha:</span> {activePlant.ayurvedicQualities.doshaEffect}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Key Phytochemical Markers
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-mono">
                  {activePlant.activePhytochemicals.map((chem, idx) => (
                    <li key={idx}>{chem}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Medicinal Uses & Pharmacology */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Traditional & Modern Herbal Applications
              </span>
              <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 leading-relaxed">
                {activePlant.primaryMedicinalUses.map((use, idx) => (
                  <li key={idx}>{use}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Pharmacological Actions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePlant.pharmacologicalProperties.map((prop, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-800 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{prop}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disease Vulnerabilities & Agricultural Care */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
                Common Foliar Health & Pathological Concerns
              </span>
              <div className="space-y-3">
                {activeDiseases.map((dis) => (
                  <div key={dis.id} className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-amber-900">{dis.name}</strong>
                      <span className="font-mono text-[10px] text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                        Pathogen: {dis.pathogenType}
                      </span>
                    </div>
                    <p className="text-amber-950 mb-2">{dis.symptoms[0]}</p>
                    <div className="text-[11px] text-amber-900">
                      <strong>Organic Remedy:</strong> {dis.organicRemedy[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Precautions */}
            <div className="pt-2">
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg text-xs text-rose-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Important Safety Precaution:</span>
                  <p>{activePlant.precautionsAndWarnings[0]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
