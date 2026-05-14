import { supabase } from '../config/supabase.js';

export const StorageService = {
  async uploadExamPaper(fileBuffer, originalName, mimeType) {
    console.log("-> [Storage Service] Uploading file to Supabase...");
    if (!fileBuffer || typeof originalName !== 'string') {
      throw new Error("Invalid file buffer or file name provided for upload.");
    }
    
    // IMPROVEMENT 1: Better sanitization (removes all weird characters)
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const fileName = `submissions/${Date.now()}_${sanitizedName}`;

    // Upload the file buffer directly to Supabase
    const { data, error } = await supabase.storage
      .from('exam-papers') // This MUST match your Supabase bucket name exactly!
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    // IMPROVEMENT 2: Log the exact error before throwing it
    if (error) {
      console.error("❌ [Storage Service] Supabase Error:", error);
      throw error;
    }

    // Get the public URL for the newly uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('exam-papers')
      .getPublicUrl(fileName);

    console.log("✅ [Storage Service] Upload Success:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  }
};