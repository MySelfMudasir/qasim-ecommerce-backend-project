import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { apiLimiter } from './src/middlewares/rateLimit.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

// app.use(cors());
app.use(
    cors({
        origin: [
            'http://localhost:4200'
        ],
        credentials: true
    })
);


app.use(helmet());
// app.use(morgan('dev'));
app.use(express.json());
app.use(apiLimiter);


app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Running',
    });
});


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/admin', adminRoutes);


// Global error handler middleware
app.use(errorHandler);

export default app;