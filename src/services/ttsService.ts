export interface TtsProgress {
  current: number;
  total: number;
}

export interface SpeakFullTextOptions {
  text: string;
  lang?: string;
  rate?: number;
  onStart?: () => void;
  onProgress?: (progress: TtsProgress) => void;
  onEnd?: () => void;
}

export interface TtsPlaybackController {
  stop: () => void;
}

const MAX_TTS_CHUNK_CHARS = 150;

const SPEECH_LANG_MAP: Record<string, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  en: 'en-US',
  te: 'te-IN',
  ta: 'ta-IN',
};

export function normalizeTtsLangCode(lang?: string): string {
  const base = (lang || 'kn').trim().toLowerCase().split(/[-_]/)[0];
  return base || 'en';
}

export function getBcp47SpeechCode(lang?: string): string {
  const raw = (lang || 'kn').trim();
  if (raw.includes('-')) return raw;
  const base = normalizeTtsLangCode(raw);
  return SPEECH_LANG_MAP[base] || 'en-US';
}

/**
 * Cleans markdown, emojis, and formatting into natural spoken prose
 * while keeping line/section breaks as sentence pauses.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  const lines = rawText
    // Strip markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip markdown headings (#, ##, ###) anywhere and ensure clean sentence separation
    .replace(/\s*#{1,6}\s+/g, '\n')
    // Convert numbered list prefixes "1. " -> "1, " so "1." doesn't split into an isolated chunk
    .replace(/^\s*(\d+)\.\s+/gm, '$1, ')
    // Strip unordered list bullets "- ", "* ", "• "
    .replace(/^\s*[-*•]\s+/gm, '')
    // Strip bold/italic/inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // Strip emojis & pictographs that can confuse TTS engines
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .split(/\r?\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      if (/[.!?।॥:;]$/.test(line)) {
        return line;
      }
      return `${line}.`;
    });

  return lines.join(' ').replace(/\s+/g, ' ').trim();
}

function splitLongSegment(segment: string, maxLen: number): string[] {
  const trimmed = segment.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  // Try splitting on clause punctuation first
  const clauses = trimmed.split(/(?<=[;:,—–])\s+/).filter(Boolean);
  if (clauses.length > 1) {
    const packed: string[] = [];
    let current = '';
    for (const clause of clauses) {
      if (clause.length > maxLen) {
        if (current) {
          packed.push(current);
          current = '';
        }
        packed.push(...splitByWords(clause, maxLen));
      } else if (!current) {
        current = clause;
      } else if (current.length + 1 + clause.length <= maxLen) {
        current = `${current} ${clause}`;
      } else {
        packed.push(current);
        current = clause;
      }
    }
    if (current) packed.push(current);
    return packed;
  }

  return splitByWords(trimmed, maxLen);
}

function splitByWords(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if (word.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      // Hard slice extremely long unbroken token as last resort
      for (let i = 0; i < word.length; i += maxLen) {
        chunks.push(word.slice(i, i + maxLen));
      }
      continue;
    }

    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxLen) {
      current = `${current} ${word}`;
    } else {
      chunks.push(current);
      current = word;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Splits cleaned text into sentence/phrase chunks (<= 150 chars each)
 * preserving 100% of the content across English, Kannada, Hindi, Telugu, and Tamil.
 */
export function splitTextIntoTtsChunks(rawText: string, maxLen = MAX_TTS_CHUNK_CHARS): string[] {
  const cleaned = cleanTextForSpeech(rawText);
  if (!cleaned) return [];

  // Split at sentence enders (. ! ? । ॥) while preserving the punctuation on the sentence
  const rawSentences = cleaned.split(/(?<=[.!?।॥])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      chunks.push(...splitLongSegment(trimmed, maxLen));
      continue;
    }

    if (!current) {
      current = trimmed;
    } else if (current.length + 1 + trimmed.length <= maxLen) {
      current = `${current} ${trimmed}`;
    } else {
      chunks.push(current);
      current = trimmed;
    }
  }

  if (current) chunks.push(current);

  // Filter out empty or punctuation-only fragments
  return chunks.filter((chunk) => /[\p{L}\p{N}]/u.test(chunk));
}

function cancelBrowserSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch {
      // ignore speech synthesis cancellation quirks
    }
  }
}

/**
 * Plays the entire explanation or answer seamlessly across all chunks.
 * Starts chunk 0 SYNCHRONOUSLY inside the user click handler on a single reused
 * HTMLAudioElement (so browsers and iframes preserve audio autoplay activation
 * across every chunk), while warming the HTTP cache for upcoming chunks.
 */
