import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import mediaProcessor from '../services/mediaProcessor.js';

const router = express.Router();

// Configure multer for file uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/podstream/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/podstream/output';

// Ensure directories exist
async function ensureDirs() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

// Download file from URL
async function downloadFromUrl(url, destPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = require('fs').createWriteStream(destPath);

        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                require('fs').unlinkSync(destPath);
                return downloadFromUrl(response.headers.location, destPath).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                return reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(destPath);
            });
        }).on('error', (err) => {
            file.close();
            reject(err);
        });
    });
}

// Get file path - either from upload or download from URL
async function getFilePath(req) {
    await ensureDirs();

    if (req.file?.path) {
        return req.file.path;
    }

    if (req.body.filePath) {
        // Check if it's a URL
        if (req.body.filePath.startsWith('http://') || req.body.filePath.startsWith('https://')) {
            const filename = `download_${crypto.randomUUID()}.mp3`;
            const destPath = path.join(UPLOAD_DIR, filename);
            await downloadFromUrl(req.body.filePath, destPath);
            return destPath;
        }
        return req.body.filePath;
    }

    return null;
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureDirs();
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac',
            'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
            'image/jpeg', 'image/png', 'image/webp', 'image/gif'
        ];
        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Job tracking for async processing
const jobs = new Map();

// Helper to create a job
function createJob(type) {
    const jobId = crypto.randomUUID();
    const job = {
        id: jobId,
        type,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        result: null,
        error: null,
    };
    jobs.set(jobId, job);
    return job;
}

function updateJob(jobId, updates) {
    const job = jobs.get(jobId);
    if (job) {
        Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    }
    return job;
}

// Cleanup old jobs (keep for 1 hour)
setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs) {
        if (now - new Date(job.createdAt).getTime() > 60 * 60 * 1000) {
            jobs.delete(id);
        }
    }
}, 5 * 60 * 1000);

// ============= ROUTES =============

