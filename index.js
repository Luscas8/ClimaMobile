import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { requestLocation } from './location'; 
import { registerRootComponent } from 'expo';
import SearchScreen from './buscarcidade'; 

registerRootComponent(SearchScreen);

export default function App() {
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGetLocation = async () => {
    try {
      setErrorMsg(null);
      const locationCoords = await requestLocation();
      setCoords(locationCoords);
      console.log('Coordenadas obtidas:', locationCoords);
    } catch (error) {
      setErrorMsg(error.message);
      
      // No celular, se der erro, avisamos o usuário para checar as configurações
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Erro de Localização",
          "Não conseguimos sua posição. Verifique se o GPS está ativo e se você deu permissão nas configurações do celular."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clima App</Text>
      
      <Button title="Obter Minha Localização" onPress={handleGetLocation} />

      {coords && (
        <View style={styles.result}>
          <Text>Lat: {coords.latitude}</Text>
          <Text>Lon: {coords.longitude}</Text>
        </View>
      )}

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 20 },
  result: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' },
  error: { color: 'red', marginTop: 10 }
});