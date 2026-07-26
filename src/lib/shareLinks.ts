/**
 * Utility functions for generating shareable links
 */

/**
 * Get the application's base URL
 * Uses environment variable in production, falls back to current origin in development
 */
export const getBaseUrl = (): string => {
  // Check if we're in production
  if (import.meta.env.PROD) {
    return 'https://mytuta.org';
  }
  
  // In development, use the current origin (e.g., http://localhost:5001)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for SSR or edge cases
  return 'https://mytuta.org';
};

/**
 * Generate a shareable link for content
 * @param contentType - Type of content (lesson, flashcards, quiz, etc.)
 * @param contentId - Unique identifier for the content
 * @returns Full shareable URL
 */
export const generateShareLink = (contentType: string, contentId: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/share/${contentType}/${contentId}`;
};

/**
 * Generate a unique content ID
 * Uses timestamp and random string for uniqueness
 * @returns Unique content ID
 */
export const generateContentId = (): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;
};

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

