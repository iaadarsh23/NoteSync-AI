import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Summarize endpoint (Groq integration if GROQ_API_KEY provided)
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Provide meeting notes text in `text` field.' });
    }

    const key = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    if (key) {
      try {
        const groq = new Groq({ apiKey: key });
        const prompt = `You are an assistant that extracts structured summaries from meeting notes.
Return strict JSON with keys: overview (2-4 sentences), actionItems (array of short strings, imperative), decisions (array), topics (array of short tags).
Input notes:\n\n${text}`;

        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You produce concise, structured summaries as valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 700
        });

        const raw = completion.choices?.[0]?.message?.content?.trim() || '';
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          // try to extract JSON if wrapped in text
          const match = raw.match(/\{[\s\S]*\}/);
          parsed = match ? JSON.parse(match[0]) : null;
        }
        if (!parsed) throw new Error('Groq returned non-JSON');

        return res.json({ summary: {
          overview: parsed.overview || '',
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
          topics: Array.isArray(parsed.topics) ? parsed.topics : []
        }});
      } catch (groqErr) {
        console.warn('Groq error, falling back to mock:', groqErr?.message || groqErr);
      }
    }

    // Fallback mock if no key or Groq failed
    const mockSummary = {
      overview: text.length > 160 ? text.slice(0, 160) + '…' : text,
      actionItems: [],
      decisions: [],
      topics: [],
    };
    res.json({ summary: mockSummary });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`NoteSync-AI server running at http://localhost:${port}`);
});
