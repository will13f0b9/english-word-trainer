import React, { useState } from 'react';
import { saveWord } from '../services/wordService';
import { Word } from '../models/Word';

interface WordFormProps {
  onWordAdded: () => void;
}

const WordForm: React.FC<WordFormProps> = ({ onWordAdded }) => {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;

    setIsSubmitting(true);

    const newWord: Word = {
      id: Date.now().toString(),
      term: term.trim(),
      definition: definition.trim(),
      createdAt: Date.now()
    };

    setTimeout(() => {
      const result = saveWord(newWord);

      if (result.success) {
        setTerm('');
        setDefinition('');
        onWordAdded();
        setMessage({ text: result.message, isError: false });
      } else {
        setMessage({ text: result.message, isError: true });
      }

      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }, 300);
  };

  return (
    <div className="card fade-in" style={{ padding: '1.25rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
        Add New Word
      </h2>

      {message && (
        <div className={`alert ${message.isError ? 'alert-danger' : 'alert-success'} fade-in`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.875rem' }}>
          <label className="form-label">Word or Phrase</label>
          <input
            type="text"
            className="form-control"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Ephemeral"
            required
            disabled={isSubmitting}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Definition / Translation</label>
          <textarea
            className="form-control"
            rows={2}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="e.g. Lasting for a very short time"
            required
            disabled={isSubmitting}
            style={{ resize: 'vertical' }}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving…
            </>
          ) : 'Save Word'}
        </button>
      </form>
    </div>
  );
};

export default WordForm;
