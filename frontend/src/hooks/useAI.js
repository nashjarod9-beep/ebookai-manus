import api from '../lib/axios';

export function useAI() {
  const generateOutline = async (ebookData) => {
    const { data } = await api.post('/ai/outline', ebookData);
    return data;
  };

  const generateCover = async (bookId, coverImagePrompt) => {
    const { data } = await api.post('/ai/cover', { bookId, coverImagePrompt });
    return data.coverUrl;
  };

  const generateChapter = async (bookId, chapterData, ebookData) => {
    const { data } = await api.post('/ai/chapter', { bookId, chapterData, ebookData });
    return data;
  };

  return { generateOutline, generateCover, generateChapter };
}
