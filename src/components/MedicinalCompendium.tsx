import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MEDICINAL_PLANTS, PLANT_DISEASES } from '../data/medicinalPlants.ts';
import { PlantSpeciesId } from '../types/index.ts';
import { Search, ShieldAlert, Sparkles, Microscope, ArrowRight, Leaf } from 'lucide-react';

interface MedicinalCompendiumProps {
  initialPlantId?: PlantSpeciesId;
  onSelectSampleToAnalyze: (sampleId: PlantSpeciesId, targetMode?: 'identify' | 'disease') => void;
}

export const MedicinalCompendium: React.FC<MedicinalCompendiumProps> = ({
  initialPlantId,
  onSelectSampleToAnalyze,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<PlantSpeciesId>(initialPlantId || 'neem');

  useEffect(() => {
    if (initialPlantId) {
      setSelectedPlantId(initialPlantId);
    }
  }, [initialPlantId]);

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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123D2A] to-[#175138] text-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/20 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] font-semibold">
              <Leaf className="w-4 h-4" />
              <span>Supported Botanical Species Index</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Medicinal Plant Library & Pharmacognosy
            </h1>
            <p className="text-xs sm:text-sm text-[#E8F5EC]/80 max-w-2xl">
              Explore all trained medicinal plant classes with scientific taxonomy, bioactive phytoconstituents, and foliar pathology profiles.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#E8F5EC]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plant or compound..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#E8F5EC]/55 border border-[#E8F5EC]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A36A] bg-[#0c291c]/70"
            />
          </div>
        </div>
      </div>

      {/* Supported Plants Botanical Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlants.map((plant) => {
          const isSelected = plant.id === selectedPlantId;
          return (
            <motion.button
              key={plant.id}
              type="button"
              onClick={() => setSelectedPlantId(plant.id)}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              className={`text-left rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-[#E8F5EC]/65 border-[#16A36A] ring-2 ring-[#16A36A]/25 shadow-md'
                  : 'bg-white border-[#123D2A]/12 hover:border-[#16A36A]/70 shadow-xs hover:shadow-lg'
              }`}
            >
              <div>
                <div className="relative aspect-16/10 bg-[#18251E] overflow-hidden">
                  <img
                    src={plant.sampleImage}
                    alt={plant.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#123D2A]/85 via-transparent to-transparent"
                  />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">{plant.name}</h2>
                      <p className="text-xs italic text-[#E8F5EC]/85 font-serif">
                        {plant.scientificName}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#E8F5EC]/90">
                      {plant.family.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <p className="text-xs text-[#18251E]/80 leading-relaxed line-clamp-2">
                    {plant.primaryMedicinalUses[0]}
                  </p>
                  <div className="text-[11px] font-mono text-[#123D2A]/70 truncate">
                    {plant.commonName}
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 border-t border-[#123D2A]/10 flex items-center justify-between text-xs font-bold text-[#16A36A]">
                <span>{isSelected ? 'Viewing Details Below' : 'Select Plant Dossier'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Plant Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leaf Photo, Morphology & Quick Launchers */}
        <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-xs space-y-5">
          <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#123D2A]/15 bg-[#18251E]">
            <img
              src={activePlant.sampleImage}
              alt={activePlant.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2.5 left-2.5 bg-[#123D2A]/85 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md">
              {activePlant.name} Specimen
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#16A36A] font-semibold block">
              Leaf Morphology & Structure
            </span>
            <p className="text-xs text-[#18251E]/85 mt-1 leading-relaxed">
              {activePlant.leafMorphology}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#18251E]/55 font-semibold block mb-1">
              Natural Habitat & Distribution
            </span>
            <p className="text-xs text-[#18251E]/75 leading-relaxed">{activePlant.habitat}</p>
          </div>

          <div className="pt-3 border-t border-[#123D2A]/10 space-y-2">
            <button
              type="button"
              onClick={() => onSelectSampleToAnalyze(activePlant.id, 'identify')}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#16A36A] hover:bg-[#138f5d] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Identify {activePlant.name} Specimen</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectSampleToAnalyze(activePlant.id, 'disease')}
              className="w-full py-2.5 px-4 text-xs font-bold text-[#123D2A] bg-[#E8F5EC] hover:bg-[#d8efe1] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Microscope className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Screen in Disease Detector</span>
            </button>
          </div>
        </div>

        {/* Right Column (2 cols): Full Pharmacology & Diseases */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-[#123D2A]/10 mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#123D2A]">{activePlant.name}</h3>
                <p className="text-sm font-serif italic text-[#18251E]/75">
                  {activePlant.scientificName} · Family {activePlant.family}
                </p>
              </div>
              <span className="text-xs font-mono text-[#18251E]/60">
                Common: {activePlant.commonName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#18251E]/55 block mb-1.5">
                  Ayurvedic Energetics (Dravya Guna)
                </span>
                <div className="bg-[#FAFCF8] p-3.5 rounded-xl text-xs space-y-1 font-mono text-[#18251E]/85 border border-[#123D2A]/10">
                  <div>
                    <span className="text-[#18251E]/55">Rasa (Taste):</span>{' '}
                    {activePlant.ayurvedicQualities.rasa}
                  </div>
                  <div>
                    <span className="text-[#18251E]/55">Virya (Potency):</span>{' '}
                    {activePlant.ayurvedicQualities.virya}
                  </div>
                  <div>
                    <span className="text-[#18251E]/55">Vipaka:</span>{' '}
                    {activePlant.ayurvedicQualities.vipaka}
                  </div>
                  <div>
                    <span className="text-[#18251E]/55">Dosha:</span>{' '}
                    {activePlant.ayurvedicQualities.doshaEffect}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#18251E]/55 block mb-1.5">
                  Key Phytochemical Markers
                </span>
                <ul className="text-xs text-[#18251E]/85 space-y-1.5 list-disc pl-4 font-mono">
                  {activePlant.activePhytochemicals.map((chem, idx) => (
                    <li key={idx}>{chem}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#123D2A]/12 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#18251E]/55 block mb-2">
                Traditional & Modern Medicinal Uses
              </span>
              <ul className="text-xs text-[#18251E]/85 space-y-2 list-disc pl-4 leading-relaxed">
                {activePlant.primaryMedicinalUses.map((use, idx) => (
                  <li key={idx}>{use}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#18251E]/55 block mb-2">
                Pharmacological Actions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePlant.pharmacologicalProperties.map((prop, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#FAFCF8] border border-[#123D2A]/10 rounded-xl text-xs text-[#123D2A] font-semibold flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] shrink-0" />
                    <span>{prop}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#123D2A]/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#123D2A] block mb-2">
                Common Foliar Health & Pathological Concerns
              </span>
              <div className="space-y-3">
                {activeDiseases.map((dis) => (
                  <div
                    key={dis.id}
                    className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-amber-900">{dis.name}</strong>
                      <span className="font-mono text-[10px] text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded">
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

            <div className="p-3.5 bg-rose-50/60 border border-rose-200/70 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Important Safety Precaution</span>
                <p>{activePlant.precautionsAndWarnings[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
