# AI insights

Hybrid: deterministic rules + optional LLM summarize.

- `GET /ai/insights`, `POST /ai/insights/refresh` (low-stock rules)
- `POST /ai/insights/:id/dismiss`
- `GET /ai/capabilities`
- `POST /ai/summarize` requires `AI_LLM_API_KEY` (+ optional `AI_LLM_BASE_URL`, `AI_LLM_MODEL`); otherwise **503**
- Critical insights can fan out via notifications
- UI: `/ai`
