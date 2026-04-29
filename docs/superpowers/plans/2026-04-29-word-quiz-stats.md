# Word Quiz Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track per-word quiz attempt counts and accuracy, then display them as a stats column (attempt label + color-coded progress bar) in the Word List.

**Architecture:** Add `totalAttempts` and `totalCorrect` optional fields to the `Word` model. A new `recordQuizAttempt` service function increments them on every quiz answer. The Quiz calls this function alongside the existing SM2 update. The WordList renders a fixed-width stats column per row.

**Tech Stack:** TypeScript, React, localStorage, Jest (via react-scripts)

---

## File Map

| File | Change |
|---|---|
| `src/models/Word.ts` | Add `totalAttempts?: number` and `totalCorrect?: number` fields |
| `src/services/wordService.ts` | Add `recordQuizAttempt(id, correct)` function |
| `src/__tests__/wordService.test.ts` | Add tests for `recordQuizAttempt` |
| `src/components/Quiz.tsx` | Call `recordQuizAttempt` in `handleOptionSelect` |
| `src/components/WordList.tsx` | Add stats column to each word row |

---

### Task 1: Extend Word model

**Files:**
- Modify: `src/models/Word.ts`

- [ ] **Step 1: Add the two new optional fields**

Open `src/models/Word.ts`. The current file is:

```typescript
export interface Word {
  id: string;
  term: string;
  definition: string;
  createdAt: number;
  mastered?: boolean;
  priority?: boolean;
  smInterval?: number;
  smRepetitions?: number;
  smEaseFactor?: number;
  smNextReview?: number;
}
```

Replace it with:

