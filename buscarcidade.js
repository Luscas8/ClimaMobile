import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity, // ✅ Adicionado para os botões de estados
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWeatherByCity,
  getWeatherByCoords,
  getForecastByCoords,
} from "./services/api";

import { getCurrentLocation } from "./services/location";

const STORAGE_KEY = "lastWeatherCache";

// ✅ LISTA DE ESTADOS PARA ACESSO RÁPIDO
const ESTADOS_SUGERIDOS = [
  { nome: "Salvador", busca: "Salvador,BR" },
  { nome: "São Paulo", busca: "Sao Paulo,BR" },
  { nome: "Rio de Janeiro", busca: "Rio de Janeiro,BR" },
  { nome: "Brasília", busca: "Brasilia,BR" },
  { nome: "Paraiba", busca: "Paraiba,BR" },
  { nome: "Fortaleza", busca: "Fortaleza,BR" },
  { nome: "Recife", busca: "Recife,BR" },
];

export default function SearchScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");

  const saveCache = async (data) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const loadCache = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWeather(parsed.weather);
      setForecast(parsed.forecast);
      setOfflineMessage("Dados carregados do último uso.");
    }
  };

  const formatForecast = (forecastData) => {
    if (!forecastData?.list) return [];
    return forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
  };

  const displayDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const fetchWeatherAndForecast = async (coords) => {
    setLoading(true);
    setError("");
    setOfflineMessage("");

    try {
      const current = await getWeatherByCoords(coords.latitude, coords.longitude);
      const forecastData = await getForecastByCoords(coords.latitude, coords.longitude);

      setWeather(current);
      setForecast(forecastData);
      await saveCache({ weather: current, forecast: forecastData });
    } catch (err) {
      setError("Não foi possível buscar os dados do tempo.");
      await loadCache();
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = async () => {
    setError("");
    setOfflineMessage("");
    setLoading(true);
    try {
      const coords = await getCurrentLocation(); 
      await fetchWeatherAndForecast(coords);
      setCity("");
    } catch (err) {
      setError("Falha na localização. Verifique o GPS.");
      await loadCache();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (cidadeParaBusca) => {
    const buscaFinal = cidadeParaBusca || city;
    
    if (!buscaFinal.trim()) {
      setError("Digite uma cidade antes de buscar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const current = await getWeatherByCity(buscaFinal);
      const coords = current.coord;
      const forecastData = await getForecastByCoords(coords.lat, coords.lon);
      setWeather(current);
      setForecast(forecastData);
      await saveCache({ weather: current, forecast: forecastData });
    } catch (err) {
      setError("Erro ao buscar cidade.");
      await loadCache();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleUseLocation();
  }, []);

  const dailyForecast = formatForecast(forecast);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Clima Agora</Text>
      </View>

      <View style={styles.searchCard}>
        <TextInput
          style={styles.input}
          placeholder="Cidade (ex: Salvador,BR)"
          value={city}
          onChangeText={setCity}
        />
        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <Button title="Buscar" onPress={() => handleSearch()} color="#1d4ed8"/>
          </View>
          <View style={styles.buttonWrapperLast}>
            <Button title="Localização Atual" onPress={handleUseLocation} color="#10b981"/>
          </View>
        </View>

        {/* ATALHOS DE ESTADOS/CAPITAIS */}
        <View style={styles.shortcutsRow}>
          {ESTADOS_SUGERIDOS.map((item) => (
            <TouchableOpacity 
              key={item.busca} 
              style={styles.shortcutButton}
              onPress={() => {
                setCity(item.nome);
                handleSearch(item.busca);
              }}
            >
              <Text style={styles.shortcutText}>{item.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!offlineMessage && <Text style={styles.offline}>{offlineMessage}</Text>}
      </View>

      {loading && <ActivityIndicator style={styles.loading} size="large" color="#1d4ed8" />}

      {/* CLIMA ATUAL */}
      {weather && !loading && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{weather.name}</Text>
          <Text style={styles.currentTemp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.description}>{weather.weather[0].description}</Text>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.extraText}>Sensação: {Math.round(weather.main.feels_like)}°C</Text>
            <Text style={styles.extraText}>Umidade: {weather.main.humidity}%</Text>
            <Text style={styles.extraText}>Vento: {weather.wind.speed} km/h</Text>
            
            {weather.rain?.['1h'] && (
              <Text style={styles.extraText}>Chuva: {weather.rain['1h']} mm</Text>
            )}
          </View>
        </View>
      )}

      {/* PRÓXIMOS DIAS */}
      {dailyForecast.length > 0 && !loading && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Próximos dias</Text>
          {dailyForecast.map((item) => (
            <View key={item.dt} style={styles.forecastRow}>
              <Text style={styles.forecastDate}>{displayDate(item.dt)}</Text>
              <Text style={styles.forecastText}>
                {Math.round(item.main.temp)}°C — {item.weather[0].description}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: "#f2f2f7", minHeight: "100%" },
  headerCard: { marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: 'center', color: "#1c1c1e" },
  searchCard: { backgroundColor: "#fff", padding: 20, borderRadius: 15, marginBottom: 20, elevation: 3 },
  input: { backgroundColor: "#f7f7fb", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#ddd", marginBottom: 15 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between" },
  buttonWrapper: { flex: 1, marginRight: 5 },
  buttonWrapperLast: { flex: 1, marginLeft: 5 },
  
  // ESTILOS DOS ATALHOS
  shortcutsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15, gap: 8 },
  shortcutButton: { backgroundColor: '#e5e7eb', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  shortcutText: { fontSize: 12, color: '#4b5563', fontWeight: '600' },

  card: { backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, elevation: 4 },
  cardTitle: { fontSize: 24, fontWeight: "bold", color: "#1c1c1e", marginBottom: 5 },
  currentTemp: { fontSize: 56, fontWeight: "bold", color: "#1d4ed8", marginBottom: 5 },
  description: { fontSize: 18, color: "#3a3a3c", textTransform: 'capitalize', marginBottom: 15 },
  detailsContainer: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  extraText: { fontSize: 15, color: "#636366", marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1c1c1e", marginBottom: 15 },
  forecastRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  forecastDate: { fontWeight: "bold", fontSize: 14, color: "#1c1c1e", marginBottom: 2 },
  forecastText: { fontSize: 16, color: "#3a3a3c" },
  loading: { marginVertical: 20 },
  error: { color: "#ff3b30", marginTop: 10, textAlign: 'center' },
  offline: { color: "#8e8e93", marginTop: 10, textAlign: 'center' }
});
