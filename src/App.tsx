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

  useEffect(() => { loadWords(); }, [currentPage]);

  const loadWords = () => setWords(getWords());

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="container fade-in">
            <div className="home-hero">
              <h2>English Word Trainer</h2>
              <p>Build your vocabulary and test yourself with quizzes.</p>
            </div>
            <div className="home-cards">
              <div className="home-card">
                <h3>My Words</h3>
                <p>Add words, view your list, and manage what you're learning.</p>
                <button onClick={() => setCurrentPage('words')} className="btn btn-primary">
                  Go to My Words
                </button>
              </div>
              <div className="home-card">
                <h3>Quiz</h3>
                <p>Test your knowledge with multiple-choice questions.</p>
                <button onClick={() => setCurrentPage('quiz')} className="btn btn-success">
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
            <div style={{ marginTop: '1rem' }}>
              <WordList words={words} onWordDeleted={loadWords} onWordUpdated={loadWords} />
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="container fade-in">
            <Quiz words={words.filter(w => !w.mastered)} onWordMastered={loadWords} />
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header setCurrentPage={setCurrentPage} />
      <main className="page-content">
        {renderPage()}
      </main>
      <footer className="app-footer">
        English Word Trainer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
