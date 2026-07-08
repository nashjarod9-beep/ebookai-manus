const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials are missing. File uploads will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadFile = async (buffer, filename, mimetype) => {
  const { data, error } = await supabase.storage
    .from('ebookai-storage')
    .upload(filename, buffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Erreur lors de l\'envoi du fichier sur Supabase');
  }

  const { data: publicData } = supabase.storage
    .from('ebookai-storage')
    .getPublicUrl(filename);

  return publicData.publicUrl;
};

module.exports = {
  supabase,
  uploadFile
};
