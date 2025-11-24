import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const MODELS = {
  '1': { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)' },
  '2': { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro (Preview)' },
  '3': { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash (Preview)' },
  '4': { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  '5': { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
  '6': { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  '7': { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
};

app.get('/api/models', (req, res) => {
  res.json(MODELS);
});

app.post('/api/chat', async (req, res) => {
  const { model, messages } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: messages,
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3030;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
