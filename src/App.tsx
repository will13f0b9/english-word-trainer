import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WordForm from './components/WordForm';
import WordList from './components/WordList';
import Quiz from './components/Quiz';
import { getWords } from './services/wordService';
import { Word } from './models/Word';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'words' | 'quiz'>('home');
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    setWords(getWords());
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="container fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Welcome to English Word Trainer</h2>
              <p className="mb-4">
                This app helps you memorize English words by creating your personal vocabulary list
                and testing your knowledge with quizzes.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card p-6 hover:shadow-md">
                <h3 className="text-xl mb-3">Add Words</h3>
                <p className="mb-4">
                  Build your vocabulary by adding words you want to learn.
                </p>
                <button 
                  onClick={() => setCurrentPage('words')}
                  className="btn btn-primary"
                >
                  My Word List
                </button>
              </div>
              <div className="card p-6 hover:shadow-md">
                <h3 className="text-xl mb-3">Test Your Knowledge</h3>
                <p className="mb-4">
                  Take quizzes to practice and reinforce your memory.
                </p>
                <button 
                  onClick={() => setCurrentPage('quiz')}
                  className="btn btn-success"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        );
      case 'words':
        return (
          <div className="container fade-in">
            <WordForm onWordAdded={loadWords} />
            <div className="mt-4">
              <WordList words={words} onWordDeleted={loadWords} />
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="container fade-in">
            <Quiz words={words} />
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header setCurrentPage={setCurrentPage} />
      <main className="py-8">
        {renderPage()}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>English Word Trainer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App; 