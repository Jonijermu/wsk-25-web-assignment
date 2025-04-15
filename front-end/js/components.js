const loginScreen = () => {
  let loginHtml = '';
  loginHtml += `
   <form id="loginForm" class="form-modal">
    <div class="form-header">
      <h3>Login</h3>
      <button type="button" name="exitBtn" value="close" class="close-btn">Close</button>
    </div>
    <input type="text" name="username" placeholder="Username" required />
    <input type="password" name="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
  `;
  return loginHtml
}

const signUpScreen = () => {
  let signUpHtml = '';
  signUpHtml += `
  <form id="signUpForm" class="form-modal">
  <div class="form-header">
  <h3>Register</h3>
  <button type="button" name="exitBtn" value="close" class="close-btn">Close</button>
  </div>
      <input type="text" name="name" placeholder="Name" required />
      <input type="text" name="username" placeholder="Username" required />
      <input type="email" name="email" placeholder="email" required />
      <input type="password" name="password" placeholder="Password" required />
      <input type="file" name="file" required/>
      <button type="submit">Register</button>
    </form>
`;
  return signUpHtml;
}

const userMenuScreen = (currentUser) => {
  let userMenuHtml = '';
  userMenuHtml += `
    <form id="userMenuForm" class="form-modal">
    <div class="form-header">
    <h3>Profile</h3>
    <button type="button" name="exitBtn" value="close" class="close-btn">Close</button>
    </div>
      <input type="text" name="name" value="${currentUser.name}" />
      <input type="text" name="username" value="${currentUser.username}"  />
      <input type="email" name="email" value="${currentUser.email}"  />
      <input type="password" name="password" placeholder="Password"  />
      <input type="file" name="file" />

      <button type="submit" name="action" value="update">Change Information</button>
      <button type="submit"  name="action" value="delete">Delete User</button>
    </form>
  `;
  return userMenuHtml;
}

const restaurantBox = (restaurant) => {
  const {name, company, city, address, phone} = restaurant;
  const div = document.createElement('div');
  div.classList.add('restaurant-box');
  div.innerHTML = `
    <img src="./img/heart.png" alt="heart" class="heart-icon">
    <h3>${name}</h3>
    <p>${company}</p>
    <p>${city}</p>
    <p>${address}</p>
    <p>${phone}</p>
    <h3>Menu</h3>
  `;
  return div;
}

const restaurantMenu = (menu) => {
  const {courses} = menu;
  let menuHtml = '';
  courses.forEach(course => {
    menuHtml += `
    <article class="course">
      <p><strong>${course.name}</strong>,
        Price: ${course.price},
        Allergens: ${course.diets}</p>
    </article>
    `;
  });
  return menuHtml

}

const menuTable = (menu) => {
  const {courses} = menu;
  let menuHtml = '';

  courses.forEach(course => {
    menuHtml += `
      <tr>
        <td>${course.name}</td>
        <td>${course.price || '-'}</td>
        <td>${course.diets || '-'}</td>
      </tr>
    `;
  });

  return `
    <thead>
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>Diets</th>
      </tr>
    </thead>
    <tbody>
      ${menuHtml}
    </tbody>
  `;
}

export {
  restaurantBox,
  restaurantMenu,
  loginScreen,
  signUpScreen,
  userMenuScreen,
  menuTable
};

