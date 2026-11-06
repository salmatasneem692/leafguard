import { PredictionResult } from '../types/index.ts';

export interface SavedAnalysisSession {
  id: string;
  savedAt: string;
  dateStr: string;
  thumbnailUrl: string;
  plantName: string;
  scientificName: string;
  speciesConfidence: number;
  healthStatus: 'healthy' | 'diseased';
  healthConfidence: number;
  diseaseName?: string;
  result: PredictionResult;
}

const STORAGE_KEY = 'leafguard_analysis_history_v1';
const MAX_SAVED_SESSIONS = 30;

/**
 * Creates a low-res thumbnail from a data URL or image to minimize localStorage footprint.
 */
async function createCompactThumbnail(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 96, 96);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
          return;
        }
      } catch (e) {
        // Fallback
      }
      resolve(src.length > 5000 ? '' : src);
    };
    img.onerror = () => resolve('');
    img.src = src;
  });
}

export async function saveAnalysisSession(
  result: PredictionResult,
  imageSrc?: string
): Promise<SavedAnalysisSession> {
  const history = getAnalysisHistory();

  let thumbnail = '';
  if (imageSrc) {
    try {
      thumbnail = await createCompactThumbnail(imageSrc);
    } catch {
      thumbnail = '';
    }
  }

  const newSession: SavedAnalysisSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateStr: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    thumbnailUrl: thumbnail,
    plantName: result.species.name,
    scientificName: result.species.scientificName,
    speciesConfidence: result.species.confidence,
    healthStatus: result.health.status,
    healthConfidence: result.health.confidence,
    diseaseName: result.health.diseaseName,
    result,
  };

  // Add to beginning, limit to max sessions
  const updatedHistory = [newSession, ...history].slice(0, MAX_SAVED_SESSIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (err) {
    console.warn('LocalStorage quota warning, trimming older items:', err);
    // If quota exceeded, trim more aggressively
    try {
      const minimalHistory = [newSession, ...history].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalHistory));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  return newSession;
}

export async function saveBatchAnalysisSessions(
  items: { result: PredictionResult; imageSrc?: string }[]
): Promise<SavedAnalysisSession[]> {
  const history = getAnalysisHistory();
  const newSessions: SavedAnalysisSession[] = [];

  for (const item of items) {
    let thumbnail = '';
    if (item.imageSrc) {
      try {
        thumbnail = await createCompactThumbnail(item.imageSrc);
      } catch {
        thumbnail = '';
      }
    }
    newSessions.push({
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      thumbnailUrl: thumbnail,
      plantName: item.result.species.name,
      scientificName: item.result.species.scientificName,
      speciesConfidence: item.result.species.confidence,
      healthStatus: item.result.health.status,
      healthConfidence: item.result.health.confidence,
      diseaseName: item.result.health.diseaseName,
      result: item.result,
    });
  }

  const updatedHistory = [...newSessions, ...history].slice(0, MAX_SAVED_SESSIONS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (err) {
    console.warn('LocalStorage quota warning in batch save:', err);
    try {
      const trimmed = [...newSessions, ...history].slice(0, 15);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save batch to localStorage:', e);
    }
  }

  return updatedHistory;
}


export function getAnalysisHistory(): SavedAnalysisSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse analysis history from localStorage:', err);
    return [];
  }
}

export function deleteAnalysisSession(id: string): SavedAnalysisSession[] {
  const history = getAnalysisHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update localStorage:', err);
  }
  return updated;
}

export function clearAnalysisHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
}
