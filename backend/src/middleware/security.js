/**
 * Security Middleware Configuration
 * Provides comprehensive security hardening for the Express app
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';

// ============================================
// HELMET - Security Headers
// ============================================
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            mediaSrc: ["'self'", "https:", "blob:"],
            connectSrc: ["'self'", "https://storage.googleapis.com"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow video embedding
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
});

// ============================================
// RATE LIMITING
// ============================================

// General API rate limit
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: 15,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health', // Skip health checks
});

// Strict rate limit for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many login attempts, please try again after 15 minutes.',
        retryAfter: 15,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
});

// Upload rate limit
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: {
        error: 'Upload limit reached, please try again later.',
        retryAfter: 60,
    },
});

// Search rate limit (prevent scraping)
export const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: {
        error: 'Too many searches, please slow down.',
    },
});

// ============================================
// INPUT VALIDATION HELPERS
// ============================================

// Validation result handler
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

// Common validation rules
export const validationRules = {
    // Auth validation
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be 3-30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Invalid email address'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase, and number'),
    ],

    login: [
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Invalid email address'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
    ],

    // Video validation
    videoUpload: [
        body('title')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Title must be 1-100 characters')
            .escape(),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must be under 500 characters')
            .escape(),
        body('category')
            .optional()
            .isIn(['tech', 'science', 'education', 'entertainment', 'lifestyle', 'health', 'business', 'other'])
            .withMessage('Invalid category'),
    ],

    // Search validation
    search: [
        query('q')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query must be 1-100 characters')
            .escape(),
    ],

    // Pagination validation
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage('Page must be between 1 and 1000'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('Limit must be between 1 and 50'),
    ],

    // ID parameter validation
    idParam: [
        param('id')
            .trim()
            .notEmpty()
            .withMessage('ID is required')
            .escape(),
    ],
};

// ============================================
// SANITIZATION MIDDLEWARE
// ============================================

// Sanitize request body (remove $ and . for NoSQL injection prevention)
export const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        for (const key of Object.keys(obj)) {
            // Remove keys starting with $ or containing .
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
                continue;
            }

            // Recursively sanitize nested objects
            if (typeof obj[key] === 'object') {
                obj[key] = sanitize(obj[key]);
            }

            // Trim strings and prevent null bytes
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/\0/g, '').trim();
            }
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
};

// ============================================
// REQUEST SIZE LIMITS
// ============================================
export const requestLimits = {
    json: { limit: '1mb' },
    urlencoded: { limit: '1mb', extended: true },
    raw: { limit: '10mb' }, // For video processing
};

// ============================================
// SECURITY LOGGING
// ============================================
export const securityLogger = (req, res, next) => {
    // Log suspicious activity
    const suspiciousPatterns = [
        /(\.\.|\/\/)/,           // Path traversal
        /<script>/i,              // XSS attempt
        /union.*select/i,         // SQL injection
        /\$where|\$regex/i,       // NoSQL injection
    ];

    const fullUrl = req.originalUrl + JSON.stringify(req.body || {});

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(fullUrl)) {
            console.warn(`[SECURITY] Suspicious request from ${req.ip}: ${req.method} ${req.originalUrl}`);
            break;
        }
    }

    next();
};

// ============================================
// ERROR HANDLER (hides internal errors)
// ============================================
export const secureErrorHandler = (err, req, res, next) => {
    // Log full error internally
    console.error('[ERROR]', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Send sanitized error to client
    const statusCode = err.status || err.statusCode || 500;

    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

export default {
    securityHeaders,
    generalLimiter,
    authLimiter,
    uploadLimiter,
    searchLimiter,
    validate,
    validationRules,
    sanitizeInput,
    requestLimits,
    securityLogger,
    secureErrorHandler,
};
