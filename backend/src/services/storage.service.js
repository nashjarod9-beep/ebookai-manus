const { supabase } = require('./supabase.service');

/**
 * Télécharge une image depuis une URL externe (ex: FLUX) pour la convertir en Buffer
 */
const downloadImageToBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur téléchargement image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Failed to download image to buffer:", error);
    throw new Error("Impossible de télécharger l'image générée.");
  }
};

/**
 * Upload générique vers un chemin spécifique dans le bucket ebookai-storage
 */
const uploadToStorage = async (buffer, path, mimetype) => {
  const { data, error } = await supabase.storage
    .from('ebookai-storage')
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) {
    console.error(`Supabase upload error for path ${path}:`, error);
    throw new Error('Erreur lors du stockage du fichier dans le cloud.');
  }

  const { data: publicData } = supabase.storage
    .from('ebookai-storage')
    .getPublicUrl(path);

  return publicData.publicUrl;
};

/**
 * Stocke une image d'illustration de chapitre
 * Chemin: images/{userId}/{filename}
 */
const uploadChapterImage = async (imageBuffer, userId, filename, mimetype = 'image/png') => {
  const path = `images/${userId}/${filename}`;
  return await uploadToStorage(imageBuffer, path, mimetype);
};

/**
 * Stocke une image de couverture
 * Chemin: covers/{userId}/{filename}
 */
const uploadCoverImage = async (imageBuffer, userId, filename, mimetype = 'image/png') => {
  const path = `covers/${userId}/${filename}`;
  return await uploadToStorage(imageBuffer, path, mimetype);
};

/**
 * Stocke un PDF exporté
 * Chemin: exports/${userId}/{filename}
 */
const uploadPdfExport = async (pdfBuffer, userId, filename, mimetype = 'application/pdf') => {
  const path = `exports/${userId}/${filename}`;
  return await uploadToStorage(pdfBuffer, path, mimetype);
};

module.exports = {
  downloadImageToBuffer,
  uploadChapterImage,
  uploadCoverImage,
  uploadPdfExport
};
