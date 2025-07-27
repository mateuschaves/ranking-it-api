export class UrlUtil {
  private static readonly CDN_BASE_URL = process.env.CDN_BASE_URL || 'http://ranking-attachments.s3.us-east-1.amazonaws.com';

  static getFullUrl(fileName: string): string | null {
    if (!fileName) return null;
    
    // Se já é uma URL completa, retorna como está
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      return fileName;
    }
    
    // Remove barras iniciais se houver
    const cleanFileName = fileName.replace(/^\/+/, '');
    
    return `${this.CDN_BASE_URL}/${cleanFileName}`;
  }

  static getAvatarUrl(avatar: any): string | null {
    if (!avatar || !avatar.url) return null;
    return this.getFullUrl(avatar.url);
  }
} 