```typescript
export interface Word {
  id: string;
  term: string;
  definition: string;
  createdAt: number;
  mastered?: boolean;
  priority?: boolean;
  smInterval?: number;
  smRepetitions?: number;
  smEaseFactor?: number;
  smNextReview?: number;
  totalAttempts?: number;
  totalCorrect?: number;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no type errors related to the new fields.

- [ ] **Step 3: Commit**

```bash
git add src/models/Word.ts
git commit -m "feat: add totalAttempts and totalCorrect fields to Word model"
```

---

### Task 2: Add recordQuizAttempt service function

**Files:**
- Modify: `src/services/wordService.ts`
- Test: `src/__tests__/wordService.test.ts`

- [ ] **Step 1: Write the failing tests**

Open `src/__tests__/wordService.test.ts`. Add the following at the end of the file (after the existing `toggleWordPriority` describe block). The import at the top already imports from `../services/wordService` — add `recordQuizAttempt` to that import:

```typescript
import { getWords, saveWord, toggleWordPriority, recordQuizAttempt } from '../services/wordService';
```

Then append these tests:

```typescript
describe('recordQuizAttempt', () => {
  it('initializes totalAttempts to 1 and totalCorrect to 1 on first correct attempt', () => {
    const word = makeWord({ id: 'r1', term: 'run' });
    saveWord(word);
    recordQuizAttempt('r1', true);
    const updated = getWords().find(w => w.id === 'r1');
    expect(updated?.totalAttempts).toBe(1);
    expect(updated?.totalCorrect).toBe(1);
  });

  it('initializes totalAttempts to 1 and totalCorrect to 0 on first incorrect attempt', () => {
    const word = makeWord({ id: 'r2', term: 'run2' });
    saveWord(word);
    recordQuizAttempt('r2', false);
    const updated = getWords().find(w => w.id === 'r2');
    expect(updated?.totalAttempts).toBe(1);
    expect(updated?.totalCorrect).toBe(0);
  });

  it('increments both counters on subsequent correct attempt', () => {
    const word = makeWord({ id: 'r3', term: 'run3', totalAttempts: 4, totalCorrect: 3 });
    saveWord(word);
    recordQuizAttempt('r3', true);
    const updated = getWords().find(w => w.id === 'r3');
    expect(updated?.totalAttempts).toBe(5);
    expect(updated?.totalCorrect).toBe(4);
  });

  it('increments only totalAttempts on incorrect attempt', () => {
    const word = makeWord({ id: 'r4', term: 'run4', totalAttempts: 4, totalCorrect: 3 });
    saveWord(word);
    recordQuizAttempt('r4', false);
    const updated = getWords().find(w => w.id === 'r4');
    expect(updated?.totalAttempts).toBe(5);
    expect(updated?.totalCorrect).toBe(3);
  });

  it('does not affect other words', () => {
    const w1 = makeWord({ id: 'r5', term: 'apple2', totalAttempts: 2, totalCorrect: 1 });
    const w2 = makeWord({ id: 'r6', term: 'banana2', totalAttempts: 5, totalCorrect: 5 });
    saveWord(w1);
    saveWord(w2);
    recordQuizAttempt('r5', true);
    const unchanged = getWords().find(w => w.id === 'r6');
    expect(unchanged?.totalAttempts).toBe(5);
    expect(unchanged?.totalCorrect).toBe(5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
NODE_OPTIONS=--openssl-legacy-provider npm test -- --watchAll=false --testPathPattern=wordService 2>&1 | tail -20
```

Expected: FAIL — `recordQuizAttempt` is not exported / not found.

- [ ] **Step 3: Implement recordQuizAttempt in wordService**

Open `src/services/wordService.ts`. Add this function after `toggleWordPriority`:

```typescript
export const recordQuizAttempt = (id: string, correct: boolean): void => {
  const words = getWords().map(word =>
    word.id === id
      ? {
          ...word,
          totalAttempts: (word.totalAttempts ?? 0) + 1,
          totalCorrect: (word.totalCorrect ?? 0) + (correct ? 1 : 0),
        }
      : word
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
NODE_OPTIONS=--openssl-legacy-provider npm test -- --watchAll=false --testPathPattern=wordService 2>&1 | tail -20
```

Expected: all `recordQuizAttempt` tests PASS, existing tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/wordService.ts src/__tests__/wordService.test.ts
git commit -m "feat: add recordQuizAttempt to wordService with tests"
```

---

### Task 3: Wire Quiz to record attempts

**Files:**
- Modify: `src/components/Quiz.tsx:1` (import line) and `src/components/Quiz.tsx:76-94` (handleOptionSelect)

- [ ] **Step 1: Add import**

In `src/components/Quiz.tsx`, the import from `wordService` is currently:

```typescript
import { toggleWordMastery, updateWordSM2 } from '../services/wordService';
```

Change it to:

```typescript
import { toggleWordMastery, updateWordSM2, recordQuizAttempt } from '../services/wordService';
```

- [ ] **Step 2: Call recordQuizAttempt in handleOptionSelect**

In `src/components/Quiz.tsx`, the `handleOptionSelect` function currently contains:

```typescript
    if (currentQuestion) {
      const isNew = currentQuestion.smNextReview == null;
      const updatedWord = calculateSM2(currentQuestion, correct);
      updateWordSM2(updatedWord);
      const updatedLocalWords = localWords.map(w => w.id === updatedWord.id ? updatedWord : w);
      setLocalWords(updatedLocalWords);
      if (isNew && correct) setSessionNewCount(c => c + 1);
    }
```

Replace it with:

```typescript
    if (currentQuestion) {
      const isNew = currentQuestion.smNextReview == null;
      const updatedWord = calculateSM2(currentQuestion, correct);
      updateWordSM2(updatedWord);
      recordQuizAttempt(currentQuestion.id, correct);
      const updatedLocalWords = localWords.map(w => w.id === updatedWord.id ? updatedWord : w);
      setLocalWords(updatedLocalWords);
      if (isNew && correct) setSessionNewCount(c => c + 1);
    }
```

- [ ] **Step 3: Verify the app compiles and quiz still works**

```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
```

Open http://localhost:3000, go to the Quiz page, answer a few questions. Open DevTools → Application → Local Storage and confirm the word entries now have `totalAttempts` and `totalCorrect` fields being updated.

- [ ] **Step 4: Commit**

```bash
git add src/components/Quiz.tsx
git commit -m "feat: record quiz attempts per word in Quiz component"
```

---

### Task 4: Add stats column to WordList

**Files:**
- Modify: `src/components/WordList.tsx`

- [ ] **Step 1: Add the StatsColumn component inside WordList.tsx**

Open `src/components/WordList.tsx`. After the `FlameIcon` component definition (around line 49), add this helper component:

```typescript
const QuizStats = ({ totalAttempts, totalCorrect }: { totalAttempts?: number; totalCorrect?: number }) => {
  const attempts = totalAttempts ?? 0;
  const correct = totalCorrect ?? 0;
  const accuracy = attempts > 0 ? correct / attempts : 0;

  let barColor = '#6b7280'; // grey for 0 attempts
  if (attempts > 0) {
    if (accuracy >= 0.7) barColor = '#34d399';       // green
    else if (accuracy >= 0.4) barColor = 'var(--warning)'; // yellow
    else barColor = '#f87171';                          // red
  }

  return (
    <div style={{ width: 100, flexShrink: 0 }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>
        {attempts} attempts
      </p>
      <div style={{
        height: 6,
        background: 'var(--border)',
        borderRadius: 9999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${accuracy * 100}%`,
          background: barColor,
          borderRadius: 9999,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Insert the stats column into each word row**

In `src/components/WordList.tsx`, the list item layout currently has:

```typescript
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              ...
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
```

Add the `<QuizStats>` component between the text div and the actions div:

```typescript
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              ...
            </div>

            {/* Quiz stats */}
            <QuizStats totalAttempts={word.totalAttempts} totalCorrect={word.totalCorrect} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
```

- [ ] **Step 3: Verify the UI renders correctly**

```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
```

Open http://localhost:3000 and go to My Words. Verify:
- Every word row shows a stats column with `0 attempts` and an empty progress bar for words never quizzed
- After running the quiz and returning to My Words, quizzed words show updated attempt counts and a colored progress bar
- Green bar for ≥ 70% accuracy, yellow for 40–69%, red for < 40%
- The existing flame, star, and delete buttons are unaffected

- [ ] **Step 4: Run all tests to check for regressions**

```bash
NODE_OPTIONS=--openssl-legacy-provider npm test -- --watchAll=false 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/WordList.tsx
git commit -m "feat: add quiz stats column to word list"
```

---

## Done

All four tasks complete. The feature is fully implemented:
- `Word` model carries lifetime quiz counters
- `recordQuizAttempt` updates them on every answer
- Quiz calls it alongside the SM2 update
- WordList displays a 100px stats column with attempt count label and color-coded accuracy bar
