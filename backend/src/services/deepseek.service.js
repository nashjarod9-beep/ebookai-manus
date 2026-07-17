const callDeepSeek = async (messages, responseFormat = null) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API DeepSeek est manquante dans les variables d\'environnement.');
  }

  const payload = {
    model: 'deepseek-chat',
    messages: messages,
    temperature: 0.7,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur DeepSeek API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API Request Error:", error);
    throw error;
  }
};

const { getPrompt } = require('./prompts/system-prompts.service');

const suggestTitles = async (ebookData) => {
  const { theme, objective, audience, tone, language } = ebookData;
  const promptObj = getPrompt('suggest_titles', 'v1');
  const userPrompt = promptObj.user(theme, objective, audience, tone, language);

  const content = await callDeepSeek([
    { role: 'system', content: promptObj.system },
    { role: 'user', content: userPrompt }
  ], { type: 'json_object' });

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing des titres suggérés par DeepSeek:", content);
    throw new Error("Le format de titres renvoyé par DeepSeek n'est pas un JSON valide.");
  }
};

const generateOutline = async (ebookData) => {
  const { title, theme, objective, audience, tone, length, language } = ebookData;
  const promptObj = getPrompt('generate_outline', 'v1');
  const userPrompt = promptObj.user(title, theme, objective, audience, tone, length, language);

  const content = await callDeepSeek([
    { role: 'system', content: promptObj.system },
    { role: 'user', content: userPrompt }
  ], { type: 'json_object' });

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing de la structure DeepSeek:", content);
    throw new Error("Le format renvoyé par DeepSeek n'est pas un JSON valide.");
  }
};

const generateChapter = async (chapterData, bookContext) => {
  const { title, summary, order, subchapters } = chapterData;
  const { theme, objective, audience, tone, language, additionalInstructions } = bookContext;
  const promptObj = getPrompt('generate_chapter', 'v1');
  const userPrompt = promptObj.user(title, summary, order, subchapters, theme, objective, audience, tone, language, additionalInstructions);

  const content = await callDeepSeek([
    { role: 'system', content: promptObj.system },
    { role: 'user', content: userPrompt }
  ]);

  return content.trim();
};

module.exports = {
  suggestTitles,
  generateOutline,
  generateChapter
};
