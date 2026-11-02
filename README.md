# SinhalaVoice Studio — Desktop Sinhala Text-to-Speech

Desktop-grade Sinhala text-to-speech studio powered by Google Gemini AI (`gemini-3.8-flash-lite-tts`), featuring natural voice presets, Singlish transliteration, virtual Sinhala keypad, and 24kHz studio WAV audio export.

---

## Running the Desktop Executable (.exe)

Your standalone Windows executable has been built and is ready to run:

- **Portable Executable**: `release/SinhalaVoice Studio 1.0.0.exe`  
  Double-click to run directly on any Windows 64-bit machine. No installation or Node.js required.
- **Unpacked Folder**: `release/win-unpacked/SinhalaVoice Studio.exe`  
  Ready for quick launching or pinning to your taskbar/Start menu.

---

## Configuring Your Gemini API Key

You can configure your Gemini API key in either of two ways:

1. **In-App Settings (Recommended)**:
   - Launch the app and click the **"Set API Key"** button in the top titlebar.
   - Enter your Gemini API key and click **"Test Key"** to verify connection, then click **"Save & Apply"**.
   - Your key is securely stored in your local application profile.

2. **Desktop `.env` File Fallback**:
   - Place a file named `.env` in the same directory as `SinhalaVoice Studio 1.0.0.exe` (or in the project root):
     ```env
     GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
     ```

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## Building from Source

### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` or `npm`

### Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Run in web development mode
pnpm run dev

# 3. Run in Electron desktop development mode
pnpm run electron:dev

# 4. Build Windows portable .exe
pnpm run dist:portable

# 5. Build Windows NSIS installer
pnpm run dist:nsis
```
