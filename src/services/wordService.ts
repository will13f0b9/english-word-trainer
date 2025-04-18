import { Word } from '../models/Word';

const STORAGE_KEY = 'english_words';

export const getWords = (): Word[] => {
  const words = localStorage.getItem(STORAGE_KEY);
  return words ? JSON.parse(words) : [];
};

export const findWordByTerm = (term: string): Word | undefined => {
  const words = getWords();
  return words.find(word => word.term.toLowerCase() === term.toLowerCase());
};

export const searchWords = (query: string): Word[] => {
  if (!query.trim()) return getWords();
  
  const words = getWords();
  const lowerQuery = query.toLowerCase();
  
  return words.filter(word => 
    word.term.toLowerCase().includes(lowerQuery) || 
    word.definition.toLowerCase().includes(lowerQuery)
  );
};

export const saveWord = (word: Word): { success: boolean; message: string } => {
  const existingWord = findWordByTerm(word.term);
  
  if (existingWord) {
    return { 
      success: false, 
      message: `The word "${word.term}" already exists in your list.` 
    };
  }
  
  const words = getWords();
  words.push(word);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  
  return { success: true, message: 'Word saved successfully!' };
};

export const deleteWord = (id: string): void => {
  const words = getWords().filter(word => word.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
};

// Export words to a JSON file
export const exportWordsToJSON = (): void => {
  const words = getWords();
  
  if (words.length === 0) {
    alert('No words to export!');
    return;
  }
  
  const dataStr = JSON.stringify(words, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileName = `english-words-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
};

// Import words from a JSON file
export const importWordsFromJSON = (jsonFile: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          resolve({ success: false, message: 'Could not read the file.' });
          return;
        }
        
        const importedWords = JSON.parse(result) as Word[];
        
        if (!Array.isArray(importedWords)) {
          resolve({ success: false, message: 'Invalid file format. Expected an array of words.' });
          return;
        }
        
        // Validate each word has the required properties
        const isValid = importedWords.every(word => 
          typeof word.id === 'string' && 
          typeof word.term === 'string' && 
          typeof word.definition === 'string' && 
          typeof word.createdAt === 'number'
        );
        
        if (!isValid) {
          resolve({ success: false, message: 'Invalid word data in the file.' });
          return;
        }
        
        // Merge with existing words, avoiding duplicates
        const existingWords = getWords();
        const existingIds = new Set(existingWords.map(w => w.id));
        const existingTerms = new Set(existingWords.map(w => w.term.toLowerCase()));
        
        const newWords = importedWords.filter(word => 
          !existingIds.has(word.id) && !existingTerms.has(word.term.toLowerCase())
        );
        
        const updatedWords = [...existingWords, ...newWords];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
        
        resolve({ 
          success: true, 
          message: `Successfully imported ${newWords.length} new words.${newWords.length < importedWords.length ? ` (${importedWords.length - newWords.length} duplicates were skipped.)` : ''}` 
        });
      } catch (error) {
        resolve({ success: false, message: 'Error parsing the file. Please ensure it\'s a valid JSON file.' });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Error reading the file.' });
    };
    
    reader.readAsText(jsonFile);
  });
}; 