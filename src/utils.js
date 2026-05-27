export function getWeatherIcon(code, size = 48) {
  const id = Math.floor(code / 100);
  const icons = {
    2: '⛈️', 3: '🌦️', 5: '🌧️', 6: '🌨️', 7: '🌫️', 8: null,
  };
  if (id !== 8) return icons[id] || '🌡️';
  if (code === 800) return '☀️';
  if (code === 801) return '🌤️';
  if (code === 802) return '⛅';
  if (code === 803) return '🌥️';
  return '☁️';
}

export function getWeatherDesc(code) {
  if (code >= 200 && code < 300) return 'Thunderstorm';
  if (code >= 300 && code < 400) return 'Drizzle';
  if (code >= 500 && code < 600) return 'Rain';
  if (code >= 600 && code < 700) return 'Snow';
  if (code >= 700 && code < 800) return 'Fog';
  if (code === 800) return 'Clear Sky';
  if (code === 801) return 'Partly Cloudy';
  if (code === 802) return 'Partly Cloudy';
  if (code === 803) return 'Mostly Cloudy';
  return 'Cloudy';
}

export function getBgGradient(code) {
  if (code >= 200 && code < 300) return 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)';
  if (code >= 500 && code < 600) return 'linear-gradient(135deg,#141e30 0%,#243b55 100%)';
  if (code === 800) return 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)';
  if (code === 801 || code === 802) return 'linear-gradient(135deg,#1c1c2e 0%,#2d3561 100%)';
  return 'linear-gradient(135deg,#12172e 0%,#1e2a45 50%,#243050 100%)';
}

export function windDir(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg/45) % 8];
}

export function formatHour(dt) {
  return new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDay(dt) {
  return new Date(dt * 1000).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export function groupByDay(list) {
  const days = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!days[date]) days[date] = item;
  });
  return Object.values(days).slice(0, 7);
}

export function todayHourly(list) {
  const today = new Date().toDateString();
  return list.filter(item => new Date(item.dt * 1000).toDateString() === today).slice(0, 6);
}
