# Gemini AI Chat

A CLI chat application using Google's Gemini API with model switching support.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set your API key:
```bash
cp .env.example .env
# Edit .env and add your Google API key
```

Get your API key from: https://aistudio.google.com/apikey

## Usage

```bash
npm start
```

### Commands

- `/models` - Show available models
- `/switch <n>` - Switch to model number n
- `/clear` - Clear chat history
- `/stream` - Toggle streaming mode
- `/help` - Show help
- `/exit` - Exit

### Available Models

1. Gemini 2.0 Flash
2. Gemini 2.0 Flash Lite
3. Gemini 1.5 Pro
4. Gemini 1.5 Flash
5. Gemini 2.5 Pro (Preview)
6. Gemini 2.5 Flash (Preview)
