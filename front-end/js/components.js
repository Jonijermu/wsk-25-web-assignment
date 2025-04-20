// Creates the login modal elements and return the html
const createLoginModal = () => {
  let loginHtml = '';
  loginHtml += `
   <form id="loginForm" class="form-modal">
    <div class="form-header">
      <h3>Login</h3>
      <button type="button" name="exitBtn" value="close" class="close-btn">Close</button>
    </div>
    <input type="text" name="username" placeholder="Username" required />
    <input type="password" name="password" placeholder="Password" required />
    <button type="submit" class="submit-btn">Login</button>
  </form>
  `;
  return loginHtml
}

//Creates the register page elements
const registerScreen = () => {
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
      <label for="file">Your profile picture here</label>
      <input type="file" name="file" accept="image/*" required />
      <button type="submit">Register</button>
    </form>
`;
  return signUpHtml;
}

//Creates the user profile screen
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


      <button type="submit" name="action" value="update">Change Information</button>
      <button type="submit"  name="action" value="delete">Delete User</button>
    </form>
  `;
  return userMenuHtml;
}

//Creates the restaurant boxes
const createRestaurantBox = (restaurant) => {
  const {name, company, city, address, phone} = restaurant;
  const div = document.createElement('div');
  div.classList.add('restaurant-box');
  div.innerHTML = `
    <img src="./img/heart.png" alt="heart" class="heart-icon">
    <h3>${name}</h3>
    <p>Company ${company}</p>
    <p>City ${city}</p>
    <p>Address ${address}</p>
    <p>Phone ${phone}</p>

  `;
  return div;
}

//Creates the restaurant daily menu in the div container boxes
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

//Creates menu table for weekly view
const menuTable = (menu) => {
  const {courses} = menu;

  // Check if the courses array is empty
  if (!courses || courses.length === 0) {
    return `
      <p>No menu available for this day.</p>
    `;
  }

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
  createRestaurantBox,
  restaurantMenu,
  createLoginModal,
  registerScreen,
  userMenuScreen,
  menuTable
};

