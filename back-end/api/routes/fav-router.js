import {
  getFavorite,
  postFavorite,
  getFavoriteByUserId, removeFavorite
} from "../controllers/fav-controller.js";
import express from 'express';
import {authenticateToken} from "../../middlewares.js";


const favRouter = express.Router();

favRouter.route('/').get(getFavorite).post(authenticateToken,postFavorite);

favRouter.route('/:id').delete(authenticateToken, removeFavorite).get(authenticateToken, getFavoriteByUserId);

export default favRouter;
