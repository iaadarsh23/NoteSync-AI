# NoteSync-AI (Public)

A simple meeting notes summarizer with a minimal web UI and a Node.js backend. Paste or upload notes, get a concise summary. Ready for Groq LLM integration.

## Features
- Simple HTML/CSS/JS frontend
- Express backend with `/api/summarize`
- Works without any key (mock summary); add Groq for AI summaries
- Windows + PowerShell friendly

## Quick start (local)

1. Install Node 18+.
2. Clone this repo and open PowerShell.
3. Copy env file and (optionally) fill in Groq vars:

```pwsh
Copy-Item .env.example .env
# Edit .env to set GROQ_API_KEY and optionally GROQ_MODEL (default: llama-3.1-8b-instant)
```

4. Install deps and run:

```pwsh
npm install
npm start
```

5. Open http://localhost:3000

## Integrate Groq (optional)
- Set `GROQ_API_KEY` in `.env` (and `GROQ_MODEL` if desired).
- The server will automatically call Groq; if anything fails, it falls back to a mock.

Response shape used by the UI:

```json
{
  "summary": {
    "overview": "Short overview…",
    "actionItems": ["Item 1", "Item 2"],
    "decisions": ["Decision A"],
    "topics": ["Topic X", "Topic Y"]
  }
}
```

## Project structure
- `public/` static files (UI)
- `src/server.js` Express server
- `.env.example` env template
- `package.json` scripts/deps

## License
MIT
