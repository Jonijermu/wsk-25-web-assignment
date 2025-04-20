const fetchData = async (url, options = {}) => {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    if (json.message) {
      throw new Error(`${json.message}, code:${response.status}`);
    }
    throw new Error(`Error ${response.status} occured!`);
  }
  return json;
}


const getData = async (url, token) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    };
    const jsonData = await fetchData(url, options);
    return jsonData;
  } catch (error) {
    console.error(error);
  }
}


const postData = async (url, data, token) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    };
    const response = await fetch(url, options);
    const jsonData = await response.json();
    if (!response.ok) {
      if (jsonData) {
        throw new Error(`${jsonData.message}, code:${response.status}`);
      }
      throw new Error(`Error ${response.status} occured!`);
    }
    return jsonData;
  } catch (error) {
    console.error(error)
  }
}


const postFormData = async (url, formData) => {
  try {
    const options = {
      method: 'POST',
      body: formData,
    };

    const response = await fetch(url, options);
    const jsonData = await response.json();

    if (!response.ok) {
      throw new Error(`${jsonData.message || 'Something went wrong'}, code: ${response.status}`);
    }

    console.log(jsonData);
    return jsonData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


const authMe = async (url, token) => {
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  const response = await fetch(url, options);
  const userdata = await response.json();
  console.log(userdata);
}


const deleteData = async (url, token) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  const response = await fetch(url, options);
  const message = await response.json();
  console.log(message)
}


const putData = async (url, data = {}, token) => {
  const options = {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'

    },
    body: JSON.stringify(data)
  };
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(`${json.message || 'Unknown error'} (code: ${response.status})`);
    }
    console.log(json);
  } catch (error) {
    console.error('PUT request failed:', error.message);
  }
}


export {fetchData, postData, postFormData, authMe, deleteData, putData, getData}
