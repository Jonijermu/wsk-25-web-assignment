import {
  authMe,
  deleteData,
  fetchData,
  postData,
  postFormData,
  putData,
  getData
} from "./utils.js";

import {
  loginScreen,
  restaurantBox,
  restaurantMenu,
  signUpScreen,
  userMenuScreen
} from "./components.js";

import {getRestaurantsLatLon} from "./map.js"
import {baseUrl, restaurantUrl,} from "./variables.js";

let restaurants = [];
let favorites = []
let weeklyMenu = []
let userToken = null;
let currentUser = null;

let headersUl = document.querySelector('.headers-ul');
const div = document.querySelector('.restaurant-container')
const loginModal = document.querySelector('dialog');
const signUpModal = document.querySelector('dialog');
const userMenuModal = document.querySelector('dialog');

//Getters for restaurant API's
const getRestaurants = async () => {
  try {
    restaurants = await fetchData(restaurantUrl + '/restaurants');
  } catch (error) {
    console.error(error);
  }
}

const getDailyMenu = async (id, lang) => {
  try {
    return await fetchData(`${restaurantUrl}/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
}

const getWeeklyMenu = async (id, lang) => {
  try {
    weeklyMenu = await fetchData(`${restaurantUrl}/restaurants/weekly/${id}/${lang}`)
    console.log(weeklyMenu)
  } catch (error) {
    console.log(error);
  }
}

// API calls for the user
const postUserCredentials = async (credentials) => {
  try {
    const user = await postData(baseUrl + '/auth/login', credentials);
    loginModal.close();
    userToken = user.token;
    currentUser = user.user;
    localStorage.setItem('token', user.token);
    await tokenTest(user.token)
    updateMenu();
    await getFavoritesByUserId()
    createContainerBoxes();
    console.log(favorites)
  } catch (error) {
    console.error(error);
  }
}

const registerUser = async (registerData) => {
  try {
    await postFormData(baseUrl + '/users', registerData);
  } catch (error) {
    console.log(error);
  }
}

const putUser = async (userData) => {
  try {
    await putData(`${baseUrl}/users/${currentUser.user_id}`, userData, userToken);
  } catch (error) {
    console.log(error);
  }
}
const deleteUser = async () => {
  try {
    await deleteData(`${baseUrl}/users/${currentUser.user_id}`, userToken);
    localStorage.removeItem('token');
    userToken = null;
    currentUser = null;
    location.reload();
  } catch (error) {
    console.log(error);
  }
}

const tokenTest = async (token) => {
  try {
    await authMe(baseUrl + '/auth/me', token)
  } catch (error) {
    console.log(error);
  }
}

//API calls for the favorites
const saveToFavorites = async (companyId) => {
  try {
    const data = {company_id: companyId};
    await postData(`${baseUrl}/favorites/`, data, userToken)
  } catch (error) {
    console.log(error);
  }
}

const removeFromFavorites = async (companyId) => {
  try {
    console.log("User:", userToken);
    console.log("Company:", companyId);
    await deleteData(`${baseUrl}/favorites/${companyId}`, userToken);
  } catch (error) {
    console.log(error);
  }
}

const getFavoritesByUserId = async () => {
  try {
    favorites = await getData(`${baseUrl}/favorites/${currentUser.user_id}`, userToken)
  } catch (error) {
    console.log(error);
  }
}


const signUpPage = () => {
  const registerBtn = document.querySelector('#registerBtn');
  registerBtn.addEventListener('click', function () {
    signUpModal.innerHTML = signUpScreen();
    signUpModal.showModal();

    requestAnimationFrame(() => {
      const signUpForm = document.querySelector('#signUpForm');
      signUpForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(signUpForm);
        console.log(formData)
        registerUser(formData);
      });
    });
  });
};


const updateMenu = () => {
  if (currentUser) {
    headersUl.innerHTML = `
    <li id="userMenuBtn">User Menu</li>
    <li id="logoutBtn">Logout</li>
    `;
    document.querySelector('#userMenuBtn').addEventListener('click', () => {
      userMenuModal.innerHTML = userMenuScreen();
      userMenuModal.showModal();
      userMenuPage();

    });
    document.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      userToken = null;
      currentUser = null;
      location.reload();
    });
  }
}


const userMenuPage = () => {
  const userMenuForm = document.querySelector('#userMenuForm');
  userMenuForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const clickedButton = e.submitter;
    const action = clickedButton.value;
    console.log(action)
    if (action === 'update') {
      const formData = new FormData(userMenuForm);
      const userData = {};
      formData.forEach((value, key) => {
        if (!(value instanceof File)) {
          userData[key] = value;
        }
      });
      putUser(userData);
    }
    if (action === 'delete') {
      deleteUser();
    }
  });
};


const loginPage = () => {
  const loginBtn = document.querySelector('#loginBtn');
  loginBtn.addEventListener('click', function () {
    loginModal.innerHTML = loginScreen();
    loginModal.showModal();

    const loginForm = document.querySelector('#loginForm');
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = loginForm.username.value;
      const password = loginForm.password.value;
      const credentials = {
        username: username,
        password: password
      };
      postUserCredentials(credentials);
    });
  });
}


const createContainerBoxes = async () => {
  div.innerHTML = '';
  for (const restaurant of restaurants) {
    try {
      const box = restaurantBox(restaurant);
      div.append(box);
      const menu = await getDailyMenu(restaurant._id, 'en');
      const menuHtml = restaurantMenu(menu);
      box.innerHTML += menuHtml;
      const heartBtn = box.querySelector('.heart-icon')
      if (Array.isArray(favorites) && favorites.some(fav => Number(fav.company_id) === restaurant.companyId)) {
        heartBtn.classList.add('favorite');
      }
      heartBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        if (!currentUser) {
          showNotification(heartBtn, "You need to log in to save favorites!");
          return;
        }

        const companyId = restaurant.companyId
        if (!heartBtn.classList.contains('favorite')) {
          await saveToFavorites(companyId);
          heartBtn.classList.add('favorite');
        } else {
          await removeFromFavorites(companyId);
          heartBtn.classList.remove('favorite');
        }
      });
    } catch (error) {
      console.log(error)
    }
  }
};


const showWeeklyMenu = () => {
  const dayButtons = document.querySelectorAll('button[data-day]');
  dayButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const day = e.target.dataset.day;
      console.log(day);
      for (const restaurant of restaurants) {
        try {
          await getWeeklyMenu(restaurant._id, day);
        } catch (error) {
          console.log(error);
        }
      }
    });
  });
};

const showNotification = (targetElement, message, timeout = 3000) => {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('hidden');

  const rect = targetElement.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  notification.style.top = `${rect.top + scrollTop - 30}px`;
  notification.style.left = `${rect.left + scrollLeft}px`;

  clearTimeout(notification.timer);
  notification.timer = setTimeout(() => {
    notification.classList.add('hidden');
  }, timeout);
};

const init = async () => {
  await getRestaurants();
  await getRestaurantsLatLon(restaurants);
  createContainerBoxes();
  loginPage();
  signUpPage();
}
init();
