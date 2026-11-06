/**
 * LeafGuard AI – Multilingual Regional Language Translation & Q&A Assistant Database
 * Supports English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்)
 * Designed for rural farmers, home gardeners, and traditional medicine researchers.
 */

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'te' | 'ta';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  speechCode: string; // BCP 47 language tag for SpeechSynthesis
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechCode: 'en-US' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', speechCode: 'ta-IN' },
];

export interface PlantTranslation {
  name: string;
  scientificName: string;
  family: string;
  shortDesc: string;
  healthHealthy: string;
  healthDiseased: string;
  wateringSummary: string;
  safetyWarning: string;
}

export const REGIONAL_PLANT_DATA: Record<SupportedLanguage, Record<string, PlantTranslation>> = {
  en: {
    neem: {
      name: 'Neem',
      scientificName: 'Azadirachta indica',
      family: 'Meliaceae (Mahogany Family)',
      shortDesc: 'Known as the village pharmacy in India. Possesses broad antimicrobial and bio-insecticidal properties.',
      healthHealthy: 'Leaf shows healthy foliar color, clear venation, and no visible fungal or pest damage.',
      healthDiseased: 'Foliar blight or leaf spot observed. Yellowing and brown necrotic spots detected on leaf blade.',
      wateringSummary: 'Water thoroughly once a week. Highly drought-tolerant once established; avoid waterlogging.',
      safetyWarning: 'Caution: Identifying this plant does not guarantee it is safe for consumption. Avoid high doses during pregnancy.',
    },
    tulsi: {
      name: 'Tulsi (Holy Basil)',
      scientificName: 'Ocimum tenuiflorum',
      family: 'Lamiaceae (Mint Family)',
      shortDesc: 'Revered adaptogenic herb traditionally consumed in herbal decoctions for respiratory comfort and vitality.',
      healthHealthy: 'Vibrant green aromatic foliage with healthy glandular trichomes and intact leaf margins.',
      healthDiseased: 'Symptoms of downy mildew or fungal leaf spot detected. Dark patches visible on leaf blade.',
      wateringSummary: 'Water 3-4 times a week when topsoil dries. Protect from water stagnation around roots.',
      safetyWarning: 'Caution: Identification does not replace medical advice. May enhance blood-thinning effects.',
    },
    aloe_vera: {
      name: 'Aloe Vera',
      scientificName: 'Aloe barbadensis miller',
      family: 'Asphodelaceae (Succulent Family)',
      shortDesc: 'Succulent plant cultivated for soothing inner parenchymal gel used in burns, cuts, and skincare.',
      healthHealthy: 'Firm, turgid succulent leaf blade with healthy gel volume and no fungal basal lesions.',
      healthDiseased: 'Basal stem rot or anthracnose leaf spotting detected. Soft watery lesions on leaf epidermis.',
      wateringSummary: 'Water sparingly every 2-3 weeks. Allow soil to dry completely between waterings to prevent root rot.',
      safetyWarning: 'Caution: The yellow latex (aloin) under the outer skin is a harsh purgative and unsafe in large doses.',
    },
    ashwagandha: {
      name: 'Ashwagandha',
      scientificName: 'Withania somnifera',
      family: 'Solanaceae (Nightshade Family)',
      shortDesc: 'Prestigious Ayurvedic adaptogen known as Indian Ginseng, used to enhance endurance and reduce stress.',
      healthHealthy: 'Intact dull green ovate leaf with typical fine pubescence and normal venation.',
      healthDiseased: 'Leaf curl or fungal leaf blight spots detected. Irregular brown necrosis on margins.',
      wateringSummary: 'Water moderately once or twice a week. Requires dry, warm weather and sandy well-drained soil.',
      safetyWarning: 'Caution: Do not consume without professional guidance. Contraindicated during pregnancy.',
    },
    mint: {
      name: 'Mint (Pudina)',
      scientificName: 'Mentha spicata / piperita',
      family: 'Lamiaceae (Mint Family)',
      shortDesc: 'Aromatic digestive culinary herb rich in natural menthol, soothing gastric inflammation.',
      healthHealthy: 'Fresh serrated fragrant leaves with bright chlorophyll content and no rust pustules.',
      healthDiseased: 'Orange-brown rust spots (Mint Rust) or powdery mildew fungal patches detected on leaf blade.',
      wateringSummary: 'Keep soil consistently moist but never soggy. Water daily in hot summer weather.',
      safetyWarning: 'Caution: Pure concentrated menthol essential oil is toxic to infants and small pets.',
    },
    curry_leaf: {
      name: 'Curry Leaf (Kadi Patta)',
      scientificName: 'Murraya koenigii',
      family: 'Rutaceae (Citrus Family)',
      shortDesc: 'Nutrient-rich seasoning herb containing mahanimbine and iron, used in hair tonics and digestive cuisine.',
      healthHealthy: 'Glossy dark green pinnate leaflets with strong characteristic fragrance and healthy margins.',
      healthDiseased: 'Psyllid insect damage or fungal leaf spot visible. Curled leaf edges and brownish spots.',
      wateringSummary: 'Water every 2-3 days in well-draining organic soil. Requires full sunlight.',
      safetyWarning: 'Caution: Ensure leaves are thoroughly washed to remove any wild agricultural sprays before use.',
    },
  },
  kn: {
    neem: {
      name: 'ಬೇವಿನ ಗಿಡ (Neem)',
      scientificName: 'Azadirachta indica',
      family: 'ಮೆಲಿಯೇಸಿ (Meliaceae)',
      shortDesc: 'ಭಾರತದ ಹಳ್ಳಿಯ ಔಷಧಾಲಯ ಎಂದು ಹೆಸರುವಾಸಿ. ನೈಸರ್ಗಿಕ ಕ್ರಿಮಿನಾಶಕ ಮತ್ತು ರೋಗನಿರೋಧಕ ಗುಣಗಳನ್ನು ಹೊಂದಿದೆ.',
      healthHealthy: 'ಎಲೆಯು ಆರೋಗ್ಯಕರ ಹಸಿರು ಬಣ್ಣವನ್ನು ಹೊಂದಿದ್ದು, ಯಾವುದೇ ಶಿಲೀಂಧ್ರ ಅಥವಾ ಕೀಟಗಳ ಬಾಧೆ ಕಂಡುಬಂದಿಲ್ಲ.',
      healthDiseased: 'ಎಲೆ ಚುಕ್ಕೆ ರೋಗ ಅಥವಾ ಕಂದು ಬಣ್ಣದ ಶಿಲೀಂಧ್ರ ಮಚ್ಚೆಗಳು ಪತ್ತೆಯಾಗಿವೆ. ತುರ್ತು ಸಾವಯವ ಉಪಚಾರ ಅಗತ್ಯವಿದೆ.',
      wateringSummary: 'ವಾರಕ್ಕೊಮ್ಮೆ ಸರಿಯಾಗಿ ನೀರುಣಿಸಿ. ಒಣ ಹವೆಯನ್ನು ತಡೆದುಕೊಳ್ಳಬಲ್ಲದು, ಬೇರಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
      safetyWarning: 'ಎಚ್ಚರಿಕೆ: ಗಿಡ ಗುರುತಿಸುವಿಕೆಯು ನೇರ ಸೇವನೆಗೆ ಸುರಕ್ಷಿತ ಎಂದು ಖಚಿತಪಡಿಸುವುದಿಲ್ಲ. ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಸೇವಿಸಬೇಡಿ.',
    },
    tulsi: {
      name: 'ತುಳಸಿ (Tulsi)',
      scientificName: 'Ocimum tenuiflorum',
      family: 'ಲ್ಯಾಮಿಯೇಸಿ (Lamiaceae)',
      shortDesc: 'ಪವಿತ್ರ ಮತ್ತು ಔಷಧೀಯ ಗಿಡ. ಶೀತ, ಕೆಮ್ಮು ಮತ್ತು ಉಸಿರಾಟದ ಸಮಸ್ಯೆಗೆ ಕಷಾಯ ರೂಪದಲ್ಲಿ ಬಳಸಲಾಗುತ್ತದೆ.',
      healthHealthy: 'ತಾಜಾ ಹಸಿರು ಸುಗಂಧಭರಿತ ಎಲೆಗಳು. ರೋಗ ಮುಕ್ತವಾಗಿದೆ ಮತ್ತು ನೈಸರ್ಗಿಕ ತೇಜಸ್ಸಿನಿಂದ ಕೂಡಿದೆ.',
      healthDiseased: 'ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ಕಲೆಗಳು ಅಥವಾ ಶಿಲೀಂಧ್ರ ಸೋಂಕು ಕಂಡುಬಂದಿದೆ. ನೀರು ನಿಲ್ಲುವುದನ್ನು ತಪ್ಪಿಸಿ.',
      wateringSummary: 'ಮೇಲಿನ ಮಣ್ಣು ಒಣಗಿದಾಗ ದಿನ ಬಿಟ್ಟು ದಿನ ನೀರುಣಿಸಿ. ಹೆಚ್ಚು ನೀರು ನಿಂತರೆ ಬೇರು ಕೊಳೆಯುವ ಸಾಧ್ಯತೆ ಇದೆ.',
      safetyWarning: 'ಎಚ್ಚರಿಕೆ: ಇದು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮಾತ್ರ, ವೈದ್ಯಕೀಯ ಸಲಹೆಯಲ್ಲ. ರಕ್ತ ತೆಳುವಾಗಿಸುವ ಔಷಧ ಸೇವಿಸುವವರು ಎಚ್ಚರದಿಂದಿರಬೇಕು.',
    },
    aloe_vera: {
      name: 'ಲೋಳೆಸರ / ಅಲೋವೆರಾ (Aloe Vera)',
      scientificName: 'Aloe barbadensis miller',
      family: 'ಆಸ್ಫೊಡೆಲೇಸಿ (Asphodelaceae)',
      shortDesc: 'ಚರ್ಮದ ಆರೋಗ್ಯ, ಸುಟ್ಟ ಗಾಯಗಳು ಮತ್ತು ತೇವಾಂಶಕ್ಕೆ ಒಳಗಿನ ರಸಭರಿತ ಲೋಳೆಯನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.',
      healthHealthy: 'ದಪ್ಪನೆಯ ರಸಭರಿತ ಎಲೆ, ಯಾವುದೇ ಕೊಳೆತ ಅಥವಾ ಶಿಲೀಂಧ್ರದ ಕಲೆಗಳಿಲ್ಲದೆ ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ.',
      healthDiseased: 'ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಕಂದು ಕೊಳೆತ ಅಥವಾ ಮೃದುವಾದ ನೀರಿನ ಮಚ್ಚೆಗಳು ಕಂಡುಬಂದಿವೆ. ನೀರುಣಿಸುವುದನ್ನು ಕಡಿಮೆ ಮಾಡಿ.',
      wateringSummary: '೨ ರಿಂದ ೩ ವಾರಗಳಿಗೊಮ್ಮೆ ಮಾತ್ರ ನೀರು ಹಾಕಿ. ಮಣ್ಣು ಪೂರ್ಣ ಒಣಗಿದ ನಂತರವೇ ನೀರುಣಿಸಿ.',
      safetyWarning: 'ಎಚ್ಚರಿಕೆ: ಹೊರ ತೊಗಟೆಯ ಹಳದಿ ಅಂಟು (ಅಲೋಯಿನ್) ವಿಷಕಾರಿಯಾಗಬಹುದು, ನೇರವಾಗಿ ಸೇವಿಸಬೇಡಿ.',
    },
    ashwagandha: {
      name: 'ಅಶ್ವಗಂಧ (Ashwagandha)',
      scientificName: 'Withania somnifera',
      family: 'ಸೊಲನೇಸಿ (Solanaceae)',
      shortDesc: 'ಆಯುರ್ವೇದದಲ್ಲಿ ಶಕ್ತಿ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ಪ್ರಸಿದ್ಧವಾಗಿರುವ ನೈಸರ್ಗಿಕ ಗಿಡಮೂಲಿಕೆ.',
      healthHealthy: 'ಆರೋಗ್ಯಕರ ತಿಳಿ ಹಸಿರು ಎಲೆ. ರೋಗ ಮುಕ್ತವಾಗಿದ್ದು ಉತ್ತಮ ಬೆಳವಣಿಗೆಯನ್ನು ತೋರಿಸುತ್ತಿದೆ.',
      healthDiseased: 'ಎಲೆ ಮುರುಟು ರೋಗ ಅಥವಾ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿವೆ. ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.',
      wateringSummary: 'ವಾರಕ್ಕೆ ಒಂದು ಅಥವಾ ಎರಡು ಬಾರಿ ಮಾತ್ರ ನೀರುಣಿಸಿ. ಬಿಸಿಲು ಮತ್ತು ಚೆನ್ನಾಗಿ ನೀರು ಬಸಿಯುವ ಮಣ್ಣು ಅಗತ್ಯ.',
      safetyWarning: 'ಎಚ್ಚರಿಕೆ: ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ಗರ್ಭಿಣಿಯರು ಅಥವಾ ಹಾಲುಣಿಸುವ ತಾಯಂದಿರು ಸೇವಿಸಬಾರದು.',
    },
    mint: {
      name: 'ಪುದೀನಾ (Mint)',
      scientificName: 'Mentha spicata',
      family: 'ಲ್ಯಾಮಿಯೇಸಿ (Lamiaceae)',
      shortDesc: 'ಜೀರ್ಣಕ್ರಿಯೆಗೆ ಹಾಗೂ ತಂಪು ಅನುಭವ ನೀಡಲು ಬಳಸುವ ಜನಪ್ರಿಯ ಸುಗಂಧಭರಿತ ಸೊಪ್ಪು.',
      healthHealthy: 'ತಾಜಾ ಕಟುವಾದ ಹಸಿರು ಎಲೆಗಳು, ಯಾವುದೇ ತುಕ್ಕು ಅಥವಾ ಬೂದಿ ರೋಗದ ಲಕ್ಷಣಗಳಿಲ್ಲ.',
      healthDiseased: 'ಕಿತ್ತಳೆ-ಕಂದು ಬಣ್ಣದ ತುಕ್ಕು ರೋಗ (Mint Rust) ಅಥವಾ ಬಿಳಿ ಬೂದಿ ರೋಗ ಪತ್ತೆಯಾಗಿದೆ.',
      wateringSummary: 'ಮಣ್ಣಿನಲ್ಲಿ ಸದಾ ತೇವಾಂಶ ಇರಲಿ, ಆದರೆ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಪ್ರತಿದಿನ ಸ್ವಲ್ಪ ನೀರುಣಿಸಿ.',
      safetyWarning: 'ಎಚ್ಚರಿಕೆ: ಶುದ್ಧ ಪುದೀನಾ ಎಣ್ಣೆಯನ್ನು ಶಿಶುಗಳ ಮೂಗು ಅಥವಾ ಮುಖದ ಹತ್ತಿರ ಹಚ್ಚಬೇಡಿ.',
    },
    curry_leaf: {
      name: 'ಕರಿಬೇವು (Curry Leaf)',
      scientificName: 'Murraya koenigii',
      family: 'ರೂಟೇಸಿ (Rutaceae)',
      shortDesc: 'ಕೂದಲಿನ ಬೆಳವಣಿಗೆ ಮತ್ತು ಸಾಂಬಾರಿನಲ್ಲಿ ಬಳಸುವ ಅತ್ಯಮೂಲ್ಯ ಕಬ್ಬಿಣಾಂಶಯುಕ್ತ ಔಷಧೀಯ ಎಲೆ.',
      healthHealthy: 'ಹೊಳಪಿನ ಕಡು ಹಸಿರು ಎಲೆಗಳು, ಉತ್ತಮ ಪರಿಮಳದೊಂದಿಗೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ.',
      healthDiseased: 'ನುಸಿ ಅಥವಾ ಕಪ್ಪು ಚುಕ್ಕೆ ರೋಗದ ಲಕ್ಷಣಗಳಿವೆ. ಎಲೆಗಳ ಅಂಚು ಮುದುಡಿಕೊಂಡಿದೆ.',
      wateringSummary: '೨-೩ ದಿನಗಳಿಗೊಮ್ಮೆ ನೀರುಣಿಸಿ. ಮಜ್ಜಿಗೆಯ ನೀರು ಸಿಂಪಡಿಸಿದರೆ ಗಿಡ ಹುಲುಸಾಗಿ ಬೆಳೆಯುತ್ತದೆ.',
      safetyWarning: 'ಎಚ್ಚರಿಕೆ: ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿದ ಎಲೆಗಳನ್ನು ಬಳಸುವ ಮುನ್ನ ಚೆನ್ನಾಗಿ ತೊಳೆಯಿರಿ.',
    },
  },
  hi: {
    neem: {
      name: 'नीम (Neem)',
      scientificName: 'Azadirachta indica',
      family: 'मेलिएसी (Meliaceae)',
      shortDesc: 'भारत का प्राकृतिक औषधालय। त्वचा रोग और जीवाणुरोधी उपचार के लिए प्रसिद्ध।',
      healthHealthy: 'पत्ता पूरी तरह स्वस्थ है, कोई कवक या कीड़ा नहीं पाया गया।',
      healthDiseased: 'पत्ते पर भूरे धब्बे और कवक संक्रमण देखा गया है। जैविक उपचार की आवश्यकता है।',
      wateringSummary: 'हफ्ते में एक बार भरपूर पानी दें। जड़ में पानी रुकने न दें।',
      safetyWarning: 'चेतावनी: पौधे की पहचान का मतलब यह नहीं कि यह खाने के लिए पूरी तरह सुरक्षित है।',
    },
    tulsi: {
      name: 'तुलसी (Tulsi)',
      scientificName: 'Ocimum tenuiflorum',
      family: 'लेमिएसी (Lamiaceae)',
      shortDesc: 'पवित्र और रोग प्रतिरोधक पौधा, सर्दी-खांसी के काढ़े में अत्यंत गुणकारी।',
      healthHealthy: 'पत्तियां हरी, सुगंधित और पूरी तरह स्वस्थ हैं।',
      healthDiseased: 'पत्तियों पर काले या भूरे धब्बे दिखाई दे रहे हैं। फंगस का प्रकोप हो सकता है।',
      wateringSummary: 'मिट्टी की ऊपरी सतह सूखने पर ही पानी दें। गमले में जलभराव न होने दें।',
      safetyWarning: 'चेतावनी: यह शैक्षिक जानकारी है। चिकित्सकीय सलाह के बिना बड़ी मात्रा में सेवन न करें।',
    },
    aloe_vera: {
      name: 'एलोवेरा / घृतकुमारी (Aloe Vera)',
      scientificName: 'Aloe barbadensis miller',
      family: 'एस्फोडेलेसी (Asphodelaceae)',
      shortDesc: 'त्वचा के घाव, जलन और ठंडक के लिए इसका जेल अत्यंत लाभकारी है।',
      healthHealthy: 'पत्ता मोटा और जेल से भरपूर है, कोई सड़न नहीं है।',
      healthDiseased: 'पत्ते के निचले हिस्से में सड़न या भूरे धब्बे हैं। पानी देना कम करें।',
      wateringSummary: '२-३ हफ्ते में एक बार ही पानी दें। ज्यादा पानी से जड़ें सड़ सकती हैं।',
      safetyWarning: 'चेतावनी: छिलके के नीचे का पीला रस (एलोइन) हानिकारक हो सकता है, इसे न खाएं।',
    },
    ashwagandha: {
      name: 'अश्वगंधा (Ashwagandha)',
      scientificName: 'Withania somnifera',
      family: 'सोलेनेसी (Solanaceae)',
      shortDesc: 'शारीरिक शक्ति और मानसिक तनाव कम करने वाली प्रसिद्ध आयुर्वेदिक वनस्पति।',
      healthHealthy: 'पत्ते स्वस्थ और सामान्य शिरा विन्यास वाले हैं।',
      healthDiseased: 'पत्ती मुड़ने या कवक के धब्बे देखे गए हैं। नीम के तेल का छिड़काव करें।',
      wateringSummary: 'हफ्ते में १-२ बार पानी दें। धूप और सूखी रेतीली मिट्टी उपयुक्त है।',
      safetyWarning: 'चेतावनी: गर्भावस्था में सेवन वर्जित है। आयुर्वेदिक चिकित्सक की सलाह लें।',
    },
    mint: {
      name: 'पुदीना (Mint)',
      scientificName: 'Mentha spicata',
      family: 'लेमिएसी (Lamiaceae)',
      shortDesc: 'पाचन सुधारने और पेट की ठंडक के लिए घरेलू रूप से इस्तेमाल की जाने वाली पत्तियां।',
      healthHealthy: 'हरी ताजी पत्तियां, कोई जंग या फफूंद का असर नहीं है।',
      healthDiseased: 'पत्तियों पर जंग जैसे संतरी-भूरे धब्बे या सफेद फफूंद पाई गई है।',
      wateringSummary: 'मिट्टी में नमी बनाए रखें। गर्मियों में रोज सुबह पानी दें।',
      safetyWarning: 'चेतावनी: शुद्ध मेंथॉल तेल छोटे बच्चों के चेहरे के पास न लगाएं।',
    },
    curry_leaf: {
      name: 'कढ़ी पत्ता (Curry Leaf)',
      scientificName: 'Murraya koenigii',
      family: 'रूटेसी (Rutaceae)',
      shortDesc: 'बालों की मजबूती और पाचन के लिए इस्तेमाल किया जाने वाला खुशबूदार पत्ता।',
      healthHealthy: 'चमकदार गहरे हरे पत्ते, भरपूर सुगंध और पूर्ण स्वस्थ हैं।',
      healthDiseased: 'कीटों का हमला या भूरे कवक धब्बे दिखाई दे रहे हैं। छाछ का छिड़काव करें।',
      wateringSummary: '२-३ दिन में एक बार पानी दें। भरपूर धूप की जरूरत होती है।',
      safetyWarning: 'चेतावनी: उपयोग से पहले पत्तों को स्वच्छ पानी से अच्छी तरह धो लें।',
    },
  },
  te: {
    neem: {
      name: 'వేప చెట్టు (Neem)',
      scientificName: 'Azadirachta indica',
      family: 'మెలియేసి (Meliaceae)',
      shortDesc: 'గ్రామ ఔషధాలయం అని పిలుస్తారు. క్రిమినాశక మరియు రోగనిరోధక లక్షణాలు మెండుగా ఉన్నాయి.',
      healthHealthy: 'ఆకు పూర్తిగా ఆరోగ్యంగా ఉంది, ఎటువంటి ఫంగస్ లేదా తెగులు కనిపించలేదు.',
      healthDiseased: 'ఆకు మచ్చ తెగులు లేదా బూజు కనిపించింది. సేంద్రీయ నివారణ చర్యలు తీసుకోండి.',
      wateringSummary: 'వారానికి ఒకసారి నీరు పోయండి. ఎక్కువ నీరు నిల్వ ఉండకుండా చూసుకోండి.',
      safetyWarning: 'హెచ్చరిక: మొక్కను గుర్తించినంత మాత్రాన తినుటకు సురక్షితమని భావించరాదు.',
    },
    tulsi: {
      name: 'తులసి (Tulsi)',
      scientificName: 'Ocimum tenuiflorum',
      family: 'లామియేసి (Lamiaceae)',
      shortDesc: 'పవిత్ర ఔషధ మొక్క. దగ్గు, జలుబు నివారణకు కషాయంలో వాడతారు.',
      healthHealthy: 'తాజా ఆకుపచ్చని సువాసనగల ఆకులు, సంపూర్ణ ఆరోగ్యంగా ఉన్నాయి.',
      healthDiseased: 'ఆకులపై నల్లటి లేదా బూడిద రంగు మచ్చలు ఉన్నాయి. నీరు నిల్వ ఉండకుండా చూడండి.',
      wateringSummary: 'పై మట్టి ఆరినప్పుడు మాత్రమే నీరు పోయండి. కుండీలో నీరు నిల్వ ఉండకూడదు.',
      safetyWarning: 'హెచ్చరిక: ఇది కేవలం విద్యా సమాచారం మాత్రమే. వైద్యుల సలహా లేకుండా మందుగా వాడకండి.',
    },
    aloe_vera: {
      name: 'కలబంద (Aloe Vera)',
      scientificName: 'Aloe barbadensis miller',
      family: 'ఆస్ఫోడెలేసి (Asphodelaceae)',
      shortDesc: 'చర్మ సౌందర్యానికి, కాలిన గాయాలకు ఉపశమనం కలిగించే రసభరిత మొక్క.',
      healthHealthy: 'మందపాటి గుజ్జుతో కూడిన ఆరోగ్యకరమైన ఆకు.',
      healthDiseased: 'ఆకు అడుగు భాగంలో కుళ్ళు లేదా నల్లటి మచ్చలు ఉన్నాయి. నీరు పోయడం తగ్గించండి.',
      wateringSummary: '2-3 వారాలకు ఒకసారి మాత్రమే నీరు పోయండి. నీరు ఎక్కువైతే వేర్లు కుళ్ళిపోతాయి.',
      safetyWarning: 'హెచ్చరిక: పై తొక్క కింద ఉండే పసుపు రంగు రసాన్ని నేరుగా సేవించరాదు.',
    },
    ashwagandha: {
      name: 'అశ్వగంధ (Ashwagandha)',
      scientificName: 'Withania somnifera',
      family: 'సొలనేసి (Solanaceae)',
      shortDesc: 'శారీరక బలాన్ని మరియు మానసిక ప్రశాంతతను అందించే ఆయుర్వేద మూలిక.',
      healthHealthy: 'ఆరోగ్యకరమైన ఆకులు, తెగుళ్ళు లేని పరిస్థితి.',
      healthDiseased: 'ఆకు ముడత తెగులు లేదా మచ్చలు ఉన్నాయి. వేపనూనె పిచికారీ చేయండి.',
      wateringSummary: 'వారానికి 1-2 సార్లు మాత్రమే నీరు పోయండి. ఎండ మరియు ఇసుక నేలలు అనుకూలం.',
      safetyWarning: 'హెచ్చరిక: గర్భిణీ స్త్రీలు వైద్యుల సలహా లేకుండా వాడకూడదు.',
    },
    mint: {
      name: 'పుదీనా (Mint)',
      scientificName: 'Mentha spicata',
      family: 'లామియేసి (Lamiaceae)',
      shortDesc: 'జీర్ణక్రియకు మరియు చలువ చేయడానికి ఉపయోగపడే సుగంధ ఆకులు.',
      healthHealthy: 'తాజా ఆకుపచ్చని ఆకులు, ఎటువంటి తెగుళ్ళు లేవు.',
      healthDiseased: 'ఆకులపై తుప్పు మచ్చలు లేదా బూజు తెగులు కనిపించింది.',
      wateringSummary: 'మట్టిలో ఎల్లప్పుడూ తేమ ఉండేలా చూడండి. వేసవిలో రోజూ నీరు పోయండి.',
      safetyWarning: 'హెచ్చరిక: గాఢమైన మెంథాల్ నూనెను చిన్న పిల్లల ముఖానికి రాయవద్దు.',
    },
    curry_leaf: {
      name: 'కరివేపాకు (Curry Leaf)',
      scientificName: 'Murraya koenigii',
      family: 'రూటేసి (Rutaceae)',
      shortDesc: 'జుట్టు పెరుగుదలకు మరియు సుగంధ వంటకాలకు వాడే ఇనుము సమృద్ధిగా గల ఆకు.',
      healthHealthy: 'మెరిసే ముదురు ఆకుపచ్చ ఆకులు, ఆరోగ్యకరమైన సువాసన.',
      healthDiseased: 'నల్ల మచ్చలు లేదా తెగులు సోకిన ఆకులు. మజ్జిగ నీటిని పిచికారీ చేయండి.',
      wateringSummary: '2-3 రోజులకు ఒకసారి నీరు పోయండి. మంచి ఎండ అవసరం.',
      safetyWarning: 'హెచ్చరిక: పురుగుమందులు ఉన్నట్లయితే వాడే ముందు శుభ్రంగా కడగండి.',
    },
  },
  ta: {
    neem: {
      name: 'வேப்ப மரம் (Neem)',
      scientificName: 'Azadirachta indica',
      family: 'மெலியேசி (Meliaceae)',
      shortDesc: 'கிராமத்து மருந்தகம் என அழைக்கப்படும் சிறந்த இயற்கை கிருமிநாசினி.',
      healthHealthy: 'இலை ஆரோக்கியமான பச்சையாகவும், பூஞ்சை தாக்கமின்றியும் உள்ளது.',
      healthDiseased: 'இலைப்புள்ளி நோய் அல்லது கருகல் நோய் தாக்கம் தென்படுகிறது.',
      wateringSummary: 'வாரத்திற்கு ஒருமுறை நீர் பாய்ச்சினால் போதுமானது. நீர் தேங்காமல் பார்த்துக் கொள்ளுங்கள்.',
      safetyWarning: 'எச்சரிக்கை: தாவரத்தை அடையாளம் காண்பது அதை நேரடியாக உட்கொள்ள பாதுகாப்பானது அல்ல.',
    },
    tulsi: {
      name: 'துளசி (Tulsi)',
      scientificName: 'Ocimum tenuiflorum',
      family: 'லாமியேசி (Lamiaceae)',
      shortDesc: 'புனிதமான மூலிகை. சளி, இருமல் மற்றும் சுவாச கோளாறுகளுக்கு கஷாயமாக பயன்படுவது.',
      healthHealthy: 'புத்துணர்ச்சியான வாசனை கொண்ட ஆரோக்கியமான இலைகள்.',
      healthDiseased: 'இலையில் கரும்புள்ளிகள் அல்லது சாம்பல் பூஞ்சை நோய் தென்படுகிறது.',
      wateringSummary: 'மேல் மண் காய்ந்ததும் நீர் ஊற்றவும். அதிக நீர் தேங்கக்கூடாது.',
      safetyWarning: 'எச்சரிக்கை: இது மருத்துவ ஆலோசனை அல்ல. மருத்துவரின் வழிகாட்டுதலின்றி அதிக அளவு உட்கொள்ள வேண்டாம்.',
    },
    aloe_vera: {
      name: 'சோற்றுக்கற்றாழை (Aloe Vera)',
      scientificName: 'Aloe barbadensis miller',
      family: 'அஸ்போடெலேசி (Asphodelaceae)',
      shortDesc: 'தோல் பராமரிப்பு, தீக்காயங்கள் மற்றும் உடலுக்கு குளிர்ச்சி தரும் சோற்றுக்கற்றாழை.',
      healthHealthy: 'தடிமனான சோற்றுடன் கூடிய நல்ல ஆரோக்கியமான இலை.',
      healthDiseased: 'இலையின் அடிப்பகுதியில் அழுகல் அல்லது புள்ளிகள் உள்ளன. நீர் ஊற்றுவதை குறைக்கவும்.',
      wateringSummary: '2-3 வாரங்களுக்கு ஒருமுறை மட்டுமே நீர் ஊற்றவும். அதிக நீரால் வேர் அழுகும்.',
      safetyWarning: 'எச்சரிக்கை: தோலுக்கு அடியில் உள்ள மஞ்சள் நிற பாலை உட்கொள்ள வேண்டாம்.',
    },
    ashwagandha: {
      name: 'அமுக்கிரா / அஸ்வகந்தா (Ashwagandha)',
      scientificName: 'Withania somnifera',
      family: 'சொலனேசி (Solanaceae)',
      shortDesc: 'உடல் பலத்திற்கும் மன அமைதிக்கும் ஆயுர்வேதத்தில் பயன்படும் முக்கிய மூலிகை.',
      healthHealthy: 'நோயற்ற ஆரோக்கியமான வெளிர் பச்சை இலைகள்.',
      healthDiseased: 'இலை சுருட்டை நோய் அல்லது கரும்புள்ளிகள் தென்படுகின்றன.',
      wateringSummary: 'வாரத்திற்கு 1-2 முறை நீர் ஊற்றவும். நல்ல வடிகால் வசதி கொண்ட மண் தேவை.',
      safetyWarning: 'எச்சரிக்கை: கர்ப்பிணி பெண்கள் மருத்துவர் அனுமதியின்றி உட்கொள்ளக் கூடாது.',
    },
    mint: {
      name: 'புதினா (Mint)',
      scientificName: 'Mentha spicata',
      family: 'லாமியேசி (Lamiaceae)',
      shortDesc: 'செரிமானத்தை தூண்டவும் உடலை குளிர்ச்சியாக்கவும் பயன்படும் நறுமண இலை.',
      healthHealthy: 'நல்ல நறுமணமுள்ள புதிய இலைகள், பூஞ்சை பாதிப்பில்லை.',
      healthDiseased: 'இலைகளில் துரு போன்ற புள்ளிகள் அல்லது சாம்பல் நோய் தென்படுகிறது.',
      wateringSummary: 'மண்ணில் எப்போதும் ஈரப்பதம் இருக்க வேண்டும். தினமும் சிறிது நீர் ஊற்றவும்.',
      safetyWarning: 'எச்சரிக்கை: அடர்ந்த மெந்தால் எண்ணெயை பச்சிளங் குழந்தைகளுக்கு பயன்படுத்த வேண்டாம்.',
    },
    curry_leaf: {
      name: 'கறிவேப்பிலை (Curry Leaf)',
      scientificName: 'Murraya koenigii',
      family: 'ரூட்டேசி (Rutaceae)',
      shortDesc: 'கூந்தல் வளர்ச்சிக்கும் செரிமானத்திற்கும் பயன்படும் இரும்புச்சத்து நிறைந்த மூலிகை.',
      healthHealthy: 'பளபளப்பான கரும்பச்சை இலைகள், நல்ல நறுமணத்துடன் உள்ளன.',
      healthDiseased: 'புள்ளி நோய் அல்லது இலை சுருட்டல் தென்படுகிறது. புளித்த மோரை தெளிக்கவும்.',
      wateringSummary: '2-3 நாட்களுக்கு ஒருமுறை நீர் ஊற்றவும். நல்ல சூரிய ஒளி அவசியம்.',
      safetyWarning: 'எச்சரிக்கை: பூச்சிக்கொல்லிகள் இருக்கலாம் என்பதால் சமைக்கும் முன் நன்கு கழுவவும்.',
    },
  },
};

