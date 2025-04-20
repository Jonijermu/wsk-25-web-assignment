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
  createLoginModal, createRestaurantBox,
  menuTable, registerScreen,
  userMenuScreen
} from "./components.js";

import {
  createMap,
  getRestaurantsLatLon, userMarker,
  zoomRestaurant
} from "./map.js"
import {baseUrl, restaurantUrl, uploadsUrl,} from "./variables.js";

let restaurants = [];
let favorites = []
let weeklyMenu = []
let userToken = null;
let currentUser = null;
let box;

let headersUl = document.querySelector('.headers-ul');
const div = document.querySelector('.restaurant-container')
const loginModal = document.querySelector('#loginModal');
const registerModal = document.querySelector('#registerModal');
const profileModal = document.querySelector('#profileModal');
const menuDisplay = document.querySelector('.menu-display');
const searchForm = document.querySelector('.search-form');
const favButton = document.querySelector('#fav-button');
const clearButton = document.querySelector('#clear-button')


//Getters for restaurant API's
const getRestaurants = async () => {
  try {
    restaurants = await fetchData(restaurantUrl + '/restaurants')
    //Creates restaurant container boxes
    createContainerBoxes(restaurants)
  } catch (error) {
    console.error(error);
  }
}

//Get daily menu
const getDailyMenu = async (id, lang) => {
  try {
    return await fetchData(`${restaurantUrl}/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
}

//Get weekly menu
const getWeeklyMenu = async (id, lang) => {
  try {
    weeklyMenu = await fetchData(`${restaurantUrl}/restaurants/weekly/${id}/${lang}`)
  } catch (error) {
    console.log(error);
  }
}

// Login the user
const loginUser = async (credentials) => {
  try {
    const user = await postData(baseUrl + '/auth/login', credentials);
    userToken = user.token;
    currentUser = user.user;
    localStorage.setItem('token', user.token);
    if (currentUser) {
      loginModal.close();
    }
    await tokenTest(user.token);
    updateHeaderElements();
    createContainerBoxes(restaurants);
  } catch (error) {
    console.error(error);
    alert("Invalid username or password.");
  }
}

//POST user
const registerUser = async (userData) => {
  try {
    await postFormData(baseUrl + '/users', userData);
  } catch (error) {
    console.log(error);
  }
}

//Modify user information
const putUser = async (userData) => {
  try {
    await putData(`${baseUrl}/users/${currentUser.user_id}`, userData, userToken);
    alert('user  updated  successfully')
  } catch (error) {
    console.log(error);
    alert('User update failed')
  }
}

//Delete user
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

//Method to test the token
const tokenTest = async (token) => {
  try {
    await authMe(baseUrl + '/auth/me', token)
  } catch (error) {
    console.log(error);
  }
}

//Save restaurant companyId to db
const saveToFavorites = async (companyId) => {
  try {
    const data = {company_id: companyId};
    await postData(`${baseUrl}/favorites/`, data, userToken)
  } catch (error) {
    console.log(error);
  }
}

//Delete restaurant compnayId in db
const removeFromFavorites = async (companyId) => {
  try {
    await deleteData(`${baseUrl}/favorites/${companyId}`, userToken);
  } catch (error) {
    console.log(error);
  }
}

// Get current user favorites from db
const getFavoritesByUserId = async () => {
  try {
    favorites  = []
    favorites = await getData(`${baseUrl}/favorites/${currentUser.user_id}`, userToken)
  } catch (error) {
    console.log(error);
  }
}

//Get user current location
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error)
    );
  });
}

//Calculate distance between User and restaurants
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  return Math.sqrt(((lat2 - lat1) ** 2) + ((lon2 - lon1) ** 2));
}

//Finds the nearest restaurant to user
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
  //zoom effect to the nearest restaurant and show its daily/weekly menu
  zoomRestaurant(closestRestaurant);
  const menu = await getDailyMenu(closestRestaurant._id, 'en');
  menuDisplay.innerHTML = menuTable(menu);
  showWeeklyMenu(closestRestaurant)

};

//Modal for user registering
const registerPage = () => {
  const registerBtn = document.querySelector('#registerBtn');
  registerBtn.addEventListener('click', function () {
    registerModal.innerHTML = registerScreen();
    registerModal.showModal();

    const closeBtn = registerModal.querySelector('.close-btn');
    closeBtn.addEventListener('click', function () {
      registerModal.close();
    });


    const registerForm = document.querySelector('#signUpForm');
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      //Get formData from the form inputs
      const formData = new FormData(registerForm);
      await registerUser(formData);

      //Automatically login user after registering
      const username = formData.get('username');
      const password = formData.get('password');

      if (username && password) {
        const credentials = {username, password};
        await loginUser(credentials);
        registerModal.close()
      }

    });
  });
};

// Update header after successful login
const updateHeaderElements = () => {
  if (currentUser) {

    //Add new elements to the header and get profile picture
    headersUl.innerHTML = `
    <img class="profile-pic" src="${uploadsUrl}${currentUser.profile_picture}_thumb.png" alt="profile-pic">
    <li id="userMenuBtn">User Menu</li>
    <li id="logoutBtn">Logout</li>
    `;

    //Modal for checking and modifying user information
    document.querySelector('#userMenuBtn').addEventListener('click', () => {
      profileModal.innerHTML = userMenuScreen(currentUser);
      profileModal.showModal();
      profilePage();
      const closeBtn = profileModal.querySelector('.close-btn');
      closeBtn.addEventListener('click', function () {
        profileModal.close();
      })
    });

    //Create logout modal
    document.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      userToken = null;
      currentUser = null;
      location.reload();
    });
  }
}


const profilePage = () => {
  if (currentUser) {
    const userMenuForm = document.querySelector('#userMenuForm');
    userMenuForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const clickedButton = e.submitter;
      const action = clickedButton.value;
      if (action === 'update') {
        const formData = new FormData(userMenuForm);
        const userData = {};
        formData.forEach((value, key) => {
          if (!(value instanceof File) && value.trim() !== '') {
            userData[key] = value;
          }
        });
        const fileInput = userMenuForm.querySelector('input[type="file"]');
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
  //Login modal gets created
  loginBtn.addEventListener('click', function () {
    loginModal.innerHTML = createLoginModal();
    loginModal.showModal();

    const closeBtn = document.querySelector('.close-btn')
    closeBtn.addEventListener('click', function () {
      loginModal.close();
    })

    const loginForm = document.querySelector('#loginForm');

    //Gets data from the login modal form and post user credentials
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = loginForm.username.value;
      const password = loginForm.password.value;
      const credentials = {
        username: username,
        password: password
      };
      loginUser(credentials);
    });
  });
}

const getOnlyFavoriteRestaurants = () => {
  favButton.addEventListener('click', async function () {
    console.log('button pressed')
      if (!currentUser) {
        showNotification(favButton, "You need to be logged in to view your favorites!")
        return;
      }
    await getFavoritesByUserId()

      if (!Array.isArray(favorites)) return;

      const favoriteRestaurants = restaurants.filter(restaurant =>
        favorites.some(fav => Number(fav.company_id) === restaurant.companyId)
      );
      await createContainerBoxes(favoriteRestaurants);
    },
  );
};


const getSearchValue = () => {
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchValue = searchForm.searchvalue.value.trim().toLowerCase();

    const filteredRestaurants = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchValue)
    );
    createContainerBoxes(filteredRestaurants);
  });
}


const clearFilters = () => {
  clearButton.addEventListener('click', function () {
    createContainerBoxes(restaurants)
  })
}


//Creates the restaurant boxes and adds important Event Listeners
const createContainerBoxes = async (restaurants) => {
  div.innerHTML = '';

  //Loop all the  restaurants
  for (const restaurant of restaurants) {
    try {
      if (currentUser) {
        await getFavoritesByUserId()
      }

      //creates restaurant boxes
      box = createRestaurantBox(restaurant);
      div.append(box);

      //Favorite  button  to  add/remove from favorites
      const heartBtn = box.querySelector('.heart-icon')

      // Check if the user has marked the restaurant as a favorite and add the style class if true.
      if (Array.isArray(favorites) && favorites.some(fav => Number(fav.company_id) === restaurant.companyId)) {
        heartBtn.classList.add('favorite');
      }

      //Restaurant box Event listener
      box.addEventListener('click', async function () {
        try {
          const menu = await getDailyMenu(restaurant._id, 'en');
          //Opens the menu table
          menuDisplay.innerHTML = menuTable(menu);
          //Zoom to the clicked restaurant
          zoomRestaurant(restaurant);
          //Gets the restaurant weekly menu
          showWeeklyMenu(restaurant)
        } catch (error) {
          console.log(error);
        }
      });

      //Event listener for the Favorite Button
      heartBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        //stopPropagation prevents opening the menu table when click heart button
        e.stopPropagation();
        //If  user not login gets a notification
        if (!currentUser) {
          showNotification(heartBtn, "You need to log in to save favorites!");
          return;
        }

        const companyId = restaurant.companyId

        // If the element does not contain the 'favorite' class, add it; otherwise, remove it.
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

// Displays the weekly menu based on the day button clicked
const showWeeklyMenu = (restaurant) => {
  // Select all day buttons using the data-day attribute
  const dayButtons = document.querySelectorAll('button[data-day]');
  //Get current day
  const currentDay = (new Date().getDay() + 6) % 7;

  dayButtons.forEach(button => {
    const dayIndex = parseInt(button.dataset.day, 10);
    // Highlight the button for the current day
    if (dayIndex === currentDay) {
      button.classList.add('current-day');
    }
    // Replace the old button with a cloned one to remove previous event listeners
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);
    newButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const updatedButtons = document.querySelectorAll('button[data-day]');
      updatedButtons.forEach(btn => btn.classList.remove('current-day'));
      newButton.classList.add('current-day');
      // Get the index of the selected day (for example Monday = 0)
      const day = e.target.dataset.day;
      try {
        weeklyMenu = [];
        await getWeeklyMenu(restaurant._id, 'en');
        // Retrieve the menu for the selected day based on the index
        const selectedDayMenu = weeklyMenu.days[day];
        menuDisplay.innerHTML = menuTable(selectedDayMenu);
      } catch (error) {
        console.log(error);
      }

    });
  });
};


//Shows user notifications
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

//SetUp when page is loaded
const init = async () => {
  await getRestaurants();
  await createMap();
  await getRestaurantsLatLon(restaurants);
  findNearestRestaurant(restaurants)
  getOnlyFavoriteRestaurants()
  getSearchValue()
  clearFilters()
  loginPage();
  registerPage();
  getUserLocation()
}
init();
