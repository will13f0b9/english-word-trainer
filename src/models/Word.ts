export interface Word {
  id: string;
  term: string;
  definition: string;
  createdAt: number;
  mastered?: boolean;
  priority?: boolean;
  smInterval?: number;      // days until next review
  smRepetitions?: number;   // consecutive correct answers
  smEaseFactor?: number;    // quality multiplier (min 1.3, default 2.5)
  smNextReview?: number;    // timestamp (ms) of next scheduled review
} 