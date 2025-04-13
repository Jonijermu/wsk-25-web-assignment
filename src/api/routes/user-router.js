import express from 'express';
import {body} from 'express-validator';

import {
  deleteUser,
  getUser,
  getUserById,
  postUser,
  putUser,
} from '../controllers/user-controller.js';
import {
  authenticateToken,
  createThumbnail,
  upload,
  validationErrors
} from "../../middlewares.js";

const userRouter = express.Router();

userRouter.route('/').get(getUser).post(
  upload.single('file'),
  body('email').trim().isEmail(),
  body('username').trim().isLength({min: 3, max: 20}).isAlphanumeric(),
  body('password').trim().isLength({min: 8}),
  validationErrors,
  createThumbnail,
  postUser);

userRouter.route('/:id').get(getUserById).put(authenticateToken, putUser).delete(authenticateToken, deleteUser);


export default userRouter;
