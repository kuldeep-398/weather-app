const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO  = 'https://api.openweathermap.org/geo/1.0';

export async function fetchWeather(city) {
  // 1. geocode
  const geoRes = await fetch(`${GEO}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
  const geo = await geoRes.json();
  if (!geo.length) throw new Error('City not found');
  const { lat, lon, name, country } = geo[0];

  // 2. current
  const curRes = await fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
  const current = await curRes.json();

  // 3. forecast (5-day / 3-hour)
  const fRes = await fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
  const forecast = await fRes.json();

  return { lat, lon, name, country, current, forecast };
}
