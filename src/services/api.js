/* Dese ser alterado a porta para se comunicar com o servidor  BackEnd */
import axios from 'axios';

const apiapiwhatsapp = axios.create({
  baseURL: 'http://192.168.0.200:200/',
});

apiapiwhatsapp.interceptors.request.use(async (config) => {
  const userData = await localStorage.getItem('apiwhatsapp:userData');
  const token = userData && JSON.parse(userData).token;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default apiapiwhatsapp;
