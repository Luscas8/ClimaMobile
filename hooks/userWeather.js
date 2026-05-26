import { useState, useEffect } from "react";
import { getWeatherByCoords } from "../services/api";
import { getCurrentLocation } from "../services/location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const coords = await getCurrentLocation();
      const data = await getWeatherByCoords(coords.latitude, coords.longitude);

      setWeather(data);

      // salva offline
      await AsyncStorage.setItem("weather", JSON.stringify(data));

    } catch (error) {
      console.log("Erro:", error);

      // tenta pegar offline
      const saved = await AsyncStorage.getItem("weather");
      if (saved) {
        setWeather(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return { weather, loading, refresh: fetchWeather };
};