# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

English Word Trainer is a React-based vocabulary learning application that helps users memorize English words through flashcards and quizzes. Words are stored in browser localStorage, and the app is deployed to GitHub Pages.

## Development Commands

### Development
- `npm start` - Start development server at http://localhost:3000
- `npm test` - Run tests in watch mode
- `npm run build` - Build for production (outputs to `build/` folder)

### Deployment
- `npm run deploy` - Deploy to GitHub Pages (runs build first)

### Important Note
All npm scripts require `NODE_OPTIONS=--openssl-legacy-provider` due to older react-scripts version (3.0.1). This is already configured in package.json scripts.

## Architecture Overview

### Data Flow
1. **Storage Layer** (`src/services/wordService.ts`): All word data is persisted to localStorage under the key `'english_words'`. This service provides CRUD operations and import/export functionality.

2. **State Management**: The app uses React's built-in state management. The main `App.tsx` component maintains the word list and passes it down to child components.

3. **Page Navigation**: Simple state-based navigation via `currentPage` state in `App.tsx` (values: 'home', 'words', 'quiz').

### Core Components

- **App.tsx**: Main application shell with page routing and global word state management
- **Quiz.tsx**: Quiz interface that randomly selects words and generates multiple-choice questions with 4 options (1 correct + 3 random incorrect). Requires minimum 4 words to function.
- **WordForm.tsx**: Form for adding new words with duplicate detection
- **WordList.tsx**: Displays all saved words with search and delete functionality
- **Header.tsx**: Navigation header
- **TextToSpeech.tsx**: Text-to-speech component for pronunciation

### Data Model

```typescript
interface Word {
  id: string;        // Timestamp-based ID
  term: string;      // The word/phrase
  definition: string; // Definition/translation
  createdAt: number; // Timestamp
}
```

### Key Services

**wordService.ts** provides:
- `getWords()`: Retrieves all words from localStorage
- `saveWord(word)`: Saves word with duplicate checking by term (case-insensitive)
- `deleteWord(id)`: Removes word by ID
- `findWordByTerm(term)`: Case-insensitive term lookup
- `searchWords(query)`: Searches both term and definition fields
- `exportWordsToJSON()`: Downloads words as JSON file
- `importWordsFromJSON(file)`: Imports words, skipping duplicates by ID or term

## Future Roadmap

The README.md contains a backlog of planned features:
1. Hide option text by default in quiz, add button to reveal
2. Audio recording feature for quiz responses
3. Word mastery tracking (hide mastered words from rotation)
4. Improved quiz sort algorithm prioritizing new/failed words
5. Mastery toggle in word list view

## Styling

The app uses TailwindCSS (v4.1.4) with custom utility classes defined in App.css. Components use a mix of Tailwind utility classes and custom CSS classes like `card`, `btn-primary`, `form-control`, etc.

## Deployment Configuration

- **Homepage**: http://will13f0b9.github.io/english-word-trainer
- **GitHub Pages**: Uses gh-pages package to deploy the build folder
- Target branch for deployment is typically `gh-pages`
