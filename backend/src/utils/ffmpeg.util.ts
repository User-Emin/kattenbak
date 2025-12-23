/**
 * FFMPEG VIDEO TRANSCODING & OPTIMIZATION UTILITY
 * DRY & Secure video processing for uploaded media
 * 
 * Features:
 * - H.264/H.265 encoding for broad compatibility
 * - Multiple quality presets (low, medium, high)
 * - Automatic resolution scaling
 * - Audio normalization
 * - Metadata stripping (privacy)
 * - Progress tracking
 * - AES-256-GCM encryption after processing
 */

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { encryptAndSaveFile } from './encryption.util';

// DRY: Video processing configuration
export const VIDEO_CONFIG = {
  // Quality presets
  presets: {
    low: {
      videoBitrate: '500k',
      audioBitrate: '64k',
      resolution: '480x?', // Auto height
      crf: 28, // Constant Rate Factor (higher = smaller file, lower quality)
    },
    medium: {
      videoBitrate: '1500k',
      audioBitrate: '128k',
      resolution: '720x?',
      crf: 23,
    },
    high: {
      videoBitrate: '3000k',
      audioBitrate: '192k',
      resolution: '1080x?',
      crf: 20,
    },
  },
  
  // Encoding settings
  codec: {
    video: 'libx264', // H.264 for compatibility
    audio: 'aac',
    container: 'mp4',
  },
  
  // FFmpeg options for optimization
  options: [
    '-movflags', 'faststart', // Enable streaming (move moov atom to start)
    '-preset', 'medium', // Encoding speed vs compression (fast/medium/slow)
    '-profile:v', 'main', // H.264 profile (baseline/main/high)
    '-pix_fmt', 'yuv420p', // Pixel format for compatibility
    '-map_metadata', '-1', // Strip all metadata (privacy)
  ],
};

/**
 * Video processing result
 */
export interface VideoProcessingResult {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  duration: number;
  outputPath: string;
  encrypted: boolean;
}

/**
 * Get video metadata (duration, resolution, codec)
 */
export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  codec: string;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to read video metadata: ${err.message}`));
        return;
      }
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }
      
      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        codec: videoStream.codec_name || 'unknown',
        size: metadata.format.size || 0,
      });
    });
  });
}

/**
 * Transcode and optimize video
 * Returns encrypted file path
 */
export async function transcodeVideo(
  inputPath: string,
  quality: 'low' | 'medium' | 'high' = 'medium',
  onProgress?: (percent: number) => void
): Promise<VideoProcessingResult> {
  const startTime = Date.now();
  const preset = VIDEO_CONFIG.presets[quality];
  const outputPath = inputPath.replace(/\.[^.]+$/, `_optimized.${VIDEO_CONFIG.codec.container}`);
  const tempPath = `${outputPath}.tmp`;
  
  try {
    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;
    
    // Get video metadata for duration (for progress tracking)
    const metadata = await getVideoMetadata(inputPath);
    
    console.log(`🎬 Transcoding video: ${path.basename(inputPath)}`);
    console.log(`   Quality: ${quality}, Original size: ${Math.round(originalSize / 1024 / 1024)}MB`);
    
    // Transcode video
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .videoCodec(VIDEO_CONFIG.codec.video)
        .audioCodec(VIDEO_CONFIG.codec.audio)
        .videoBitrate(preset.videoBitrate)
        .audioBitrate(preset.audioBitrate)
        .size(preset.resolution)
        .outputOptions([
          ...VIDEO_CONFIG.options,
          `-crf ${preset.crf}`,
        ]);
      
      // Progress tracking
      if (onProgress && metadata.duration > 0) {
        command.on('progress', (progress) => {
          const percent = (progress.timemark / metadata.duration) * 100;
          onProgress(Math.min(percent, 100));
        });
      }
      
      // Execute
      command
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .save(tempPath);
    });
    
    // Get processed file size
    const processedStats = await fs.stat(tempPath);
    const processedSize = processedStats.size;
    const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;
    
    console.log(`   ✅ Transcoded: ${Math.round(processedSize / 1024 / 1024)}MB`);
    console.log(`   📉 Compression: ${compressionRatio.toFixed(1)}% smaller`);
    
    // 🔒 ENCRYPT the processed video
    const videoBuffer = await fs.readFile(tempPath);
    await encryptAndSaveFile(videoBuffer, outputPath);
    
    // Cleanup temp files
    await fs.unlink(tempPath);
    await fs.unlink(inputPath); // Remove original unencrypted file
    
    const processingTime = Date.now() - startTime;
    console.log(`   ⏱️  Processing time: ${Math.round(processingTime / 1000)}s`);
    
    return {
      originalSize,
      processedSize,
      compressionRatio,
      duration: metadata.duration,
      outputPath,
      encrypted: true,
    };
    
  } catch (error) {
    // Cleanup on error
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    
    console.error('Video transcoding failed:', error);
    throw new Error('Video transcoding failed');
  }
}

/**
 * Generate video thumbnail
 * Returns encrypted thumbnail path
 */
export async function generateThumbnail(
  videoPath: string,
  timestamp: number = 1 // seconds
): Promise<string> {
  const thumbnailPath = videoPath.replace(/\.[^.]+$/, '_thumb.jpg');
  const tempPath = `${thumbnailPath}.tmp`;
  
  try {
    // Generate thumbnail at specified timestamp
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(tempPath),
          folder: path.dirname(tempPath),
          size: '640x360',
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`Thumbnail generation failed: ${err.message}`)));
    });
    
    // 🔒 ENCRYPT thumbnail
    const thumbBuffer = await fs.readFile(tempPath);
    await encryptAndSaveFile(thumbBuffer, thumbnailPath);
    
    // Cleanup
    await fs.unlink(tempPath);
    
    console.log(`   📸 Thumbnail generated: ${path.basename(thumbnailPath)}`);
    
    return thumbnailPath;
    
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    throw new Error('Thumbnail generation failed');
  }
}

/**
 * Validate video file (format, duration, resolution)
 * Security check before processing
 */
export async function validateVideo(filePath: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const metadata = await getVideoMetadata(filePath);
    
    // Check duration (max 10 minutes for web)
    if (metadata.duration > 600) {
      return {
        valid: false,
        error: 'Video duration exceeds 10 minutes',
      };
    }
    
    // Check resolution (max 4K)
    if (metadata.width > 3840 || metadata.height > 2160) {
      return {
        valid: false,
        error: 'Video resolution exceeds 4K (3840x2160)',
      };
    }
    
    // Check file size (already validated by multer, but double-check)
    if (metadata.size > 100 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Video file size exceeds 100MB',
      };
    }
    
    return { valid: true };
    
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid video file or corrupt data',
    };
  }
}

/**
 * Process video with full pipeline:
 * 1. Validate
 * 2. Transcode
 * 3. Generate thumbnail
 * 4. Encrypt
 */
export async function processVideoComplete(
  inputPath: string,
  quality: 'low' | 'medium' | 'high' = 'medium',
  onProgress?: (percent: number) => void
): Promise<{
  videoPath: string;
  thumbnailPath: string;
  metadata: VideoProcessingResult;
}> {
  // Step 1: Validate
  const validation = await validateVideo(inputPath);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Step 2: Transcode
  const result = await transcodeVideo(inputPath, quality, onProgress);
  
  // Step 3: Generate thumbnail
  const thumbnailPath = await generateThumbnail(result.outputPath, 1);
  
  return {
    videoPath: result.outputPath,
    thumbnailPath,
    metadata: result,
  };
}

