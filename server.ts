import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Init Google GenAI on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// TTS Generation API
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style = '' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your Settings > Secrets panel.',
      });
    }

    // Call Gemini 3.8 Flash Lite TTS
    // Unary output: complete WAV file (audio/wav, 24kHz mono 16-bit RIFF)
    const promptText = text.trim();
    const contents: any[] = [
      {
        role: 'user',
        parts: [
          {
            text: promptText,
            ...(style ? { speechMetadata: { style } } : {}),
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({
        error: 'No audio data was returned by the speech model.',
      });
    }

    res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating Sinhala audio:', error);
    res.status(500).json({
      error: error?.message || 'Failed to synthesize speech. Please try again.',
    });
  }
});

// AI Singlish to Sinhala transliteration & text enhancer
app.post('/api/tts/singlish-to-sinhala', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert Sinhala linguist and transliteration engine.
Convert the following romanized Singlish text into natural, accurate Sinhala script (Unicode).
Rules:
- Output ONLY the converted Sinhala text.
- Do NOT wrap in quotes, do not output explanations, markdown bolding, or headers.
- Maintain punctuation and formatting.
- If the text contains English technical terms, keep them phonetically natural in Sinhala or preserved as appropriate.

Text to convert:
${text.trim()}`,
    });

    const converted = response.text?.trim() || text;
    res.json({ convertedText: converted });
  } catch (error: any) {
    console.error('Transliteration error:', error);
    res.status(500).json({ error: error?.message || 'Failed to transliterate text.' });
  }
});

// Vite dev middleware or static serving
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sinhala Voice Studio desktop app server listening on http://0.0.0.0:${PORT}`);
});
