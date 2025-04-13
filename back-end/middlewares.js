import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import {validationResult} from 'express-validator';

const createThumbnail = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  let extension = 'jpg';
  if (req.file.mimetype === 'image/png') {
    extension = 'png';
  }

  await sharp(req.file.path)
    .resize(160, 160)
    .toFile(`${req.file.path}_thumb.${extension}`);

  next();
};

const authenticateToken = (req, res, next) => {
  console.log('authenticateToken', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('token', token);
  if (token == null) {
    return res.sendStatus(401);
  }
  try {
    res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).send({message: 'invalid token'});
  }
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};


const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
};


const validationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(', ');
    const error = new Error(messages);
    error.status = 400;
    next(error);
    return;
  }
  next();
};


const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      const error = new Error('Only images and videos are allowed!');
      error.status = 400;
      cb(error, false);
    }
  },
});

export {
  createThumbnail, authenticateToken,
  notFoundHandler, errorHandler, validationErrors, upload,
};
