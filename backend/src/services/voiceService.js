/**
 * Voice Service
 * Handles communication with Python TTS service and voice-related operations
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://localhost:5001';
const TTS_TIMEOUT = parseInt(process.env.TTS_TIMEOUT || '60000'); // 60 seconds

/**
 * Check if TTS service is healthy
 */
export async function checkTTSHealth() {
    try {
        const response = await axios.get(`${TTS_SERVICE_URL}/health`, {
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('TTS service health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
    }
}

/**
 * Validate audio file using TTS service
 */
export async function validateAudioFile(filePath) {
    try {
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(filePath));

        const response = await axios.post(
            `${TTS_SERVICE_URL}/validate-audio`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: TTS_TIMEOUT
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Audio validation failed:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

/**
 * Process voice sample for cloning
 */
export async function processVoiceSample(filePath, sampleId) {
    try {
        const response = await axios.post(
            `${TTS_SERVICE_URL}/process-voice-sample`,
            {
                file_path: filePath,
                sample_id: sampleId
            },
            {
                timeout: TTS_TIMEOUT
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Voice sample processing failed:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

/**
 * Synthesize speech using cloned voice
 */
export async function synthesizeSpeech(text, voiceSamplePath, options = {}) {
    try {
        const { outputFormat = 'mp3', language = 'en' } = options;

        const response = await axios.post(
            `${TTS_SERVICE_URL}/synthesize`,
            {
                text,
                voice_sample_path: voiceSamplePath,
                output_format: outputFormat,
                language
            },
            {
                timeout: TTS_TIMEOUT * 2 // Longer timeout for synthesis
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Speech synthesis failed:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

/**
 * Clean up temporary files via TTS service
 */
export async function cleanupTTSFiles(filePaths) {
    try {
        const response = await axios.post(
            `${TTS_SERVICE_URL}/cleanup`,
            {
                files: filePaths
            },
            {
                timeout: 10000
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('File cleanup failed:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

/**
 * Download generated audio file from TTS service
 */
export async function downloadTTSAudio(filename, outputPath) {
    try {
        const response = await axios.get(
            `${TTS_SERVICE_URL}/download/${filename}`,
            {
                responseType: 'stream',
                timeout: TTS_TIMEOUT
            }
        );

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve({ success: true, path: outputPath }));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Audio download failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Clean up local file
 */
export async function cleanupLocalFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
            return true;
        }
        return true;
    } catch (error) {
        console.error('Local file cleanup failed:', error.message);
        return false;
    }
}
