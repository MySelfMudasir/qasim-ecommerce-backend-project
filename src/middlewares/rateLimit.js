import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,

    handler: (req, res) => {
        console.log('Rate limit exceeded by IP:', req.ip);

        res.status(429).json({
            success: false,
            message: 'Too many requests'
        });
    }
});