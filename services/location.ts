import * as Location from 'expo-location';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export const getCurrentLocation = async (): Promise<Coordinates> => {
  // 1. Pede permissão
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permissão de localização negada. Ative nas configurações do celular.');
  }

  // 2. Tenta pegar a última localização conhecida (é muito mais rápido no celular)
  let location = await Location.getLastKnownPositionAsync({});

  // 3. Se não houver última, busca a atual com precisão balanceada
  if (!location) {
    location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  }

  const { latitude, longitude } = location.coords;

  if (latitude == null || longitude == null) {
    throw new Error('Não foi possível obter a localização');
  }

  return { latitude, longitude };
};