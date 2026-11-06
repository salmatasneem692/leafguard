import { MedicinalInfo, DiseaseCondition, PlantSpeciesId } from '../types/index.ts';

// Botanical high-res sample references generated for the application
import neemImg from '../assets/images/leaf_neem_sample_1791208950491.jpg';
import tulsiImg from '../assets/images/leaf_tulsi_sample_1791208970212.jpg';
import aloeImg from '../assets/images/leaf_aloe_sample_1791208983417.jpg';
import ashwagandhaImg from '../assets/images/leaf_ashwagandha_sample_1791208997367.jpg';
import mintImg from '../assets/images/leaf_mint_sample_1791209009487.jpg';
import curryImg from '../assets/images/leaf_curry_sample_1791209025162.jpg';
import diseasedImg from '../assets/images/leaf_disease_sample_1791209039046.jpg';

export const SAMPLE_IMAGES = {
  neem: neemImg,
  tulsi: tulsiImg,
  aloe_vera: aloeImg,
  ashwagandha: ashwagandhaImg,
  mint: mintImg,
  curry_leaf: curryImg,
  diseased_sample: diseasedImg,
};

export const MEDICINAL_PLANTS: Record<PlantSpeciesId, MedicinalInfo> = {
  neem: {
    id: 'neem',
    name: 'Neem',
    commonName: 'Indian Lilac / Margosa',
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    habitat: 'Native to the Indian subcontinent; thrives in tropical and semi-arid regions.',
    ayurvedicQualities: {
      rasa: 'Tikta (Bitter), Kashaya (Astringent)',
      virya: 'Sheeta (Cooling)',
      vipaka: 'Katu (Pungent)',
      doshaEffect: 'Pacifies Pitta and Kapha; increases Vata in excess',
    },
    activePhytochemicals: [
      'Azadirachtin (natural bio-pesticide)',
      'Nimbin & Nimbidin (anti-inflammatory triterpenoids)',
      'Gedunin (antimalarial limonoid)',
      'Quercetin (antioxidant flavonoid)',
    ],
    primaryMedicinalUses: [
      'Traditionally prepared in dermatological formulations for skin purifications, acne, and eczema.',
      'Chewed or applied as twigs (Datun) in oral hygiene for anti-gingivitis and dental plaque prevention.',
      'Used as an herbal blood purifier and immunomodulatory decoction in classical Ayurveda.',
      'Natural agricultural biopesticide and insect repellent safe for organic farming.',
    ],
    pharmacologicalProperties: [
      'Potent broad-spectrum antibacterial & antifungal activity',
      'Anti-inflammatory and analgesic properties',
      'Antioxidant and hepatoprotective support',
      'Insecticidal and antifeedant botanical compound',
    ],
    commonPlantDiseases: [
      'Neem Leaf Web Blight (Rhizoctonia solani)',
      'Cercospora Leaf Spot (Cercospora subsessilis)',
      'Powdery Mildew (Oidium azadirachtae)',
      'Twig Canker & Dieback (Fusarium oxysporum)',
    ],
    leafMorphology: 'Alternate, pinnately compound, 20–40 cm long with 20–31 medium-to-dark green leaflets having distinctly serrated (toothed) margins.',
    precautionsAndWarnings: [
      'Strictly avoid excessive internal consumption during pregnancy or planning conception (traditional emmenagogue effects).',
      'High internal doses may stress renal and hepatic function; use under qualified herbal guidance.',
      'Keep neem seed oil extract out of reach of young infants.',
    ],
    sampleImage: neemImg,
  },
  tulsi: {
    id: 'tulsi',
    name: 'Tulsi',
    commonName: 'Holy Basil / Queen of Herbs',
    scientificName: 'Ocimum tenuiflorum',
    family: 'Lamiaceae (Mint Family)',
    habitat: 'Indigenous to India and Southeast Asia; widely cultivated across subtropical and temperate zones.',
    ayurvedicQualities: {
      rasa: 'Katu (Pungent), Tikta (Bitter)',
      virya: 'Ushna (Heating)',
      vipaka: 'Katu (Pungent)',
      doshaEffect: 'Balances Vata and Kapha; mildly increases Pitta',
    },
    activePhytochemicals: [
      'Eugenol (major phenolic volatile oil component)',
      'Ursolic acid (cardioprotective and antiviral triterpene)',
      'Rosmarinic acid (potent antioxidant polyphenol)',
      'Caryophyllene (anti-inflammatory sesquiterpene)',
    ],
    primaryMedicinalUses: [
      'Infused as herbal tea (Kadha) for upper respiratory tract relief, colds, coughs, and sore throat.',
      'Employed as a premier herbal adaptogen to alleviate physical, psychological, and metabolic stress.',
      'Aids healthy glucose metabolism and supports cardiovascular arterial elasticity.',
      'Used topically in herbal pastes for insect stings, ringworm, and minor cutaneous abrasions.',
    ],
    pharmacologicalProperties: [
      'Adaptogenic and neuroprotective action',
      'Immunostimulant and bronchodilator qualities',
      'Antimicrobial action against Gram-positive bacteria',
      'Free-radical scavenging cellular protection',
    ],
    commonPlantDiseases: [
      'Downy Mildew (Peronospora belbahrii)',
      'Fusarium Wilt (Fusarium oxysporum f. sp. basilicum)',
      'Cercospora Leaf Spot (Cercospora ocimicola)',
      'Bacterial Leaf Spot (Pseudomonas cichorii)',
    ],
    leafMorphology: 'Opposite, simple, green or purplish leaves, 2–5 cm long, ovate to elliptic with slightly toothed margins and glandular aromatic trichomes.',
    precautionsAndWarnings: [
      'May enhance anticoagulant effects; exercise caution before scheduled surgeries or with blood thinners.',
      'High doses may lower blood sugar levels; monitor glucose if co-administered with diabetic medication.',
      'Do not boil excessively to prevent volatilization of essential phenolic oils.',
    ],
    sampleImage: tulsiImg,
  },
  aloe_vera: {
    id: 'aloe_vera',
    name: 'Aloe Vera',
    commonName: 'Ghritkumari / Burn Plant',
    scientificName: 'Aloe barbadensis miller',
    family: 'Asphodelaceae',
    habitat: 'Arid, tropical, and desert ecosystems; drought-tolerant succulent adapted to well-drained sandy soil.',
    ayurvedicQualities: {
      rasa: 'Tikta (Bitter), Madhura (Sweet)',
      virya: 'Sheeta (Cooling)',
      vipaka: 'Madhura (Sweet)',
      doshaEffect: 'Tridoshic (Balances Vata, Pitta, and Kapha)',
    },
    activePhytochemicals: [
      'Acemannan (immunostimulatory complex polysaccharide)',
      'Aloin / Barbaloin (anthraquinone glycoside)',
      'Aloe-emodin (antimicrobial anthraquinone)',
      'Vitamins A, C, E and essential trace minerals (Zinc, Magnesium)',
    ],
    primaryMedicinalUses: [
      'Topical application of inner parenchyma gel for superficial burns, sunburn, and wound healing acceleration.',
      'Promotes cellular hydration, epidermal barrier repair, and collagen synthesis in cosmetic applications.',
      'Purified inner fillet juice consumed in regulated quantities for gastric soothe and digestive transit.',
      'Traditional Ayurvedic tonic (Kumaryasava) for female reproductive wellness and liver support.',
    ],
    pharmacologicalProperties: [
      'Epithelial cell proliferation and wound closure promotion',
      'Cooling anti-inflammatory topical action',
      'Humectant moisturizing mucosal soothing',
      'Antioxidant protection against solar UV radiation damage',
    ],
    commonPlantDiseases: [
      'Aloe Rust (Uromyces aloes)',
      'Anthracnose & Leaf Rot (Colletotrichum gloeosporioides)',
      'Bacterial Soft Rot (Dickeya dadantii)',
      'Basal Stem Rot (Fusarium and Phytophthora spp.)',
    ],
    leafMorphology: 'Sessile, thick fleshy succulent lanceolate leaves arranged in rosette form; pale to bright green with small, whitish serrated teeth along edges.',
    precautionsAndWarnings: [
      'Yellow latex layer beneath the rind contains potent anthraquinones (Aloin) which act as strong laxatives; do not ingest crude whole-leaf extract.',
      'Avoid oral intake during pregnancy and lactation due to uterine stimulation potential.',
      'Always patch-test topical gel to exclude contact dermatitis in hypersensitive individuals.',
    ],
    sampleImage: aloeImg,
  },
  ashwagandha: {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    commonName: 'Indian Ginseng / Winter Cherry',
    scientificName: 'Withania somnifera',
    family: 'Solanaceae (Nightshade Family)',
    habitat: 'Dry subtropical regions of India, the Middle East, and parts of North Africa.',
    ayurvedicQualities: {
      rasa: 'Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)',
      virya: 'Ushna (Heating)',
      vipaka: 'Madhura (Sweet)',
      doshaEffect: 'Balances Vata and Kapha; may aggravate Pitta in excess',
    },
    activePhytochemicals: [
      'Withanolides (Withaferin A & Withanolide D steroidal lactones)',
      'Alkaloids (Withanine, Somniferine, Tropine)',
      'Sitoindosides (adaptogenic antioxidant glycowithanolides)',
      'Saponins and amino acids',
    ],
    primaryMedicinalUses: [
      'Revered adaptogenic Rasayana (rejuvenator) that modulates the HPA axis to reduce cortisol and stress.',
      'Supports neuromuscular vigor, muscle strength, and athletic endurance recovery.',
      'Promotes calm restful sleep without daytime drowsiness by GABAergic neurotransmission support.',
      'Traditionally prescribed for vitality, cognitive focus, and vitality enhancement.',
    ],
    pharmacologicalProperties: [
      'Corticosteroid regulation and adaptogenic resistance',
      'Anxiolytic and nootropic cognitive support',
      'Anti-inflammatory and chondroprotective effects',
      'Endocrine and thyroid hormone modulation',
    ],
    commonPlantDiseases: [
      'Alternaria Leaf Blight (Alternaria alternata)',
      'Damping Off and Seedling Rot (Pythium debaryanum)',
      'Cercospora Leaf Spot (Cercospora withaniae)',
      'Root Rot and Collar Rot (Macrophomina phaseolina)',
    ],
    leafMorphology: 'Simple, alternate, dull green, elliptic to ovate leaves, usually up to 10–12 cm long, with smooth margins and finely pubescent undersides.',
    precautionsAndWarnings: [
      'Contraindicated during pregnancy as it may possess abortifacient properties at high herbal dosages.',
      'May potentiate sedative drugs, barbiturates, and thyroid medications; consult a physician.',
      'Avoid in patients with active autoimmune disorders unless monitored by an integrative clinician.',
    ],
    sampleImage: ashwagandhaImg,
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    commonName: 'Pudina / Spearmint / Peppermint',
    scientificName: 'Mentha spicata / Mentha piperita',
    family: 'Lamiaceae (Mint Family)',
    habitat: 'Moist, fertile environments; easily cultivated across temperate and tropical zones globally.',
    ayurvedicQualities: {
      rasa: 'Katu (Pungent)',
      virya: 'Sheeta (Cooling after initial pungent sensation)',
      vipaka: 'Katu (Pungent)',
      doshaEffect: 'Balances all three doshas; particularly cooling for Pitta',
    },
    activePhytochemicals: [
      'Menthol (characteristic cooling monocyclic monoterpene)',
      'Menthone & Isomenthone',
      'Carvone (in Spearmint varieties)',
      'Limonene and caffeic acid derivatives',
    ],
    primaryMedicinalUses: [
      'Widely formulated for gastrointestinal relief, flatulence, nausea, indigestion, and irritable bowel symptoms.',
      'Menthol vapours inhaled for opening congested nasal airways and reducing head tension.',
      'Topically applied in cooling balms for local muscle ache relief and cephalic cooling.',
      'Popular herbal digestive garnish and refreshing beverage component across culinary traditions.',
    ],
    pharmacologicalProperties: [
      'Antispasmodic action on gastrointestinal smooth muscle',
      'Carminative and digestive secretion stimulus',
      'Topical cryo-receptor stimulant giving sensation of cooling',
      'Antibacterial activity against oral pathogens',
    ],
    commonPlantDiseases: [
      'Mint Rust (Puccinia menthae)',
      'Verticillium Wilt (Verticillium dahliae)',
      'Powdery Mildew (Erysiphe biocellata)',
      'Leaf Flea Beetles & Spider Mite infestation',
    ],
    leafMorphology: 'Opposite, simple, aromatic, deep green leaves with sharply serrated edges, lanceolate to ovate shape, and prominent net-like venation.',
    precautionsAndWarnings: [
      'May relax lower esophageal sphincter; individuals with severe GERD (acid reflux) should consume with moderation.',
      'Pure concentrated menthol essential oil must never be applied near the face or nostrils of infants.',
      'Use culinary preparations rather than concentrated extracts for daily domestic consumption.',
    ],
    sampleImage: mintImg,
  },
  curry_leaf: {
    id: 'curry_leaf',
    name: 'Curry Leaf',
    commonName: 'Kadi Patta / Sweet Neem',
    scientificName: 'Murraya koenigii',
    family: 'Rutaceae (Citrus Family)',
    habitat: 'Native to India and Sri Lanka; found in wild forests and domestic homestead gardens throughout the tropics.',
    ayurvedicQualities: {
      rasa: 'Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)',
      virya: 'Sheeta (Cooling)',
      vipaka: 'Katu (Pungent)',
      doshaEffect: 'Alleviates Pitta and Kapha; stimulates digestive fire (Agni)',
    },
    activePhytochemicals: [
      'Mahanimbine & Girinimbine (carbazole alkaloids)',
      'Koenimbine and Koenidine',
      'Beta-caryophyllene, alpha-pinene (aromatic terpenes)',
      'Iron, Calcium, Vitamin A, and Riboflavin',
    ],
    primaryMedicinalUses: [
      'Traditionally infused into pure coconut oil as a hair tonic to prevent premature greying and strengthen follicles.',
      'Consumed to stimulate appetite, optimize gut microbiota, and combat morning sickness.',
      'Studied for anti-hyperglycemic properties helping modulate postprandial glucose surges.',
      'Essential culinary aromatic imparting bioavailable trace minerals and micronutrients in daily diet.',
    ],
    pharmacologicalProperties: [
      'Carbazole alkaloid antioxidant and anti-lipid peroxidation activity',
      'Antidiabetic and alpha-glucosidase inhibitory potential',
      'Hepatoprotective and gastroprotective properties',
      'Hair follicular nourishment and melanin preservation',
    ],
    commonPlantDiseases: [
      'Citrus Leaf Miner (Phyllocnistis citrella)',
      'Sooty Mold (associated with scale insect honeydew)',
      'Leaf Spot (Colletotrichum and Phyllosticta spp.)',
      'Psyllid infestation (Diaphorina citri)',
    ],
    leafMorphology: 'Alternate, pinnate compound leaves, 15–30 cm long with 11–25 obliquely ovate to lanceolate, highly aromatic glossy dark green leaflets.',
    precautionsAndWarnings: [
      'Commercially sourced fresh leaves may carry pesticide residues; thoroughly wash under running water or source organically.',
      'Generally safe and beneficial in culinary amounts; medicinal extracts should follow balanced regimens.',
      'Persons with specific Rutaceae plant allergies should observe patch tolerance.',
    ],
    sampleImage: curryImg,
  },
};

