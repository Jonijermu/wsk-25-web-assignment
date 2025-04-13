import {
  addUser,
  deleteUserById,
  findUserById,
  listAllUsers,
  modifyUser,
} from "../models/user-model.js";

import bcrypt from "bcrypt";
import {validationResult} from 'express-validator';


const getUser = async (req, res) => {
  const users = await listAllUsers();
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await findUserById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
};

const postUser = async (req, res, next) => {

  if (!req.file) {

    const error = new Error('Invalid or missing file');
    error.status = 400;
    next(error);
  }
  req.body.profile_picture = req.file.filename;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid or missing fields');
    error.status = 400;
    return next(error);
  }
  req.body.password = bcrypt.hashSync(req.body.password, 10);
  const result = await addUser(req.body);
  res.status(201);
  res.json({message: "new user  Added", user_id: result.user_id});
};


const deleteUser = async (req, res, next) => {
  if (res.locals.user.user_id !== Number(req.params.id)) {
    const error = new Error("Don't have access");
    error.status = 403;
    return next(error);
  }
  const user = await deleteUserById(req.params.id);
  if (user.message) {
    res.status(200).json({message: 'User deleted successfully', user: user});

  } else {
    res.sendStatus(404);
  }
};

const putUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid or missing fields');
    error.status = 400;
    return next(error);
  }
  if (res.locals.user.user_id !== Number(req.params.id)) {
    const error = new Error("Don't have access");
    error.status = 403;
    return next(error);
  }
  const user = await modifyUser(req.body, req.params.id);
  if (user) {
    res.status(200);
    res.json({message: 'User updated successfully'});
  } else {
    res.sendStatus(403);
  }
};

export {getUser, getUserById, postUser, deleteUser, putUser};
