import React, { useState } from 'react';

type TextToSpeechProps = { text: string };

export default function TextToSpeech({ text }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = () => {
    if (!text) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: '0.625rem',
      padding: '0.625rem 1rem',
    }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flex: 1 }}>Text to Speech</span>
      <button
        onClick={speak}
        disabled={isPlaying}
        title="Play pronunciation"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--success)', border: 'none',
          color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: isPlaying ? 0.5 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        ▶
      </button>
      <button
        onClick={stop}
        title="Stop"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        ■
      </button>
    </div>
  );
}
