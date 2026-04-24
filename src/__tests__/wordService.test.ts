import { getWords, saveWord, toggleWordPriority } from '../services/wordService';
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