export interface QAPair {
  question: string;
  answer: string;
  tag: 'watering' | 'health' | 'safety' | 'growing';
}

export const REGIONAL_QA_KNOWLEDGE_BASE: Record<SupportedLanguage, QAPair[]> = {
  en: [
    {
      question: 'How often should I water my medicinal plant?',
      answer: 'Watering depends on the species: Succulents like Aloe Vera need water only every 2-3 weeks. Herbs like Tulsi and Mint need water when the top 1 inch of soil feels dry. Neem and Curry Leaf prefer deep watering every 3-5 days. Always avoid water standing in the saucer to protect roots from fungal rot.',
      tag: 'watering',
    },
    {
      question: 'What do yellow leaves or brown spots indicate?',
      answer: 'Yellow leaves usually indicate overwatering or poor drainage. Circular brown spots with a yellow halo typically indicate fungal or bacterial leaf spot, often exacerbated by high humidity. Treat by pruning infected leaves, improving air circulation, and spraying organic neem oil (5ml/L) or diluted copper fungicide.',
      tag: 'health',
    },
    {
      question: 'Is it safe to consume any leaf identified by AI?',
      answer: 'CRITICAL SAFETY RULE: No! Identifying a plant with AI does NOT mean it is safe to ingest. Many toxic plants closely resemble edible herbs. Never self-prescribe or consume leaves without verifying with an elder botanist or certified healthcare professional. Pregnant women must exercise extreme caution.',
      tag: 'safety',
    },
    {
      question: 'Can I grow these plants in balcony pots?',
      answer: 'Yes! Tulsi, Mint, and Aloe Vera thrive in 8-12 inch terracotta pots with drainage holes. Use a well-draining potting mix (40% soil, 30% compost, 30% cocopeat/sand). Curry leaf and Neem also grow well in 14-18 inch containers with at least 5 hours of direct sunlight.',
      tag: 'growing',
    },
  ],
  kn: [
    {
      question: 'ಔಷಧೀಯ ಗಿಡಗಳಿಗೆ ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ನೀರುಣಿಸಬೇಕು?',
      answer: 'ಗಿಡದ ಜಾತಿಯನ್ನು ಅವಲಂಬಿಸಿ ನೀರುಣಿಸಬೇಕು: ಲೋಳೆಸರಕ್ಕೆ ೨-೩ ವಾರಕ್ಕೊಮ್ಮೆ ಮಾತ್ರ ನೀರು ಸಾಕು. ತುಳಸಿ ಮತ್ತು ಪುದೀನಾಗೆ ಮೇಲಿನ ಮಣ್ಣು ಒಣಗಿದಾಗ ದಿನ ಬಿಟ್ಟು ದಿನ ನೀರುಣಿಸಿ. ಬೇವಿನ ಗಿಡ ಮತ್ತು ಕರಿಬೇವಿಗೆ ೩-೫ ದಿನಕ್ಕೊಮ್ಮೆ ನೀರು ಹಾಕಿ. ಕುಂಡದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
      tag: 'watering',
    },
    {
      question: 'ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಅಥವಾ ಕಂದು ಚುಕ್ಕೆಗಳು ಬರಲು ಕಾರಣವೇನು?',
      answer: 'ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು ಹೆಚ್ಚಾಗಿ ಅತಿಯಾದ ನೀರು ಅಥವಾ ಕಳಪೆ ಚರಂಡಿ ವ್ಯವಸ್ಥೆಯಿಂದ ಉಂಟಾಗುತ್ತದೆ. ಕಂದು ಚುಕ್ಕೆಗಳು ಶಿಲೀಂಧ್ರ ರೋಗದ ಲಕ್ಷಣ. ಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ೫ ಮಿಲಿ ಬೇವಿನೆಣ್ಣೆಯನ್ನು ಒಂದು ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
      tag: 'health',
    },
    {
      question: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಗುರುತಿಸಿದ ಎಲೆಯನ್ನು ನೇರವಾಗಿ ತಿನ್ನಬಹುದೇ?',
      answer: 'ಮುಖ್ಯ ಎಚ್ಚರಿಕೆ: ಖಂಡಿತಾ ಇಲ್ಲ! AI ಗುರುತಿಸಿದ ಮಾತ್ರಕ್ಕೆ ಅದು ಸುರಕ್ಷಿತ ಎಂದು ಅರ್ಥವಲ್ಲ. ಅನೇಕ ವಿಷಕಾರಿ ಗಿಡಗಳು ಔಷಧೀಯ ಗಿಡಗಳಂತೆಯೇ ಕಾಣುತ್ತವೆ. ಅನುಭವಿ ವೈದ್ಯರು ಅಥವಾ ಹಿರಿಯರ ಅನುಮೋದನೆಯಿಲ್ಲದೆ ಯಾವುದೇ ಎಲೆಯನ್ನು ತಿನ್ನಬೇಡಿ.',
      tag: 'safety',
    },
    {
      question: 'ಬಾಲ್ಕನಿ ಅಥವಾ ಕುಂಡಗಳಲ್ಲಿ ಈ ಗಿಡಗಳನ್ನು ಬೆಳೆಸಬಹುದೇ?',
      answer: 'ಖಂಡಿತವಾಗಿ! ತುಳಸಿ, ಪುದೀನಾ ಮತ್ತು ಲೋಳೆಸರ ೮-೧೨ ಇಂಚಿನ ಕುಂಡಗಳಲ್ಲಿ ಚೆನ್ನಾಗಿ ಬೆಳೆಯುತ್ತವೆ. ಕೆಂಪು ಮಣ್ಣು, ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮತ್ತು ಮರಳಿನ ಸಮಪ್ರಮಾಣ ಮಿಶ್ರಣ ಬಳಸಿ. ಗಿಡಗಳಿಗೆ ಕನಿಷ್ಠ ೪-೫ ಗಂಟೆ ಸೂರ್ಯನ ಬೆಳಕು ಸಿಗುವಂತೆ ಇಡಿ.',
      tag: 'growing',
    },
  ],
  hi: [
    {
      question: 'औषधीय पौधों को कितने दिनों में पानी देना चाहिए?',
      answer: 'पौधे की किस्म पर निर्भर करता है: एलोवेरा को 2-3 हफ्ते में एक बार ही पानी दें। तुलसी और पुदीना को मिट्टी की ऊपरी सतह सूखने पर पानी दें। नीम और कढ़ी पत्ते को 3-4 दिन में पानी दें। गमले में जलभराव कभी न होने दें।',
      tag: 'watering',
    },
    {
      question: 'पत्तियों पर भूरे धब्बे या पीलापन क्यों आता है?',
      answer: 'पीलापन आमतौर पर अधिक पानी या जल निकासी न होने से आता है। भूरे धब्बे फंगल संक्रमण (कवक रोग) के कारण होते हैं। संक्रमित पत्तियों को काटकर हटा दें और 5 मिली नीम के तेल को 1 लीटर पानी में मिलाकर छिड़काव करें।',
      tag: 'health',
    },
    {
      question: 'क्या AI द्वारा पहचाने गए किसी भी पत्ते को खाया जा सकता है?',
      answer: 'गंभीर चेतावनी: बिल्कुल नहीं! AI पहचान केवल शैक्षणिक जानकारी है। कई जंगली पौधे औषधीय पौधों जैसे दिखते हैं जो जहरीले हो सकते हैं। बिना डॉक्टर या विशेषज्ञ की पुष्टि के किसी भी पौधे का सेवन न करें।',
      tag: 'safety',
    },
    {
      question: 'क्या इन पौधों को गमलों में उगाया जा सकता है?',
      answer: 'हाँ! तुलसी, पुदीना और एलोवेरा 8 से 12 इंच के गमलों में बहुत अच्छे से बढ़ते हैं। गमले में नीचे छेद होना जरूरी है। अच्छी धूप और वर्मीकम्पोस्ट खाद से पौधे तेजी से पनपते हैं।',
      tag: 'growing',
    },
  ],
  te: [
    {
      question: 'ఔషధ మొక్కలకు ఎన్ని రోజులకు నీరు పోయాలి?',
      answer: 'మొక్క రకాన్ని బట్టి నీరు పోయాలి: కలబందకు 2-3 వారాలకు ఒకసారి సరిపోతుంది. తులసి, పుదీనాకు పై మట్టి ఆరినప్పుడు నీరు పోయాలి. వేప, కరివేపాకుకు 3-5 రోజులకు ఒకసారి నీరు ఇవ్వాలి. కుండీలలో నీరు నిల్వ ఉండకుండా చూడండి.',
      tag: 'watering',
    },
    {
      question: 'ఆకులపై మచ్చలు లేదా పసుపు రంగు వస్తే ఏమి చేయాలి?',
      answer: 'ఎక్కువ నీరు లేదా తేమ వల్ల పసుపు రంగు వస్తుంది. నల్ల లేదా గోధుమ మచ్చలు బూజు తెగులు వల్ల వస్తాయి. తెగులు సోకిన ఆకులను తీసేసి, వేపనూనె (5 మి.లీ/లీటరు) కలిపి పిచికారీ చేయండి.',
      tag: 'health',
    },
    {
      question: 'AI గుర్తించిన ఆకులను నేరుగా తినవచ్చా?',
      answer: 'ముఖ్య హెచ్చరిక: తినకూడదు! AI గుర్తించినంత మాత్రాన అది తినడానికి సురక్షితం కాదు. విషపూరిత మొక్కలు కూడా ఇలాగే కనిపిస్తాయి. వైద్యుల సలహా లేకుండా ఏ మొక్కనూ తినవద్దు.',
      tag: 'safety',
    },
    {
      question: 'కుండీలలో వీటిని పెంచవచ్చా?',
      answer: 'ఖచ్చితంగా! తులసి, పుదీనా, కలబంద 8-12 అంగుళాల కుండీలలో బాగా పెరుగుతాయి. మంచి ఎండ తగిలే చోట ఉంచాలి మరియు నీరు త్వరగా ఇంకే మట్టిని వాడాలి.',
      tag: 'growing',
    },
  ],
  ta: [
    {
      question: 'மூலிகை செடிகளுக்கு எத்தனை நாட்களுக்கு ஒருமுறை நீர் ஊற்ற வேண்டும்?',
      answer: 'செடியின் வகையைப் பொறுத்து நீர் ஊற்ற வேண்டும்: கற்றாழைக்கு 2-3 வாரத்திற்கு ஒருமுறை போதும். துளசி மற்றும் புதினாவுக்கு மேல் மண் காய்ந்ததும் நீர் ஊற்றவும். வேப்பிலை மற்றும் கறிவேப்பிலைக்கு 3-5 நாட்களுக்கு ஒருமுறை நீர் பாய்ச்சவும்.',
      tag: 'watering',
    },
    {
      question: 'இலைகள் மஞ்சள் நிறமாகவோ அல்லது புள்ளிகள் தோன்றினாலோ என்ன செய்வது?',
      answer: 'அதிகப்படியான நீரால் இலைகள் மஞ்சளாகும். கரும்புள்ளிகள் பூஞ்சை நோயால் வருகின்றன. பாதிக்கப்பட்ட இலைகளை அகற்றி, 1 லிட்டர் தண்ணீரில் 5 மிலி வேப்பெண்ணெய் கலந்து தெளிக்கவும்.',
      tag: 'health',
    },
    {
      question: 'AI அடையாளம் காட்டிய இலையை நேரடியாக சாப்பிடலாமா?',
      answer: 'முக்கிய எச்சரிக்கை: கூடாது! AI அடையாளம் காட்டுவது மருத்துவ சான்றல்ல. நச்சுத்தன்மை கொண்ட செடிகளும் இதேபோல் தோன்றலாம். மருத்துவர் ஆலோசனையின்றி எதையும் உட்கொள்ளாதீர்கள்.',
      tag: 'safety',
    },
    {
      question: 'இவற்றை தொட்டிகளில் வளர்க்கலாமா?',
      answer: 'ஆம்! துளசி, புதினா மற்றும் கற்றாழை 8-12 அங்குல தொட்டிகளில் எளிதாக வளரும். நல்ல வடிகால் வசதியுள்ள மண்பானை தொட்டிகளை பயன்படுத்தவும். தினமும் 4-5 மணிநேர சூரிய ஒளி அவசியம்.',
      tag: 'growing',
    },
  ],
};
