import React, { useState, useRef } from 'react';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const handleRecord = () => { isRecording ? stopRecording() : startRecording(); };

  const handlePlay = () => {
    if (!audioUrl) return;
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); return; }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
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
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flex: 1 }}>Record yourself</span>

      <button
        onClick={handleRecord}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: isRecording ? 'var(--danger)' : '#7f1d1d',
          border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        {isRecording ? '■' : '●'}
      </button>

      {audioUrl && (
        <button
          onClick={handlePlay}
          title={isPlaying ? 'Pause' : 'Play recording'}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--success)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      )}
    </div>
  );
}
