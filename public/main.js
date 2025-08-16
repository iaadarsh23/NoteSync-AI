const notesEl = document.getElementById('notes');
const fileEl = document.getElementById('file');
const summarizeBtn = document.getElementById('summarize');
const output = document.getElementById('output');
const overviewEl = document.getElementById('summary-overview');
const actionsEl = document.getElementById('summary-actions');
const decisionsEl = document.getElementById('summary-decisions');
const topicsEl = document.getElementById('summary-topics');

fileEl.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  notesEl.value = text;
});

summarizeBtn.addEventListener('click', async () => {
  const text = notesEl.value.trim();
  if (!text) { alert('Please paste some notes or upload a file.'); return; }

  summarizeBtn.disabled = true;
  summarizeBtn.textContent = 'Summarizing…';

  try {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Request failed');

    const { summary } = data;
    renderSummary(summary);
  } catch (err) {
    console.error(err);
    alert('Failed to summarize. Check server logs.');
  } finally {
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = 'Summarize';
  }
});

function renderSummary(summary) {
  output.hidden = false;
  overviewEl.textContent = summary?.overview || '';

  renderList(actionsEl, summary?.actionItems || []);
  renderList(decisionsEl, summary?.decisions || []);
  renderList(topicsEl, summary?.topics || []);
}

function renderList(ul, items) {
  ul.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.textContent = '—';
    ul.appendChild(li);
    return;
  }
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  }
}
