const deepseek = require('./deepseek.service');
const qwen = require('./qwen.service');

const generateBookOutline = async (ebookData) => {
  console.log("Tentative de génération du plan avec DeepSeek...");
  try {
    const outline = await deepseek.generateOutline(ebookData);
    console.log("Plan généré avec succès par DeepSeek.");
    return { outline, modelUsed: 'deepseek-chat' };
  } catch (error) {
    console.error("Échec de la génération avec DeepSeek, bascule sur Qwen. Erreur :", error.message);
    try {
      const outline = await qwen.generateOutline(ebookData);
      console.log("Plan généré avec succès par Qwen (Fallback).");
      return { outline, modelUsed: 'qwen-plus' };
    } catch (qwenError) {
      console.error("Échec de la génération avec Qwen également.", qwenError.message);
      throw new Error("Impossible de générer le plan de l'ebook (DeepSeek et Qwen ont échoué).");
    }
  }
};

const generateChapterContent = async (chapterData, bookContext) => {
  console.log(`Tentative de génération du chapitre ${chapterData.order} avec DeepSeek...`);
  try {
    const content = await deepseek.generateChapter(chapterData, bookContext);
    console.log(`Chapitre ${chapterData.order} généré avec succès par DeepSeek.`);
    return { content, modelUsed: 'deepseek-chat' };
  } catch (error) {
    console.error(`Échec de la génération du chapitre ${chapterData.order} avec DeepSeek, bascule sur Qwen. Erreur :`, error.message);
    try {
      const content = await qwen.generateChapter(chapterData, bookContext);
      console.log(`Chapitre ${chapterData.order} généré avec succès par Qwen (Fallback).`);
      return { content, modelUsed: 'qwen-plus' };
    } catch (qwenError) {
      console.error(`Échec de la génération du chapitre ${chapterData.order} avec Qwen également.`, qwenError.message);
      throw new Error(`Impossible de générer le chapitre ${chapterData.order} (DeepSeek et Qwen ont échoué).`);
    }
  }
};

module.exports = {
  generateBookOutline,
  generateChapterContent
};
