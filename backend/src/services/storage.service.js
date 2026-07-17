const { supabase } = require('./supabase.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

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
 * Fonction centralisée de sauvegarde d'actif avec métadonnées dans Prisma (StorageAsset)
 */
const saveAssetWithMetadata = async ({ buffer, path, mimetype, userId, format, origine, workerId }) => {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const taille = buffer.length;

  // 1. Upload vers Supabase Storage
  const url = await uploadToStorage(buffer, path, mimetype);

  // 2. Création/mise à jour de l'enregistrement de l'actif
  await prisma.storageAsset.upsert({
    where: { path },
    update: {
      taille,
      hash,
      url,
      origine,
      workerId,
      statut: 'active',
      version: '1.0.0',
      date: new Date()
    },
    create: {
      path,
      url,
      taille,
      hash,
      utilisateurId: userId,
      format,
      origine,
      workerId,
      statut: 'active',
      version: '1.0.0'
    }
  });

  return url;
};

/**
 * Stocke une image d'illustration de chapitre
 * Chemin: images/{userId}/{filename}
 */
const uploadChapterImage = async (imageBuffer, userId, filename, workerId = null, mimetype = 'image/png') => {
  const path = `images/${userId}/${filename}`;
  return await saveAssetWithMetadata({
    buffer: imageBuffer,
    path,
    mimetype,
    userId,
    format: 'png',
    origine: filename.includes('mockup') ? 'ideogram' : 'flux',
    workerId
  });
};

/**
 * Stocke une image de couverture
 * Chemin: covers/{userId}/{filename}
 */
const uploadCoverImage = async (imageBuffer, userId, filename, workerId = null, mimetype = 'image/png') => {
  const path = `covers/${userId}/${filename}`;
  return await saveAssetWithMetadata({
    buffer: imageBuffer,
    path,
    mimetype,
    userId,
    format: 'png',
    origine: 'flux',
    workerId
  });
};

/**
 * Stocke un PDF ou un ZIP exporté
 * Chemin: exports/{userId}/{filename}
 */
const uploadPdfExport = async (pdfBuffer, userId, filename, mimetype = 'application/pdf', workerId = null) => {
  const path = `exports/${userId}/${filename}`;
  const isZip = mimetype === 'application/zip' || filename.endsWith('.zip');
  return await saveAssetWithMetadata({
    buffer: pdfBuffer,
    path,
    mimetype,
    userId,
    format: isZip ? 'zip' : 'pdf',
    origine: isZip ? 'archiver' : 'playwright',
    workerId
  });
};

module.exports = {
  downloadImageToBuffer,
  saveAssetWithMetadata,
  uploadChapterImage,
  uploadCoverImage,
  uploadPdfExport
};