export const PLANT_DISEASES: Record<PlantSpeciesId, DiseaseCondition[]> = {
  neem: [
    {
      id: 'neem_leaf_spot',
      plantId: 'neem',
      name: 'Cercospora Leaf Spot',
      pathogenType: 'fungal',
      symptoms: [
        'Small, circular to irregular dark brown lesions with necrotic grey centers on mature leaves.',
        'Yellowish chlorotic halo surrounding lesions.',
        'Premature leaf senescence and defoliation during prolonged humid monsoon periods.',
      ],
      severity: 'moderate',
      organicRemedy: [
        'Prune and destroy heavily infected lower foliage to reduce local spore load.',
        'Spray with 1% Bordeaux mixture or 5% neem seed kernel extract (NSKE) at 10-day intervals.',
        'Ensure open canopy spacing to encourage direct sun exposure and rapid air drying.',
      ],
      preventiveMeasures: [
        'Avoid high-pressure overhead irrigation that splashes soil fungi onto lower leaves.',
        'Maintain balanced soil potassium and avoid excessive nitrogenous fertilizers.',
      ],
    },
  ],
  tulsi: [
    {
      id: 'tulsi_cercospora_leaf_spot',
      plantId: 'tulsi',
      name: 'Cercospora Leaf Spot & Blight',
      pathogenType: 'fungal',
      symptoms: [
        'Distinct dark brown circular lesions with characteristic yellow chlorotic halos across the leaf surface.',
        'Lesions expand and coalesce, leading to foliar necrosis, leaf yellowing, and premature drop.',
        'Diminished medicinal volatile essential oil aroma and stunted foliage development.',
      ],
      severity: 'moderate',
      organicRemedy: [
        'Prune off severely infected leaves with sterilized shears and dispose of them away from the garden.',
        'Spray with 5% cold-pressed neem seed kernel extract (NSKE) or organic copper soap fungicide at 7–10 day intervals.',
        'Apply Trichoderma viride or Pseudomonas bio-fungicide spray to outcompete fungal spores.',
      ],
      preventiveMeasures: [
        'Water exclusively at the soil level; keep foliage completely dry during morning irrigation.',
        'Ensure open canopy spacing with 6+ hours of bright morning sunlight and adequate air ventilation.',
      ],
    },
    {
      id: 'tulsi_powdery_mildew',
      plantId: 'tulsi',
      name: 'Powdery Mildew & Leaf Blight',
      pathogenType: 'fungal',
      symptoms: [
        'White talcum-like superficial fungal growth coating the upper leaf blade surface.',
        'Leaves turn brittle, curl upward at edges, and wither prematurely.',
        'Diminished volatile essential oil aroma and stunted terminal shoot growth.',
      ],
      severity: 'moderate',
      organicRemedy: [
        'Foliar spray with diluted milk solution (1 part milk : 9 parts water) under bright morning sunlight.',
        'Spray potassium bicarbonate or mild baking soda solution (5g/liter with a drop of organic liquid soap).',
        'Dust agricultural wettable sulfur during early cooler hours.',
      ],
      preventiveMeasures: [
        'Plant in full morning sunlight with minimum 6 hours of direct solar exposure.',
        'Thin out overcrowded central branches to facilitate constant ventilation.',
      ],
    },
  ],
  aloe_vera: [
    {
      id: 'aloe_rust_leaf_spot',
      plantId: 'aloe_vera',
      name: 'Aloe Rust & Anthracnose',
      pathogenType: 'fungal',
      symptoms: [
        'Distinct small, circular brownish-black sunken pustules on the succulent leaf epidermis.',
        'Pustules expand into hard, dark necrotic lesions with surrounding water-soaked halos.',
        'Gel inside the leaf parenchyma may oxidize or discolor near deep lesion sites.',
      ],
      severity: 'moderate',
      organicRemedy: [
        'Carefully excise severely affected outer leaf blades using a sterilized razor blade.',
        'Allow cut succulent surfaces to callus in dry shade; do not irrigate over open cuts.',
        'Apply copper-based botanical fungicide or colloidal sulfur sparingly at basal areas.',
      ],
      preventiveMeasures: [
        'Substantially reduce watering frequency; allow soil to dry completely between cycles.',
        'Grow only in fast-draining gritty cactus soil mix; eliminate standing water in potting saucer.',
      ],
    },
  ],
  ashwagandha: [
    {
      id: 'ashwagandha_alternaria_blight',
      plantId: 'ashwagandha',
      name: 'Alternaria Leaf Blight',
      pathogenType: 'fungal',
      symptoms: [
        'Concentric target-board rings on leaves ranging from light brown to charcoal black.',
        'Lesions coalesce, causing broad-scale foliar necrosis and premature leaf drop.',
        'Plant shows reduced root growth and weakened vigor.',
      ],
      severity: 'severe',
      organicRemedy: [
        'Collect and burn fallen diseased plant debris; do not add to compost heaps.',
        'Spray with Trichoderma viride or Pseudomonas fluorescens biological biocontrol formulations.',
        'Apply copper oxychloride (0.25%) if fungal spread is aggressive.',
      ],
      preventiveMeasures: [
        'Implement crop rotation with non-solanaceous crops.',
        'Treat planting seeds with bio-formulations prior to sowing in nursery beds.',
      ],
    },
  ],
  mint: [
    {
      id: 'mint_rust',
      plantId: 'mint',
      name: 'Mint Rust (Puccinia menthae)',
      pathogenType: 'fungal',
      symptoms: [
        'Dusty orange-yellow to reddish-brown spore pustules beneath the lower leaf surface.',
        'Yellow chlorotic mottling on the corresponding upper leaf blade.',
        'Infected leaves distort, turn dark brown, and drop prematurely.',
      ],
      severity: 'moderate',
      organicRemedy: [
        'Harvest all top foliage immediately down to soil level; healthy new shoots will regenerate.',
        'Apply hot water dip treatment (50°C for 5 minutes) to dormant root runners before replanting.',
        'Spray with wettable sulfur or copper hydroxide.',
      ],
      preventiveMeasures: [
        'Avoid wet foliage overnight; water exclusively at soil level in early mornings.',
        'Divide and replant mint beds every 2 to 3 years to prevent pathogen accumulation.',
      ],
    },
  ],
  curry_leaf: [
    {
      id: 'curry_sooty_mold_miner',
      plantId: 'curry_leaf',
      name: 'Citrus Leaf Miner & Sooty Mold',
      pathogenType: 'pest',
      symptoms: [
        'Silvery serpentine serpentine tunnels/mines visible within the leaflet epidermis.',
        'Curled, distorted new flush leaflets with stunted shoot tips.',
        'Secondary black superficial sooty mold coating leaf surfaces following sap-sucking insect honeydew.',
      ],
      severity: 'moderate',
      organicRemedy: [
        'Spray 2% cold-pressed neem seed oil emulsion with gentle detergent once weekly.',
        'Gently wash off black superficial sooty mold with dilute soap-water sponge.',
        'Introduce predatory beneficial insects like green lacewings or parasitic wasps.',
      ],
      preventiveMeasures: [
        'Prune off heavily mined new shoots during early attack phases.',
        'Install yellow sticky traps near the canopy to monitor adult micro-moth populations.',
      ],
    },
  ],
};
