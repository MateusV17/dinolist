import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { celebrate, Joi, errors, Segments } from 'celebrate';

import uploadConfig from './config/multer.js';
import Category from './models/Category.js';
import Note from './models/Note.js';
import User from './models/User.js';

import { isAuthenticated } from './middleware/auth.js';
import SendMail from './services/SendMail.js';

import path from 'path';
import {fileURLToPath} from 'url';


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}


const router = Router();
const c = console;

router.get('/', (req, res) => res.redirect('/index.html'));

router.get('/index', isAuthenticated, async (req, res) => {
  try {
    const notes = await Note.readAll();

    res.json(notes);
  } catch (error) {
    throw new Error('Error in list notes');
  }
});


// router.get('/new-note', isAuthenticated, async (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/note-template.html'));
// });

router.post(
  '/dinos',
  isAuthenticated,
  multer(uploadConfig).single('image'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      height: Joi.string(),
      weight: Joi.string(),      
      period_id: Joi.string(),   
      description: Joi.string(),
    }),
  }),
  async (req, res) => {
    try {
      const dino = req.body;
      c.log(dino)
      
      c.log('body', req.body);

      const image = req.file
        ? `/imgs/foods/${req.file.filename}`
        : '';

      const newDino = await Note.create({ ...dino, image });

      res.json(newDino);
    } catch (error) {
      throw new Error('Error in create food');
    }
  }
);

router.put(
  '/dinos/:id',
  isAuthenticated,
  multer(uploadConfig).single('image'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),  
      period_id: Joi.string(),  
      height: Joi.string(),
      weight: Joi.string(),   
      description: Joi.string(), 
      oldImage: Joi.string(), 
    }),
  }),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const dino = req.body;
      const oldImage = req.body.oldImage;

      const image = req.file
        ? `/imgs/foods/${req.file.filename}`
        : oldImage;

      const newDino = await Note.update({ ...dino, image }, id);

      if (newDino) {
        res.json(newDino);
      } else {
        throw new AppError('Note not found.');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Error in update note');
    }
  }
);

router.delete('/dinos/:id', isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (await Note.destroy(id)) {
      res.status(204).send();
    } else {
      res.status(400).json({ error: 'Food not found.' });
    }
  } catch (error) {
    throw new Error('Error in delete food');
  }
});

router.get('/dinos', async (req, res) => {
  res.sendFile(path.join(__dirname, '/../public/edit-dino.html'));
});

router.get('/dinos/:id', isAuthenticated, async (req, res) => {
  const id = parseInt((req.params.id));
  const response = await Note.readDino(id)

 res.json(response);
});

router.post('/dinos/:id', isAuthenticated, async (req, res) => {
  const id = parseInt((req.params.id));
  const response = await Note.readDino(id)

 res.json(response);
});

router.get('/categories', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.readAll();

    res.json(categories);
  } catch (error) {
    throw new Error('Error in list categories');
  }
});

router.post(
  '/users',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email(),
      password: Joi.string().min(8),      
      confirmation_password: Joi.string().min(8),
    }),
  }),
  async (req, res) => {
    try {
      const user = req.body;

      const newUser = await User.create(user);

      await SendMail.createNewUser(user.email);

      res.json(newUser);
    } catch (error) {
      if (
        error.message.includes(
          'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email'
        )
      ) {
        throw new AppError('Email already exists');
      } else {
        throw new AppError('Error in create user');
      }
    }
  }
);

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.readByEmail(email);

    if (!user) {
      throw new Error();
    }

    const { id: userId, password: hash } = user;

    const match = await bcrypt.compareSync(password, hash);

    if (match) {
      const token = jwt.sign(
        { userId },
        process.env.SECRET,
        { expiresIn: 3600 } // 1h
      );

      res.json({ auth: true, token });
    } else {
      throw new Error();
    }
  } catch (error) {
    throw new AppError('User not found', 401);
  }
});

router.use(function (req, res, next) {
  res.status(404).json({
    message: 'Content not found',
  });
});

router.use(errors());

router.use(function (error, req, res, next) {
  console.error(error.stack);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    res.status(500).json({ message: 'Something broke!' });
  }
});



export default router;
