import promisePool from '../../utils/database.js';

const listAllFavorites = async () => {
  const [rows] = await promisePool.query(`SELECT * FROM Favorites`);
  console.log('rows', rows)
  return rows;
};

const findFavoriteByUserId = async (id) => {
  const [rows] = await promisePool.query(`SELECT company_id FROM Favorites
         WHERE user_id = ? `, [id]);
  console.log(rows);
  if (rows.length === 0) {
    return false;
  }
  return rows;
};

const addFavorite = async (userId, companyId) => {
  const sql = `INSERT INTO Favorites (user_Id, company_Id)
                                       VALUES (?, ?)`;
  const params = [userId, companyId];
  const rows = await promisePool.query(sql, params);
  console.log('row', rows);
  if (rows[0].affectedRows ===0) {
    return false;
  }
  return {user_id: rows[0].insertId}
};

const deleteFavorite = async (userId, company_id) => {
  const [result] =  await promisePool.query(`
                  DELETE FROM Favorites
                  WHERE company_id = ?
                  AND user_id = ?`,
                  [company_id, userId]
  );
  if (result.affectedRows === 0) {
    return false;
  }
  return true;
};

export {listAllFavorites, findFavoriteByUserId, addFavorite, deleteFavorite}
