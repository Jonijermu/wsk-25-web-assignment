import {
  listAllFavorites,
  addFavorite,
  findFavoriteByUserId,
  deleteFavorite
}
  from "../models/fav-model.js";

const getFavorite = async (req, res, next) => {
  try {
    const favorites = await listAllFavorites();
    res.json(favorites)
  } catch (error) {
    next(error);
  }
};

const getFavoriteByUserId = async (req, res, next) => {
  try {
    if (res.locals.user.user_id !== Number(req.params.id)) {
      const error = new Error("Don't have access");
      error.status = 403;
      return next(error);
    }
    const favorites = await findFavoriteByUserId(req.params.id);
    res.json(favorites)
  } catch (error) {
    next(error);
  }
}

const postFavorite = async (req, res,  next) => {
  try {
    const userId = res.locals.user.user_id;
    const result = await addFavorite(userId, req.body.company_id);
    res.status(201).json({ message: "New Favorite Added", user_id: result.user_id });
  } catch (error) {
    next(error);
  }
};


const removeFavorite = async (req, res, next) => {
  try {
    const result = await deleteFavorite(res.locals.user.user_id, req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Favorite not found or already removed" });
    }
    res.status(200).json({ message: "Favorite successfully removed", user_id: res.locals.user.user_id });
  } catch (error) {
    next(error);
  }
};

export {postFavorite, getFavorite, removeFavorite, getFavoriteByUserId};
