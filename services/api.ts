import axios from 'axios';

const API_KEY = '8bccdfe027b7dad699e4627bdde8c76e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByCity = async (city: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'pt_br',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar clima da cidade');
  }
};

export const getWeatherByCoords = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'pt_br',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar clima por localização');
  }
};

export const getForecastByCoords = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'pt_br',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar previsão por localização');
  }
};
