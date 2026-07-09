import api from '../lib/axios';

export function useAI() {
  const suggestTitles = async (ebookData) => {
    const { data } = await api.post('/ai/suggest-titles', ebookData);
    return data.titles;
  };

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

  return { suggestTitles, generateOutline, generateCover, generateChapter };
}
