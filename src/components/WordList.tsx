import React, { useState, useEffect, useRef } from 'react';
import { deleteWord, searchWords, exportWordsToJSON, importWordsFromJSON } from '../services/wordService';
import { Word } from '../models/Word';

interface WordListProps {
  words: Word[];
  onWordDeleted: () => void;
}

const WordList: React.FC<WordListProps> = ({ words, onWordDeleted }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>(words);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWords(words);
    } else {
      setFilteredWords(
        words.filter(word =>
          word.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.definition.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, words]);

  const handleDelete = (id: string) => {
    setDeletingId(id);

    // Add a small delay for better UX
    setTimeout(() => {
      deleteWord(id);
      onWordDeleted();
      setDeletingId(null);
    }, 300);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    exportWordsToJSON();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const result = await importWordsFromJSON(file);

    setMessage({
      text: result.message,
      isError: !result.success
    });

    if (result.success) {
      onWordDeleted();
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const renderContent = () => {
    if (words.length === 0) {
      return (
        <div className="text-center p-8 fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
          >
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">Your vocabulary list is empty</p>
          <p className="text-gray-400">Start by adding some words to learn</p>
        </div>
      );
    }

    if (filteredWords.length === 0) {
      return (
        <div className="text-center p-8 fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
          >
            <path d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">No words match your search</p>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      );
    }

    return (
      <div className="card fade-in">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Word/Phrase</th>
                <th style={{ width: '50%' }}>Definition</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map(word => (
                <tr key={word.id}>
                  <td className="font-medium">{word.term}</td>
                  <td>{word.definition}</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(word.id)}
                      style={{ backgroundColor: 'transparent', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', transition: 'background-color 0.3s ease', width: '45px'}}
                      className="text-danger bg-transparent border-0 p-2 rounded-full hover:bg-danger/10 transition-colors"
                      disabled={deletingId === word.id}
                    >
                      {deletingId === word.id ? (
                        <svg
                          className="animate-spin h-5 w-5"
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
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 mr-2 text-primary"
          >
            <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
            <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
            <path d="M12 7.875a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
          </svg>
          <h2 className="text-xl font-bold">My Word List</h2>
          <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            {words.length} {words.length === 1 ? 'word' : 'words'}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            className="form-control pl-10"
            placeholder="Search words..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {message && (
        <div className={`alert ${message.isError ? 'alert-danger' : 'alert-success'} fade-in`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {/* <button
          onClick={handleExport}
          className="btn btn-dark"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-5 h-5 mr-1"
          >
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Export Words
        </button> */}

        <div className="p-6 hover:shadow-md">
          <button
            onClick={handleExport}
            className="btn btn-dark"
          >
            Export Words
          </button>
        </div>

        <div className="p-6 hover:shadow-md">
          <button
            onClick={handleImportClick}
            className="btn btn-dark"
          >
            Import Words
          </button>
        </div>

        {/* <button
          onClick={handleImportClick}
          className="btn btn-dark"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-1"
          >
            <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11c0 .332.22.627.543.72a7.506 7.506 0 012.454.338A7.465 7.465 0 009.25 16.82V4.065z" />
          </svg>
          Import Words
        </button> */}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>

      {renderContent()}
    </div>
  );
};

export default WordList; 