export function speakFullText(options: SpeakFullTextOptions): TtsPlaybackController {
  const { text, lang = 'kn', rate = 1.0, onStart, onProgress, onEnd } = options;
  const chunks = splitTextIntoTtsChunks(text);

  if (chunks.length === 0) {
    onEnd?.();
    return { stop: () => {} };
  }

  const baseLang = normalizeTtsLangCode(lang);
  const bcp47Lang = getBcp47SpeechCode(lang);
  const safeRate = Math.min(Math.max(rate, 0.75), 1.5);
  const abortController = new AbortController();
  const prefetchedIndices = new Set<number>();

  let stopped = false;
  let finished = false;
  let usingBrowserFallback = false;
  let currentIndex = 0;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.volume = 1.0;

  const notifyEndOnce = () => {
    if (finished) return;
    finished = true;
    onEnd?.();
  };

  const cleanupAudio = () => {
    try {
      audio.onended = null;
      audio.onerror = null;
      audio.onloadedmetadata = null;
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
    } catch {
      // ignore cleanup errors
    }
  };

  const stop = () => {
    if (stopped) return;
    stopped = true;
    abortController.abort();
    cleanupAudio();
    cancelBrowserSpeech();
    notifyEndOnce();
  };

  const getChunkUrl = (index: number): string => {
    return `/api/tts?lang=${encodeURIComponent(baseLang)}&text=${encodeURIComponent(chunks[index])}`;
  };

  const prefetchChunk = (index: number) => {
    if (stopped || index >= chunks.length || prefetchedIndices.has(index)) return;
    prefetchedIndices.add(index);
    fetch(getChunkUrl(index), { signal: abortController.signal }).catch(() => {
      // Ignore prefetch errors; chunk will still load or fall back when reached
    });
  };

  const speakRemainingWithBrowserSynthesis = (startIdx: number) => {
    if (stopped || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      cleanupAudio();
      notifyEndOnce();
      return;
    }

    const speakNextUtterance = (idx: number) => {
      if (stopped || idx >= chunks.length) {
        notifyEndOnce();
        return;
      }

      onProgress?.({ current: idx + 1, total: chunks.length });

      try {
        const utterance = new SpeechSynthesisUtterance(chunks[idx]);
        utterance.lang = bcp47Lang;
        utterance.rate = safeRate;

        const voices = window.speechSynthesis.getVoices();
        const matchingVoice =
          voices.find((v) => v.lang.toLowerCase() === bcp47Lang.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onend = () => {
          if (!stopped) {
            speakNextUtterance(idx + 1);
          }
        };

        utterance.onerror = () => {
          if (!stopped) {
            // Try continuing with remaining chunks or finish cleanly
            if (idx + 1 < chunks.length) {
              speakNextUtterance(idx + 1);
            } else {
              notifyEndOnce();
            }
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        notifyEndOnce();
      }
    };

    speakNextUtterance(startIdx);
  };

  const playChunk = (idx: number) => {
    if (stopped) return;
    if (idx >= chunks.length) {
      cleanupAudio();
      notifyEndOnce();
      return;
    }

    currentIndex = idx;
    onProgress?.({ current: idx + 1, total: chunks.length });

    // Warm browser HTTP cache for the next 2 chunks so transitions are gapless
    prefetchChunk(idx + 1);
    prefetchChunk(idx + 2);

    const url = getChunkUrl(idx);

    audio.onloadedmetadata = () => {
      if (!stopped && safeRate !== 1.0) {
        try {
          audio.playbackRate = safeRate;
        } catch {
          // ignore
        }
      }
    };

    audio.onended = () => {
      if (stopped) return;
      playChunk(currentIndex + 1);
    };

    audio.onerror = () => {
      if (stopped || usingBrowserFallback) return;
      usingBrowserFallback = true;
      cleanupAudio();
      speakRemainingWithBrowserSynthesis(currentIndex);
    };

    try {
      audio.src = url;
      audio.volume = 1.0;
      if (safeRate !== 1.0) {
        audio.playbackRate = safeRate;
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          if (stopped) return;
          if (err && (err.name === 'AbortError' || err.code === 20)) return;
          if (!usingBrowserFallback) {
            usingBrowserFallback = true;
            cleanupAudio();
            speakRemainingWithBrowserSynthesis(currentIndex);
          }
        });
      }
    } catch {
      if (!stopped && !usingBrowserFallback) {
        usingBrowserFallback = true;
        cleanupAudio();
        speakRemainingWithBrowserSynthesis(currentIndex);
      }
    }
  };

  // Notify start & trigger Chunk 0 synchronously inside the click gesture callstack
  onStart?.();
  playChunk(0);

  return { stop };
}
