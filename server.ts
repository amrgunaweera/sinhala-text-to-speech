import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Working directory for static assets
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// 1. Resolve .env from multiple search locations (current dir, next to .exe, or AppData)
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
  ];

  if (process.execPath) {
    const exeDir = path.dirname(process.execPath);
    possiblePaths.push(path.resolve(exeDir, '.env'));
    possiblePaths.push(path.resolve(exeDir, '.env.local'));
  }

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }
}
loadEnv();

// User data config file for in-app saved settings
function getUserConfigPath(): string {
  const appData =
    process.env.APPDATA ||
    (process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Preferences')
      : path.join(os.homedir(), '.config'));
  const configDir = path.join(appData, 'SinhalaVoiceStudio');
  if (!fs.existsSync(configDir)) {
    try {
      fs.mkdirSync(configDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(configDir, 'settings.json');
}

let inMemoryApiKey: string | null = null;

function loadSavedApiKey(): string | null {
  try {
    const configPath = getUserConfigPath();
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (data && typeof data.apiKey === 'string') {
        return data.apiKey.trim();
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveCustomApiKey(key: string) {
  inMemoryApiKey = key.trim() || null;
  try {
    const configPath = getUserConfigPath();
    fs.writeFileSync(
      configPath,
      JSON.stringify({ apiKey: inMemoryApiKey, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('Failed to persist user settings:', err);
  }
}

inMemoryApiKey = loadSavedApiKey();

export function getActiveApiKey(customKey?: string | null): string | null {
  if (customKey && customKey.trim()) return customKey.trim();
  if (inMemoryApiKey && inMemoryApiKey.trim()) return inMemoryApiKey.trim();
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  return null;
}

export function getApiKeySource(): 'header' | 'in-app' | 'env' | 'none' {
  if (inMemoryApiKey && inMemoryApiKey.trim()) return 'in-app';
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) return 'env';
  return 'none';
}

export function getMaskedApiKey(key?: string | null): string {
  const active = key || getActiveApiKey();
  if (!active) return '';
  if (active.length <= 8) return '****';
  return `${active.substring(0, 4)}...${active.substring(active.length - 4)}`;
}

export function createGenAIClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'sinhala-voice-studio-desktop',
      },
    },
  });
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Settings APIs
  app.get('/api/settings/status', (_req, res) => {
    const activeKey = getActiveApiKey();
    res.json({
      hasApiKey: !!activeKey,
      source: getApiKeySource(),
      maskedKey: getMaskedApiKey(activeKey),
    });
  });

  app.post('/api/settings/save', (req, res) => {
    const { apiKey } = req.body;
    saveCustomApiKey(typeof apiKey === 'string' ? apiKey : '');
    res.json({
      success: true,
      hasApiKey: !!getActiveApiKey(),
      source: getApiKeySource(),
      maskedKey: getMaskedApiKey(),
    });
  });

  app.post('/api/settings/test', async (req, res) => {
    try {
      const customKey =
        (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey || null;
      const apiKey = getActiveApiKey(customKey);

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'No Gemini API key provided to test.',
        });
      }

      const client = createGenAIClient(apiKey);
      // Quick test with gemini-2.5-flash or gemini-3.8-flash
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Reply with the word "OK"',
      });

      if (response && response.text) {
        return res.json({ success: true, message: 'API key is valid and connected!' });
      }
      res.json({ success: true, message: 'Connected successfully.' });
    } catch (err: any) {
      console.error('API key test error:', err);
      res.status(400).json({
        success: false,
        error: err?.message || 'Authentication failed. Please check your Gemini API key.',
      });
    }
  });

  // TTS Generation API
  app.post('/api/tts/generate', async (req, res) => {
    try {
      const { text, voiceName = 'Kore', style = '' } = req.body;
      const customKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
      const apiKey = getActiveApiKey(customKey);

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text prompt is required.' });
      }

      if (!apiKey) {
        return res.status(401).json({
          error:
            'Gemini API key is missing. Please click "Set API Key" in the top bar or provide GEMINI_API_KEY.',
        });
      }

      const ai = createGenAIClient(apiKey);
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

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
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
      const customKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
      const apiKey = getActiveApiKey(customKey);

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required.' });
      }

      if (!apiKey) {
        return res.status(401).json({
          error:
            'Gemini API key is missing. Please configure your key in Settings or in a .env file.',
        });
      }

      const ai = createGenAIClient(apiKey);
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

  return app;
}

export async function startServer(port = Number(process.env.PORT) || 3000) {
  const app = createApp();

  if (process.env.NODE_ENV !== 'production' && !process.env.ELECTRON_PROD) {
    const viteModule = 'vite';
    const { createServer } = await import(/* @vite-ignore */ viteModule);
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production or Electron app, look for dist
    const candidates = [
      path.resolve(currentDir, '../dist'),
      path.resolve(currentDir, 'dist'),
      path.resolve(process.cwd(), 'dist'),
    ];
    let distPath = candidates.find((c) => fs.existsSync(c)) || candidates[0];

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return new Promise<{ server: any; port: number }>((resolve, reject) => {
    const server = app.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      console.log(`Sinhala Voice Studio server listening on http://127.0.0.1:${actualPort}`);
      resolve({ server, port: actualPort });
    });
    server.on('error', reject);
  });
}

// Auto start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}