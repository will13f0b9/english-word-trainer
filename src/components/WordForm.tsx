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
    
    // Simulate slight delay for better UX
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
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }, 300);
  };

  return (
    <div className="card p-6 fade-in">
      <div className="flex items-center mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="mr-2 text-primary" 
          style={{ width: '1.25rem', height: '1.25rem' }}
        >
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
        <h2 className="text-xl font-bold">Add New Word</h2>
      </div>
      
      {message && (
        <div className={`alert ${message.isError ? 'alert-danger' : 'alert-success'} fade-in`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label">Word or Phrase</label>
          <input
            type="text"
            className="form-control"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Enter a word or phrase"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Definition/Translation</label>
          <textarea
            className="form-control"
            rows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Enter the definition or translation"
            required
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg 
                className="animate-spin mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : "Save Word"}
        </button>
      </form>
    </div>
  );
};

export default WordForm; 