// Check FFmpeg availability
router.get('/status', async (req, res) => {
    try {
        const ffmpegStatus = await mediaProcessor.checkFFmpeg();
        res.json({
            status: 'ok',
            ffmpeg: ffmpegStatus,
            uploadDir: UPLOAD_DIR,
            outputDir: OUTPUT_DIR,
            activeJobs: jobs.size,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get job status
router.get('/jobs/:jobId', (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
});

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get media info
        let mediaInfo = null;
        try {
            mediaInfo = await mediaProcessor.getMediaInfo(req.file.path);
        } catch {
            // Not all files have media info
        }

        res.json({
            success: true,
            file: {
                id: crypto.randomUUID(),
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                mediaInfo,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get media info
router.post('/info', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file?.path || req.body.filePath;
        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const info = await mediaProcessor.getMediaInfo(filePath);
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate waveform data
router.post('/waveform', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file?.path || req.body.filePath;
        const samples = parseInt(req.body.samples) || 500;

        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const waveform = await mediaProcessor.generateWaveform(filePath, samples);
        res.json({ waveform, samples: waveform.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create audio clip
router.post('/clip/audio', upload.single('file'), async (req, res) => {
    try {
        const filePath = await getFilePath(req);
        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const options = {
            startTime: parseFloat(req.body.startTime) || 0,
            endTime: parseFloat(req.body.endTime) || 60,
            fadeIn: parseFloat(req.body.fadeIn) || 0,
            fadeOut: parseFloat(req.body.fadeOut) || 0,
            volume: parseFloat(req.body.volume) || 1.0,
            speed: parseFloat(req.body.speed) || 1.0,
            format: req.body.format || 'mp3',
            quality: req.body.quality || 'high',
        };

        // Create job for tracking
        const job = createJob('audio_clip');
        updateJob(job.id, { status: 'processing', progress: 10 });

        // Process async
        mediaProcessor.createClip(filePath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            message: 'Processing started',
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create video clip
router.post('/clip/video', upload.single('file'), async (req, res) => {
    try {
        const filePath = await getFilePath(req);

        const options = {
            startTime: parseFloat(req.body.startTime) || 0,
            endTime: parseFloat(req.body.endTime) || 60,
            width: parseInt(req.body.width) || 720,
            height: parseInt(req.body.height) || 1280,
            fadeIn: parseFloat(req.body.fadeIn) || 0,
            fadeOut: parseFloat(req.body.fadeOut) || 0,
            speed: parseFloat(req.body.speed) || 1.0,
            format: req.body.format || 'mp4',
            quality: req.body.quality || 'high',
        };

        const job = createJob('video_clip');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.createVideoClip(filePath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Convert audio format
router.post('/convert', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file?.path || req.body.filePath;
        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const options = {
            format: req.body.format || 'mp3',
            bitrate: req.body.bitrate || '192k',
            sampleRate: parseInt(req.body.sampleRate) || 44100,
            channels: parseInt(req.body.channels) || 2,
        };

        const job = createJob('convert');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.convertAudio(filePath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Merge audio clips
router.post('/merge', upload.array('files', 10), async (req, res) => {
    try {
        const filePaths = req.files?.map(f => f.path) || JSON.parse(req.body.filePaths || '[]');
        if (filePaths.length < 2) {
            return res.status(400).json({ error: 'At least 2 files required' });
        }

        const options = {
            crossfade: parseFloat(req.body.crossfade) || 0,
            normalize: req.body.normalize !== 'false',
            format: req.body.format || 'mp3',
        };

        const job = createJob('merge');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.mergeAudioClips(filePaths, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add background music
router.post('/add-music', upload.fields([
    { name: 'voice', maxCount: 1 },
    { name: 'music', maxCount: 1 }
]), async (req, res) => {
    try {
        const voicePath = req.files?.voice?.[0]?.path || req.body.voicePath;
        const musicPath = req.files?.music?.[0]?.path || req.body.musicPath;

        if (!voicePath || !musicPath) {
            return res.status(400).json({ error: 'Both voice and music files required' });
        }

        const options = {
            musicVolume: parseFloat(req.body.musicVolume) || 0.2,
            fadeMusic: req.body.fadeMusic !== 'false',
            format: req.body.format || 'mp3',
        };

        const job = createJob('add_music');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.addBackgroundMusic(voicePath, musicPath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create podcast video from audio + image
router.post('/podcast-video', upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const audioPath = req.files?.audio?.[0]?.path || req.body.audioPath;
        const imagePath = req.files?.image?.[0]?.path || req.body.imagePath;

        if (!audioPath || !imagePath) {
            return res.status(400).json({ error: 'Both audio and image files required' });
        }

        const options = {
            width: parseInt(req.body.width) || 1080,
            height: parseInt(req.body.height) || 1920,
            addProgressBar: req.body.addProgressBar !== 'false',
            textOverlay: req.body.textOverlay || '',
            format: req.body.format || 'mp4',
        };

        const job = createJob('podcast_video');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.createPodcastVideo(audioPath, imagePath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Extract audio from video
router.post('/extract-audio', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file?.path || req.body.filePath;
        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const options = {
            format: req.body.format || 'mp3',
            bitrate: req.body.bitrate || '192k',
        };

        const job = createJob('extract_audio');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.extractAudio(filePath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Normalize audio levels
router.post('/normalize', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file?.path || req.body.filePath;
        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const options = {
            targetLoudness: parseFloat(req.body.targetLoudness) || -16,
            format: req.body.format || 'mp3',
        };

        const job = createJob('normalize');
        updateJob(job.id, { status: 'processing', progress: 10 });

        mediaProcessor.normalizeAudio(filePath, options)
            .then(result => {
                updateJob(job.id, { status: 'completed', progress: 100, result });
            })
            .catch(error => {
                updateJob(job.id, { status: 'failed', error: error.message });
            });

        res.json({
            jobId: job.id,
            checkStatus: `/api/process/jobs/${job.id}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate thumbnail
router.post('/thumbnail', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file?.path || req.body.filePath;
        if (!filePath) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const options = {
            timestamp: parseFloat(req.body.timestamp) || 1,
            width: parseInt(req.body.width) || 640,
            height: parseInt(req.body.height) || 360,
            format: req.body.format || 'jpg',
        };

        const result = await mediaProcessor.generateThumbnail(filePath, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve processed files
router.get('/download/:filename', async (req, res) => {
    try {
        const filePath = path.join(OUTPUT_DIR, req.params.filename);
        await fs.access(filePath);
        res.download(filePath);
    } catch {
        res.status(404).json({ error: 'File not found' });
    }
});

// Cleanup old files
router.post('/cleanup', async (req, res) => {
    try {
        const maxAgeHours = parseInt(req.body.maxAgeHours) || 24;
        await mediaProcessor.cleanupOldFiles(maxAgeHours);
        res.json({ success: true, message: `Cleaned up files older than ${maxAgeHours} hours` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
