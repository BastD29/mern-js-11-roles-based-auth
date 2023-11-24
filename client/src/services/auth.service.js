import axios from "axios";

import { AUTH_URL } from "../constants/endpoints";

const register = (username, email, password) => {
  return axios.post(AUTH_URL + "signup", {
    username,
    email,
    password,
  });
};

const login = (username, password) => {
  return axios
    .post(AUTH_URL + "signin", {
      username,
      password,
    })
    .then((response) => {
      console.log("response.data:", response.data);
      console.log("response.headers:", response.headers);

      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    });
};

const logout = async () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
