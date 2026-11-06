/**
 * LeafGuard AI – Robust Cross-Browser Voice Recording and Speech Transcription Service
 * Supports Kannada (ಕನ್ನಡ), Hindi (हिंदी), and English with automatic audio recording fallback.
 */

export interface TranscriptionResult {
  transcript: string;
  languageCode: 'kn' | 'hi' | 'en' | 'te' | 'ta' | string;
  languageName: string;
}

export interface VoiceSessionController {
  stop: () => Promise<TranscriptionResult>;
  cancel: () => void;
}

// Convert audio blob to base64 string
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Transcribe recorded audio blob using Gemini server endpoint
export async function transcribeAudioBlob(blob: Blob): Promise<TranscriptionResult> {
  const base64Audio = await blobToBase64(blob);
  const mimeType = blob.type || 'audio/webm';

  const res = await fetch('/api/transcribe-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64: base64Audio,
      mimeType,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with ${res.status}`);
  }

  const data = await res.json();
  return {
    transcript: data.transcript || '',
    languageCode: data.languageCode || 'kn',
    languageName: data.languageName || 'Kannada',
  };
}

/**
 * Start a unified voice session with MediaRecorder + Web Speech API parallel capture.
 */
export async function startVoiceRecordingSession(options: {
  preferredLang?: string; // e.g. 'kn', 'hi', 'en'
  onInterimTranscript?: (text: string) => void;
  onVolumeChange?: (level: number) => void;
  onError?: (errMessage: string) => void;
}): Promise<VoiceSessionController> {
  const preferredLang = options.preferredLang || 'kn';
  const langCode = preferredLang === 'kn' ? 'kn-IN' : preferredLang === 'hi' ? 'hi-IN' : 'en-US';

  // 1. Request microphone access
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser environment.');
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err: any) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error(
        preferredLang === 'kn'
          ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ ಆನ್ ಮಾಡಿ ಅಥವಾ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ.'
          : 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
      );
    }
    throw new Error(`Microphone error: ${err.message || 'Unable to access microphone'}`);
  }

  // 2. Setup MediaRecorder for universal backup
  let mediaRecorder: MediaRecorder | null = null;
  const recordedChunks: Blob[] = [];

  try {
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : '';

    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
    mediaRecorder.start(100);
  } catch (mrErr) {
    console.warn('MediaRecorder setup warning:', mrErr);
  }

  // 3. Setup Web Speech API if supported
  let webSpeechTranscript = '';
  let recognition: any = null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.lang = langCode;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (e: any) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            webSpeechTranscript += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        if (options.onInterimTranscript) {
          options.onInterimTranscript(webSpeechTranscript || interim);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Web Speech recognition warning:', e.error);
        // Do not crash; we have MediaRecorder as backup
      };

      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition start warning:', e);
    }
  }

  const stopAll = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (_) {}
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  return {
    cancel: () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch (_) {}
      }
      stopAll();
    },
    stop: async (): Promise<TranscriptionResult> => {
      return new Promise<TranscriptionResult>((resolve, reject) => {
        const finalize = async () => {
          stopAll();

          // If Web Speech yielded a clean transcript with at least 2 words, prefer it
          const cleanedWebSpeech = webSpeechTranscript.trim();
          if (cleanedWebSpeech.length >= 3) {
            resolve({
              transcript: cleanedWebSpeech,
              languageCode: preferredLang,
              languageName: preferredLang === 'kn' ? 'Kannada (ಕನ್ನಡ)' : preferredLang === 'hi' ? 'Hindi (हिंदी)' : 'English',
            });
            return;
          }

          // Otherwise, transcribe the raw recorded audio chunks via Gemini
          if (recordedChunks.length > 0) {
            try {
              const audioBlob = new Blob(recordedChunks, {
                type: mediaRecorder?.mimeType || 'audio/webm',
              });

              if (audioBlob.size > 200) {
                const result = await transcribeAudioBlob(audioBlob);
                if (result.transcript && result.transcript.trim()) {
                  resolve(result);
                  return;
                }
              }
            } catch (err: any) {
              console.warn('Gemini audio transcription fallback notice:', err);
            }
          }

          // If still empty
          if (cleanedWebSpeech) {
            resolve({
              transcript: cleanedWebSpeech,
              languageCode: preferredLang,
              languageName: preferredLang,
            });
          } else {
            reject(
              new Error(
                preferredLang === 'kn'
                  ? 'ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ ಹತ್ತಿರ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.'
                  : 'No speech was detected. Please speak closer to the microphone or type your question.'
              )
            );
          }
        };

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.onstop = () => {
            finalize().catch(reject);
          };
          try {
            mediaRecorder.stop();
          } catch (_) {
            finalize().catch(reject);
          }
        } else {
          finalize().catch(reject);
        }
      });
    },
  };
}
