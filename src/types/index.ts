export type PlantSpeciesId = 
  | 'neem'
  | 'tulsi'
  | 'aloe_vera'
  | 'ashwagandha'
  | 'mint'
  | 'curry_leaf';

export type HealthStatus = 'healthy' | 'diseased';

export type PathogenType = 'fungal' | 'bacterial' | 'viral' | 'pest' | 'physiological' | 'none';

export interface DiseaseCondition {
  id: string;
  plantId: PlantSpeciesId;
  name: string;
  pathogenType: PathogenType;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  organicRemedy: string[];
  chemicalControl?: string[];
  preventiveMeasures: string[];
}

export interface MedicinalInfo {
  id: PlantSpeciesId;
  name: string;
  commonName: string;
  scientificName: string;
  family: string;
  habitat: string;
  ayurvedicQualities: {
    rasa?: string;
    virya?: string;
    vipaka?: string;
    doshaEffect?: string;
  };
  activePhytochemicals: string[];
  primaryMedicinalUses: string[];
  pharmacologicalProperties: string[];
  commonPlantDiseases: string[];
  leafMorphology: string;
  precautionsAndWarnings: string[];
  sampleImage: string;
}

export interface PreprocessingMetrics {
  originalDimensions: { width: number; height: number };
  resizedDimensions: { width: 224; height: 224 };
  meanRGB: [number, number, number];
  stdRGB: [number, number, number];
  greenIndex: number; // Excess Green Index: 2G - R - B
  blurScore: number;  // Laplacian variance approximation
  isValidLeaf: boolean;
  validationMessage?: string;
  tensorSample: number[][]; // 8x8 downsampled slice for visualization
}

export interface ClassProbability {
  id: PlantSpeciesId;
  name: string;
  scientificName: string;
  probability: number;
}

export interface PredictionResult {
  timestamp: string;
  inferenceTimeMs: number;
  species: {
    plantId: PlantSpeciesId;
    name: string;
    scientificName: string;
    confidence: number;
    probabilities: ClassProbability[];
  };
  health: {
    status: HealthStatus;
    confidence: number;
    diseaseName?: string;
    pathogenType?: PathogenType;
    severity?: 'mild' | 'moderate' | 'severe';
    symptoms?: string[];
    recommendations?: string[];
  };
  medicinalInfo: MedicinalInfo;
  preprocessing: PreprocessingMetrics;
  isDemoMode: boolean;
  modelSource: 'demo_simulation' | 'keras_loaded';
  notes?: string;
}

export interface EvaluationMetrics {
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  totalTestSamples: number;
  classes: {
    id: PlantSpeciesId;
    name: string;
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }[];
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
  trainingHistory: {
    epoch: number;
    trainAcc: number;
    valAcc: number;
    trainLoss: number;
    valLoss: number;
  }[];
}

export interface BatchLeafItem {
  id: string;
  name: string;
  file?: File;
  dataUrl: string;
  sampleKey?: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  result?: PredictionResult;
  processingTimeMs?: number;
  addedAt: string;
}

