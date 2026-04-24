import { selectNextWord } from '../services/sm2Service';
import { Word } from '../models/Word';

const now = Date.now();
const past = now - 1000;
const future = now + 24 * 60 * 60 * 1000;

const makeWord = (id: string, overrides: Partial<Word> = {}): Word => ({
  id,
  term: id,
  definition: `def-${id}`,
  createdAt: 1000,
  ...overrides,
});

// Helpers to build word arrays with guaranteed 4+ entries for Quiz
const padTo4 = (words: Word[]): Word[] => {
  const extras = ['pad1', 'pad2', 'pad3', 'pad4'].map(id =>
    makeWord(id, { smNextReview: future })
  );
  return [...words, ...extras].slice(0, Math.max(words.length, 4));
};

describe('selectNextWord — priority within due tier', () => {
  it('picks a prioritized due word over a non-prioritized due word', () => {
    const normal = makeWord('normal', { smNextReview: past, priority: false });
    const prio   = makeWord('prio',   { smNextReview: past, priority: true });
    const words  = padTo4([normal, prio]);

    // Run 20 times — should always return prioritized word
    for (let i = 0; i < 20; i++) {
      expect(selectNextWord(words, 0).id).toBe('prio');
    }
  });

  it('falls back to non-prioritized due words when no due word is prioritized', () => {
    const w1 = makeWord('w1', { smNextReview: past, priority: false });
    const w2 = makeWord('w2', { smNextReview: past, priority: false });
    const words = padTo4([w1, w2]);

    const result = selectNextWord(words, 0);
    expect(['w1', 'w2']).toContain(result.id);
  });
});

describe('selectNextWord — priority within new-word tier', () => {
  it('picks a prioritized new word over a non-prioritized new word', () => {
    const normal = makeWord('normal', { smNextReview: undefined, priority: false });
    const prio   = makeWord('prio',   { smNextReview: undefined, priority: true });
    const words  = padTo4([normal, prio]);

    for (let i = 0; i < 20; i++) {
      expect(selectNextWord(words, 0).id).toBe('prio');
    }
  });
});

describe('selectNextWord — priority within future fallback tier', () => {
  it('picks the earliest prioritized future word over an earlier non-prioritized one', () => {
    const earlyNormal = makeWord('earlyNormal', { smNextReview: future, priority: false });
    const laterPrio   = makeWord('laterPrio',   { smNextReview: future + 1000, priority: true });
    const words = padTo4([earlyNormal, laterPrio]);

    for (let i = 0; i < 20; i++) {
      expect(selectNextWord(words, 5).id).toBe('laterPrio');
    }
  });

  it('falls back to earliest non-prioritized when no future word is prioritized', () => {
    const w1 = makeWord('w1', { smNextReview: future,        priority: false });
    const w2 = makeWord('w2', { smNextReview: future + 1000, priority: false });
    const words = padTo4([w1, w2]);

    expect(selectNextWord(words, 5).id).toBe('w1');
  });
});

describe('selectNextWord — mastered words are always excluded', () => {
  it('never returns a mastered word even if it is prioritized', () => {
    const mastered = makeWord('mastered', { smNextReview: past, priority: true, mastered: true });
    const normal   = makeWord('normal',   { smNextReview: past });
    const words    = padTo4([mastered, normal]);

    for (let i = 0; i < 20; i++) {
      expect(selectNextWord(words, 0).id).not.toBe('mastered');
    }
  });
});
