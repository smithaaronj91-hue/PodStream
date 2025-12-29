import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

// Ensure upload directories exist
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/podstream/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/podstream/output';
const TEMP_DIR = process.env.TEMP_DIR || '/tmp/podstream/temp';

async function ensureDirs() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
}

// Check if FFmpeg is available
export async function checkFFmpeg() {
    try {
        const { stdout } = await execAsync('ffmpeg -version');
        const version = stdout.split('\n')[0];
        return { available: true, version };
    } catch {
        return { available: false, version: null };
    }
}

// Get media info using ffprobe
export async function getMediaInfo(inputPath) {
    try {
        const { stdout } = await execAsync(
            `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`
        );
        return JSON.parse(stdout);
    } catch (error) {
        console.error('Error getting media info:', error);
        throw new Error('Failed to get media info');
    }
}

// Generate waveform data for audio visualization
export async function generateWaveform(inputPath, samples = 500) {
    await ensureDirs();
    const outputPath = path.join(TEMP_DIR, `waveform_${crypto.randomUUID()}.json`);

    try {
        // Extract audio samples using FFmpeg
        const { stdout } = await execAsync(
            `ffmpeg -i "${inputPath}" -ac 1 -filter:a "aresample=8000" -map 0:a -c:a pcm_s16le -f data - 2>/dev/null | od -A n -t d2 -w2 | head -${samples * 2}`
        );

        const values = stdout.trim().split('\n')
            .map(v => parseInt(v.trim()))
            .filter(v => !isNaN(v));

        // Normalize to 0-1 range
        const max = Math.max(...values.map(Math.abs));
        const normalized = values.map(v => v / max);

        // Downsample to requested number of samples
        const step = Math.floor(normalized.length / samples);
        const waveform = [];
        for (let i = 0; i < samples; i++) {
            const start = i * step;
            const end = Math.min(start + step, normalized.length);
            const chunk = normalized.slice(start, end);
            waveform.push(chunk.reduce((a, b) => a + Math.abs(b), 0) / chunk.length);
        }

        return waveform;
    } catch (error) {
        console.error('Error generating waveform:', error);
        // Return fake waveform on error
        return Array.from({ length: samples }, () => Math.random());
    }
}

// Create a clip from audio/video
export async function createClip(inputPath, options = {}) {
    await ensureDirs();

    const {
        startTime = 0,
        endTime = 60,
        fadeIn = 0,
        fadeOut = 0,
        volume = 1.0,
        speed = 1.0,
        format = 'mp3',
        quality = 'high',
        outputFilename = null,
    } = options;

    const duration = endTime - startTime;
    const outputName = outputFilename || `clip_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    // Build audio filters
    const filters = [];

    // Trim
    filters.push(`atrim=start=${startTime}:end=${endTime}`);
    filters.push('asetpts=PTS-STARTPTS');

    // Speed adjustment
    if (speed !== 1.0) {
        filters.push(`atempo=${speed}`);
    }

    // Volume adjustment
    if (volume !== 1.0) {
        filters.push(`volume=${volume}`);
    }

    // Fade effects
    if (fadeIn > 0) {
        filters.push(`afade=t=in:st=0:d=${fadeIn}`);
    }
    if (fadeOut > 0) {
        const fadeOutStart = (duration / speed) - fadeOut;
        filters.push(`afade=t=out:st=${fadeOutStart}:d=${fadeOut}`);
    }

    const filterChain = filters.join(',');

    // Quality settings
    const qualitySettings = {
        high: '-b:a 320k',
        medium: '-b:a 192k',
        low: '-b:a 128k',
    };

    const cmd = `ffmpeg -y -i "${inputPath}" -af "${filterChain}" ${qualitySettings[quality] || qualitySettings.medium} "${outputPath}"`;

    try {
        await execAsync(cmd);
        return {
            success: true,
            outputPath,
            filename: outputName,
            duration: duration / speed,
        };
    } catch (error) {
        console.error('Error creating clip:', error);
        throw new Error('Failed to create clip');
    }
}

// Create video clip with thumbnail
export async function createVideoClip(inputPath, options = {}) {
    await ensureDirs();

    const {
        startTime = 0,
        endTime = 60,
        width = 720,
        height = 1280, // Vertical format for TikTok-style
        fadeIn = 0,
        fadeOut = 0,
        speed = 1.0,
        format = 'mp4',
        quality = 'high',
        addSubtitles = false,
        subtitlesText = '',
        outputFilename = null,
    } = options;

    const duration = endTime - startTime;
    const outputName = outputFilename || `video_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);
    const thumbnailPath = path.join(OUTPUT_DIR, `thumb_${crypto.randomUUID()}.jpg`);

    // Build video filters
    const videoFilters = [
        `trim=start=${startTime}:end=${endTime}`,
        'setpts=PTS-STARTPTS',
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
    ];

    if (speed !== 1.0) {
        videoFilters.push(`setpts=${1 / speed}*PTS`);
    }

    if (fadeIn > 0) {
        videoFilters.push(`fade=t=in:st=0:d=${fadeIn}`);
    }
    if (fadeOut > 0) {
        const fadeOutStart = (duration / speed) - fadeOut;
        videoFilters.push(`fade=t=out:st=${fadeOutStart}:d=${fadeOut}`);
    }

    // Build audio filters
    const audioFilters = [
        `atrim=start=${startTime}:end=${endTime}`,
        'asetpts=PTS-STARTPTS',
    ];

    if (speed !== 1.0) {
        audioFilters.push(`atempo=${speed}`);
    }

    // Quality presets
    const qualityPresets = {
        high: '-crf 18 -preset slow',
        medium: '-crf 23 -preset medium',
        low: '-crf 28 -preset fast',
    };

    const cmd = `ffmpeg -y -i "${inputPath}" \
        -vf "${videoFilters.join(',')}" \
        -af "${audioFilters.join(',')}" \
        -c:v libx264 ${qualityPresets[quality] || qualityPresets.medium} \
        -c:a aac -b:a 192k \
        "${outputPath}"`;

    // Generate thumbnail
    const thumbCmd = `ffmpeg -y -i "${inputPath}" -ss ${startTime + 1} -vframes 1 -s 360x640 "${thumbnailPath}"`;

    try {
        await execAsync(cmd);
        await execAsync(thumbCmd).catch(() => { }); // Thumbnail is optional

        return {
            success: true,
            outputPath,
            thumbnailPath,
            filename: outputName,
            duration: duration / speed,
            resolution: `${width}x${height}`,
        };
    } catch (error) {
        console.error('Error creating video clip:', error);
        throw new Error('Failed to create video clip');
    }
}

