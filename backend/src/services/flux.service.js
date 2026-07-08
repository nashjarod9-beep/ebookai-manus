const generateImage = async (prompt, width = 1024, height = 768) => {
  const apiKey = process.env.FLUX_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API FLUX est manquante dans les variables d\'environnement.');
  }

  try {
    console.log(`Initialisation de la génération d'image FLUX... Prompt: "${prompt.substring(0, 60)}..."`);
    
    // Step 1: Submit the task
    // We use the flagship flux-pro-1.1 model endpoint
    const response = await fetch('https://api.bfl.ai/v1/flux-pro-1.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-key': apiKey
      },
      body: JSON.stringify({
        prompt: prompt,
        width: width,
        height: height,
        prompt_upsampling: false // Turn off upsampling to avoid altering prompt content too much
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur soumission FLUX: ${response.status} - ${errorText}`);
    }

    const taskData = await response.json();
    const taskId = taskData.id;
    if (!taskId) {
      throw new Error("ID de tâche non renvoyé par l'API FLUX.");
    }

    console.log(`Tâche FLUX soumise avec succès (ID: ${taskId}). Attente du résultat...`);

    // Step 2: Poll for the result
    const maxRetries = 20; // 40 seconds max
    const delayMs = 2000;
    
    for (let i = 0; i < maxRetries; i++) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      const pollResponse = await fetch(`https://api.bfl.ai/v1/get_result?id=${taskId}`, {
        method: 'GET',
        headers: {
          'x-key': apiKey
        }
      });

      if (!pollResponse.ok) {
        console.warn(`Erreur lors du polling FLUX (essai ${i+1}): ${pollResponse.statusText}`);
        continue;
      }

      const pollData = await pollResponse.json();
      
      if (pollData.status === 'Ready') {
        const imageUrl = pollData.result?.sample;
        if (!imageUrl) {
          throw new Error("URL de l'échantillon manquante dans la réponse finale de FLUX.");
        }
        console.log(`Génération FLUX terminée (ID: ${taskId}). Image URL: ${imageUrl}`);
        return imageUrl;
      }

      if (pollData.status === 'Failed') {
        throw new Error(`La tâche de génération d'image FLUX a échoué.`);
      }

      console.log(`FLUX status: ${pollData.status}...`);
    }

    throw new Error("Temps d'attente dépassé pour la génération d'image FLUX.");

  } catch (error) {
    console.error("FLUX Image Generation Error:", error);
    throw error;
  }
};

module.exports = {
  generateImage
};
