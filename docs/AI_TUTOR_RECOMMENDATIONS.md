# AI Tutor Recommendations (Gemini)

## Enable Gemini

1. Open `src/config/gemini.ts`
2. Set `apiKey: 'YOUR_GEMINI_API_KEY'`
3. Reload the app

Without a key, the app still recommends tutors using local ranking and a friendly template explanation.

## Behaviour

- Reads student **interests** from profile/signup
- Searches tutors by subject (falls back to mock tutors if API empty)
- Scores by rating, reviews, sessions, success rate, experience, verification, availability
- Asks Gemini to pick + explain when configured
- First dashboard visit shows floating AI mascot + speech bubble (once per user/device via AsyncStorage)

## Key files

| File | Role |
|------|------|
| `src/config/gemini.ts` | API key + model |
| `src/services/ai/*` | Gemini client, scoring, recommendation |
| `src/hooks/api/useAiTutorRecommendation.ts` | UI hook |
| `src/components/AiAssistant/*` | Mascot + recommendation card |
