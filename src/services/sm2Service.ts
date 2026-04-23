import { Word } from '../models/Word';

const MAX_NEW_PER_SESSION = 10;
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const calculateSM2 = (word: Word, correct: boolean): Word => {
  const quality = correct ? 4 : 1;

  const interval = word.smInterval ?? 1;
  const repetitions = word.smRepetitions ?? 0;
  const easeFactor = word.smEaseFactor ?? DEFAULT_EASE_FACTOR;

  let newInterval: number;
  let newRepetitions: number;

  if (quality >= 3) {
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
    newRepetitions = repetitions + 1;
  } else {
    newInterval = 1;
    newRepetitions = 0;
  }

  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    ...word,
    smInterval: newInterval,
    smRepetitions: newRepetitions,
    smEaseFactor: newEaseFactor,
    smNextReview: Date.now() + newInterval * MS_PER_DAY,
  };
};

export const selectNextWord = (words: Word[], sessionNewCount: number): Word => {
  const now = Date.now();
  const eligible = words.filter(w => !w.mastered);

  // Priority 1: due for review (previously seen, now past their next review date)
  const dueWords = eligible.filter(
    w => w.smNextReview != null && w.smNextReview <= now
  );
  if (dueWords.length > 0) {
    return dueWords[Math.floor(Math.random() * dueWords.length)];
  }

  // Priority 2: new words (never seen), within the per-session cap
  const newWords = eligible.filter(w => w.smNextReview == null);
  if (newWords.length > 0 && sessionNewCount < MAX_NEW_PER_SESSION) {
    return newWords[Math.floor(Math.random() * newWords.length)];
  }

  // Priority 3: fallback — word with the earliest future review date
  const futureWords = eligible
    .filter(w => w.smNextReview != null && w.smNextReview > now)
    .sort((a, b) => (a.smNextReview ?? 0) - (b.smNextReview ?? 0));
  if (futureWords.length > 0) {
    return futureWords[0];
  }

  // Last resort: any eligible word (handles all-new + cap exceeded edge case)
  return eligible[Math.floor(Math.random() * eligible.length)];
};
