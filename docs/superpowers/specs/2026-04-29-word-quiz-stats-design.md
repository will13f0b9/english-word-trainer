# Word Quiz Stats — Design Spec

**Date:** 2026-04-29  
**Status:** Approved

## Overview

Display per-word quiz statistics in the Word List page. Each word shows how many times it was selected in the quiz and the user's lifetime accuracy (correct / total attempts), rendered as a progress bar with a attempts label.

---

## Data Model

### Changes to `src/models/Word.ts`

Add two optional fields to the `Word` interface:

```typescript
totalAttempts?: number;  // times this word appeared in quiz
totalCorrect?: number;   // times the user answered correctly
```

Both are optional so existing words without these fields default to `0 attempts` with no migration required.

### New function in `src/services/wordService.ts`

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

---

## Quiz Integration

### Changes to `src/components/Quiz.tsx`

In `handleOptionSelect`, after `updateWordSM2(updatedWord)`, call:

```typescript
recordQuizAttempt(currentQuestion.id, correct);
```

Both SM2 and stats are updated together on each answered question.

---

## Word List UI

### Changes to `src/components/WordList.tsx`

Add a **Stats column** to each word row, positioned between the definition and the action buttons.

**Column width:** fixed ~100px  
**Content:**

- **Label:** `{totalAttempts} attempts` — small, muted text
- **Progress bar:** fills proportionally to accuracy (`totalCorrect / totalAttempts`)
  - Green (`#34d399`) when accuracy ≥ 70%
  - Yellow (`var(--warning)`) when accuracy 40–69%
  - Red (`#f87171`) when accuracy < 40%
  - Grey / empty bar when `totalAttempts === 0`
- **0 attempts state:** label shows `0 attempts`, bar renders at 0% width with grey background

### Layout

```
| term + definition (flex: 1) | stats column (100px) | actions |
```

The existing actions column (flame, star, trash) is unchanged.

---

## Out of Scope

- Session-level stats (already shown in the quiz header as `score/totalQuestions`)
- Per-attempt history with timestamps (counters are sufficient for lifetime accuracy)
- Resetting stats independently from deleting a word
