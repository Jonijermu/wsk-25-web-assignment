const loginScreen = () => {
  let loginHtml = '';
  loginHtml += `
  <form id="loginForm" class="form-modal">
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

const userMenuScreen = () => {
  let userMenuHtml = '';
  userMenuHtml += `
    <form id="userMenuForm" class="form-modal">
      <input type="text" name="name" placeholder="Name" />
      <input type="text" name="username" placeholder="Username"  />
      <input type="email" name="email" placeholder="email"  />
      <input type="password" name="password" placeholder="Password"  />
      <input type="file" name="file" />

      <button type="submit" name="action" value="update">Change Information</button>
      <button type="submit"  name="action" value="delete">Delete User</button>
    </form>
  `;
  return userMenuHtml;
}

const restaurantBox  = (restaurant) => {
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

const restaurantMenu = (menu)  => {
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

export {restaurantBox, restaurantMenu, loginScreen, signUpScreen, userMenuScreen, createHeaders};

