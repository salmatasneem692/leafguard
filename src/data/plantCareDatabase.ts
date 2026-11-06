/**
 * LeafGuard AI – Personalized Plant-Care & Agronomic Guidance Database
 * Provides tailored botanical instructions based on identified species and user growing conditions.
 */

import { PlantSpeciesId } from '../types/index.ts';

export type GrowingEnvironment = 'indoor_pot' | 'outdoor_garden' | 'balcony_container' | 'agricultural_field';
export type ClimateSeason = 'monsoon_rainy' | 'dry_summer' | 'moderate_winter' | 'spring';
export type SoilType = 'red_loam' | 'potting_mix' | 'sandy_soil' | 'clay_soil';

export interface PlantCareProtocol {
  plantId: PlantSpeciesId;
  plantName: string;
  botanicalFamily: string;
  generalSunlight: string;
  generalWatering: string;
  soilMix: string;
  idealTemperature: string;
  phRange: string;
  pruningSeason: string;
  fertilizerNeeds: string;
  commonPests: { pest: string; remedy: string }[];
  seasonalCare: Record<ClimateSeason, string>;
  environmentalAdjustments: Record<GrowingEnvironment, string>;
}

export const PERSONALIZED_CARE_DATABASE: Record<PlantSpeciesId, PlantCareProtocol> = {
  neem: {
    plantId: 'neem',
    plantName: 'Neem',
    botanicalFamily: 'Meliaceae',
    generalSunlight: 'Full direct sunlight (minimum 6–8 hours daily). Highly resilient to intense tropical radiation.',
    generalWatering: 'Deep, infrequent watering. Allow the top 2–3 inches of soil to dry between waterings. Drought-hardy once root system establishes.',
    soilMix: 'Well-draining sandy loam or red soil. Adapts to rocky soils; intolerant of poorly drained waterlogged clay.',
    idealTemperature: '20°C to 40°C. Sensitive to hard winter frost below 4°C.',
    phRange: '6.2 – 7.8 (neutral to mildly alkaline)',
    pruningSeason: 'Early spring before new vegetative flush. Remove dead or crisscrossing branches to encourage canopy aeration.',
    fertilizerNeeds: 'Minimal. Annual topdressing with well-decomposed farmyard manure (FYM) or vermicompost before the monsoon.',
    commonPests: [
      { pest: 'Neem Web Blight / Tea Mosquito Bug', remedy: 'Spray 5% neem seed kernel extract (NSKE) or diluted cow-urine ferment (1:10).' },
      { pest: 'Scale Insects', remedy: 'Dab with cotton soaked in organic horticultural oil or mild soapy potassium salt spray.' },
    ],
    seasonalCare: {
      monsoon_rainy: 'Ensure adequate drainage trenches. Inspect leaf undersides weekly for fungal web blight.',
      dry_summer: 'Mulch around root zone with dry straw or leaf litter to retain moisture. Water twice a week during severe heatwaves.',
      moderate_winter: 'Reduce watering frequency by 50%. Protect young saplings from cold drafts.',
      spring: 'Apply fresh organic vermicompost and prune canopy tips to stimulate healthy medicinal foliage.',
    },
    environmentalAdjustments: {
      indoor_pot: 'Needs a deep container (at least 18-24 inches) near a south-facing sunny window. Prune regularly as a dwarf tree.',
      outdoor_garden: 'Provide at least 3-4 meters spacing from building foundations as neem develops an expansive taproot system.',
      balcony_container: 'Use terracotta pots with multiple drainage holes. Turn pot weekly to ensure symmetrical sunlight exposure.',
      agricultural_field: 'Plant at 5m × 5m or 8m × 8m spacing. Excellent windbreak and natural pest-repellent perimeter crop.',
    },
  },
  tulsi: {
    plantId: 'tulsi',
    plantName: 'Tulsi (Holy Basil)',
    botanicalFamily: 'Lamiaceae',
    generalSunlight: 'Bright direct morning sunlight (4–6 hours daily). Afternoon filtered shade prevents leaf scorch in hot climates.',
    generalWatering: 'Regular, moderate watering. Water when the top 1 inch of soil feels dry. Intolerant of standing water.',
    soilMix: 'Rich, aerated loam with 40% garden soil, 30% vermicompost, 20% cocopeat, and 10% coarse sand/perlite.',
    idealTemperature: '22°C to 35°C. Suffers severe leaf drop and chlorosis below 12°C.',
    phRange: '6.0 – 7.5',
    pruningSeason: 'Pinch flower spikes (manjaris) regularly to redirect energy into leaf branching and prevent leggy senescence.',
    fertilizerNeeds: 'Bi-weekly feeding with liquid seaweed extract or diluted vermicompost tea during active growth.',
    commonPests: [
      { pest: 'Aphids & Whiteflies', remedy: 'Spray diluted neem oil (5ml/L + 2 drops mild soap) in early morning.' },
      { pest: 'Downy / Powdery Mildew', remedy: 'Improve ventilation, avoid overhead watering, and spray diluted baking soda solution (3g/L).' },
    ],
    seasonalCare: {
      monsoon_rainy: 'Elevate pots on brick stands to prevent root rot. Stop overhead splashing onto leaves.',
      dry_summer: 'Mist surrounding air in the morning. Water daily in early morning or late dusk.',
      moderate_winter: 'Move pots to warmest sun-exposed spot. Drape light cotton cloth overnight if temperatures plunge below 15°C.',
      spring: 'Repot into fresh nutrient-rich potting mix and pinch apical shoots for bushier medicinal yield.',
    },
    environmentalAdjustments: {
      indoor_pot: 'Place on well-lit windowsill or use full-spectrum grow light (12 hrs/day). Ensure good room air circulation.',
      outdoor_garden: 'Plant in raised herbal beds with rich organic matter and compost-enriched moisture-retentive soil.',
      balcony_container: 'Ideal for 10-12 inch clay pots. Protect from heavy monsoon rain downpours.',
      agricultural_field: 'Cultivated in ridges and furrows with drip irrigation for commercial essential oil distillation.',
    },
  },
  aloe_vera: {
    plantId: 'aloe_vera',
    plantName: 'Aloe Vera',
    botanicalFamily: 'Asphodelaceae',
    generalSunlight: 'Bright indirect to direct sunlight (4–6 hours). Excessive scorching noon sun can turn leaves brownish-red.',
    generalWatering: 'Soak and dry method: Water thoroughly until water drains out, then wait 2–3 weeks until soil is bone dry.',
    soilMix: 'Cactus/succulent blend: 50% coarse sand/pumice, 30% perlite, 20% well-draining garden soil. Zero water retention.',
    idealTemperature: '18°C to 38°C. Susceptible to rot if damp at low temperatures (<10°C).',
    phRange: '7.0 – 8.5 (neutral to alkaline)',
    pruningSeason: 'Harvest mature outermost bottom leaves with a sterile knife, leaving the central growing rosette intact.',
    fertilizerNeeds: 'Light feeder. Feed with diluted organic balanced succulent fertilizer once in spring and once in summer.',
    commonPests: [
      { pest: 'Mealybugs in leaf axils', remedy: 'Dab with cotton bud dipped in 70% isopropyl alcohol.' },
      { pest: 'Basal stem / Root Rot', remedy: 'Strictly stop watering, remove rotting leaf tissue, and replant in dry sand with cinnamon powder.' },
    ],
    seasonalCare: {
      monsoon_rainy: 'Move outdoor pots under rain shelter immediately. A single prolonged waterlogging can dissolve root cores.',
      dry_summer: 'Growth period. Water every 10-14 days. If tips turn brown, provide light partial midday shade.',
      moderate_winter: 'Semi-dormancy: Reduce watering to once a month. Keep completely dry at night.',
      spring: 'Separate healthy offset pups from mother plant and pot individually into terracotta containers.',
    },
    environmentalAdjustments: {
      indoor_pot: 'Use unglazed terracotta pot with large drainage hole. Keep away from humid bathrooms or damp dark corners.',
      outdoor_garden: 'Plant on elevated rock gardens or sloped mounds where rainwater runs off freely.',
      balcony_container: 'Ensure saucer is never filled with stagnant runoff water.',
      agricultural_field: 'Commercial spacing 60cm × 60cm on raised sandy-loam beds with micro-sprinkler or drip emitters.',
    },
  },
  ashwagandha: {
    plantId: 'ashwagandha',
    plantName: 'Ashwagandha',
    botanicalFamily: 'Solanaceae',
    generalSunlight: 'Full direct sunlight (6–8 hours). Requires warm, sunny microclimate for alkaloid synthesis.',
    generalWatering: 'Low to moderate moisture. Water once or twice weekly. Overwatering triggers Pythium root rot.',
    soilMix: 'Sandy-loam or well-aerated red soil with excellent internal drainage. Low organic matter preferred.',
    idealTemperature: '20°C to 38°C. Harvest roots after 150-180 days when berries turn red.',
    phRange: '7.5 – 8.5 (prefers slightly alkaline conditions)',
    pruningSeason: 'Pinch top shoots when plant reaches 30cm to encourage branching. Prune dying leaves.',
    fertilizerNeeds: 'Low fertility requirement. Excessive nitrogen promotes leafy foliage at the expense of medicinal root active withanolides.',
    commonPests: [
      { pest: 'Hadda Beetle & Aphids', remedy: 'Dust with neem wood ash or spray organic pyrethrum/neem oil.' },
      { pest: 'Leaf Spot (Alternaria)', remedy: 'Avoid overhead sprinkler irrigation; spray fermented butter-milk (1:10).' },
    ],
    seasonalCare: {
      monsoon_rainy: 'Ensure raised planting beds so roots never sit in saturated muddy soils.',
      dry_summer: 'Ideal growth season. Deep soak every 5 days.',
      moderate_winter: 'Growth slows down. Prepare for root harvesting in late winter as leaves begin to yellow and drop.',
      spring: 'Sow fresh seeds in sandy nursery beds with light moisture.',
    },
    environmentalAdjustments: {
      indoor_pot: 'Requires deep root containers (at least 16-20 inches) and full sunny exposure.',
      outdoor_garden: 'Select the sunniest, driest sector of your herb garden away from water-thirsty plants.',
      balcony_container: 'Use porous clay pots with 30% gravel or perlite in the base.',
      agricultural_field: 'Cultivated as a rainfed or semi-irrigated dryland commercial medicinal cash crop.',
    },
  },
  mint: {
    plantId: 'mint',
    plantName: 'Mint (Pudina)',
    botanicalFamily: 'Lamiaceae',
    generalSunlight: 'Partial to full sunlight (3–5 hours direct). Prefers morning sun with protection from intense afternoon heat.',
    generalWatering: 'Frequent watering. Soil should remain consistently moist like a wrung-out sponge, but not waterlogged.',
    soilMix: 'Rich, moisture-retentive organic potting mix: 50% compost/vermicompost, 30% garden soil, 20% cocopeat.',
    idealTemperature: '18°C to 30°C. Thrives in cool, humid microclimates.',
    phRange: '6.0 – 7.0 (mildly acidic to neutral)',
    pruningSeason: 'Harvest stems frequently from top 1/3 to stimulate dense stolon growth. Never allow to bloom into full flower.',
    fertilizerNeeds: 'Monthly feeding with balanced organic nitrogen-rich fertilizer (fish emulsion or worm tea) for leafy growth.',
    commonPests: [
      { pest: 'Mint Rust (Puccinia menthae)', remedy: 'Isolate affected stems immediately, prune to base, and avoid wetting foliage during watering.' },
      { pest: 'Spider Mites', remedy: 'Wash leaf undersides with strong water spray and spray organic neem oil.' },
    ],
    seasonalCare: {
      monsoon_rainy: 'Growth accelerates rapidly. Prune stems bi-weekly to prevent overcrowding and fungal mildew.',
      dry_summer: 'Water twice daily in hot weather. Keep in partial shade beneath taller companion plants.',
      moderate_winter: 'Dies back in cold weather; mulch heavily with compost to protect creeping underground rhizomes.',
      spring: 'Vigorous regrowth. Divide root clumps and repot into fresh nutrient soil.',
    },
    environmentalAdjustments: {
      indoor_pot: 'Place in kitchen windowsill receiving good morning light. Rotate pot weekly for even growth.',
      outdoor_garden: 'Grow inside a contained sunken barrier or pot; otherwise creeping rhizomes will aggressively take over garden beds.',
      balcony_container: 'Shallow wide planters (6-8 inches deep, 14-18 inches wide) allow runners to root and multiply.',
      agricultural_field: 'Planted via stem stolons with regular sprinkler or furrow irrigation for continuous commercial leaf harvest.',
    },
  },
  curry_leaf: {
    plantId: 'curry_leaf',
    plantName: 'Curry Leaf (Kadi Patta)',
    botanicalFamily: 'Rutaceae',
    generalSunlight: 'Full direct sunlight (at least 6 hours). Young saplings appreciate partial shade during harsh summers.',
    generalWatering: 'Moderate watering. Water every 2–3 days when top 1.5 inches of soil is dry. Avoid wet soggy feet.',
    soilMix: 'Fertile, well-draining loamy red soil enriched with compost and coarse sand. Intolerant of saline or alkaline water.',
    idealTemperature: '24°C to 38°C. Drops leaves in cold winters below 15°C (dormancy).',
    phRange: '6.0 – 6.8 (prefers slightly acidic soil)',
    pruningSeason: 'Hard prune main branches in early spring to stimulate 3-4 new vigorous side flushes of aromatic leaves.',
    fertilizerNeeds: 'Monthly drenching with sour fermented buttermilk/curd water (1:10) provides lactic acid and essential micronutrients.',
    commonPests: [
      { pest: 'Citrus Psyllid & Scales', remedy: 'Spray 5ml neem oil + 2ml horticultural soap per liter of water.' },
      { pest: 'Fungal Leaf Spot', remedy: 'Spray fermented sour curd or 1% Bordeaux mixture on foliage.' },
    ],
    seasonalCare: {
      monsoon_rainy: 'Prime growth flush. Feed with organic bone meal or rock phosphate and vermicompost.',
      dry_summer: 'Mulch root zone and water deeply early in the day. Shield young plants from scorching winds.',
      moderate_winter: 'Deciduous leaf shedding is normal. Restrict watering significantly and do not fertilize until spring.',
      spring: 'Prune branches back by 20-30%, apply fresh compost and Epsom salt (1 tsp/gal) for rich green foliage.',
    },
    environmentalAdjustments: {
      indoor_pot: 'Difficult indoors; needs the sunniest south-facing balcony or patio spot. Minimum 14-inch terracotta pot.',
      outdoor_garden: 'Grows into an attractive small 3-5 meter tree in frost-free subtropical gardens.',
      balcony_container: 'Prune apical center shoot once it reaches 1 meter to encourage bushy compact branching.',
      agricultural_field: 'Harvested by cutting stem branches every 70-90 days under warm tropical conditions.',
    },
  },
};
