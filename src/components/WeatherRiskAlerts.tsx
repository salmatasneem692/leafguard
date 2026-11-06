import React, { useState, useMemo } from 'react';
import { CloudRain, Thermometer, Droplets, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { evaluateWeatherDiseaseRisk, WEATHER_PRESETS, WeatherPreset, DiseaseRiskAlert, RiskLevel } from '../data/weatherDiseaseRules.ts';
import { PlantSpeciesId } from '../types/index.ts';

interface WeatherRiskAlertsProps {
  speciesId: PlantSpeciesId;
  plantSpeciesName: string;
}

export const WeatherRiskAlerts: React.FC<WeatherRiskAlertsProps> = ({ speciesId, plantSpeciesName }) => {
  const [temperature, setTemperature] = useState<number>(27);
  const [humidity, setHumidity] = useState<number>(82);
  const [rainfallMm, setRainfallMm] = useState<number>(12);

  const alert: DiseaseRiskAlert = useMemo(() => {
    return evaluateWeatherDiseaseRisk(speciesId, {
      temperatureC: temperature,
      humidityPct: humidity,
      rainfallMm: rainfallMm,
    });
  }, [speciesId, temperature, humidity, rainfallMm]);

  const applyPreset = (key: string) => {
    const p: WeatherPreset = WEATHER_PRESETS[key];
    if (p) {
      setTemperature(p.temperature);
      setHumidity(p.humidity);
      setRainfallMm(p.rainfallMm);
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-900',
          badge: 'bg-rose-600 text-white',
          border: 'border-rose-400',
        };
      case 'high':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'bg-amber-600 text-white',
          border: 'border-amber-400',
        };
      case 'moderate':
        return {
          bg: 'bg-yellow-50 border-yellow-300 text-yellow-900',
          badge: 'bg-yellow-600 text-white',
          border: 'border-yellow-400',
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          border: 'border-emerald-400',
        };
    }
  };

  const colors = getRiskColor(alert.riskLevel);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-900 text-base">
              Weather-Based Disease Risk Predictor
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Epidemiological vulnerability model tailored for <span className="font-semibold text-slate-700">{plantSpeciesName}</span> foliar diseases
          </p>
        </div>

        {/* Risk Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Risk Tier:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${colors.badge}`}>
            {alert.riskLevel} Risk ({alert.riskScore}%)
          </span>
        </div>
      </div>

      {/* Quick Weather Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
          Simulate Climatic Conditions / Regional Season:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(WEATHER_PRESETS).map(([key, preset]: [string, WeatherPreset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="text-left p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer group"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                {preset.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {preset.temperature}°C · {preset.humidity}% RH
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Microclimate Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              Ambient Temp
            </span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {temperature}°C
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="45"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>10°C (Cold)</span>
            <span>45°C (Extreme)</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              Relative Humidity
            </span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {humidity}% RH
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>20% (Arid)</span>
            <span>100% (Saturated)</span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
              Precipitation Rate
            </span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {rainfallMm} mm/hr
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={rainfallMm}
            onChange={(e) => setRainfallMm(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0 mm (Dry)</span>
            <span>60 mm (Downpour)</span>
          </div>
        </div>
      </div>

      {/* Risk Summary Box */}
      <div className={`p-4 rounded-xl border ${colors.bg} space-y-3`}>
        <div className="flex items-start gap-2.5">
          {alert.riskLevel === 'low' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-semibold text-sm">
              Pathogen Proliferation Potential: {alert.riskLevel.toUpperCase()}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              <strong>Vulnerability Factor:</strong> {alert.primaryTrigger}
            </p>
          </div>
        </div>

        {/* Vulnerable Pathogen */}
        <div className="pt-2 border-t border-black/10">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
            Threatened Condition Under This Climate:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/80 border border-black/10 text-slate-900 font-semibold">
              ⚠ {alert.threatenedDisease} ({alert.pathogenType})
            </span>
          </div>
        </div>

        {/* Preventative Actions */}
        <div className="pt-2 border-t border-black/10">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
            Recommended Preventive Agronomic Actions:
          </div>
          <ul className="space-y-1.5 text-xs">
            {alert.preventativeAdvisory.map((advice: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>
          Epidemiological model based on published temperature/leaf-wetness duration formulas for medicinal herbs.
        </span>
      </div>
    </div>
  );
};
