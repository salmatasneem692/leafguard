import React, { useState, useEffect, useRef } from 'react';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  REGIONAL_PLANT_DATA, 
  REGIONAL_QA_KNOWLEDGE_BASE, 
  QAPair 
} from '../data/regionalTranslations.ts';
import { PlantSpeciesId, HealthStatus } from '../types/index.ts';
import { startVoiceRecordingSession, VoiceSessionController } from '../services/voiceInputService.ts';
import { 
  Languages, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  MessageSquare,
  Loader2
} from 'lucide-react';

interface RegionalAssistantProps {
  speciesId: PlantSpeciesId;
  healthStatus: HealthStatus;
  confidence: number;
}

export const RegionalAssistant: React.FC<RegionalAssistantProps> = ({
  speciesId,
  healthStatus,
  confidence,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('kn'); // Default to Kannada as requested in the PDF
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'assistant'; text: string; languageCode?: string; languageName?: string }[]
  >([]);

  const voiceSessionRef = useRef<VoiceSessionController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioActiveRef = useRef<boolean>(false);
  const audioSessionRef = useRef<number>(0);

  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];
  const plantData = REGIONAL_PLANT_DATA[selectedLang]?.[speciesId] || REGIONAL_PLANT_DATA.en[speciesId];
  const qaList = REGIONAL_QA_KNOWLEDGE_BASE[selectedLang] || REGIONAL_QA_KNOWLEDGE_BASE.en;

  // Build spoken text script
  const getSpeechScript = (): string => {
    if (!plantData) return '';
    const healthText = healthStatus === 'healthy' ? plantData.healthHealthy : plantData.healthDiseased;
    return `${plantData.name}. ${plantData.shortDesc} ${healthText} ${plantData.wateringSummary} ${plantData.safetyWarning}`;
  };

  const handleStopAudio = () => {
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

    setIsPlayingAudio(false);
  };

  // Text-To-Speech Handler supporting Kannada, Hindi, and regional voices in the exact language requested
  const handleSpeak = (customText?: string, langOverride?: string) => {
    if (isPlayingAudio && !customText) {
      handleStopAudio();
      return;
    }

    handleStopAudio();

    const textToSpeak = (customText || getSpeechScript()).trim();
    if (!textToSpeak) return;

    const langToUse = langOverride || selectedLang;

    try {
      const sessionId = Date.now();
      audioSessionRef.current = sessionId;
      isAudioActiveRef.current = true;
      setIsPlayingAudio(true);

      const audioUrl = `/api/tts?lang=${encodeURIComponent(langToUse)}&text=${encodeURIComponent(textToSpeak.slice(0, 185))}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        if (audioSessionRef.current !== sessionId) return;
        setIsPlayingAudio(false);
        audioRef.current = null;
        isAudioActiveRef.current = false;
      };

      audio.onerror = () => {
        // If user stopped, do not fallback to speech synthesis
        if (!isAudioActiveRef.current || audioSessionRef.current !== sessionId) {
          setIsPlayingAudio(false);
          return;
        }
        console.warn('TTS streaming failed, falling back to browser SpeechSynthesis');
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && isAudioActiveRef.current) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const meta = SUPPORTED_LANGUAGES.find((l) => l.code === langToUse) || langMeta;
          utterance.lang = meta.speechCode;
          utterance.rate = speechRate;
          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find((v) => v.lang.toLowerCase().includes(langToUse));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
          utterance.onend = () => {
            if (audioSessionRef.current === sessionId) {
              setIsPlayingAudio(false);
              isAudioActiveRef.current = false;
            }
          };
          utterance.onerror = () => {
            if (audioSessionRef.current === sessionId) {
              setIsPlayingAudio(false);
              isAudioActiveRef.current = false;
            }
          };
          if (isAudioActiveRef.current && audioSessionRef.current === sessionId) {
            window.speechSynthesis.speak(utterance);
          }
        } else {
          setIsPlayingAudio(false);
        }
      };

      audio.play().catch((err) => {
        // User clicked Stop button: NEVER fall back to SpeechSynthesis
        if (!isAudioActiveRef.current || audioSessionRef.current !== sessionId) {
          return;
        }
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && isAudioActiveRef.current) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const meta = SUPPORTED_LANGUAGES.find((l) => l.code === langToUse) || langMeta;
          utterance.lang = meta.speechCode;
          utterance.rate = speechRate;
          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find((v) => v.lang.toLowerCase().includes(langToUse));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
          utterance.onend = () => {
            if (audioSessionRef.current === sessionId) {
              setIsPlayingAudio(false);
              isAudioActiveRef.current = false;
            }
          };
          utterance.onerror = () => {
            if (audioSessionRef.current === sessionId) {
              setIsPlayingAudio(false);
              isAudioActiveRef.current = false;
            }
          };
          if (isAudioActiveRef.current && audioSessionRef.current === sessionId) {
            window.speechSynthesis.speak(utterance);
          }
        } else {
          setIsPlayingAudio(false);
        }
      });
    } catch (e) {
      console.error('Regional TTS play error:', e);
      setIsPlayingAudio(false);
      isAudioActiveRef.current = false;
    }
  };

  // Stop audio if component unmounts or language changes
  useEffect(() => {
    return () => {
      handleStopAudio();
      if (voiceSessionRef.current) {
        voiceSessionRef.current.cancel();
      }
    };
  }, [selectedLang]);

  // Unified Cross-Browser Voice Recording and Speech-to-Text Handler
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
            setUserQuestion(result.transcript);
            processUserQuestion(result.transcript, result.languageCode);
          }
        } catch (err: any) {
          setIsTranscribing(false);
          voiceSessionRef.current = null;
          setVoiceNotice(err.message || 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ.');
        }
      }
      return;
    }

    setVoiceNotice(null);
    try {
      setIsRecordingMic(true);
      const session = await startVoiceRecordingSession({
        preferredLang: selectedLang,
        onInterimTranscript: (interim) => {
          if (interim) setUserQuestion(interim);
        },
      });
      voiceSessionRef.current = session;
    } catch (err: any) {
      setIsRecordingMic(false);
      setVoiceNotice(err.message || 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರಾರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    }
  };

  // Process question via Gemini AI in the exact language it was asked
  const processUserQuestion = async (queryText: string, langHint?: string) => {
    const cleanText = queryText.trim();
    if (!cleanText) return;

    setUserQuestion('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: cleanText }]);
    setIsAnsweringQuestion(true);

    try {
      const response = await fetch('/api/gemini/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cleanText,
          speciesName: plantData.name,
          scientificName: plantData.scientificName,
          healthStatus,
          preferredLanguage: langHint || selectedLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer || 'ಉತ್ತರವನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.';
      const answerLang = data.languageCode || langHint || selectedLang;
      const answerLangName = data.languageName || (answerLang === 'kn' ? 'ಕನ್ನಡ' : answerLang === 'hi' ? 'हिंदी' : 'English');

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: answer,
          languageCode: answerLang,
          languageName: answerLangName,
        },
      ]);

      // Speak answer in the language it was delivered!
      handleSpeak(answer, answerLang);
    } catch (err) {
      console.warn('API error, falling back to local dataset:', err);
      // Fallback
      let matchedAnswer = '';
      for (const item of qaList) {
        if (cleanText.toLowerCase().includes(item.tag)) {
          matchedAnswer = item.answer;
          break;
        }
      }
      if (!matchedAnswer) {
        matchedAnswer = `${plantData.name}: ${plantData.wateringSummary} ${plantData.safetyWarning}`;
      }
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: matchedAnswer,
          languageCode: selectedLang,
          languageName: selectedLang === 'kn' ? 'ಕನ್ನಡ' : selectedLang === 'hi' ? 'हिंदी' : 'English',
        },
      ]);
      handleSpeak(matchedAnswer, selectedLang);
    } finally {
      setIsAnsweringQuestion(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
      {/* Top Header: Language Switcher and Audio Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold mb-1">
            <Languages className="w-4 h-4 text-emerald-600" />
            <span>Regional-Language AI Assistant · ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಸಹಾಯಕ</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Read & Hear Botanical Diagnostics in Your Language
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Designed for farmers, rural users, and home gardeners with voice readout & Q&A
          </p>
        </div>

        {/* Language Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                handleStopAudio();
                setSelectedLang(lang.code);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium flex items-center gap-1 ${
                selectedLang === lang.code
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{lang.nativeLabel}</span>
              <span className="text-[10px] opacity-75">({lang.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Regional Translation & Voice Readout Banner */}
      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-emerald-950 font-serif">
                {plantData.name}
              </h4>
              <span className="text-xs font-mono text-emerald-700 italic">
                ({plantData.scientificName})
              </span>
            </div>
            <p className="text-xs text-emerald-900 mt-0.5 font-medium leading-relaxed">
              {plantData.shortDesc}
            </p>
          </div>

          {/* Voice Readout Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isPlayingAudio) {
                  handleStopAudio();
                } else {
                  handleSpeak();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-600 text-white hover:bg-amber-700 animate-pulse'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
              title={isPlayingAudio ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Voice Audio)" : "Listen to full diagnostic report in selected language"}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>{selectedLang === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop)' : 'Stop Voice'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Listen in {langMeta.nativeLabel}</span>
                </>
              )}
            </button>

            {isPlayingAudio && (
              <button
                type="button"
                onClick={handleStopAudio}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                title="Stop Audio immediately"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Audio Voice Player Notice Banner if playing */}
        {isPlayingAudio && (
          <div className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span className="font-semibold">
                {selectedLang === 'kn' 
                  ? 'ಧ್ವನಿ ವಿವರಣೆಯನ್ನು ನುಡಿಯಲಾಗುತ್ತಿದೆ...' 
                  : 'Regional voice audio is playing...'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
              title="Stop audio playback immediately"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{selectedLang === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop)' : 'Stop Audio'}</span>
            </button>
          </div>
        )}

        {/* Localized Health & Watering Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/80 rounded-lg border border-emerald-100 space-y-1">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              {healthStatus === 'healthy' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>ಆರೋಗ್ಯ ಸ್ಥಿತಿ / Health Status:</span>
            </span>
            <p className="text-slate-700 leading-relaxed">
              {healthStatus === 'healthy' ? plantData.healthHealthy : plantData.healthDiseased}
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-lg border border-emerald-100 space-y-1">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>ನೀರಿನ ಪ್ರಮಾಣ / Watering Guide:</span>
            </span>
            <p className="text-slate-700 leading-relaxed">
              {plantData.wateringSummary}
            </p>
          </div>
        </div>

        {/* Safety Warning in Regional Language */}
        <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-lg text-[11px] text-amber-950 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {plantData.safetyWarning}
          </p>
        </div>
      </div>

      {/* Voice-based Question & Answer Facility */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Voice & Text Q&A Facility · ಪ್ರಶ್ನೋತ್ತರ ವಿಭಾಗ</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Tap any question to listen to answers</span>
        </div>

        {/* Quick FAQ buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {qaList.map((qa, idx) => (
            <button
              key={idx}
              onClick={() => {
                processUserQuestion(qa.question);
              }}
              className="p-2.5 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs transition-colors flex items-center justify-between group"
            >
              <span className="text-slate-800 group-hover:text-emerald-900 font-medium">
                {qa.question}
              </span>
              <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
            </button>
          ))}
        </div>

        {/* Active Audio Recording Visual Banner */}
        {isRecordingMic && (
          <div className="p-3 bg-rose-50 border-2 border-rose-400 rounded-xl flex items-center justify-between text-xs text-rose-950 animate-pulse shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <div>
                <span className="font-bold block text-rose-900">
                  {selectedLang === 'kn' ? '🎙️ ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ...' : '🎙️ Listening to your voice...'}
                </span>
                <span className="text-[11px] text-rose-700">
                  {selectedLang === 'kn'
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
              <span>{selectedLang === 'kn' ? 'ನಿಲ್ಲಿಸಿ & ಕಳುಹಿಸಿ' : 'Stop & Send'}</span>
            </button>
          </div>
        )}

        {/* Audio Transcribing or AI Answering Status */}
        {isTranscribing && (
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2 text-xs text-sky-900">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            <span className="font-medium">
              {selectedLang === 'kn'
                ? 'ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲಾಗುತ್ತಿದೆ (Transcribing speech with Gemini)...'
                : 'Transcribing speech into text...'}
            </span>
          </div>
        )}

        {isAnsweringQuestion && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="font-medium">
              {selectedLang === 'kn'
                ? 'ಜೆಮಿನಿ AI ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ...'
                : 'Gemini AI is generating answer in the requested language...'}
            </span>
          </div>
        )}

        {/* Chat / Answer History Box */}
        {chatHistory.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-h-64 overflow-y-auto">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-slate-200/90 text-slate-800 ml-6 sm:ml-12 font-medium border border-slate-300'
                    : 'bg-emerald-800 text-white mr-6 sm:mr-12 shadow-xs border border-emerald-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/10">
                  <span className="text-[10px] font-mono opacity-80 font-bold uppercase tracking-wider">
                    {item.sender === 'user' ? '👤 ನೀವು ಕೇಳಿದ ಪ್ರಶ್ನೆ (Your Question)' : '🌿 ಕೃಷಿ AI ಸಹಾಯಕ (Plant Assistant)'}
                  </span>

                  {item.sender === 'assistant' && (
                    <div className="flex items-center gap-1.5">
                      {item.languageName && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-emerald-100">
                          {item.languageName}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isPlayingAudio) {
                            handleStopAudio();
                          } else {
                            handleSpeak(item.text, item.languageCode);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          isPlayingAudio
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                        title={isPlayingAudio ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Audio)" : "ಈ ಉತ್ತರವನ್ನು ಆಲಿಸಿ (Listen to this answer)"}
                      >
                        {isPlayingAudio ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-white" />
                            <span>ನಿಲ್ಲಿಸಿ (Stop)</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-emerald-200" />
                            <span>ಆಲಿಸಿ</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="whitespace-pre-line text-[12px]">{item.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Voice Notice if microphone unavailable or error */}
        {voiceNotice && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
            <span>{voiceNotice}</span>
            <button
              onClick={() => setVoiceNotice(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 text-[11px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* Question Input with Microphone Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isTranscribing || isAnsweringQuestion}
            className={`p-2.5 rounded-lg transition-all shadow-xs cursor-pointer ${
              isRecordingMic
                ? 'bg-rose-600 text-white ring-4 ring-rose-400/40 animate-pulse'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-emerald-700'
            }`}
            title={isRecordingMic ? 'ನಿಲ್ಲಿಸಿ (Stop recording)' : 'ಮೈಕ್ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (Speak question)'}
          >
            {isRecordingMic ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4 text-emerald-700" />}
          </button>

          <input
            type="text"
            placeholder={
              selectedLang === 'kn'
                ? 'ಗಿಡದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ನೀರು ಎಷ್ಟು ಹಾಕಬೇಕು? / ಕಲೆಗಳಿಗೆ ಏನು ಮಾಡಬೇಕು?)...'
                : selectedLang === 'hi'
                ? 'पौधे के बारे में प्रश्न पूछें (उदा: पानी कितना दें? / पत्तियों के दाग कैसे हटाएं?)...'
                : 'Ask a question in Kannada, Hindi, or English (e.g. watering, sunlight, remedies)...'
            }
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') processUserQuestion(userQuestion);
            }}
            disabled={isRecordingMic || isTranscribing || isAnsweringQuestion}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          />

          <button
            type="button"
            onClick={() => processUserQuestion(userQuestion)}
            disabled={!userQuestion.trim() || isAnsweringQuestion}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isAnsweringQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{selectedLang === 'kn' ? 'ಕೇಳಿ' : 'Ask'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
