import React, { useState, useEffect, useRef } from 'react';
import { deleteWord, exportWordsToJSON, importWordsFromJSON, toggleWordMastery, toggleWordPriority } from '../services/wordService';
import { Word } from '../models/Word';

interface WordListProps {
  words: Word[];
  onWordDeleted: () => void;
  onWordUpdated: () => void;
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth={filled ? 0 : 1.5}
    width="20" height="20">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const FlameIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={active ? 0 : 1.5}
    width="20"
    height="20"
  >
    <path
      fillRule="evenodd"
      d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
      clipRule="evenodd"
    />
  </svg>
);

const QuizStats = ({ totalAttempts, totalCorrect }: { totalAttempts?: number; totalCorrect?: number }) => {
  const attempts = totalAttempts ?? 0;
  const correct = totalCorrect ?? 0;
  const accuracy = attempts > 0 ? correct / attempts : 0;

  let barColor = '#6b7280'; // grey for 0 attempts
  if (attempts > 0) {
    if (accuracy >= 0.7) barColor = '#34d399';       // green
    else if (accuracy >= 0.4) barColor = 'var(--warning)'; // yellow
    else barColor = '#f87171';                          // red
  }

  return (
    <div style={{ width: 100, flexShrink: 0 }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>
        {attempts} attempts
      </p>
      <div style={{
        height: 6,
        background: 'var(--border)',
        borderRadius: 9999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${accuracy * 100}%`,
          background: barColor,
          borderRadius: 9999,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

const WordList: React.FC<WordListProps> = ({ words, onWordDeleted, onWordUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>(words);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const byAttempts = (a: { totalAttempts?: number }, b: { totalAttempts?: number }) =>
      (b.totalAttempts ?? 0) - (a.totalAttempts ?? 0);

    if (searchQuery.trim() === '') {
      setFilteredWords([...words].sort(byAttempts));
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredWords(
        words
          .filter(w => w.term.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q))
          .sort(byAttempts)
      );
    }
  }, [searchQuery, words]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteWord(id);
      onWordDeleted();
      setDeletingId(null);
    }, 300);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const result = await importWordsFromJSON(files[0]);
    setMessage({ text: result.message, isError: !result.success });
    if (result.success) onWordDeleted();

    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setMessage(null), 5000);
  };

  const renderList = () => {
    if (words.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }} className="fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            width="48" height="48" style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }}>
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Your vocabulary list is empty</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Start by adding some words above</p>
        </div>
      );
    }

    if (filteredWords.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }} className="fade-in">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No words match your search</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try a different search term</p>
        </div>
      );
    }

    return (
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {filteredWords.map((word) => (
          <li
            key={word.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--border)',
              opacity: deletingId === word.id ? 0.4 : 1,
              transition: 'opacity 0.3s',
            }}
          >
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: word.mastered ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: word.mastered ? 'line-through' : 'none',
                marginBottom: '0.2rem',
                wordBreak: 'break-word',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}>
                {word.term}
                {word.priority && (
                  <span aria-hidden="true" style={{ color: 'var(--warning)', display: 'inline-flex', lineHeight: 1 }}>
                    <FlameIcon active={true} />
                  </span>
                )}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                wordBreak: 'break-word',
              }}>
                {word.definition}
              </p>
            </div>

            {/* Quiz stats */}
            <QuizStats totalAttempts={word.totalAttempts} totalCorrect={word.totalCorrect} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
              <button
                className="btn-icon"
                onClick={() => { toggleWordPriority(word.id); onWordUpdated(); }}
                title={word.priority ? 'Remove priority' : 'Mark as priority'}
                aria-label={word.priority ? 'Remove priority' : 'Mark as priority'}
                aria-pressed={word.priority ?? false}
                style={{ color: word.priority ? 'var(--warning)' : 'var(--text-muted)' }}
              >
                <FlameIcon active={word.priority ?? false} />
              </button>
              <button
                className="btn-icon"
                onClick={() => { toggleWordMastery(word.id); onWordUpdated(); }}
                title={word.mastered ? 'Un-master' : 'Mark as mastered'}
                style={{ color: word.mastered ? 'var(--warning)' : 'var(--text-muted)' }}
              >
                <StarIcon filled={word.mastered ?? false} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleDelete(word.id)}
                disabled={deletingId === word.id}
                title="Delete word"
                style={{ color: 'var(--danger)' }}
              >
                {deletingId === word.id ? <SpinnerIcon /> : <TrashIcon />}
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, flex: 1, color: 'var(--text)' }}>
          My Words
          <span style={{
            marginLeft: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--accent)',
            background: 'var(--accent-dim)',
            padding: '0.1rem 0.5rem',
            borderRadius: '9999px',
          }}>
            {words.length}
          </span>
        </h2>
        <button onClick={exportWordsToJSON} className="btn btn-secondary btn-sm">Export</button>
        <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm">Import</button>
        <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" style={{ display: 'none' }} />
      </div>

      {/* Search */}
      <input
        type="text"
        className="form-control"
        placeholder="Search words…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '0.75rem' }}
      />

      {message && (
        <div className={`alert ${message.isError ? 'alert-danger' : 'alert-success'} fade-in`}>
          {message.text}
        </div>
      )}

      <div className="card">
        {renderList()}
      </div>
    </div>
  );
};

export default WordList;
