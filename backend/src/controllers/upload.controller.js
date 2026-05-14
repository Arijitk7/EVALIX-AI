import { StorageService } from '../services/storage.service.js';

export const UploadController = {
  async handleFileUpload(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file provided. Please upload an image or PDF." });
      }

      // Pass the file data to the Storage Service
      const fileUrl = await StorageService.uploadExamPaper(
        file.buffer, 
        file.originalname, 
        file.mimetype
      );

      // Return the URL so the frontend can use it in the /submit call
      return res.status(200).json({
        message: "File uploaded successfully",
        fileUrl: fileUrl
      });

    } catch (error) {
      console.error("[Controller] Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload file to storage" });
    }
  }
};