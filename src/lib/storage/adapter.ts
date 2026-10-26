export interface StorageAdapter {
  isConfigured(): boolean;
  saveImage(id: string, buffer: Buffer): Promise<string | null>;
  getImage(id: string): Promise<Buffer | null>;
}

class MemoryOrBlobStorage implements StorageAdapter {
  private cache = new Map<string, { buffer: Buffer; expiresAt: number }>();

  isConfigured(): boolean {
    // Returns true if Vercel Blob or similar token is defined
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.ENABLE_EPHEMERAL_STORAGE === "true");
  }

  async saveImage(id: string, buffer: Buffer): Promise<string | null> {
    if (!this.isConfigured()) return null;

    // Ephemeral cache (1 hour)
    this.cache.set(id, {
      buffer,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
    return `/api/og/image/${id}.png`;
  }

  async getImage(id: string): Promise<Buffer | null> {
    const item = this.cache.get(id);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(id);
      return null;
    }
    return item.buffer;
  }
}

export const storageAdapter = new MemoryOrBlobStorage();
