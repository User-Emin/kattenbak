// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRY VIDEO URL VALIDATOR & HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Extract Vimeo video ID from URL
 * Supports: vimeo.com/ID, player.vimeo.com/video/ID
 */
export function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Validate video URL (YouTube or Vimeo)
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return true; // Allow empty
  return getYouTubeId(url) !== null || getVimeoId(url) !== null;
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnail(url: string): string | null {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }
  
  // Vimeo requires API call, return placeholder
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }
  
  return null;
}
