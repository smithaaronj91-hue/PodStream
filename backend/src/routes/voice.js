/**
 * Voice Cloning API Routes
 * Endpoints for voice sample upload, cloning, and synthesis
 */

import express from 'express';
import multer from 'multer';
import pool from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';
import { voiceLimiter, validate, validationRules } from '../middleware/security.js';
import {
    validateAudioFile,
    processVoiceSample,
    synthesizeSpeech,
    cleanupTTSFiles,
    cleanupLocalFile,
    checkTTSHealth
} from '../services/voiceService.js';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();
const mkdirAsync = promisify(fs.mkdir);

// Configure multer for file uploads
const UPLOAD_DIR = process.env.VOICE_UPLOAD_DIR || '/tmp/podstream/voice_uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_VOICE_FILE_SIZE || '10485760'); // 10MB

// Ensure upload directory exists
await mkdirAsync(UPLOAD_DIR, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `voice-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/flac'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.wav', '.mp3', '.flac'];

    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only WAV, MP3, and FLAC are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
});

/**
 * Health check for TTS service
 */
router.get('/health', async (req, res) => {
    try {
        const health = await checkTTSHealth();
        res.json(health);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Health check failed' });
    }
});

/**
 * Upload voice sample
 * POST /api/voice/upload
 */
router.post('/upload', authMiddleware, voiceLimiter, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const userId = req.user.userId;
        const filePath = req.file.path;
        const originalFilename = req.file.originalname;
        const fileSize = req.file.size;

        // Validate audio file using TTS service
        const validationResult = await validateAudioFile(filePath);

        if (!validationResult.success) {
            // Clean up file
            await cleanupLocalFile(filePath);
            return res.status(400).json({ error: validationResult.error });
        }

        const metadata = validationResult.data.metadata;

        // Store in database
        const result = await pool.query(
            `INSERT INTO voice_samples 
            (user_id, original_filename, file_path, file_size_bytes, duration_seconds, 
             audio_format, sample_rate, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [
                userId,
                originalFilename,
                filePath,
                fileSize,
                metadata.duration,
                path.extname(originalFilename).substring(1).toLowerCase(),
                metadata.sample_rate,
                'uploaded'
            ]
        );

        const voiceSample = result.rows[0];

        res.status(201).json({
            message: 'Voice sample uploaded successfully',
            sample: {
                id: voiceSample.id,
                filename: voiceSample.original_filename,
                duration: voiceSample.duration_seconds,
                format: voiceSample.audio_format,
                status: voiceSample.status,
                created_at: voiceSample.created_at
            }
        });

    } catch (error) {
        console.error('Voice upload error:', error);
        
        // Clean up file on error
        if (req.file) {
            await cleanupLocalFile(req.file.path);
        }
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        
        res.status(500).json({ error: 'Failed to upload voice sample' });
    }
});

/**
 * Create voice model from sample
 * POST /api/voice/clone
 */
