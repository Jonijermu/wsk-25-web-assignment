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
  loginScreen, menuTable,
  restaurantBox,
  restaurantMenu,
  signUpScreen,
  userMenuScreen
} from "./components.js";

import {
  createMap,
  favoriteMarker,
  getRestaurantsLatLon, userMarker,
  zoomRestaurant
} from "./map.js"
import {baseUrl, restaurantUrl, uploadsUrl,} from "./variables.js";

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
const menuDisplay = document.querySelector('.menu-display');
const searchform = document.querySelector('.search-form');
let box;

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

const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error)
    );
  });
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  return Math.sqrt(((lat2 - lat1) ** 2) + ((lon2 - lon1) ** 2));
}

const findNearestRestaurant = async (restaurants) => {
  const user = await getUserLocation();
  userMarker(user);
  let closestRestaurant = null;
  let minDistance = Infinity;
  for (let rest of restaurants) {
    const restLat = rest.location.coordinates[1];
    const restLon = rest.location.coordinates[0];
    const distance = calculateDistance(
      user.coords.latitude, user.coords.longitude, restLat, restLon
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestRestaurant = rest;
    }
  }
  zoomRestaurant(closestRestaurant);
  const menu = await getDailyMenu(closestRestaurant._id, 'en');
  menuDisplay.innerHTML = menuTable(menu);
  showWeeklyMenu(closestRestaurant)

};

const signUpPage = () => {
  const registerBtn = document.querySelector('#registerBtn');
  registerBtn.addEventListener('click', function () {
    signUpModal.innerHTML = signUpScreen();
    signUpModal.showModal();

    const closeBtn = document.querySelector('.close-btn')
    closeBtn.addEventListener('click', function () {
      signUpModal.close();
    })

    requestAnimationFrame(() => {
      const signUpForm = document.querySelector('#signUpForm');
      signUpForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(signUpForm);
        console.log(formData)
        await registerUser(formData);

        const username = formData.get('username');
        const password = formData.get('password');

        if (username && password) {
          const credentials = {username, password};
          await postUserCredentials(credentials);
        }
      });
    });
  });
};


const updateMenu = () => {
  if (currentUser) {
    console.log(currentUser.profile_picture)
    console.log(`${uploadsUrl}${currentUser.profile_picture}_thumb.png`);
    headersUl.innerHTML = `
    <img class="profile-pic" src="${uploadsUrl}${currentUser.profile_picture}_thumb.png" alt="profile-pic">
    <li id="userMenuBtn">User Menu</li>
    <li id="logoutBtn">Logout</li>
    `;
    document.querySelector('#userMenuBtn').addEventListener('click', () => {
      userMenuModal.innerHTML = userMenuScreen(currentUser);
      userMenuModal.showModal();
      userMenuPage();
      const closeBtn = document.querySelector('.close-btn')
      closeBtn.addEventListener('click', function (e) {
        userMenuModal.close();
      })

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
  if (currentUser) {
    const userMenuForm = document.querySelector('#userMenuForm');
    userMenuForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const clickedButton = e.submitter;
      const action = clickedButton.value;
      console.log(action);
      if (action === 'update') {
        const formData = new FormData(userMenuForm);
        const userData = {};
        formData.forEach((value, key) => {
          if (!(value instanceof File) && value.trim() !== '') {
            userData[key] = value;
          }
        });
        const fileInput = userMenuForm.querySelector('input[type="file"]');
        console.log(fileInput)
        if (Object.keys(userData).length > 0) {
          putUser(userData);
        }
      }
      if (action === 'delete') {
        deleteUser();
      }
    });
  }
};

const loginPage = () => {
  const loginBtn = document.querySelector('#loginBtn');
  loginBtn.addEventListener('click', function () {
    loginModal.innerHTML = loginScreen();
    loginModal.showModal();
    const closeBtn = document.querySelector('.close-btn')
    closeBtn.addEventListener('click', function (e) {
      loginModal.close();
    })
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


const createContainerBoxes = async (restaurantList) => {
  div.innerHTML = '';
  console.log('pyöriii')
  findNearestRestaurant(restaurants)
  if (!restaurantList) {
    restaurantList = restaurants;
  }
  for (const restaurant of restaurantList) {
    try {
      box = restaurantBox(restaurant);
      div.append(box);
      const menu = await getDailyMenu(restaurant._id, 'en');
      const menuHtml = restaurantMenu(menu);
      box.innerHTML += menuHtml;
      const heartBtn = box.querySelector('.heart-icon')
      if (Array.isArray(favorites) && favorites.some(fav => Number(fav.company_id) === restaurant.companyId)) {
        heartBtn.classList.add('favorite');
      }
      box.addEventListener('click', async function () {
        try {
          const menu = await getDailyMenu(restaurant._id, 'en');
          menuDisplay.innerHTML = menuTable(menu);
          zoomRestaurant(restaurant);
          showWeeklyMenu(restaurant)
        } catch (error) {
          console.log(error);
        }
      });
      heartBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
          showNotification(heartBtn, "You need to log in to save favorites!");
          return;
        }

        const companyId = restaurant.companyId
        if (!heartBtn.classList.contains('favorite')) {
          await saveToFavorites(companyId);
          favoriteMarker(restaurant)
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


searchform.addEventListener('submit', function (e) {
  e.preventDefault();
  const searchValue = searchform.searchvalue.value.trim().toLowerCase();


  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchValue)
  );
  console.log(searchValue);
  createContainerBoxes(filteredRestaurants);
});

const favButton = document.querySelector('#fav-button');

favButton.addEventListener('click', function () {
  if (!Array.isArray(favorites)) return;

  const favoriteRestaurants = restaurants.filter(restaurant =>
    favorites.some(fav => Number(fav.company_id) === restaurant.companyId)
  );

  createContainerBoxes(favoriteRestaurants);
});


const showWeeklyMenu = (restaurant) => {
  const dayButtons = document.querySelectorAll('button[data-day]');
  dayButtons.forEach(button => {
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);
    newButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const day = e.target.dataset.day;
      try {
        weeklyMenu = [];
        await getWeeklyMenu(restaurant._id, 'en');
        const selectedDayMenu = weeklyMenu.days[day];
        menuDisplay.innerHTML = menuTable(selectedDayMenu);
      } catch (error) {
        console.log(error);
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
  await createMap();
  await getRestaurantsLatLon(restaurants);
  createContainerBoxes();
  loginPage();
  signUpPage();
  getUserLocation()
}
init();
