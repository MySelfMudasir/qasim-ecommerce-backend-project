import express from 'express';
import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';

import userRoutes from './routes/userRoutes.js';

import { errorHandler } from './middlewares/middleware.js';

const app = express();

app.use(cors());

// app.use(helmet());

// app.use(morgan('dev'));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Running',
    });
});

app.use('/api/users', userRoutes);

app.use(errorHandler);

export default app;