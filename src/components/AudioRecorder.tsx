import React, { useState, useRef } from 'react';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlay = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex items-center bg-neutral-900 text-white px-5 py-4 rounded-2xl shadow-lg w-[320px]">
      <div className="flex items-center gap-3">
        <button
          onClick={handleRecord}
          className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-red-700 hover:bg-red-800'} transition p-3 rounded-full`}
          style={{ width: '30px', marginRight: '5px' }}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? '■' : '●'}
        </button>

        {audioUrl && (
          <button
            onClick={handlePlay}
            className="bg-green-500 hover:bg-green-600 transition p-3 rounded-full"
            style={{ width: '30px' }}
            title={isPlaying ? 'Pause' : 'Play recording'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        )}
      </div>
    </div>
  );
}
