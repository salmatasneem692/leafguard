import React, { useState } from 'react';
import { 
  PlantSpeciesId 
} from '../types/index.ts';
import { 
  PERSONALIZED_CARE_DATABASE, 
  GrowingEnvironment, 
  ClimateSeason 
} from '../data/plantCareDatabase.ts';
import { 
  Droplets, 
  Sun, 
  Sprout, 
  Thermometer, 
  Compass, 
  Bug, 
  Calendar, 
  Scissors, 
  Sparkles,
  Info
} from 'lucide-react';

interface PersonalizedCareViewProps {
  speciesId: PlantSpeciesId;
}

export const PersonalizedCareView: React.FC<PersonalizedCareViewProps> = ({ speciesId }) => {
  const [environment, setEnvironment] = useState<GrowingEnvironment>('indoor_pot');
  const [season, setSeason] = useState<ClimateSeason>('dry_summer');

  const protocol = PERSONALIZED_CARE_DATABASE[speciesId] || PERSONALIZED_CARE_DATABASE.neem;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
      {/* Header and User Growing Condition Questionnaire */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Personalized Plant-Care & Agronomic Protocol</span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Tailored Growing Recommendations for {protocol.plantName}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select your local growing environment and seasonal climate below to adapt irrigation and soil care
        </p>
      </div>

      {/* Growing Conditions Questionnaire Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        {/* Environment Selector */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Growing Environment / Location:</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'indoor_pot', label: 'Indoor Pot / Windowsill' },
              { id: 'balcony_container', label: 'Balcony Container' },
              { id: 'outdoor_garden', label: 'Outdoor Garden Bed' },
              { id: 'agricultural_field', label: 'Field / Farm Land' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEnvironment(opt.id as GrowingEnvironment)}
                className={`p-2 rounded-lg text-left transition-all font-medium ${
                  environment === opt.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Climate / Season Selector */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Current Season / Climate:</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'dry_summer', label: 'Dry Summer / Hot' },
              { id: 'monsoon_rainy', label: 'Monsoon / Rainy' },
              { id: 'spring', label: 'Spring / Mild' },
              { id: 'moderate_winter', label: 'Winter / Cold' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSeason(opt.id as ClimateSeason)}
                className={`p-2 rounded-lg text-left transition-all font-medium ${
                  season === opt.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Environmental & Seasonal Guidance Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Adjusted for Environment */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">
            Location-Specific Directive
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {protocol.environmentalAdjustments[environment]}
          </p>
        </div>

        {/* Adjusted for Season */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-blue-800 font-bold block">
            Seasonal Action Plan
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {protocol.seasonalCare[season]}
          </p>
        </div>
      </div>

      {/* Detailed Agronomic Trait Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Watering */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Watering Schedule</span>
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {protocol.generalWatering}
          </p>
        </div>

        {/* Sunlight */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Sunlight Exposure</span>
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {protocol.generalSunlight}
          </p>
        </div>

        {/* Soil & Drainage */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Soil & Drainage Mix</span>
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {protocol.soilMix}
          </p>
          <span className="inline-block text-[10px] font-mono text-slate-400 pt-1">
            pH Range: {protocol.phRange}
          </span>
        </div>

        {/* Temperature & Feeding */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Temperature & Feed</span>
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {protocol.idealTemperature}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {protocol.fertilizerNeeds}
          </p>
        </div>
      </div>

      {/* Common Pests and Organic Biopesticide Remedies */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1.5">
          <Bug className="w-4 h-4 text-amber-600" />
          <span>Species-Specific Pest Susceptibilities & Organic Biopesticide Remedies</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {protocol.commonPests.map((p, idx) => (
            <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
              <strong className="text-rose-900 block font-semibold">{p.pest}</strong>
              <p className="text-slate-600 leading-relaxed">
                <strong>Remedy:</strong> {p.remedy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
