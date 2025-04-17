import promisePool from '../../utils/database.js'

const listAllUsers = async () => {
  const [rows] = await promisePool.query(`

    SELECT *
    FROM Users`);
  console.log('row', rows);
  return rows;
};

const findUserById = async (id) => {
  const [rows] = await promisePool.query(`

    SELECT Users.*, Favorites.company_id
    FROM Users
    LEFT JOIN Favorites ON Users.user_id = Favorites.user_id
    WHERE Users.user_id = ?
  `, [id]);

  console.log('row', rows);
  if (rows.length === 0) {
    return false;
  }

  const favoriteCompanies = rows
    .filter(row => row.company_id !== null)
    .map(row => row.company_id);

  return {
    user_id: rows[0].user_id,
    name: rows[0].name,
    username: rows[0].username,
    email: rows[0].email,
    password: rows[0].password,
    companyId: favoriteCompanies
  };
};

const addUser = async (user) => {
  const {name, username, email, password, profile_picture} = user;
  const sql = `

  INSERT INTO Users
  (name, username, email, password, profile_picture)
  VALUES (?, ?, ?, ?, ?)`;

  const params = [name, username, email, password, profile_picture];
  const rows = await promisePool.query(sql, params);
  console.log('row', rows);
  if (rows[0].affectedRows === 0) {
    return false;
  }
  return {user_id: rows[0].insertId};
};

const deleteUserById = async (id) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(`

    DELETE
    FROM Users
    WHERE user_id = ?`,
      [id]);
    console.log('row', rows)
    if (rows.affectedRows === 0) {
      return {message: 'User not found'};
    }
    await connection.commit();
    return {message: 'success'};
  } catch (error) {
    await connection.rollback();
    console.error('Transaction rolled back due to error:', error);
    return {message: 'Transaction failed'};
  } finally {
    connection.release();
  }
};

const modifyUser = async (user, id) => {
  const sql = promisePool.format(`

  UPDATE Users
  SET ?
  WHERE user_id = ?`,
    [user, id]);

  const rows = await promisePool.execute(sql);
  console.log('row', rows);
  if (rows[0].affectedRows === 0) {
    return false;
  }
  return rows[0];
}


const login = async (user) => {
  const sql = `
  SELECT *
  FROM Users
  WHERE username = ?`;

  const [rows] = await promisePool.execute(sql, [user]);
  console.log('rows', rows);
  if (rows.length === 0) {
    return false;
  }
  const userData = rows[0];
  const profilePictureUrl = `/uploads/${userData.profile_picture}`;

  return {
    ...userData,
    profile_picture: profilePictureUrl,
  };
};

export {listAllUsers, findUserById, addUser, deleteUserById, modifyUser, login};
