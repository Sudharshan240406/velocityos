"use client";

import React, { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, RefreshCw } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  locationName: string;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    code: number;
  }>;
}

const WEATHER_CODES: Record<number, { text: string; icon: React.ReactNode }> = {
  0: { text: "Clear Sky", icon: <Sun className="w-8 h-8 text-yellow-400" /> },
  1: { text: "Mainly Clear", icon: <Sun className="w-8 h-8 text-yellow-300" /> },
  2: { text: "Partly Cloudy", icon: <Cloud className="w-8 h-8 text-blue-200" /> },
  3: { text: "Overcast", icon: <Cloud className="w-8 h-8 text-gray-400" /> },
  45: { text: "Fog", icon: <Cloud className="w-8 h-8 text-gray-300" /> },
  48: { text: "Depositing Rime Fog", icon: <Cloud className="w-8 h-8 text-gray-300" /> },
  51: { text: "Light Drizzle", icon: <CloudRain className="w-8 h-8 text-blue-300" /> },
  61: { text: "Slight Rain", icon: <CloudRain className="w-8 h-8 text-blue-400" /> },
  63: { text: "Moderate Rain", icon: <CloudRain className="w-8 h-8 text-blue-500" /> },
  65: { text: "Heavy Rain", icon: <CloudRain className="w-8 h-8 text-blue-600" /> },
  71: { text: "Slight Snowfall", icon: <CloudSnow className="w-8 h-8 text-teal-200" /> },
  73: { text: "Moderate Snowfall", icon: <CloudSnow className="w-8 h-8 text-teal-300" /> },
  75: { text: "Heavy Snowfall", icon: <CloudSnow className="w-8 h-8 text-teal-400" /> },
  95: { text: "Thunderstorm", icon: <CloudRain className="w-8 h-8 text-purple-400" /> },
};

const getDayName = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export default function WeatherCard() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, locationLabel: string) => {
    try {
      setLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&relative_humidity_2m=true&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather request failed");
      const json = await response.json();

      const current = json.current_weather;
      const forecastDays = [];
      for (let i = 0; i < 3; i++) {
        forecastDays.push({
          day: i === 0 ? "Today" : getDayName(i),
          tempMax: Math.round(json.daily.temperature_2m_max[i]),
          tempMin: Math.round(json.daily.temperature_2m_min[i]),
          code: json.daily.weathercode[i],
        });
      }

      const weatherData: WeatherData = {
        temp: Math.round(current.temperature),
        condition: WEATHER_CODES[current.weathercode]?.text || "Unknown",
        humidity: json.relative_humidity_2m ? json.relative_humidity_2m[0] : 65,
        windSpeed: Math.round(current.windspeed),
        locationName: locationLabel,
        forecast: forecastDays,
      };

      setData(weatherData);
      localStorage.setItem("focusos:weather_cache", JSON.stringify({
        timestamp: Date.now(),
        data: weatherData,
      }));
      setError(null);
    } catch (err: any) {
      setError("Failed to fetch weather");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatesAndFetch = () => {
    // Check cache first
    const cached = localStorage.getItem("focusos:weather_cache");
    if (cached) {
      const { timestamp, data: cachedData } = JSON.parse(cached);
      // 30 min cache expiration
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(
            position.coords.latitude,
            position.coords.longitude,
            "Local Timezone"
          );
        },
        () => {
          // Fallback to Tokyo
          fetchWeather(35.6895, 139.6917, "Neo Tokyo");
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeather(35.6895, 139.6917, "Neo Tokyo");
    }
  };

  useEffect(() => {
    getCoordinatesAndFetch();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(getCoordinatesAndFetch, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] animate-pulse border border-white/5">
        <span className="text-xs text-gray-400">Syncing Atmospheric Grid...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] border border-red-500/20 bg-red-950/10">
        <span className="text-xs text-red-400 mb-2">{error}</span>
        <button 
          onClick={getCoordinatesAndFetch}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition border border-white/10"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const activeWeather = data ? WEATHER_CODES[data.forecast[0].code] : null;

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/8 relative overflow-hidden group hover:border-white/15 transition-all duration-300">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data?.locationName}</h4>
          <span className="text-2xl font-black text-white tracking-tight">{data?.temp}°C</span>
          <span className="text-[10px] text-cyan-300 block font-medium mt-0.5">{data?.condition}</span>
        </div>
        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
          {activeWeather?.icon || <Cloud className="w-8 h-8 text-cyan-300" />}
        </div>
      </div>

      <div className="flex gap-4 border-t border-white/5 pt-3 pb-2 text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>RH: {data?.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3 h-3 text-purple-400" />
          <span>WS: {data?.windSpeed} km/h</span>
        </div>
      </div>

      {/* 3-day forecast list */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5 text-center">
        {data?.forecast.map((day, idx) => (
          <div key={idx} className="bg-white/3 rounded-lg p-1.5 border border-white/5">
            <span className="text-[9px] text-gray-500 font-bold block mb-1">{day.day}</span>
            <div className="flex justify-center my-1">
              {React.cloneElement((WEATHER_CODES[day.code]?.icon || <Cloud />) as React.ReactElement<any>, { className: "w-4 h-4" })}
            </div>
            <span className="text-[9px] font-black text-white">{day.tempMax}° / {day.tempMin}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
