import { getWords, saveWord, toggleWordPriority, recordQuizAttempt } from '../services/wordService';
import { Word } from '../models/Word';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
    length: 0,
    key: () => null,
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const makeWord = (overrides: Partial<Word> = {}): Word => ({
  id: 'w1',
  term: 'test',
  definition: 'a test word',
  createdAt: 1000,
  ...overrides,
});

beforeEach(() => localStorageMock.clear());

describe('toggleWordPriority', () => {
  it('sets priority to true when word has no priority', () => {
    const word = makeWord({ id: 'w1', priority: undefined });
    saveWord(word);
    toggleWordPriority('w1');
    const updated = getWords().find(w => w.id === 'w1');
    expect(updated?.priority).toBe(true);
  });

  it('toggles priority from true to false', () => {
    const word = makeWord({ id: 'w2', priority: true });
    saveWord(word);
    toggleWordPriority('w2');
    const updated = getWords().find(w => w.id === 'w2');
    expect(updated?.priority).toBe(false);
  });

  it('toggles priority from false to true', () => {
    const word = makeWord({ id: 'w3', priority: false });
    saveWord(word);
    toggleWordPriority('w3');
    const updated = getWords().find(w => w.id === 'w3');
    expect(updated?.priority).toBe(true);
  });

  it('does not affect other words', () => {
    const w1 = makeWord({ id: 'w4', term: 'apple', priority: false });
    const w2 = makeWord({ id: 'w5', term: 'banana', priority: true });
    saveWord(w1);
    saveWord(w2);
    toggleWordPriority('w4');
    const unchanged = getWords().find(w => w.id === 'w5');
    expect(unchanged?.priority).toBe(true);
  });
});

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
