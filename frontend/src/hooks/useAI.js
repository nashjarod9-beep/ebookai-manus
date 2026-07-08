import api from '../lib/axios';

export function useAI() {
  const pollTaskStatus = async (taskId, bookId = null) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const url = bookId 
            ? `/ai/task-status/${taskId}?bookId=${bookId}`
            : `/ai/task-status/${taskId}`;
            
          const { data } = await api.get(url);
          
          if (data.status === 'completed') {
            clearInterval(interval);
            resolve(data.result);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            reject(new Error(data.error || 'La génération de la tâche a échoué.'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 3000);
    });
  };

  const generateOutline = async (ebookData) => {
    const { data } = await api.post('/ai/outline', ebookData);
    if (!data.taskId) {
      throw new Error('Identifiant de tâche de structure manquant.');
    }
    return await pollTaskStatus(data.taskId);
  };

  const generateFullEbook = async (outline, ebookData, bookId) => {
    const { data } = await api.post('/ai/full-ebook', { outline, ebookData, bookId });
    if (!data.taskId) {
      throw new Error('Identifiant de tâche de génération complet manquant.');
    }
    return await pollTaskStatus(data.taskId, bookId);
  };

  return { generateOutline, generateFullEbook };
}
