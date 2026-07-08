import api from '../lib/axios';

export function useAI() {
  const generateOutline = async (ebookData) => {
    const { data } = await api.post('/ai/outline', ebookData);
    return data;
  };

  const generateFullEbook = async (outline, ebookData, bookId) => {
    const { data } = await api.post('/ai/full-ebook', { outline, ebookData, bookId });
    return data;
  };

  return { generateOutline, generateFullEbook };
}
