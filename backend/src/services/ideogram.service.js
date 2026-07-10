const generateImage = async (prompt, aspectRatio = 'ASPECT_1_1') => {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API IDEOGRAM est manquante dans les variables d\'environnement.');
  }

  try {
    console.log(`Initialisation de la génération d'image IDEOGRAM... Prompt: "${prompt.substring(0, 60)}..."`);
    
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v4/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify({
        text_prompt: prompt,
        aspect_ratio: aspectRatio,
        rendering_speed: 'TURBO'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Ideogram API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("URL de l'image manquante dans la réponse d'Ideogram.");
    }

    console.log(`Génération IDEOGRAM terminée. Image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error("Ideogram Image Generation Error:", error);
    throw error;
  }
};

module.exports = {
  generateImage
};
