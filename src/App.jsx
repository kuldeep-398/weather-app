import { useState, useEffect, useRef } from 'react';
import { fetchWeather } from './api';
import { getWeatherIcon, getWeatherDesc, getBgGradient, formatHour, todayHourly } from './utils';
import './App.css';

const NAV_ICONS = [
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
];

function MiniChart({ data }) {
  if (!data || data.length < 2) return null;
  const temps = data.map(d => d.main.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const W = 700, H = 80;
  const pad = 20;
  const pts = temps.map((t, i) => {
    const x = pad + (i / (temps.length - 1)) * (W - pad * 2);
    const y = H - pad - ((t - min) / (max - min + 1)) * (H - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M ${pts[0]} L ${pts.join(' L ')} L ${W - pad},${H} L ${pad},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '80px' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b6af0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b6af0" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#5b6af0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(',').map(Number);
        return (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#5b6af0" />
        );
      })}
    </svg>
  );
}

export default function App() {
  const [city, setCity] = useState('Bengaluru');
  const [input, setInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [navActive, setNavActive] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef();

  const load = async (c) => {
    setLoading(true); setError('');
    try {
      const res = await fetchWeather(c);
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(city); }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) { setCity(input.trim()); setInput(''); setSearching(false); }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const hourly = data ? todayHourly(data.forecast.list) : [];

  const code = data?.current?.weather?.[0]?.id || 803;
  const bg = getBgGradient(code);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {NAV_ICONS.map((icon, i) => (
          <button key={i} className={`nav-btn ${navActive === i ? 'active' : ''}`} onClick={() => setNavActive(i)}>
            {icon}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main className="main-col">
        {/* Hero Card */}
        <div className="hero-card" style={{ background: bg }}>
          <div className="hero-overlay" />
          <div className="hero-top">
            <div className="location-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span className="location-name">{loading ? '…' : `${data?.name}, ${data?.country}`}</span>
            </div>            
              <div className="rp-top">
                <span className="rp-date">{dateStr}</span>
                <span className="rp-time" style={{ marginLeft: "4rem" }}>{timeStr}</span>
              </div>
            <form onSubmit={handleSearch} className="search-form">
              {searching ? (
                <input ref={inputRef} className="search-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Search city…" onBlur={() => { if (!input) setSearching(false); }} autoFocus />
              ) : (
                <button type="button" className="search-toggle" onClick={() => setSearching(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </button>
              )}
            </form>
          </div>

          <div className="hero-body">
            <div className="hero-left">
              <p className="label">Weather Forecast</p>
              <h1 className="condition-title">
                {loading ? '…' : (data?.current?.weather?.[0]?.main || '—')}
              </h1>
              <p className="condition-desc">
                {loading ? '' : (data?.current?.weather?.[0]?.description?.charAt(0).toUpperCase() + data?.current?.weather?.[0]?.description?.slice(1) + '. ')}
                {data?.current?.weather?.[0]?.id >= 500 && data?.current?.weather?.[0]?.id < 600 ? 'Rain expected today.' : 'Looks like it may be cloudy.'}
              </p>
              <div className="temp-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
                <span>{loading ? '…' : `${Math.round(data?.current?.main?.temp ?? 0)}°C`}</span>
              </div>
            </div>
            <div className="hero-icon-wrap">
              <span className="hero-icon">{loading ? '' : getWeatherIcon(code)}</span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="stats-card">
          <h2 className="stats-title">Today's Statistics</h2>
          <div className="chart-wrap">
            <MiniChart data={hourly.length ? hourly : data?.forecast?.list?.slice(0,6)} />
          </div>
          <div className="hourly-row">
            {(hourly.length ? hourly : (data?.forecast?.list?.slice(0,6) ?? [])).map((item, i) => (
              <div key={i} className="hour-cell">
                <span className="hour-time">{formatHour(item.dt)}</span>
                <span className="hour-icon">{getWeatherIcon(item.weather[0].id)}</span>
                <span className="hour-temp">{Math.round(item.main.temp)}°</span>
                <span className="hour-desc">{getWeatherDesc(item.weather[0].id)}</span>
              </div>
            ))}
          </div>
          {loading && <div className="loading-overlay"><div className="spinner"/></div>}
          {error && <div className="error-msg">{error}</div>}
        </div>
      </main>
    </div>
  );
}
