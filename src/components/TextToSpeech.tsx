import React from "react";
import { useState } from "react";

type TextToSpeechProps = {
  text: string;
};

export default function TextToSpeech({ text }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = () => {
    if (!text) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center justify-between bg-neutral-900 text-white px-5 py-4 rounded-2xl shadow-lg w-[320px]">
      <div className="flex items-center gap-3">
        
        {/* Play */}
        <button
          onClick={speak}
          className="bg-green-500 hover:bg-green-600 transition p-3 rounded-full"
          style={{width: "30px", marginRight: "5px"}}
        >
          ▶
        </button>

        {/* Stop */}
        <button
          onClick={stop}
          className="bg-gray-700 hover:bg-gray-600 transition p-3 rounded-full"
          style={{width: "30px"}}
        >
          ■
        </button>

      </div>
    </div>
  );
}