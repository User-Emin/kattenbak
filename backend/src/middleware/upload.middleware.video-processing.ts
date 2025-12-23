/**
 * VIDEO PROCESSING - FFmpeg transcoding + encryption
 * Called after video upload to optimize and secure the file
 * 
 * Processing steps:
 * 1. Validate video (duration, resolution, codec)
 * 2. Transcode to H.264 (broad compatibility)
 * 3. Compress (reduce file size by 50-70%)
 * 4. Generate thumbnail
 * 5. Encrypt video + thumbnail (AES-256-GCM)
 * 6. Remove temporary files
 */
export async function processUploadedVideo(
  filePath: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<{
  videoUrl: string;
  thumbnailUrl: string;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
}> {
  try {
    console.log(`🎬 Processing uploaded video: ${path.basename(filePath)}`);
    
    // Process video with full pipeline
    const result = await processVideoComplete(filePath, quality);
    
    // Generate public URLs
    const videoFilename = path.basename(result.videoPath);
    const thumbnailFilename = path.basename(result.thumbnailPath);
    
    const videoUrl = getVideoPublicUrl(videoFilename);
    const thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    
    console.log(`✅ Video processing complete:`);
    console.log(`   Video: ${videoUrl}`);
    console.log(`   Thumbnail: ${thumbnailUrl}`);
    console.log(`   Size reduction: ${result.metadata.compressionRatio.toFixed(1)}%`);
    
    return {
      videoUrl,
      thumbnailUrl,
      originalSize: result.metadata.originalSize,
      processedSize: result.metadata.processedSize,
      compressionRatio: result.metadata.compressionRatio,
    };
    
  } catch (error) {
    console.error('Video processing failed:', error);
    
    // Cleanup on error
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore cleanup errors
    }
    
    throw new Error('Video processing failed');
  }
}

