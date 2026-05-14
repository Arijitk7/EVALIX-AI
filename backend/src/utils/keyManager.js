import dotenv from 'dotenv';
dotenv.config();

class KeyRotationManager {
  constructor() {
    // Read the comma-separated keys from the .env file or fallback to single key
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    this.keys = keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    this.currentIndex = 0;

    if (this.keys.length === 0) {
      console.error("❌ CRITICAL: No API keys found in GEMINI_API_KEYS or GEMINI_API_KEY environment variables.");
    } else {
      console.log(`✅ [Key Manager] Initialized with pool of ${this.keys.length} API keys for high-concurrency rotation.`);
    }
  }

  // Get the key we are currently pointing to
  getCurrentKey() {
    return this.keys[this.currentIndex];
  }

  // Move to the next key in the array
  rotateKey() {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    console.log(`🔄 [Key Manager] Key exhausted/busy. Rotating to Key #${this.currentIndex + 1} of ${this.keys.length}`);
    return this.getCurrentKey();
  }

  // Helper to know how many retries we should attempt (one for each key)
  getTotalKeys() {
    return this.keys.length;
  }
}

// Export a single instance so the whole app shares the same rotation state
export const apiKeyManager = new KeyRotationManager();