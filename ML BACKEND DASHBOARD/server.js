import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Config Nunjucks
nunjucks.configure(path.join(__dirname, 'templates'), {
  autoescape: true,
  express: app,
  watch: false
});
app.set('view engine', 'html');

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());

// Simulation data
let sensor_data = {
  temperature: 24.5,
  humidity: 45.2,
  precipitation: 0.0,
  uv_index: 3.2,
  pressure: 1012.5,
  prediction: "Sunny",
  forecast_2hr: "Sunny",
  confidence: 95.5,
  model_agreement: 100.0,
  status: "Simulation Running",
  timestamp: new Date().toLocaleTimeString(),
  arduino_warning: null,
  actual_weather: "Sunny",
  best_model: "Random Forest",
  model_scores: { decision_tree: 45, gradient_boosting: 48, knn: 42, random_forest: 49 },
  models: {
    decision_tree: { current: "Sunny", forecast: "Sunny", accuracy: "97%" },
    gradient_boosting: { current: "Sunny", forecast: "Sunny", accuracy: "99%" },
    knn: { current: "Sunny", forecast: "Sunny", accuracy: "97%" },
    random_forest: { current: "Sunny", forecast: "Sunny", accuracy: "99%" }
  },
  monitoring: {
    active: true,
    elapsed: 0,
    remaining: 300
  },
  simulation_mode: true
};

const history = [];

// App routes
app.get('/', (req, res) => {
  res.render('index.html', { openweather_key: null });
});

app.get('/pressure', (req, res) => res.render('pressure.html'));
app.get('/temp_humidity', (req, res) => res.render('temp_humidity.html'));
app.get('/uv_index', (req, res) => res.render('uv_index.html'));
app.get('/prediction', (req, res) => res.render('prediction.html'));
app.get('/model_analysis', (req, res) => res.render('model_analysis.html'));
app.get('/precipitation', (req, res) => res.render('precipitation.html'));
app.get('/workflow', (req, res) => res.render('workflow.html'));
app.get('/live', (req, res) => res.render('live.html'));

app.get('/data', (req, res) => {
  // Update simulated data randomly if active
  if (sensor_data.monitoring.active) {
    sensor_data.temperature = parseFloat((sensor_data.temperature + (Math.random() - 0.5)).toFixed(2));
    sensor_data.humidity = parseFloat((sensor_data.humidity + (Math.random() - 0.5)).toFixed(2));
    sensor_data.timestamp = new Date().toLocaleTimeString();
    
    sensor_data.monitoring.elapsed += 1;
    sensor_data.monitoring.remaining = Math.max(0, sensor_data.monitoring.remaining - 1);
    
    if (history.length > 50) history.shift();
    history.push({
      temperature: sensor_data.temperature,
      humidity: sensor_data.humidity,
      precipitation: sensor_data.precipitation,
      uv_index: sensor_data.uv_index,
      pressure: sensor_data.pressure,
      timestamp: sensor_data.timestamp
    });
  }
  
  res.json({
    current: sensor_data,
    history: history
  });
});

app.post('/start_monitoring', (req, res) => {
  sensor_data.monitoring.active = true;
  sensor_data.status = "Simulation Running";
  res.json({ status: "started" });
});

app.post('/stop_monitoring', (req, res) => {
  sensor_data.monitoring.active = false;
  sensor_data.status = "Completed";
  res.json({ status: "stopped" });
});

app.post('/set_mode', (req, res) => {
  res.json({ status: "mode_updated" });
});

app.get('/api/geo', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5`);
    const data = await response.json();
    if (data.results) {
      const mapped = data.results.map(r => ({
        lat: r.latitude,
        lon: r.longitude,
        name: r.name,
        state: r.admin1,
        country: r.country
      }));
      return res.json(mapped);
    }
    return res.json([]);
  } catch (error) {
    res.json({ error: 'Geocoding failed' });
  }
});

const weatherCodes = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Dense freezing drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Heavy freezing rain", 71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
  77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  85: "Slight snow showers", 86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
};

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.json({ error: 'Missing coordinates' });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,precipitation`);
    const data = await response.json();
    
    if (data.current) {
      const desc = weatherCodes[data.current.weather_code] || "Unknown";
      return res.json({
        weather: [{ description: desc }],
        main: { 
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          pressure: data.current.surface_pressure
        },
        rain: { '1h': data.current.precipitation }
      });
    }
    return res.json({ error: 'Weather not found' });
  } catch (error) {
    res.json({ error: 'Weather lookup failed' });
  }
});

app.post('/api/city_weather', (req, res) => {
  const { city, lat, lon, raw_weather, mapped_weather } = req.body;
  if (city) {
    sensor_data.location = city;
    sensor_data.actual_weather = raw_weather || mapped_weather || "Unknown";
    sensor_data.prediction = mapped_weather || "Unknown";
    sensor_data.models.random_forest.current = mapped_weather;
    sensor_data.models.gradient_boosting.current = mapped_weather;
    sensor_data.models.decision_tree.current = mapped_weather;
    sensor_data.models.knn.current = mapped_weather;
    
    // We can also trigger a data update for UI
    sensor_data.timestamp = new Date().toLocaleTimeString();
  }
  res.json({ status: "success", data: sensor_data });
});

app.all('*', (req, res) => {
  res.status(501).json({ error: 'Not yet migrated' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
