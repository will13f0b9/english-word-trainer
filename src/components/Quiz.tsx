import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../models/Word';
import { toggleWordMastery, updateWordSM2, recordQuizAttempt } from '../services/wordService';
import { calculateSM2, selectNextWord } from '../services/sm2Service';
import TextToSpeech from './TextToSpeech';
import AudioRecorder from './AudioRecorder';

interface QuizProps {
  words: Word[];
  onWordMastered: () => void;
}

const Quiz: React.FC<QuizProps> = ({ words, onWordMastered }) => {
  const [localWords, setLocalWords] = useState<Word[]>(words);
  const [currentQuestion, setCurrentQuestion] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [animatingNext, setAnimatingNext] = useState(false);
  const [optionsRevealed, setOptionsRevealed] = useState(false);
  const [sessionNewCount, setSessionNewCount] = useState(0);
  const [recentWordIds, setRecentWordIds] = useState<string[]>([]);
  const initializedRef = useRef(false);
  const RECENT_WINDOW = 3;

  useEffect(() => { setLocalWords(words); }, [words]);

  useEffect(() => {
    if (!initializedRef.current && localWords.length >= 4) {
      initializedRef.current = true;
      generateNewQuestion(localWords, sessionNewCount, []);
    }
  }, [localWords]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateNewQuestion = (wordList: Word[], newCount: number, recentIds: string[]) => {
    const questionWord = selectNextWord(wordList, newCount, new Set(recentIds));
    setRecentWordIds([...recentIds, questionWord.id].slice(-RECENT_WINDOW));
    setCurrentQuestion(questionWord);

    const correctOption = questionWord.definition;
    const incorrectOptions: string[] = [];
    while (incorrectOptions.length < 3) {
      const option = wordList[Math.floor(Math.random() * wordList.length)].definition;
      if (option !== correctOption && !incorrectOptions.includes(option)) {
        incorrectOptions.push(option);
      }
    }

    const allOptions = [correctOption, ...incorrectOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    setOptions(allOptions);
    setSelectedOption('');
    setResult(null);
    setOptionsRevealed(false);
  };

  const generateQuestion = (wordList: Word[], newCount: number, recentIds: string[]) => {
    if (wordList.length < 4) return;
    if (currentQuestion) {
      setAnimatingNext(true);
      setTimeout(() => {
        setAnimatingNext(false);
        generateNewQuestion(wordList, newCount, recentIds);
      }, 300);
    } else {
      generateNewQuestion(wordList, newCount, recentIds);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (result) return;
    setSelectedOption(option);
    setOptionsRevealed(true);

    const correct = currentQuestion != null && option === currentQuestion.definition;
    if (correct) { setResult('correct'); setScore(s => s + 1); }
    else { setResult('incorrect'); }
    setTotalQuestions(t => t + 1);

    if (currentQuestion) {
      const isNew = currentQuestion.smNextReview == null;
      const updatedWord = calculateSM2(currentQuestion, correct);
      updateWordSM2(updatedWord);
      recordQuizAttempt(currentQuestion.id, correct);
      const updatedLocalWords = localWords.map(w => w.id === updatedWord.id ? updatedWord : w);
      setLocalWords(updatedLocalWords);
      if (isNew && correct) setSessionNewCount(c => c + 1);
    }
  };

  const handleNextQuestion = () => generateQuestion(localWords, sessionNewCount, recentWordIds);

  if (localWords.filter(w => !w.mastered).length < 4) {
    return (
      <div className="card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--surface-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            width="28" height="28" style={{ color: 'var(--text-muted)' }}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Not Enough Words</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          You need at least 4 non-mastered words to start a quiz.
        </p>
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '0.5rem', padding: '0.875rem', fontSize: '0.875rem', color: 'var(--accent)',
        }}>
          Add more words, or un-master some in My Words.
        </div>
      </div>
    );
  }

  const progressPct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div
      className="card fade-in"
      style={{
        overflow: 'hidden',
        transition: 'opacity 0.3s',
        opacity: animatingNext ? 0 : 1,
      }}
    >
      {/* Quiz header */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: totalQuestions > 0 ? '0.75rem' : 0 }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>Word Quiz</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {totalQuestions > 0 && (
              <span style={{
                fontSize: '0.8125rem', fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'var(--border)',
                padding: '0.2rem 0.625rem',
                borderRadius: '9999px',
              }}>
                {score}/{totalQuestions}
              </span>
            )}
            {currentQuestion && (
              <button
                onClick={() => { toggleWordMastery(currentQuestion.id); onWordMastered(); }}
                title="Mark as mastered — won't appear in quiz anymore"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: 'var(--border)', border: 'none', borderRadius: '9999px',
                  padding: '0.25rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500,
                  color: 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  width="14" height="14" style={{ color: 'var(--warning)' }}>
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" clipRule="evenodd" />
                </svg>
                Master
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalQuestions > 0 && (
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 9999,
              background: 'var(--accent)',
              width: `${progressPct}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        )}
      </div>

      {/* Quiz body */}
      <div style={{ padding: '1.25rem' }}>
        {currentQuestion && (
          <>
            {/* Question number + score badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Question {totalQuestions + 1}
              </span>
              {totalQuestions > 0 && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 500,
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  padding: '0.15rem 0.5rem', borderRadius: '9999px',
                }}>
                  {score} correct
                </span>
              )}
            </div>

            {/* Word display */}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
              What is the meaning of:
            </p>
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '0.625rem',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)' }}>
                {currentQuestion.term.toUpperCase()}
              </p>
              {currentQuestion.priority && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.375rem', color: 'var(--warning)', fontSize: '0.75rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                  </svg>
                  <span>Priority</span>
                </div>
              )}
            </div>

            {/* TTS + recorder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TextToSpeech text={currentQuestion.term} />
              <AudioRecorder key={currentQuestion.id} />
            </div>

            {/* Reveal button */}
            {!optionsRevealed && !result && (
              <button
                onClick={() => setOptionsRevealed(true)}
                className="btn btn-ghost w-full"
                style={{ marginBottom: '0.75rem', border: '1px solid var(--border)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
                Reveal Options
              </button>
            )}

            {/* Options — full width single column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.definition;
                const letter = String.fromCharCode(65 + index);

                let bg = 'var(--surface-raised)';
                let borderColor = 'var(--border)';
                let textColor = 'var(--text)';

                if (result) {
                  if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; borderColor = 'rgba(16,185,129,0.5)'; textColor = '#34d399'; }
                  else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; borderColor = 'rgba(239,68,68,0.5)'; textColor = '#f87171'; }
                  else { textColor = 'var(--text-muted)'; }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={!!result}
                    style={{
                      width: '100%',
                      minHeight: 48,
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '0.5rem',
                      color: textColor,
                      cursor: result ? 'default' : 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      color: 'var(--text-secondary)',
                    }}>
                      {letter}
                    </span>
                    <span style={!optionsRevealed ? { filter: 'blur(5px)', userSelect: 'none' } : {}}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Result feedback */}
            {result === 'incorrect' && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.5rem', padding: '0.875rem', marginBottom: '1rem',
                fontSize: '0.875rem',
              }}>
                <p style={{ fontWeight: 600, color: '#f87171', marginBottom: '0.25rem' }}>Incorrect</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Correct answer: <strong style={{ color: 'var(--text)' }}>{currentQuestion.definition}</strong>
                </p>
              </div>
            )}

            {/* Next button */}
            {result && (
              <button onClick={handleNextQuestion} className="btn btn-primary w-full">
                Next Question
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
