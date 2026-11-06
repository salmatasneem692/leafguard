import React, { useState, useEffect, useRef } from 'react';
import { PredictionResult } from '../types/index.ts';
import { startVoiceRecordingSession, VoiceSessionController } from '../services/voiceInputService.ts';
import { 
  Sparkles, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Bot, 
  Leaf, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Languages,
  Square
} from 'lucide-react';

interface AiExplanationCardProps {
  result: PredictionResult;
  autoTrigger?: boolean;
}

export type ExplanationLanguage = 'kn' | 'en' | 'hi';

export interface QaAnswerItem {
  question: string;
  answer: string;
  languageCode: string;
  languageName: string;
}

export const AiExplanationCard: React.FC<AiExplanationCardProps> = ({ result, autoTrigger = false }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<ExplanationLanguage>('kn'); // Default to Kannada
  const [loading, setLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.8-flash');
  const [copied, setCopied] = useState<boolean>(false);
  const [qaCopied, setQaCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [hasRequested, setHasRequested] = useState<boolean>(false);

  // Cross-browser voice recording and Gemini multilingual Q&A states
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isAnsweringQa, setIsAnsweringQa] = useState<boolean>(false);
  const [qaAnswer, setQaAnswer] = useState<QaAnswerItem | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioActiveRef = useRef<boolean>(false);
  const audioSessionRef = useRef<number>(0);
  const voiceSessionRef = useRef<VoiceSessionController | null>(null);

  const fetchAiExplanation = async (question?: string, langOverride?: ExplanationLanguage) => {
    const langToUse = langOverride || selectedLanguage;
    try {
      setLoading(true);
      setError(null);
      setHasRequested(true);
      stopAudio();

      const response = await fetch('/api/gemini/explain-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speciesName: result.species.name,
          scientificName: result.species.scientificName,
          healthStatus: result.health.status,
          diseaseName: result.health.diseaseName,
          severity: result.health.severity,
          symptoms: result.health.symptoms,
          recommendations: result.health.recommendations,
          medicinalUses: result.medicinalInfo?.primaryMedicinalUses || [],
          phytochemicals: result.medicinalInfo?.activePhytochemicals || [],
          userQuestion: question || customQuestion || undefined,
          language: langToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data.explanation);
      if (data.model) {
        setModelUsed(data.model);
      }
    } catch (err: any) {
      console.error('Failed to get Gemini explanation:', err);
      setError(err?.message || 'Failed to retrieve AI explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTrigger && !hasRequested) {
      fetchAiExplanation();
    }
  }, [autoTrigger]);

  // Clean up audio & speech on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (voiceSessionRef.current) {
        voiceSessionRef.current.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    isAudioActiveRef.current = false;
    audioSessionRef.current = 0;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = '';
      } catch (e) {
        // ignore
      }
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    setIsSpeaking(false);
  };

  const handleCopy = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy explanation:', err);
    }
  };

  const handleCopyQa = async () => {
    if (!qaAnswer) return;
    try {
      await navigator.clipboard.writeText(`Q: ${qaAnswer.question}\n\nA: ${qaAnswer.answer}`);
      setQaCopied(true);
      setTimeout(() => setQaCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy QA answer:', err);
    }
  };

  // Speaks any given text in the exact language specified (Kannada, Hindi, English, etc.)
  const playSpokenText = (text: string, langOverride?: string) => {
    if (isSpeaking && !text) {
      stopAudio();
      return;
    }

    stopAudio();

    const effectiveLang = langOverride || selectedLanguage;

    // Clean text for speech
    const cleanText = text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[-*•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const excerpt = cleanText.length > 185 
      ? cleanText.slice(0, 185).replace(/\s+\S*$/, '') + '...' 
      : cleanText;

    try {
      const sessionId = Date.now();
      audioSessionRef.current = sessionId;
      isAudioActiveRef.current = true;
      setIsSpeaking(true);

      const audioUrl = `/api/tts?lang=${encodeURIComponent(effectiveLang)}&text=${encodeURIComponent(excerpt)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        if (audioSessionRef.current !== sessionId) return;
        setIsSpeaking(false);
        audioRef.current = null;
        isAudioActiveRef.current = false;
      };

      audio.onerror = () => {
        // If stopped, NEVER resurrect speech
        if (!isAudioActiveRef.current || audioSessionRef.current !== sessionId) {
          setIsSpeaking(false);
          return;
        }
        console.warn('TTS streaming failed, falling back to browser SpeechSynthesis');
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && isAudioActiveRef.current) {
          const utterance = new SpeechSynthesisUtterance(excerpt);
          utterance.lang = effectiveLang === 'kn' ? 'kn-IN' : effectiveLang === 'hi' ? 'hi-IN' : 'en-US';
          utterance.rate = 0.95;
          utterance.onend = () => {
            if (audioSessionRef.current === sessionId) {
              setIsSpeaking(false);
              isAudioActiveRef.current = false;
            }
          };
          utterance.onerror = () => {
            if (audioSessionRef.current === sessionId) {
              setIsSpeaking(false);
              isAudioActiveRef.current = false;
            }
          };
          if (isAudioActiveRef.current && audioSessionRef.current === sessionId) {
            window.speechSynthesis.speak(utterance);
          }
        } else {
          setIsSpeaking(false);
        }
      };

      audio.play().catch((err) => {
        // User clicked STOP or audio was aborted: DO NOT fall back to SpeechSynthesis
        if (!isAudioActiveRef.current || audioSessionRef.current !== sessionId) {
          return;
        }
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return;
        }
        console.warn('Audio play prevented or failed:', err);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && isAudioActiveRef.current) {
          const utterance = new SpeechSynthesisUtterance(excerpt);
          utterance.lang = effectiveLang === 'kn' ? 'kn-IN' : effectiveLang === 'hi' ? 'hi-IN' : 'en-US';
          utterance.rate = 0.95;
          utterance.onend = () => {
            if (audioSessionRef.current === sessionId) {
              setIsSpeaking(false);
              isAudioActiveRef.current = false;
            }
          };
          utterance.onerror = () => {
            if (audioSessionRef.current === sessionId) {
              setIsSpeaking(false);
              isAudioActiveRef.current = false;
            }
          };
          if (isAudioActiveRef.current && audioSessionRef.current === sessionId) {
            window.speechSynthesis.speak(utterance);
          }
        } else {
          setIsSpeaking(false);
        }
      });
    } catch (e) {
      console.error('Speech initialization error:', e);
      setIsSpeaking(false);
      isAudioActiveRef.current = false;
    }
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }
    if (explanation) {
      playSpokenText(explanation, selectedLanguage);
    }
  };

  // Cross-browser microphone voice input handler (with audio recording fallback)
  const handleToggleMic = async () => {
    if (isRecordingMic) {
      if (voiceSessionRef.current) {
        try {
          setIsRecordingMic(false);
          setIsTranscribing(true);
          const result = await voiceSessionRef.current.stop();
          voiceSessionRef.current = null;
          setIsTranscribing(false);

          if (result.transcript && result.transcript.trim()) {
            setCustomQuestion(result.transcript);
            askQuestionDirectly(result.transcript, result.languageCode);
          }
        } catch (err: any) {
          setIsTranscribing(false);
          voiceSessionRef.current = null;
          setError(err.message || 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ.');
        }
      }
      return;
    }

    setError(null);
    try {
      setIsRecordingMic(true);
      const session = await startVoiceRecordingSession({
        preferredLang: selectedLanguage,
        onInterimTranscript: (interim) => {
          if (interim) setCustomQuestion(interim);
        },
      });
      voiceSessionRef.current = session;
    } catch (err: any) {
      setIsRecordingMic(false);
      setError(err.message || 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರಾರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    }
  };

  // Direct Q&A that answers in the exact language the question was asked in!
  const askQuestionDirectly = async (questionText: string, langHint?: string) => {
    const cleanText = questionText.trim();
    if (!cleanText) return;

    setIsAnsweringQa(true);
    setError(null);
    stopAudio();

    try {
      const response = await fetch('/api/gemini/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cleanText,
          speciesName: result.species.name,
          scientificName: result.species.scientificName,
          healthStatus: result.health.status,
          diseaseName: result.health.diseaseName,
          severity: result.health.severity,
          symptoms: result.health.symptoms,
          recommendations: result.health.recommendations,
          medicinalUses: result.medicinalInfo?.primaryMedicinalUses || [],
          preferredLanguage: langHint || selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setQaAnswer({
        question: cleanText,
        answer: data.answer,
        languageCode: data.languageCode || 'kn',
        languageName: data.languageName || (data.languageCode === 'kn' ? 'ಕನ್ನಡ' : data.languageCode === 'hi' ? 'हिंदी' : 'English'),
      });

      // Automatically play audio readout in the exact language of the answer!
      playSpokenText(data.answer, data.languageCode);
    } catch (err: any) {
      console.error('Failed to answer user question:', err);
      setError(err.message || 'Failed to get answer to question.');
    } finally {
      setIsAnsweringQa(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isAnsweringQa) return;
    askQuestionDirectly(customQuestion.trim());
  };

  const handleLanguageChange = (newLang: ExplanationLanguage) => {
    setSelectedLanguage(newLang);
    stopAudio();
    // Re-fetch explanation in selected language if already active
    if (explanation || hasRequested) {
      fetchAiExplanation(customQuestion || undefined, newLang);
    }
  };

  // Simple Markdown Renderer for clean headings, bullet lists, bold text
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
        return;
      }

      // H3 heading
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace('### ', '');
        elements.push(
          <h4 key={`h3-${index}`} className="text-sm font-bold mt-3 mb-1.5 flex items-center gap-1.5 text-emerald-800">
            {title}
          </h4>
        );
        return;
      }

      // H2 heading
      if (trimmed.startsWith('## ')) {
        const title = trimmed.replace('## ', '');
        elements.push(
          <h3 key={`h2-${index}`} className="text-base font-bold mt-4 mb-2 text-emerald-900 border-b border-emerald-100 pb-1">
            {title}
          </h3>
        );
        return;
      }

      // Bullet item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        elements.push(
          <li key={`li-${index}`} className="text-xs text-slate-700 leading-relaxed ml-4 list-disc pl-1 mb-1">
            {formatBoldItalic(content)}
          </li>
        );
        return;
      }

      // Numbered list item: e.g. "1. ..."
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        elements.push(
          <div key={`num-${index}`} className="text-xs text-slate-700 leading-relaxed ml-1 mb-1.5 flex items-start gap-2">
            <span className="font-semibold text-emerald-700 shrink-0 font-mono text-[11px] bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center border border-emerald-200">
              {numberedMatch[1]}
            </span>
            <span className="pt-0.5">{formatBoldItalic(numberedMatch[2])}</span>
          </div>
        );
        return;
      }

      // Blockquote or italic notice
      if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
        elements.push(
          <div key={`notice-${index}`} className="p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-lg text-xs italic text-amber-900 mt-2">
            {trimmed.slice(1, -1)}
          </div>
        );
        return;
      }

      // Standard paragraph
      elements.push(
        <p key={`p-${index}`} className="text-xs text-slate-700 leading-relaxed mb-1.5">
          {formatBoldItalic(trimmed)}
        </p>
      );
    });

    return elements;
  };

  const formatBoldItalic = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-800">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-indigo-50/60 rounded-xl border border-emerald-200/80 shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-emerald-100/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-100 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                {selectedLanguage === 'kn' ? 'ಕನ್ನಡ ಎಐ ಆರೋಗ್ಯ ಮತ್ತು ಆರೈಕೆ ವಿವರಣೆ' : 'Gemini AI Plain-Language Health Explanation'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-semibold border border-emerald-200">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {selectedLanguage === 'kn' 
                ? 'ರೈತರು ಮತ್ತು ಸಸ್ಯಪ್ರಿಯರಿಗಾಗಿ ಕನ್ನಡದಲ್ಲಿ ನೈಸರ್ಗಿಕ ಧ್ವನಿ ವಿವರಣೆ ಮತ್ತು ಸಾವಯವ ಉಪಚಾರ' 
                : 'Plain-language synthesis of foliar condition, causes, and organic medicinal plant care'}
            </p>
          </div>
        </div>

        {/* Language selector & top action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => handleLanguageChange('kn')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedLanguage === 'kn'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>🇮🇳 ಕನ್ನಡ</span>
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedLanguage === 'en'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedLanguage === 'hi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>🇮🇳 हिंदी</span>
            </button>
          </div>

          {/* Action button trigger if not yet generated */}
          {!hasRequested && !explanation && (
            <button
              type="button"
              onClick={() => fetchAiExplanation()}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{selectedLanguage === 'kn' ? 'AI ವಿವರಣೆ ಪಡೆಯಿರಿ' : 'Get AI Explanation'}</span>
            </button>
          )}

          {/* Controls when explanation exists */}
          {explanation && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSpeaking 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/50' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={isSpeaking ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop audio)' : 'ಕನ್ನಡ ಧ್ವನಿ ವಿವರಣೆ ಆಲಿಸಿ (Listen in Kannada voice)'}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 text-amber-700 fill-amber-700" />
                    <span className="text-[11px] font-bold text-amber-900 animate-pulse">
                      {selectedLanguage === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop'}
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {selectedLanguage === 'kn' ? 'ಧ್ವನಿ ವಿವರಣೆ ಕೇಳಿ' : 'Listen'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Copy explanation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span className="text-[11px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => fetchAiExplanation()}
                disabled={loading}
                className="p-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Regenerate explanation"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-[11px] hidden sm:inline">
                  {selectedLanguage === 'kn' ? 'ಮತ್ತೆ ರಚಿಸಿ' : 'Regenerate'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5">
        {/* State 1: Prompt to get explanation */}
        {!hasRequested && !explanation && !loading && (
          <div className="text-center py-6 px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              {selectedLanguage === 'kn' 
                ? 'ಕನ್ನಡದಲ್ಲಿ ರೈತಸ್ನೇಹಿ ಸಸ್ಯ ಆರೋಗ್ಯ ವಿವರಣೆ ಬೇಕೇ?' 
                : 'Need a clear, farmer-friendly explanation?'}
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
              {selectedLanguage === 'kn'
                ? `ಜೆಮಿನಿ AI ಮೂಲಕ ${result.species.name} ಸಸ್ಯದ ಎಲೆಯ ಸ್ಥಿತಿ, ರೋಗದ ಕಾರಣಗಳು ಮತ್ತು ಸಾವಯವ ಪರಿಹಾರಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ.`
                : `Ask Gemini 3.8 Flash to interpret the diagnostic output for ${result.species.name}, breaking down leaf pathology and practical organic care into simple, jargon-free steps.`}
            </p>
            <button
              type="button"
              onClick={() => fetchAiExplanation()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>
                {selectedLanguage === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ AI ಆರೋಗ್ಯ ವಿವರಣೆ ಪಡೆಯಿರಿ' : 'Generate AI Health & Care Explanation'}
              </span>
            </button>
          </div>
        )}

        {/* State 2: Loading */}
        {loading && (
          <div className="py-8 px-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <Loader2 className="w-6 h-6 animate-spin" />
              <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {selectedLanguage === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...' : 'Generating Plain-Language Synthesis...'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {selectedLanguage === 'kn' 
                  ? 'ಜೆಮಿನಿ AI ಮಾದರಿಯು ಸಸ್ಯದ ರೋಗಲಕ್ಷಣಗಳು ಮತ್ತು ಸಾವಯವ ಔಷಧಿ ಕ್ರಮಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ.' 
                  : 'Gemini 3.8 Flash is analyzing foliar taxonomy, pathology biomarkers, and organic horticultural remedies.'}
              </p>
            </div>
          </div>
        )}

        {/* State 3: Error */}
        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{selectedLanguage === 'kn' ? 'ವಿವರಣೆ ಪಡೆಯುವಲ್ಲಿ ದೋಷ' : 'AI Explanation Error'}</span>
            </div>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => fetchAiExplanation()}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{selectedLanguage === 'kn' ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry Generation'}</span>
            </button>
          </div>
        )}

        {/* State 4: Generated Explanation */}
        {explanation && !loading && (
          <div className="space-y-4">
            {/* Audio Voice Player Notice Banner if speaking */}
            {isSpeaking && (
              <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 animate-pulse">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold">
                    {selectedLanguage === 'kn' 
                      ? 'ಧ್ವನಿ ವಿವರಣೆಯನ್ನು ನುಡಿಯಲಾಗುತ್ತಿದೆ...' 
                      : 'Voice Assistant audio is playing...'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
                  title="Stop audio playback immediately"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{selectedLanguage === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop)' : 'Stop Audio'}</span>
                </button>
              </div>
            )}

            {/* Active Audio Recording Visual Banner */}
            {isRecordingMic && (
              <div className="p-3 bg-rose-50 border-2 border-rose-400 rounded-xl flex items-center justify-between text-xs text-rose-950 animate-pulse shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                  <div>
                    <span className="font-bold block text-rose-900">
                      {selectedLanguage === 'kn' ? '🎙️ ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ...' : '🎙️ Listening to your voice...'}
                    </span>
                    <span className="text-[11px] text-rose-700">
                      {selectedLanguage === 'kn'
                        ? 'ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ. ಮುಗಿದ ನಂತರ "ನಿಲ್ಲಿಸಿ" ಒತ್ತಿ.'
                        : 'Speak in Kannada, Hindi, or English. Click Stop when done.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>{selectedLanguage === 'kn' ? 'ನಿಲ್ಲಿಸಿ & ಕೇಳಿ' : 'Stop & Ask'}</span>
                </button>
              </div>
            )}

            {/* Transcribing or Answering Status */}
            {isTranscribing && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2 text-xs text-sky-900">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span className="font-medium">
                  {selectedLanguage === 'kn'
                    ? 'ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲಾಗುತ್ತಿದೆ (Transcribing speech with Gemini)...'
                    : 'Transcribing speech into text...'}
                </span>
              </div>
            )}

            {isAnsweringQa && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="font-medium">
                  {selectedLanguage === 'kn'
                    ? 'ಜೆಮಿನಿ AI ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಅದೇ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರಿಸುತ್ತಿದೆ...'
                    : 'Gemini AI is generating your answer in the question language...'}
                </span>
              </div>
            )}

            {/* Direct Q&A Answer in the Requested Language */}
            {qaAnswer && (
              <div className="p-4 bg-emerald-50/90 border-2 border-emerald-300 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">
                      ❓ {qaAnswer.question}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white shadow-2xs">
                      {qaAnswer.languageName} ಉತ್ತರ
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          stopAudio();
                        } else {
                          playSpokenText(qaAnswer.answer, qaAnswer.languageCode);
                        }
                      }}
                      className={`px-2.5 py-1 rounded border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isSpeaking
                          ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                          : 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                      title={isSpeaking ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Audio)" : "ಈ ಉತ್ತರವನ್ನು ಆಲಿಸಿ (Listen to answer)"}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-white" />
                          <span>ನಿಲ್ಲಿಸಿ (Stop)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>ಆಲಿಸಿ (Listen)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyQa}
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-slate-700 rounded border border-emerald-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Answer"
                    >
                      {qaCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQaAnswer(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 text-[11px] font-bold ml-1 cursor-pointer"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line pt-1">
                  {renderFormattedMarkdown(qaAnswer.answer)}
                </div>
              </div>
            )}

            <div className="bg-white/90 p-4 sm:p-5 rounded-xl border border-emerald-100 shadow-2xs space-y-2">
              {renderFormattedMarkdown(explanation)}
            </div>

            {/* Interactive Voice/Text Q&A Box */}
            <form onSubmit={handleAskQuestion} className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {selectedLanguage === 'kn'
                      ? 'ಕನ್ನಡದಲ್ಲಿ ಅಥವಾ ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಧ್ವನಿ / ಟೈಪಿಂಗ್):'
                      : 'Ask a question in your language (Voice or typing):'}
                  </span>
                </span>
                <span className="text-[11px] text-emerald-700 font-mono font-medium">
                  {selectedLanguage === 'kn' ? 'ಪ್ರಶ್ನಿಸಿದ ಭಾಷೆಯಲ್ಲೇ ಉತ್ತರ ದೊರೆಯುತ್ತದೆ' : 'Answers in the language you ask'}
                </span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={
                      selectedLanguage === 'kn'
                        ? 'ಉದಾ: ಈ ರೋಗಕ್ಕೆ ಬೇವಿನ ಎಣ್ಣೆ ಹೇಗೆ ಸಿಂಪಡಿಸಬೇಕು? ಅಥವಾ ಎಷ್ಟು ನೀರು ಹಾಕಬೇಕು?'
                        : selectedLanguage === 'hi'
                        ? 'उदा: इस पत्ती के दाग कैसे ठीक करें? या पानी कितना डालें?'
                        : 'e.g. Can I spray neem oil for this leaf spot? or How much sunlight does it need?'
                    }
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    disabled={isRecordingMic || isTranscribing || isAnsweringQa}
                  />
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    disabled={isTranscribing || isAnsweringQa}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors cursor-pointer ${
                      isRecordingMic
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                    }`}
                    title={
                      isRecordingMic
                        ? 'ನಿಲ್ಲಿಸಿ (Stop recording)'
                        : selectedLanguage === 'kn'
                        ? 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ (Speak question in Kannada)'
                        : 'Speak your question'
                    }
                  >
                    {isRecordingMic ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!customQuestion.trim() || isAnsweringQa}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isAnsweringQa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{selectedLanguage === 'kn' ? 'ಕೇಳಿ' : 'Ask'}</span>
                </button>
              </div>

              {/* Quick suggestions in Kannada */}
              {selectedLanguage === 'kn' && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">ಉದಾಹರಣೆ ಪ್ರಶ್ನೆಗಳು:</span>
                  {[
                    'ಬೇವಿನ ಎಣ್ಣೆ ಹೇಗೆ ಸಿಂಪಡಿಸಬೇಕು?',
                    'ಗಿಡಕ್ಕೆ ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ನೀರುಣಿಸಬೇಕು?',
                    'ಈ ರೋಗದಿಂದ ಬೇರೆ ಗಿಡಗಳಿಗೆ ಅಪಾಯವಿದೆಯೇ?',
                  ].map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomQuestion(sugg);
                        askQuestionDirectly(sugg, 'kn');
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