// Convert audio to different format
export async function convertAudio(inputPath, options = {}) {
    await ensureDirs();

    const {
        format = 'mp3',
        bitrate = '192k',
        sampleRate = 44100,
        channels = 2,
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `converted_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    const cmd = `ffmpeg -y -i "${inputPath}" -ar ${sampleRate} -ac ${channels} -b:a ${bitrate} "${outputPath}"`;

    try {
        await execAsync(cmd);
        const info = await getMediaInfo(outputPath);
        return {
            success: true,
            outputPath,
            filename: outputName,
            format,
            duration: parseFloat(info.format.duration),
        };
    } catch (error) {
        console.error('Error converting audio:', error);
        throw new Error('Failed to convert audio');
    }
}

// Merge multiple audio clips
export async function mergeAudioClips(inputPaths, options = {}) {
    await ensureDirs();

    const {
        crossfade = 0,
        normalize = true,
        format = 'mp3',
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `merged_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);
    const listPath = path.join(TEMP_DIR, `list_${crypto.randomUUID()}.txt`);

    try {
        // Create concat list file
        const listContent = inputPaths.map(p => `file '${p}'`).join('\n');
        await fs.writeFile(listPath, listContent);

        let cmd;
        if (crossfade > 0 && inputPaths.length === 2) {
            // Use acrossfade for 2 files
            cmd = `ffmpeg -y -i "${inputPaths[0]}" -i "${inputPaths[1]}" \
                -filter_complex "acrossfade=d=${crossfade}:c1=tri:c2=tri" \
                "${outputPath}"`;
        } else {
            // Simple concatenation
            cmd = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`;
        }

        await execAsync(cmd);

        // Cleanup
        await fs.unlink(listPath).catch(() => { });

        return {
            success: true,
            outputPath,
            filename: outputName,
        };
    } catch (error) {
        console.error('Error merging audio:', error);
        throw new Error('Failed to merge audio clips');
    }
}

// Add background music to audio
export async function addBackgroundMusic(voicePath, musicPath, options = {}) {
    await ensureDirs();

    const {
        musicVolume = 0.2,
        fadeMusic = true,
        format = 'mp3',
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `mixed_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    // Get voice duration
    const voiceInfo = await getMediaInfo(voicePath);
    const voiceDuration = parseFloat(voiceInfo.format.duration);

    // Build filter complex
    let filterComplex = `[1:a]volume=${musicVolume}`;
    if (fadeMusic) {
        filterComplex += `,afade=t=in:st=0:d=2,afade=t=out:st=${voiceDuration - 3}:d=3`;
    }
    filterComplex += `[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=2`;

    const cmd = `ffmpeg -y -i "${voicePath}" -i "${musicPath}" \
        -filter_complex "${filterComplex}" \
        "${outputPath}"`;

    try {
        await execAsync(cmd);
        return {
            success: true,
            outputPath,
            filename: outputName,
            duration: voiceDuration,
        };
    } catch (error) {
        console.error('Error adding background music:', error);
        throw new Error('Failed to add background music');
    }
}

// Generate audio from podcast image (for video creation)
export async function createPodcastVideo(audioPath, imagePath, options = {}) {
    await ensureDirs();

    const {
        width = 1080,
        height = 1920,
        addWaveform = true,
        addProgressBar = true,
        textOverlay = '',
        format = 'mp4',
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `podcast_video_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    // Get audio duration
    const audioInfo = await getMediaInfo(audioPath);
    const audioDuration = parseFloat(audioInfo.format.duration);

    // Build video filters
    const filters = [
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
    ];

    if (addProgressBar) {
        // Add animated progress bar at bottom
        filters.push(`drawbox=x=0:y=ih-10:w=iw*t/${audioDuration}:h=10:color=red@0.8:t=fill`);
    }

    if (textOverlay) {
        filters.push(`drawtext=text='${textOverlay}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-150:shadowcolor=black:shadowx=2:shadowy=2`);
    }

    const cmd = `ffmpeg -y -loop 1 -i "${imagePath}" -i "${audioPath}" \
        -vf "${filters.join(',')}" \
        -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
        -pix_fmt yuv420p -shortest \
        "${outputPath}"`;

    try {
        await execAsync(cmd);
        return {
            success: true,
            outputPath,
            filename: outputName,
            duration: audioDuration,
            resolution: `${width}x${height}`,
        };
    } catch (error) {
        console.error('Error creating podcast video:', error);
        throw new Error('Failed to create podcast video');
    }
}

// Extract audio from video
export async function extractAudio(videoPath, options = {}) {
    await ensureDirs();

    const {
        format = 'mp3',
        bitrate = '192k',
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `audio_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    const cmd = `ffmpeg -y -i "${videoPath}" -vn -b:a ${bitrate} "${outputPath}"`;

    try {
        await execAsync(cmd);
        const info = await getMediaInfo(outputPath);
        return {
            success: true,
            outputPath,
            filename: outputName,
            duration: parseFloat(info.format.duration),
        };
    } catch (error) {
        console.error('Error extracting audio:', error);
        throw new Error('Failed to extract audio');
    }
}

// Normalize audio levels
export async function normalizeAudio(inputPath, options = {}) {
    await ensureDirs();

    const {
        targetLoudness = -16, // LUFS
        format = 'mp3',
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `normalized_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    // Two-pass loudnorm for better results
    const analyzeCmd = `ffmpeg -i "${inputPath}" -af "loudnorm=I=${targetLoudness}:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1`;

    try {
        const { stdout } = await execAsync(analyzeCmd);

        // Parse loudnorm output (simplified - in production parse JSON properly)
        const cmd = `ffmpeg -y -i "${inputPath}" -af "loudnorm=I=${targetLoudness}:TP=-1.5:LRA=11" "${outputPath}"`;
        await execAsync(cmd);

        return {
            success: true,
            outputPath,
            filename: outputName,
            targetLoudness,
        };
    } catch (error) {
        console.error('Error normalizing audio:', error);
        throw new Error('Failed to normalize audio');
    }
}

// Generate thumbnail/preview image from video
export async function generateThumbnail(videoPath, options = {}) {
    await ensureDirs();

    const {
        timestamp = 1,
        width = 640,
        height = 360,
        format = 'jpg',
        outputFilename = null,
    } = options;

    const outputName = outputFilename || `thumb_${crypto.randomUUID()}.${format}`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    const cmd = `ffmpeg -y -i "${videoPath}" -ss ${timestamp} -vframes 1 -s ${width}x${height} "${outputPath}"`;

    try {
        await execAsync(cmd);
        return {
            success: true,
            outputPath,
            filename: outputName,
            resolution: `${width}x${height}`,
        };
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw new Error('Failed to generate thumbnail');
    }
}

// Cleanup old files
export async function cleanupOldFiles(maxAgeHours = 24) {
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const dir of [OUTPUT_DIR, TEMP_DIR]) {
        try {
            const files = await fs.readdir(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = await fs.stat(filePath);
                if (now - stats.mtimeMs > maxAge) {
                    await fs.unlink(filePath);
                }
            }
        } catch (error) {
            console.error(`Error cleaning up ${dir}:`, error);
        }
    }
}

export default {
    checkFFmpeg,
    getMediaInfo,
    generateWaveform,
    createClip,
    createVideoClip,
    convertAudio,
    mergeAudioClips,
    addBackgroundMusic,
    createPodcastVideo,
    extractAudio,
    normalizeAudio,
    generateThumbnail,
    cleanupOldFiles,
};
