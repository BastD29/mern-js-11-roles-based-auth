import axios from "axios";

import { TEST_URL } from "../constants/endpoints";

import authHeader from "./auth-header";

const getPublicContent = () => {
  return axios.get(TEST_URL + "all");
};

const getUserBoard = () => {
  return axios.get(TEST_URL + "user", { headers: authHeader() });
};

const getModeratorBoard = () => {
  return axios.get(TEST_URL + "mod", { headers: authHeader() });
};

const getAdminBoard = () => {
  return axios.get(TEST_URL + "admin", { headers: authHeader() });
};

const userService = {
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
};

export default userService;
