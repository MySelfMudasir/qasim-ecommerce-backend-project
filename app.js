import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import adminRoutes from './admin/routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { apiLimiter } from './src/middlewares/rateLimit.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const app = express();


app.use(cors());
// app.use(
//     cors({
//         origin: [
//             'http://localhost:4200',
//             'http://localhost:56560',
//             'https://myselfmudasir.github.io',
//             'https://qasim-ecommerce-project.onrender.com',
//         ],
//         credentials: true
//     })
// );


// app.use(
//     helmet({
//         crossOriginResourcePolicy: {
//             policy: "cross-origin",
//         },
//     })
// );
// app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(apiLimiter);
app.use(cookieParser());


app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Running',
    });
});



// app.use('/uploads', express.static('uploads'));
app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin/auth', adminRoutes);


// Global error handler middleware
app.use(errorHandler);

export default app;