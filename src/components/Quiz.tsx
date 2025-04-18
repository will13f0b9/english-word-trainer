import React, { useState, useEffect } from 'react';
import { Word } from '../models/Word';

interface QuizProps {
  words: Word[];
}

const Quiz: React.FC<QuizProps> = ({ words }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [animatingNext, setAnimatingNext] = useState(false);

  useEffect(() => {
    if (words.length >= 4) {
      generateQuestion(words);
    }
  }, [words]);

  const generateQuestion = (wordList: Word[]) => {
    if (wordList.length < 4) {
      return;
    }

    // If transitioning between questions, add animation
    if (currentQuestion) {
      setAnimatingNext(true);
      setTimeout(() => {
        // Reset animation state and update question
        setAnimatingNext(false);
        generateNewQuestion(wordList);
      }, 300);
    } else {
      generateNewQuestion(wordList);
    }
  };

  const generateNewQuestion = (wordList: Word[]) => {
    // Get random word for question
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const questionWord = wordList[randomIndex];
    setCurrentQuestion(questionWord);

    // Create options (1 correct, 3 incorrect)
    const correctOption = questionWord.definition;
    const incorrectOptions: string[] = [];

    // Get 3 random incorrect options
    while (incorrectOptions.length < 3) {
      const randomIdx = Math.floor(Math.random() * wordList.length);
      const option = wordList[randomIdx].definition;
      if (option !== correctOption && !incorrectOptions.includes(option)) {
        incorrectOptions.push(option);
      }
    }

    // Combine and shuffle options
    const allOptions = [correctOption, ...incorrectOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    setOptions(allOptions);
    setSelectedOption('');
    setResult(null);
  };

  const handleOptionSelect = (option: string) => {
    if (result) return; // Prevent multiple selections

    setSelectedOption(option);

    if (currentQuestion && option === currentQuestion.definition) {
      setResult('correct');
      setScore(prev => prev + 1);
    } else {
      setResult('incorrect');
    }

    setTotalQuestions(prev => prev + 1);
  };

  const handleNextQuestion = () => {
    generateQuestion(words);
  };

  if (words.length < 4) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-md mx-auto text-center">
        <div className="bg-gray-50 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-400">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Not Enough Words</h2>
        <p className="text-gray-500 mb-4">
          You need at least 4 words in your vocabulary list to start a quiz.
        </p>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <p className="text-sm text-blue-700">Try adding more words to your list, then come back to test your knowledge.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white shadow-sm rounded-lg overflow-hidden max-w-md mx-auto transition-opacity duration-300 ${animatingNext ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-white opacity-90">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
            <h2 className="font-bold text-lg">Word Quiz</h2>
          </div>

          {totalQuestions > 0 && (
            <span className="bg-white bg-opacity-30 text-white text-xs font-medium py-1 px-3 rounded-full">
              Score: {score}/{totalQuestions}
            </span>
          )}
        </div>

        {totalQuestions > 0 && (
          <div className="mt-2 bg-white bg-opacity-20 rounded-full h-1.5" style={{ fontWeight: 'bold' }}>
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((score / totalQuestions) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {currentQuestion && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-gray-500">
                  Question {totalQuestions + 1}
                </span>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full" style={{ fontWeight: 'bold' }}>
                  {score} correct
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">What is the meaning of:</h3>
              <p className="text-xl font-bold text-gray-800 p-3 border border-gray-100 rounded-lg bg-gray-50 text-center" style={{ fontWeight: 'bold' }}>
                {currentQuestion.term.toUpperCase()}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.definition;
                const letter = String.fromCharCode(65 + index);

                let buttonClasses = "w-full text-left px-3 py-2 rounded transition-all";

                // Default state (no result yet)
                if (!result) {
                  buttonClasses += " bg-white hover:bg-gray-50 border-gray-300";
                }
                // Correct answer
                else if (isCorrect) {
                  buttonClasses += " bg-green-50 border-green-300 text-green-700";
                }
                // Selected but incorrect
                else if (isSelected) {
                  buttonClasses += " bg-red-50 border-red-300 text-red-700";
                }
                // Not selected and not correct
                else {
                  buttonClasses += " bg-gray-50 border-gray-300 text-gray-500";
                }

                return (
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', margin: '10px 10px 10px 10px' }}>


                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={!!result}
                      className={buttonClasses}
                      style={{ padding: '10px 10px 10px 10px',  backgroundColor: 'white', flex: '0 0 calc(50% - 10px)', boxSizing: 'border-box' }}
                    >
                      <span className="inline-flex items-center" style={{ }}>
                        <span className="font-small mr-2">{letter}.</span>
                        <span>{option.toUpperCase()}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {result && (
              <div>
                {result === 'incorrect' && (
                  <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-4 text-sm text-red-700">
                    <p className="font-medium" style={{ fontWeight: 'bold', color: 'red' }}>Incorrect answer</p>
                    <p>The correct answer is: <span className="font-medium" style={{ fontWeight: 'bold' }}>{currentQuestion.definition.toUpperCase()}</span></p>
                  </div>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm flex items-center justify-center"
                >
                  <span>Next Question</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-2">
                    <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz; 