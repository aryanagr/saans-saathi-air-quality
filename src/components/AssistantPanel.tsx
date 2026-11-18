import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { askAssistant, getGuidedAnswer, type AssistantContext } from '../data/assistantClient';

const QUICK_QUESTIONS = [
  'Can my child play outside?',
  'When should I open the windows?',
  'What is the safest commute today?',
];

export function AssistantPanel({ context }: { context: AssistantContext }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState<'gemini' | 'guided' | null>(null);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const submit = async (value: string) => {
    const nextQuestion = value.trim();
    if (!nextQuestion || loading) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setQuestion(nextQuestion);
    setLoading(true);
    setAnswer('');
    try {
      const result = await askAssistant(nextQuestion, context, controller.signal);
      setAnswer(result.answer);
      setMode('gemini');
    } catch {
      if (controller.signal.aborted) return;
      setAnswer(getGuidedAnswer(nextQuestion, context));
      setMode('guided');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(question);
  };

  return (
    <section className="assistant-panel" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div className="assistant-mark"><MessageCircle aria-hidden="true" /></div>
        <div><p className="eyebrow"><Sparkles aria-hidden="true" /> Ask about today</p><h2 id="assistant-title">Talk to Saans Saathi</h2><p>Get a short answer grounded in your city, AQI and household profile.</p></div>
      </div>
      <div className="quick-questions" aria-label="Suggested questions">
        {QUICK_QUESTIONS.map((item) => <button type="button" key={item} disabled={loading} onClick={() => void submit(item)}>{item}</button>)}
      </div>
      <form className="assistant-form" onSubmit={onSubmit}>
        <label htmlFor="assistant-question">Your air-quality question</label>
        <div><input id="assistant-question" value={question} maxLength={500} onChange={(event) => setQuestion(event.target.value)} placeholder="For example: Is an evening walk safe?" /><button type="submit" disabled={loading || !question.trim()}><Send aria-hidden="true" />{loading ? 'Thinking…' : 'Ask'}</button></div>
      </form>
      <div className="assistant-answer" aria-live="polite" aria-busy={loading}>
        {loading ? <p>Checking your current context…</p> : answer ? <><p>{answer}</p><span>{mode === 'gemini' ? 'Gemini explanation • safety rules remain authoritative' : 'Guided safety answer • live AI unavailable'}</span></> : <p>Choose a suggested question or ask your own.</p>}
      </div>
    </section>
  );
}
