/**
 * LeafGuard AI – Meteorological Disease-Risk Assessment Engine
 * Evaluates environmental vulnerability for specific plant-pathogen combinations
 * based on ambient temperature (°C), relative humidity (%), and rainfall (mm).
 * Academic Note: Presented strictly as an agro-climatic risk estimate, not a confirmed clinical diagnosis.
 */

import { PlantSpeciesId } from '../types/index.ts';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface WeatherCondition {
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  seasonName?: string;
}

export interface DiseaseRiskAlert {
  plantId: PlantSpeciesId;
  plantName: string;
  threatenedDisease: string;
  pathogenType: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  primaryTrigger: string;
  preventativeAdvisory: string[];
}

export interface WeatherPreset {
  name: string;
  temperature: number;
  humidity: number;
  rainfallMm: number;
}

export const WEATHER_PRESETS: Record<string, WeatherPreset> = {
  monsoon: {
    name: 'Monsoon Rain & High Humidity',
    temperature: 26,
    humidity: 88,
    rainfallMm: 45,
  },
  summer: {
    name: 'Hot & Arid Summer',
    temperature: 36,
    humidity: 35,
    rainfallMm: 0,
  },
  subtropical: {
    name: 'Humid Heatwave',
    temperature: 32,
    humidity: 78,
    rainfallMm: 12,
  },
  winter: {
    name: 'Mild Dry Winter',
    temperature: 19,
    humidity: 45,
    rainfallMm: 2,
  },
};

