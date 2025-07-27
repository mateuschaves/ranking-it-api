import { UrlUtil } from './url.util';

describe('UrlUtil', () => {
  beforeEach(() => {
    // Reset environment variable for each test
    delete process.env.CDN_BASE_URL;
  });

  describe('getFullUrl', () => {
    it('should return null for empty input', () => {
      expect(UrlUtil.getFullUrl('')).toBeNull();
    });

    it('should handle null and undefined gracefully', () => {
      expect(UrlUtil.getFullUrl(null as any)).toBeNull();
      expect(UrlUtil.getFullUrl(undefined as any)).toBeNull();
    });

    it('should return the same URL if it is already a full URL', () => {
      const fullUrl = 'https://example.com/image.jpg';
      expect(UrlUtil.getFullUrl(fullUrl)).toBe(fullUrl);

      const httpUrl = 'http://example.com/image.jpg';
      expect(UrlUtil.getFullUrl(httpUrl)).toBe(httpUrl);
    });

    it('should construct full URL with default base URL', () => {
      const fileName = 'avatar.jpg';
      const expected = 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg';
      expect(UrlUtil.getFullUrl(fileName)).toBe(expected);
    });

    it('should construct full URL with custom base URL', () => {
      // Temporarily set environment variable
      const originalCdnUrl = process.env.CDN_BASE_URL;
      process.env.CDN_BASE_URL = 'https://custom-cdn.com';
      
      const fileName = 'photo.png';
      const expected = 'https://custom-cdn.com/photo.png';
      expect(UrlUtil.getFullUrl(fileName)).toBe(expected);
      
      // Restore original value
      if (originalCdnUrl) {
        process.env.CDN_BASE_URL = originalCdnUrl;
      } else {
        delete process.env.CDN_BASE_URL;
      }
    });

    it('should remove leading slashes from filename', () => {
      const fileName = '/avatar.jpg';
      const expected = 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg';
      expect(UrlUtil.getFullUrl(fileName)).toBe(expected);

      const fileNameWithMultipleSlashes = '///photo.png';
      const expected2 = 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.png';
      expect(UrlUtil.getFullUrl(fileNameWithMultipleSlashes)).toBe(expected2);
    });
  });

  describe('getAvatarUrl', () => {
    it('should return null for null or undefined avatar', () => {
      expect(UrlUtil.getAvatarUrl(null)).toBeNull();
      expect(UrlUtil.getAvatarUrl(undefined)).toBeNull();
    });

    it('should return null for avatar without url', () => {
      expect(UrlUtil.getAvatarUrl({})).toBeNull();
      expect(UrlUtil.getAvatarUrl({ id: '123' })).toBeNull();
    });

    it('should return full URL for avatar with url', () => {
      const avatar = { url: 'avatar.jpg' };
      const expected = 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg';
      expect(UrlUtil.getAvatarUrl(avatar)).toBe(expected);
    });

    it('should return full URL for avatar with full URL', () => {
      const avatar = { url: 'https://example.com/avatar.jpg' };
      expect(UrlUtil.getAvatarUrl(avatar)).toBe('https://example.com/avatar.jpg');
    });

    it('should handle avatar with url that has leading slashes', () => {
      const avatar = { url: '/avatar.jpg' };
      const expected = 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg';
      expect(UrlUtil.getAvatarUrl(avatar)).toBe(expected);
    });
  });
}); 