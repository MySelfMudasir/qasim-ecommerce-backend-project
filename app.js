import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { apiLimiter } from './src/middlewares/rateLimit.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
// import cookieParser from 'cookie-parser';

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


// app.use(helmet());
// app.use(morgan('dev'));
app.use(express.json());
app.use(apiLimiter);
// app.use(cookieParser());


app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Running',
    });
});



app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);


// Global error handler middleware
app.use(errorHandler);

export default app;