export function evaluateWeatherDiseaseRisk(
  plantId: PlantSpeciesId,
  weather: WeatherCondition
): DiseaseRiskAlert {
  const { temperatureC, humidityPct, rainfallMm } = weather;

  switch (plantId) {
    case 'tulsi': {
      // Downy Mildew / Cercospora Leaf Spot: Thrives in high humidity (>75%) & moderate warm temperatures (22-29°C)
      let score = 20;
      let triggers = [];

      if (humidityPct >= 75) {
        score += 45;
        triggers.push(`High relative humidity (${humidityPct}%) favours spore germination`);
      } else if (humidityPct >= 60) {
        score += 20;
      }

      if (temperatureC >= 22 && temperatureC <= 29) {
        score += 25;
        triggers.push(`Warm ambient temperature (${temperatureC}°C) aligns with fungal reproduction window`);
      }

      if (rainfallMm > 25) {
        score += 10;
        triggers.push(`Rainfall splash (${rainfallMm}mm) disperses fungal spores onto lower leaves`);
      }

      score = Math.min(100, score);
      const level: RiskLevel = score > 75 ? 'high' : score > 45 ? 'moderate' : 'low';

      return {
        plantId,
        plantName: 'Tulsi',
        threatenedDisease: 'Downy Mildew & Cercospora Leaf Spot (Peronospora belbahrii)',
        pathogenType: 'Oomycete / Fungal',
        riskLevel: level,
        riskScore: score,
        primaryTrigger: triggers.join('; ') || 'Weather parameters within safe ecological thresholds',
        preventativeAdvisory: [
          'Avoid overhead sprinkler watering that leaves foliar moisture overnight.',
          'Space potted plants at least 30cm apart to improve inter-canopy ventilation.',
          'Apply preventative organic prophylactic spray: 3g baking soda + 2ml neem oil per liter of water.',
        ],
      };
    }

    case 'aloe_vera': {
      // Basal Stem Rot / Root Rot: Triggered by heavy rainfall (>50mm) and prolonged soil wetness
      let score = 15;
      let triggers = [];

      if (rainfallMm >= 50) {
        score += 50;
        triggers.push(`Heavy rainfall (${rainfallMm}mm) causes soil saturation in succulent root zones`);
      } else if (rainfallMm >= 20) {
        score += 25;
      }

      if (humidityPct >= 80) {
        score += 25;
        triggers.push(`High atmospheric humidity (${humidityPct}%) retards succulent transpiration`);
      }

      if (temperatureC < 18) {
        score += 15;
        triggers.push(`Cool temperatures (${temperatureC}°C) compound waterlogging decay`);
      }

      score = Math.min(100, score);
      const level: RiskLevel = score > 75 ? 'critical' : score > 50 ? 'high' : score > 30 ? 'moderate' : 'low';

      return {
        plantId,
        plantName: 'Aloe Vera',
        threatenedDisease: 'Basal Stem Rot & Soft Root Rot (Phytophthora & Pythium spp.)',
        pathogenType: 'Oomycete Water Mold',
        riskLevel: level,
        riskScore: score,
        primaryTrigger: triggers.join('; ') || 'Dry conditions prevent root rot organisms',
        preventativeAdvisory: [
          'Relocate outdoor containers under rain shelter immediately during monsoon downpours.',
          'Ensure potting soil has at least 40% coarse gravel/sand and drainage holes are clear.',
          'Dust plant base with dry organic cinnamon powder or Trichoderma bio-fungicide.',
        ],
      };
    }

    case 'neem': {
      // Neem Leaf Web Blight: Rhizoctonia solani thrives in humid, cloudy, rainy monsoon weather
      let score = 10;
      let triggers = [];

      if (humidityPct >= 80 && temperatureC >= 25 && temperatureC <= 32) {
        score += 55;
        triggers.push(`High humidity (${humidityPct}%) and warm weather (${temperatureC}°C) activate web blight mycelia`);
      }

      if (rainfallMm > 40) {
        score += 25;
        triggers.push(`Continuous dampness creates foliar microclimate for fungal web formation`);
      }

      score = Math.min(100, score);
      const level: RiskLevel = score > 70 ? 'high' : score > 40 ? 'moderate' : 'low';

      return {
        plantId,
        plantName: 'Neem',
        threatenedDisease: 'Leaf Web Blight & Foliar Necrosis (Rhizoctonia solani)',
        pathogenType: 'Soil-borne Fungal',
        riskLevel: level,
        riskScore: score,
        primaryTrigger: triggers.join('; ') || 'Weather parameters within dry, well-aerated safe range',
        preventativeAdvisory: [
          'Prune overlapping inner branches to facilitate wind passage and sunlight penetration.',
          'Drench root zone with beneficial bio-agent Pseudomonas fluorescens (5g/L).',
          'Remove and burn fallen dead leaves beneath the canopy to eliminate overwintering sclerotia.',
        ],
      };
    }

    case 'mint': {
      // Mint Rust (Puccinia menthae): High humidity and moist foliage
      let score = 25;
      let triggers = [];

      if (humidityPct >= 70) {
        score += 40;
        triggers.push(`Persistent atmospheric moisture (${humidityPct}%) supports orange rust teliospore propagation`);
      }

      if (temperatureC >= 18 && temperatureC <= 26) {
        score += 25;
        triggers.push(`Mild moderate temperatures (${temperatureC}°C) ideal for rust spore cycling`);
      }

      score = Math.min(100, score);
      const level: RiskLevel = score > 65 ? 'high' : score > 40 ? 'moderate' : 'low';

      return {
        plantId,
        plantName: 'Mint',
        threatenedDisease: 'Mint Rust & Leaf Anthracnose (Puccinia menthae)',
        pathogenType: 'Basidiomycete Rust Fungus',
        riskLevel: level,
        riskScore: score,
        primaryTrigger: triggers.join('; ') || 'Low humidity prevents rust sporulation',
        preventativeAdvisory: [
          'Water strictly at soil base; keep leaves completely dry during evening hours.',
          'Harvest dense stands promptly to avoid humid microclimates within the herb bed.',
          'Isolate any stems showing orange-yellow pustules on leaf undersides.',
        ],
      };
    }

    case 'ashwagandha': {
      // Alternaria Leaf Blight & Seedling Damping-off
      let score = 15;
      let triggers = [];

      if (humidityPct >= 75) {
        score += 35;
        triggers.push(`High humidity (${humidityPct}%) triggers Alternaria conidia germination`);
      }

      if (rainfallMm > 30) {
        score += 35;
        triggers.push(`Excess soil moisture (${rainfallMm}mm) stresses arid-adapted taproot system`);
      }

      score = Math.min(100, score);
      const level: RiskLevel = score > 65 ? 'high' : score > 35 ? 'moderate' : 'low';

      return {
        plantId,
        plantName: 'Ashwagandha',
        threatenedDisease: 'Alternaria Leaf Blight & Root Rot (Alternaria alternata)',
        pathogenType: 'Ascomycete Fungal',
        riskLevel: level,
        riskScore: score,
        primaryTrigger: triggers.join('; ') || 'Dry climatic conditions align with natural semi-arid habitat',
        preventativeAdvisory: [
          'Maintain raised soil beds with drainage channels for rapid rainwater exit.',
          'Spray fermented buttermilk (10% concentration) or copper oxychloride (2g/L) as a prophylactic barrier.',
          'Weed regularly to eliminate wild Solanaceae host weeds near your plants.',
        ],
      };
    }

    case 'curry_leaf': {
      // Asian Citrus Psyllid & Sooty Mold / Leaf Spot
      let score = 20;
      let triggers = [];

      if (temperatureC >= 32 && humidityPct < 50) {
        score += 40;
        triggers.push(`Hot dry conditions (${temperatureC}°C) accelerate sap-sucking psyllid insect reproduction`);
      } else if (humidityPct >= 80 && temperatureC >= 26) {
        score += 35;
        triggers.push(`Hot humid conditions trigger fungal leaf spot (Cercospora)`);
      }

      score = Math.min(100, score);
      const level: RiskLevel = score > 60 ? 'high' : score > 35 ? 'moderate' : 'low';

      return {
        plantId,
        plantName: 'Curry Leaf',
        threatenedDisease: 'Citrus Psyllid Infestation & Cercospora Leaf Spot (Diaphorina citri)',
        pathogenType: 'Insect Vector & Fungal',
        riskLevel: level,
        riskScore: score,
        primaryTrigger: triggers.join('; ') || 'Balanced ambient climate prevents extreme pest surges',
        preventativeAdvisory: [
          'Inspect fresh tender shoots for tiny nymph insects with white waxy secretions.',
          'Spray 5% neem seed oil (5ml/L) with liquid soap thoroughly on both leaf surfaces.',
          'Apply monthly sour buttermilk foliar drench to strengthen epidermal resistance.',
        ],
      };
    }
  }
}
