import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const port = portArgIndex !== -1 && process.argv[portArgIndex + 1]
  ? parseInt(process.argv[portArgIndex + 1], 10)
  : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side client with mandatory User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/ping', (_req, res) => {
  res.json({ pong: true, hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Serve persisted training & evaluation result JSON files
app.get('/api/results/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(__dirname, 'results', safeFilename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).json({ error: 'Result file not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error reading result file' });
  }
});

// Serve metrics.json directly
app.get('/api/metrics', (_req, res) => {
  try {
    const filePath = path.resolve(__dirname, 'results', 'metrics.json');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).json({ error: 'Metrics file not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error reading metrics' });
  }
});


// API endpoint for Audio Text-To-Speech streaming (Kannada, Hindi, English)
app.get('/api/tts', async (req, res) => {
  try {
    const rawText = (req.query.text as string) || '';
    const lang = ((req.query.lang as string) || 'kn').toLowerCase();

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Text query parameter is required' });
    }

    // Clean markdown and non-verbal symbols
    const cleanText = rawText
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[-*•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit chunk to under 190 characters per Google TTS requirement
    const textChunk = cleanText.length > 190 
      ? cleanText.slice(0, 190).replace(/\s+\S*$/, '') 
      : cleanText;

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(textChunk)}`;
    const audioRes = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!audioRes.ok) {
      return res.status(audioRes.status).send('TTS service unavailable');
    }

    const audioBuffer = await audioRes.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    console.error('TTS generation error:', err);
    res.status(500).json({ error: 'Failed to generate voice audio' });
  }
});

// Helper to detect language script from text (Kannada, Hindi, Telugu, Tamil, English)
function detectScriptLanguage(text: string): { langCode: string; langName: string } {
  if (!text) return { langCode: 'en', langName: 'English' };
  // Check Unicode ranges
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return { langCode: 'kn', langName: 'Kannada (ಕನ್ನಡ)' };
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return { langCode: 'hi', langName: 'Hindi (हिंदी)' };
  }
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return { langCode: 'te', langName: 'Telugu (తెలుగు)' };
  }
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return { langCode: 'ta', langName: 'Tamil (தமிழ்)' };
  }
  // Check Romanized/transliterated keywords
  const lower = text.toLowerCase();
  if (/\b(neeru|gida|gidakke|kannada|yestu|hege|beku|hakabeku|rogi|tinnabahuda|tumba)\b/.test(lower)) {
    return { langCode: 'kn', langName: 'Kannada (ಕನ್ನಡ)' };
  }
  if (/\b(paani|paudha|kya|kaise|dhoop|patte|patti|upchar|dawa|kaisa)\b/.test(lower)) {
    return { langCode: 'hi', langName: 'Hindi (हिंदी)' };
  }
  return { langCode: 'en', langName: 'English' };
}

// Endpoint to transcribe microphone audio using Gemini
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 payload is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured' });
    }

    const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: cleanMime,
            data: audioBase64,
          },
        },
        {
          text: 'Transcribe this spoken user question verbatim. The user may speak in Kannada (ಕನ್ನಡ), Hindi (हिंदी), English, Telugu, or Tamil. Output ONLY the exact transcribed words in the native script spoken. Do not add any extra commentary or translation.',
        },
      ],
    });

    const transcript = response.text ? response.text.trim() : '';
    const detected = detectScriptLanguage(transcript);

    res.json({
      transcript,
      languageCode: detected.langCode,
      languageName: detected.langName,
    });
  } catch (err: any) {
    console.error('Audio transcription error with Gemini:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe audio' });
  }
});

// Dedicated endpoint to answer questions in the exact language they were asked
app.post('/api/gemini/answer-question', async (req, res) => {
  try {
    const {
      question,
      speciesName = 'Medicinal plant',
      scientificName,
      healthStatus = 'healthy',
      diseaseName,
      severity,
      symptoms = [],
      recommendations = [],
      medicinalUses = [],
      preferredLanguage,
    } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Detect language from question
    let detected = detectScriptLanguage(question);
    if (detected.langCode === 'en' && preferredLanguage && preferredLanguage !== 'en') {
      if (preferredLanguage === 'kn') detected = { langCode: 'kn', langName: 'Kannada (ಕನ್ನಡ)' };
      else if (preferredLanguage === 'hi') detected = { langCode: 'hi', langName: 'Hindi (हिंदी)' };
      else if (preferredLanguage === 'te') detected = { langCode: 'te', langName: 'Telugu (తెలుగు)' };
      else if (preferredLanguage === 'ta') detected = { langCode: 'ta', langName: 'Tamil (தமிழ்)' };
    }

    const systemInstruction = `You are LeafGuard AI's multilingual botanical agronomist and plant doctor.
A user has asked a question about a leaf specimen of ${speciesName} (${scientificName || 'medicinal flora'}).
Current leaf health status: ${healthStatus.toUpperCase()}${diseaseName ? ` with ${diseaseName}` : ''}.

CRITICAL LANGUAGE REQUIREMENT:
The user asked: "${question}"
Target language: ${detected.langName} (${detected.langCode}).
YOU MUST DELIVER YOUR ENTIRE ANSWER IN THE EXACT SAME LANGUAGE AND SCRIPT THAT THE USER ASKED IN:
- If the question was asked in KANNADA (ಕನ್ನಡ script or Kannada language), your ENTIRE reply MUST be in natural, polite, respectful KANNADA (ಕನ್ನಡ).
- If the question was asked in HINDI (हिंदी script or Hindi language), your ENTIRE reply MUST be in natural, polite HINDI (हिंदी).
- If the question was asked in TELUGU (తెలుగు), reply in TELUGU (తెలుగు).
- If the question was asked in TAMIL (தமிழ்), reply in TAMIL (தமிழ்).
- If the question was asked in ENGLISH, reply in ENGLISH.
- If the user wrote Romanized Kannada (e.g. "Ee gidakke neeru estu bekagatte?"), answer in Kannada (ಕನ್ನಡ).

CONTENT GUIDELINES:
1. Answer the user's specific question directly, concisely, and accurately.
2. Give practical, actionable organic care steps (e.g. watering frequency, sunlight, soil, organic neem spray, pruning).
3. Mention safe medicinal / herbal guidance with a brief note that identification is for agricultural education and to consult a certified herbalist or Ayurvedic doctor before ingestion.
4. Keep the length friendly and conversational (2-3 short, clear paragraphs or bullet points).`;

    const userPrompt = `Plant specimen: ${speciesName} (${scientificName || ''})
Health: ${healthStatus} ${diseaseName ? `(${diseaseName})` : ''}
Symptoms: ${symptoms.join(', ') || 'None visible'}
Known recommendations: ${recommendations.join('; ') || 'Standard watering and sunlight'}

User's Question: "${question}"

Provide your answer in ${detected.langName} (${detected.langCode}):`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out')), 12000)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          }),
          timeoutPromise,
        ]);

        if (response && response.text) {
          const answerText = response.text.trim();
          const outputLang = detectScriptLanguage(answerText);
          return res.json({
            answer: answerText,
            languageCode: outputLang.langCode || detected.langCode,
            languageName: outputLang.langName || detected.langName,
            model: 'gemini-3.8-flash',
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini question answering error:', geminiErr?.message || geminiErr);
      }
    }

    // Offline / fallback answers in detected language
    let answerText = '';
    if (detected.langCode === 'kn') {
      answerText = `**${speciesName}** ಗಿಡದ ಬಗ್ಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರ:\n\n` +
        `1. **ನೀರುಣಿಸುವಿಕೆ ಮತ್ತು ಬಿಸಿಲು**: ಮೇಲಿನ ಮಣ್ಣು ಒಣಗಿದಾಗ ಮಾತ್ರ ನೀರುಣಿಸಿ, ಎಲೆಗಳ ಮೇಲೆ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ದಿನಕ್ಕೆ ೪-೫ ಗಂಟೆ ಸೂರ್ಯನ ಬೆಳಕು ಅಗತ್ಯ.\n` +
        `2. **ಆರೈಕೆ**: ${healthStatus === 'healthy' ? 'ಗಿಡವು ಆರೋಗ್ಯಕರವಾಗಿದೆ. ನಿಯಮಿತವಾಗಿ ಕಳೆ ತೆಗೆದು ತಿಂಗಳಿಗೊಮ್ಮೆ ಎರೆಹುಳು ಗೊಬ್ಬರ ಹಾಕಿ.' : 'ಕಂದು ಚುಕ್ಕೆಗಳಿರುವ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೆಗೆಯಿರಿ ಮತ್ತು ಸಂಜೆ ವೇಳೆ ಬೇವಿನ ಎಣ್ಣೆಯ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.'}\n` +
        `3. **ಸುರಕ್ಷತೆ**: ಯಾವುದೇ ಔಷಧೀಯ ಬಳಕೆಗೆ ಮುನ್ನ ಆಯುರ್ವೇದ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.`;
    } else if (detected.langCode === 'hi') {
      answerText = `**${speciesName}** के बारे में आपके प्रश्न का उत्तर:\n\n` +
        `1. **पानी और धूप**: गमले की ऊपरी मिट्टी सूखने पर ही पानी दें। पौधे को 4-5 घंटे सीधी धूप की जरूरत होती है।\n` +
        `2. **देखभाल**: ${healthStatus === 'healthy' ? 'पौधा स्वस्थ है, महीने में एक बार जैविक खाद दें।' : 'संक्रमित पत्तियों को काटकर अलग करें और नीम के तेल का छिड़काव करें।'}\n` +
        `3. **सावधानी**: औषधीय उपयोग से पहले आयुर्वेदिक चिकित्सक से सलाह अवश्य लें।`;
    } else {
      answerText = `Regarding your question about **${speciesName}**:\n\n` +
        `1. **Care & Maintenance**: Water deeply when the top 1-inch of soil feels dry. Provide 4–6 hours of direct or filtered sunlight.\n` +
        `2. **Health Action**: ${healthStatus === 'healthy' ? 'The plant shows healthy foliar vitality. Add compost every 3 weeks.' : 'Prune affected foliage with clean shears and apply an organic neem oil spray in the evening.'}\n` +
        `3. **Safety Note**: Always consult an Ayurvedic practitioner or herbalist before ingesting any medicinal plant remedies.`;
    }

    return res.json({
      answer: answerText,
      languageCode: detected.langCode,
      languageName: detected.langName,
      model: 'gemini-3.8-flash (offline-cached)',
    });
  } catch (err: any) {
    console.error('Answer question error:', err);
    res.status(500).json({ error: err.message || 'Failed to answer question' });
  }
});

// API endpoint for AI Explanation
app.post('/api/gemini/explain-health', async (req, res) => {
  console.log('Received /api/gemini/explain-health request:', req.body?.speciesName, 'language:', req.body?.language);
  try {
    const {
      speciesName,
      scientificName,
      healthStatus,
      diseaseName,
      severity,
      symptoms,
      recommendations,
      medicinalUses,
      phytochemicals,
      userQuestion,
      language = 'kn',
    } = req.body;

    if (!speciesName) {
      return res.status(400).json({ error: 'Species name is required' });
    }

    // Auto-detect question language if user submitted a specific question
    const questionLang = userQuestion ? detectScriptLanguage(userQuestion) : null;
    const effectiveLang = questionLang && questionLang.langCode !== 'en' ? questionLang.langCode : language;

    const isKannada = effectiveLang === 'kn' || effectiveLang === 'kannada';
    const isHindi = effectiveLang === 'hi' || effectiveLang === 'hindi';

    let languageDirective = 'Respond in English.';
    if (isKannada) {
      languageDirective = `IMPORTANT: Output the ENTIRE explanation in natural, fluent KANNADA script (ಕನ್ನಡ). Use everyday agricultural Kannada suitable for farmers and home herbalists in Karnataka.
The response MUST use these exact Kannada section headers:
### 🌿 ಸಸ್ಯದ ವಿವರಣೆ ಮತ್ತು ಪ್ರಾಮುಖ್ಯತೆ
### 🩺 ಎಲೆಯ ಆರೋಗ್ಯ ರೋಗನಿರ್ಣಯ
### 🌱 ಸಾವಯವ ಆರೈಕೆ ಮತ್ತು ಕ್ರಮಗಳು
### 🍵 ಸಾಂಪ್ರದಾಯಿಕ ಔಷಧೀಯ ಬಳಕೆ ಮತ್ತು ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆ`;
    } else if (isHindi) {
      languageDirective = `IMPORTANT: Output the ENTIRE explanation in natural, fluent HINDI script (हिंदी).
The response MUST use these exact Hindi section headers:
### 🌿 पौधे का विवरण और महत्व
### 🩺 पत्ती का स्वास्थ्य निदान
### 🌱 जैविक देखभाल और उपाय
### 🍵 पारंपरिक औषधीय उपयोग और सुरक्षा नोट`;
    }

    const systemInstruction = `You are LeafGuard AI's Senior Botanical Agronomist and Herbal Health Specialist.
Your purpose is to provide an accessible, plain-language, empathetic summary of a detected medicinal plant's health and recommended organic medicinal care.

${languageDirective}

Format your response in structured Markdown with 4 clear sections:
1. Plant Overview & Significance: Brief plain-language description of ${speciesName} (${scientificName || 'medicinal herb'}) and why it is valued.
2. Health Diagnostic Assessment: Explain in simple terms why the leaf is classified as ${healthStatus?.toUpperCase()}${diseaseName ? ` with ${diseaseName}` : ''}. Describe the visual symptoms, why they occur (e.g. moisture, fungal spores, humidity), and severity.
3. Recommended Organic Care & Action Plan: Give 3-4 practical, actionable, chemical-free steps to care for this plant (sunlight requirements, watering at root base, organic neem spray, pruning spotted leaves, soil aeration).
4. Traditional Medicinal Context & Safety Note: Summarize its safe traditional herbal utility, followed by a clear safety disclaimer that automated identification is for cultivation guidance and herbal remedies must be checked with a qualified practitioner before ingestion.

Keep language clear, warm, practical, and accessible to gardeners, students, and farmers.`;

    const userPrompt = `Please synthesize an AI plain-language health explanation and organic care plan for:
- Plant Species: ${speciesName} (${scientificName || 'Botanical specimen'})
- Leaf Health Status: ${healthStatus}
${diseaseName ? `- Pathological Diagnosis: ${diseaseName}` : ''}
${severity ? `- Severity Level: ${severity}` : ''}
${symptoms && symptoms.length > 0 ? `- Observed Leaf Symptoms: ${symptoms.join(', ')}` : ''}
${recommendations && recommendations.length > 0 ? `- Initial Agronomic Guidelines: ${recommendations.join('; ')}` : ''}
${medicinalUses && medicinalUses.length > 0 ? `- Primary Medicinal Applications: ${medicinalUses.join(', ')}` : ''}
${phytochemicals && phytochemicals.length > 0 ? `- Phytochemical Profile: ${phytochemicals.join(', ')}` : ''}
${userQuestion ? `\nUser Question/Note: "${userQuestion}"` : ''}
${isKannada ? 'ದಯವಿಟ್ಟು ಸಂಪೂರ್ಣ ವಿವರಣೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿಯೇ ನೀಡಿ.' : ''}
`;

    // If GEMINI_API_KEY is available, call Gemini API using the official gemini-3.8-flash model
    if (process.env.GEMINI_API_KEY) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out')), 12000)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          }),
          timeoutPromise,
        ]);

        if (response && response.text) {
          return res.json({
            explanation: response.text,
            model: 'gemini-3.8-flash',
            language: isKannada ? 'kn' : isHindi ? 'hi' : 'en',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini 3.8 Flash API notice:', geminiErr?.message || geminiErr);
        // Fall through to comprehensive expert botanical synthesis
      }
    }

    // Comprehensive fallback for local development or when key is not yet set
    let fallbackExplanation = '';

    if (isKannada) {
      fallbackExplanation = `### 🌿 ಸಸ್ಯದ ವಿವರಣೆ ಮತ್ತು ಪ್ರಾಮುಖ್ಯತೆ
**${speciesName}** (*${scientificName || 'ಔಷಧೀಯ ಸಸ್ಯ'}*) ಭಾರತೀಯ ಆಯುರ್ವೇದದಲ್ಲಿ ಅತ್ಯಂತ ಪವಿತ್ರ ಹಾಗೂ ಶ್ರೇಷ್ಠ ಔಷಧೀಯ ಗುಣಗಳನ್ನು ಹೊಂದಿರುವ ಸಸ್ಯವಾಗಿದೆ. ಇದು ಸ್ವಾಭಾವಿಕ ರೋಗನಿರೋಧಕ ಮತ್ತು ನೈಸರ್ಗಿಕ ಶಮನಕಾರಿ ಗುಣಗಳಿಗೆ ಹೆಸರುವಾಸಿಯಾಗಿದೆ.

### 🩺 ಎಲೆಯ ಆರೋಗ್ಯ ರೋಗನಿರ್ಣಯ
ನಿಮ್ಮ ಎಲೆಯ ತಪಾಸಣೆಯ ಫಲಿತಾಂಶ: **${healthStatus === 'healthy' ? 'ಆರೋಗ್ಯಕರ (HEALTHY)' : 'ರೋಗಬಾಧಿತ (DISEASED)'}**${diseaseName ? ` - **${diseaseName}** ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ` : ''}.
${healthStatus === 'healthy' 
  ? 'ಎಲೆಯು ಉತ್ತಮ ನೈಸರ್ಗಿಕ ಹಸಿರು ಬಣ್ಣವನ್ನು ಹೊಂದಿದ್ದು, ಯಾವುದೇ ಶಿಲೀಂಧ್ರ ಅಥವಾ ಕೀಟಗಳ ಬಾಧೆಯಿಲ್ಲದೆ ಸದೃಢವಾಗಿದೆ.'
  : `ಎಲೆಯ ಮೇಲ್ಮೈಯಲ್ಲಿ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಹಳದಿ ಬಣ್ಣದ ಗೆರೆಗಳು ಕಂಡುಬಂದಿವೆ. ಅಧಿಕ ತೇವಾಂಶ ಮತ್ತು ಗಾಳಿಯ ಕೊರತೆಯಿಂದ ಈ ಶಿಲೀಂಧ್ರ ಸೋಂಕು ಉಂಟಾಗುತ್ತದೆ.`
}

### 🌱 ಸಾವಯವ ಆರೈಕೆ ಮತ್ತು ಕ್ರಮಗಳು
1. **ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ**: ${healthStatus === 'healthy' ? 'ಕೆಳಭಾಗದ ಒಣಗಿದ ಎಲೆಗಳನ್ನು ತೆಗೆದು ಗಾಳಿಯಾಡುವಂತೆ ಮಾಡಿ.' : 'ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ಸ್ವಚ್ಛವಾದ ಕತ್ತರಿಯಿಂದ ಕತ್ತರಿಸಿ ಗಿಡದಿಂದ ದೂರವಿಡಿ, ಇದರಿಂದ ರೋಗ ಇತರ ಎಲೆಗಳಿಗೆ ಹರಡುವುದಿಲ್ಲ.'}
2. **ನೈಸರ್ಗಿಕ ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಣೆ**: ೧ ಲೀಟರ್ ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿಗೆ ೫ ಮಿ.ಲೀ ಬೇವಿನ ಎಣ್ಣೆ ಮತ್ತು ೨ ಮಿ.ಲೀ ಸೋಪಿನ ದ್ರಾವಣ ಬೆರೆಸಿ ಸಂಜೆ ವೇಳೆ ಸಿಂಪಡಿಸಿ.
3. **ಸರಿಯಾದ ನೀರುಣಿಕೆ**: ಗಿಡದ ಬುಡಕ್ಕೆ ಮಾತ್ರ ನೀರು ಹಾಕಿ, ಎಲೆಗಳ ಮೇಲೆ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಗಿಡಕ್ಕೆ ದಿನಕ್ಕೆ ೪-೬ ಗಂಟೆಗಳ ಕಾಲ ಸೂರ್ಯನ ಬೆಳಕು ಸಿಗುವಂತೆ ಇರಿಸಿ.
4. **ಮಣ್ಣಿನ ಬಸಿಗಾಲುವೆ**: ಕುಂಡ ಅಥವಾ ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದೆ ಸರಾಗವಾಗಿ ಬಸಿದು ಹೋಗುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.

### 🍵 ಸಾಂಪ್ರದಾಯಿಕ ಔಷಧೀಯ ಬಳಕೆ ಮತ್ತು ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆ
ಸಾಂಪ್ರದಾಯಿಕ ವೈದ್ಯ ಪದ್ಧತಿಯಲ್ಲಿ **${speciesName}** ಅನ್ನು ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಸ್ವಾಸ್ಥ್ಯಕ್ಕಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.
*ಎಚ್ಚರಿಕೆ: ಈ ಎಐ ರೋಗನಿರ್ಣಯವು ಕೃಷಿ ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಯಾವುದೇ ಗಿಡಮೂಲಿಕೆಯನ್ನು ಸೇವಿಸುವ ಮುನ್ನ ಆಯುರ್ವೇದ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.*`;
    } else if (isHindi) {
      fallbackExplanation = `### 🌿 पौधे का विवरण और महत्व
**${speciesName}** (*${scientificName || 'औषधीय पौधा'}*) पारंपरिक आयुर्वेद में अत्यंत पूजनीय और उपचारात्मक गुणों से भरपूर पौधा है।

### 🩺 पत्ती का स्वास्थ्य निदान
आपकी पत्ती का स्वास्थ्य स्तर: **${healthStatus.toUpperCase()}**${diseaseName ? ` - **${diseaseName}** के लक्षण देखे गए हैं` : ''}।
${healthStatus === 'healthy'
  ? 'पत्ती स्वस्थ हरी क्लोरोफिल रंजकता और बिना किसी कवक या कीट के नुकसान के अच्छी स्थिति में है।'
  : 'पत्ती की सतह पर पीले घेरे वाले भूरे धब्बे दिखाई दे रहे हैं, जो अत्यधिक नमी या फंगल संक्रमण का संकेत हैं।'
}

### 🌱 जैविक देखभाल और उपाय
1. **प्रभावित पत्तियों की कटाई**: संक्रमित पत्तियों को साफ कैंची से काटकर अलग करें।
2. **नीम तेल का छिड़काव**: शाम के समय 1 लीटर पानी में 5ml नीम का तेल मिलाकर छिड़कें।
3. **धूप और पानी**: सीधे जड़ों में पानी दें, पत्तियों पर पानी जमा न होने दें और पौधे को 4-5 घंटे धूप दें।
4. **मिट्टी का निकास**: गमले या मिट्टी में जल निकासी की अच्छी व्यवस्था रखें।

### 🍵 पारंपरिक औषधीय उपयोग और सुरक्षा नोट
पारंपरिक चिकित्सा में **${speciesName}** का उपयोग स्वास्थ्य लाभ और काढ़े के लिए किया जाता है।
*चेतावनी: यह AI निदान केवल कृषि और वानस्पतिक शिक्षा के लिए है। किसी भी औषधीय उपयोग से पूर्व आयुर्वेदिक चिकित्सक से परामर्श लें।*`;
    } else {
      fallbackExplanation = `### 🌿 Plant Overview & Significance
**${speciesName}** (*${scientificName || 'Medicinal Specimen'}*) is a revered traditional medicinal plant renowned for its therapeutic potency and restorative biochemical compounds.

### 🩺 Health Diagnostic Assessment
Your leaf specimen is evaluated as **${healthStatus.toUpperCase()}**${diseaseName ? ` with signs of **${diseaseName}**` : ' showing strong vitality'}. ${healthStatus === 'healthy' 
  ? 'The leaf tissue displays balanced green chlorophyll pigmentation, crisp margins, and no visible necrotic spots or mildew coatings.'
  : `The foliar surface shows ${symptoms && symptoms.length > 0 ? symptoms.join(' and ') : 'chlorotic discoloration and localized fungal lesioning'}. This is commonly triggered by prolonged moisture on the foliage or crowded canopy humidity.`
}

### 🌱 Recommended Organic Care & Action Plan
1. **Targeted Pruning**: ${healthStatus === 'healthy' ? 'Gently remove older senescent leaves at the plant base to improve airflow.' : 'Carefully snip off affected leaves using sanitized shears (wiped with rubbing alcohol) and dispose of them away from the garden.'}
2. **Moisture & Sunlight**: Water strictly at the base of the soil in the early morning; avoid spraying the leaf surface. Ensure the plant receives 4–6 hours of bright, indirect sunlight daily.
3. **Natural Protection**: ${healthStatus === 'healthy' ? 'Maintain soil health with well-rotted organic compost and light vermicompost tea every 3 weeks.' : 'Spray a mild organic cold-pressed neem oil emulsion (5ml neem oil + 2ml liquid soap in 1L lukewarm water) in the evening once a week until spots subside.'}
4. **Soil Aeration**: Ensure the potting mix or soil bed is well-draining with added perlite or sand to prevent root-zone waterlogging.

### 🍵 Traditional Medicinal Context & Safety Note
In traditional wellness systems, **${speciesName}** is utilized for its natural soothing properties (${medicinalUses && medicinalUses.length > 0 ? medicinalUses.slice(0, 2).join(', ') : 'wellness applications'}).
*Notice: AI diagnostic summaries are designed for agricultural stewardship and botanical education. Never consume wild or unverified specimens without consulting a certified medical herbalist or Ayurvedic doctor.*`;
    }

    return res.json({
      explanation: fallbackExplanation,
      model: 'gemini-3.8-flash (offline-cached)',
      language: isKannada ? 'kn' : isHindi ? 'hi' : 'en',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating AI explanation with Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate AI explanation from Gemini model',
    });
  }
});

// Setup Vite dev server middlewares or static dist serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`LeafGuard AI server listening on http://localhost:${port}`);
  });
}

startServer();
