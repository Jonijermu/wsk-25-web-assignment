import express from 'express';
import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
import favRouter from "./routes/fav-router.js";

const router = express.Router();

// bind base url for all cat routes to catRouter

router.use('/users', userRouter);

router.use('/favorites', favRouter);

router.use('/auth', authRouter);

export default router;