router.post('/clone', authMiddleware, voiceLimiter, async (req, res) => {
    try {
        const { sample_id, name, description, language = 'en' } = req.body;
        const userId = req.user.userId;

        if (!sample_id || !name) {
            return res.status(400).json({ error: 'sample_id and name are required' });
        }

        // Check if sample exists and belongs to user
        const sampleResult = await pool.query(
            'SELECT * FROM voice_samples WHERE id = $1 AND user_id = $2',
            [sample_id, userId]
        );

        if (sampleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Voice sample not found' });
        }

        const sample = sampleResult.rows[0];

        if (sample.status !== 'uploaded') {
            return res.status(400).json({ error: 'Voice sample is not ready for processing' });
        }

        // Update sample status
        await pool.query(
            'UPDATE voice_samples SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['processing', sample_id]
        );

        // Process voice sample
        const processResult = await processVoiceSample(sample.file_path, sample_id);

        if (!processResult.success) {
            // Update status to failed
            await pool.query(
                'UPDATE voice_samples SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['failed', sample_id]
            );
            return res.status(500).json({ error: processResult.error });
        }

        const processedPath = processResult.data.processed_path;

        // Create voice model record
        const modelResult = await pool.query(
            `INSERT INTO voice_models 
            (user_id, voice_sample_id, name, description, model_path, status, language) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [userId, sample_id, name, description, processedPath, 'ready', language]
        );

        // Update sample status to processed
        await pool.query(
            'UPDATE voice_samples SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['processed', sample_id]
        );

        const voiceModel = modelResult.rows[0];

        res.status(201).json({
            message: 'Voice model created successfully',
            model: {
                id: voiceModel.id,
                name: voiceModel.name,
                description: voiceModel.description,
                language: voiceModel.language,
                status: voiceModel.status,
                created_at: voiceModel.created_at
            }
        });

    } catch (error) {
        console.error('Voice cloning error:', error);
        res.status(500).json({ error: 'Failed to create voice model' });
    }
});

/**
 * Synthesize speech with cloned voice
 * POST /api/voice/synthesize
 */
router.post('/synthesize', authMiddleware, voiceLimiter, async (req, res) => {
    try {
        const { model_id, text, output_format = 'mp3' } = req.body;
        const userId = req.user.userId;

        if (!model_id || !text) {
            return res.status(400).json({ error: 'model_id and text are required' });
        }

        if (text.length > 5000) {
            return res.status(400).json({ error: 'Text too long. Maximum 5000 characters.' });
        }

        // Check if model exists and belongs to user
        const modelResult = await pool.query(
            'SELECT * FROM voice_models WHERE id = $1 AND user_id = $2',
            [model_id, userId]
        );

        if (modelResult.rows.length === 0) {
            return res.status(404).json({ error: 'Voice model not found' });
        }

        const model = modelResult.rows[0];

        if (model.status !== 'ready') {
            return res.status(400).json({ error: 'Voice model is not ready' });
        }

        // Create synthesis history record
        const historyResult = await pool.query(
            `INSERT INTO voice_synthesis_history 
            (user_id, voice_model_id, text_input, audio_output_path, format, status) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id`,
            [userId, model_id, text, '', output_format, 'processing']
        );

        const historyId = historyResult.rows[0].id;

        // Synthesize speech
        const synthesisResult = await synthesizeSpeech(text, model.model_path, {
            outputFormat: output_format,
            language: model.language
        });

        if (!synthesisResult.success) {
            // Update status to failed
            await pool.query(
                'UPDATE voice_synthesis_history SET status = $1 WHERE id = $2',
                ['failed', historyId]
            );
            return res.status(500).json({ error: synthesisResult.error });
        }

        const outputPath = synthesisResult.data.output_path;
        const duration = synthesisResult.data.duration;

        // Update synthesis history
        await pool.query(
            `UPDATE voice_synthesis_history 
            SET audio_output_path = $1, duration_seconds = $2, status = $3 
            WHERE id = $4`,
            [outputPath, duration, 'completed', historyId]
        );

        res.json({
            message: 'Speech synthesized successfully',
            synthesis: {
                id: historyId,
                audio_path: outputPath,
                duration: duration,
                format: output_format,
                text_length: text.length
            }
        });

    } catch (error) {
        console.error('Speech synthesis error:', error);
        res.status(500).json({ error: 'Failed to synthesize speech' });
    }
});

/**
 * Get user's voice models
 * GET /api/voice/models
 */
router.get('/models', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT 
                vm.id,
                vm.name,
                vm.description,
                vm.language,
                vm.status,
                vm.quality_score,
                vm.created_at,
                vm.updated_at,
                vs.duration_seconds as sample_duration,
                vs.audio_format as sample_format
            FROM voice_models vm
            LEFT JOIN voice_samples vs ON vm.voice_sample_id = vs.id
            WHERE vm.user_id = $1
            ORDER BY vm.created_at DESC
            LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM voice_models WHERE user_id = $1',
            [userId]
        );

        res.json({
            models: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult.rows[0].count / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching voice models:', error);
        res.status(500).json({ error: 'Failed to fetch voice models' });
    }
});

/**
 * Get specific voice model
 * GET /api/voice/models/:id
 */
router.get('/models/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT 
                vm.*,
                vs.duration_seconds as sample_duration,
                vs.audio_format as sample_format,
                vs.original_filename as sample_filename
            FROM voice_models vm
            LEFT JOIN voice_samples vs ON vm.voice_sample_id = vs.id
            WHERE vm.id = $1 AND vm.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Voice model not found' });
        }

        res.json({ model: result.rows[0] });

    } catch (error) {
        console.error('Error fetching voice model:', error);
        res.status(500).json({ error: 'Failed to fetch voice model' });
    }
});

/**
 * Update voice model metadata
 * PATCH /api/voice/models/:id
 */
router.patch('/models/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { name, description } = req.body;

        if (!name && !description) {
            return res.status(400).json({ error: 'name or description required' });
        }

        // Check if model exists and belongs to user
        const checkResult = await pool.query(
            'SELECT id FROM voice_models WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Voice model not found' });
        }

        // Build update query dynamically
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount}`);
            params.push(name);
            paramCount++;
        }

        if (description) {
            updates.push(`description = $${paramCount}`);
            params.push(description);
            paramCount++;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id, userId);

        const query = `
            UPDATE voice_models 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
            RETURNING *
        `;

        const result = await pool.query(query, params);

        res.json({
            message: 'Voice model updated successfully',
            model: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating voice model:', error);
        res.status(500).json({ error: 'Failed to update voice model' });
    }
});

/**
 * Delete voice model
 * DELETE /api/voice/models/:id
 */
router.delete('/models/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Get model details
        const modelResult = await pool.query(
            'SELECT * FROM voice_models WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (modelResult.rows.length === 0) {
            return res.status(404).json({ error: 'Voice model not found' });
        }

        const model = modelResult.rows[0];

        // Delete from database
        await pool.query('DELETE FROM voice_models WHERE id = $1', [id]);

        // Clean up model file
        if (model.model_path) {
            await cleanupTTSFiles([model.model_path]);
        }

        res.json({ message: 'Voice model deleted successfully' });

    } catch (error) {
        console.error('Error deleting voice model:', error);
        res.status(500).json({ error: 'Failed to delete voice model' });
    }
});

/**
 * Get synthesis history
 * GET /api/voice/history
 */
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT 
                vsh.*,
                vm.name as model_name
            FROM voice_synthesis_history vsh
            JOIN voice_models vm ON vsh.voice_model_id = vm.id
            WHERE vsh.user_id = $1
            ORDER BY vsh.created_at DESC
            LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM voice_synthesis_history WHERE user_id = $1',
            [userId]
        );

        res.json({
            history: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult.rows[0].count / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching synthesis history:', error);
        res.status(500).json({ error: 'Failed to fetch synthesis history' });
    }
});

export default router;
