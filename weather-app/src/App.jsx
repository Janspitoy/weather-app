// --- ИЗМЕНЕНИЕ: Импорт framer-motion ---
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONS (Simple SVGs for a clean look) ---
const SearchIcon = () => (
  // ... (иконка без изменений)
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  // ... (иконка без изменений)
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 ${filled ? 'text-red-500' : 'text-white'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const LocationArrowIcon = () => (
  // ... (иконка без изменений)
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 inline-block ml-1 text-blue-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


// --- API & Constants ---
// ... (без изменений)
const API_KEY = '8de658b93237433d93b114946252610'; // Your key
const API_URL_BASE = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=5&aqi=no&alerts=no&lang=en`;
const API_SEARCH_URL = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}`;

// --- Helper Functions ---
// ... (без изменений)
const getInitialFavorites = () => {
  const savedFavorites = localStorage.getItem('weatherAppFavorites');
  return savedFavorites ? JSON.parse(savedFavorites) : [];
};

const getWeatherVisuals = (conditionText = '', isDay = 1) => {
  const text = conditionText.toLowerCase();

  if (isDay === 0) {
    return {
      theme: 'dark',
      bgGif: 'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3dkdzh2dXdhZmFwcjYxdHVwc3R6NWIzaDE4MjVvNG1zZGJ4YXp5YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/URdQtEwqxNhbJF1bhU/giphy.gif)', // Night sky
    };
  }
  if (text.includes('sun') || text.includes('clear')) {
    return {
      theme: 'light',
      bgGif: 'url(https://i.gifer.com/4BiA.gif)', // Sunny day
    };
  }
  if (text.includes('rain') || text.includes('drizzle')) {
    return {
      theme: 'dark',
      bgGif: 'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHVybDVvam93NW9jMDhzMDRjZHJ4MG11eTZnbmlmYzAzamRjamliMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26DMWExfbZSiV0Btm/giphy.gif)', // Rain
    };
  }
  if (text.includes('snow') || text.includes('sleet') || text.includes('ice')) {
    return {
      theme: 'light',
      bgGif: 'url(https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHZxa2c3b2w4cGF3eTZkZzExcXB5djk5aWJkNTZxYncxNG41aHN6cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7Bgpw7PwdxoDC/giphy.gif)', // Snow
    };
  }
  if (text.includes('cloud') || text.includes('overcast')) {
    return {
      theme: 'light',
      bgGif: 'url(https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExejl6cHpndnYwa3ZhbTFqZjc5ZWh6Mzg3bnB0NjA5Ym12aWw5ZWRwMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LWPbocV2XJWo0/giphy.gif)', // Clouds
    };
  }
  if (text.includes('mist') || text.includes('fog')) {
    return {
      theme: 'light',
      bgGif: 'url(https://i.gifer.com/5yp.gif)', // Mist
    };
  }
  return {
    theme: 'light',
    bgGif: 'url(https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2g0M3YyMjBwZTY1a3o4OXJybm1wOXA1cHc0a2h1ejV2eXNjcDE1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Xmq44SuwVpr1e/giphy.gif)', // Default clouds
  };
};

// --- Main App Component ---
export default function App() {
  // --- State ---
  // ... (без изменений)
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const allCards = useMemo(() => {
    return userLocation ? [userLocation, ...favorites] : [...favorites];
  }, [userLocation, favorites]);
  const [cityToSearch, setCityToSearch] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // --- Effects ---
  // ... (все Effects без изменений)
  // 1. Request Geolocation on App Load
  useEffect(() => {
    requestLocation();
  }, []);

  // 2. Fetch weather data
  useEffect(() => {
    if (!cityToSearch) {
      setWeatherData(null);
      setLoading(false);
      if (!locationError) {
        setError("No favorite cities. Add one by searching.");
      }
      return;
    }
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL_BASE}&q=${cityToSearch}`);
        const data = await response.json();
        if (!response.ok) {
          if (cityToSearch === userLocation?.query) {
            setError("Could not fetch weather for your location.");
            setUserLocation(null);
          } else {
            throw new Error(data.error?.message || 'City not found.');
          }
        }
        setWeatherData(data);
      } catch (err) {
        setError(err.message);
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [cityToSearch]);

  // 3. Save favorites
  useEffect(() => {
    localStorage.setItem('weatherAppFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // 4. Fetch search suggestions
  useEffect(() => {
    if (cityInput.length < 3) {
      setSuggestions([]);
      return;
    }
    const debounceTimer = setTimeout(() => {
      fetchSearchSuggestions();
    }, 300);
    const fetchSearchSuggestions = async () => {
      try {
        const response = await fetch(`${API_SEARCH_URL}&q=${cityInput}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Search suggestion error:", err);
        setSuggestions([]);
      }
    };
    return () => clearTimeout(debounceTimer);
  }, [cityInput]);

  // 5. Update cityToSearch
  useEffect(() => {
    if (allCards.length > 0 && activeIndex < allCards.length) {
      setCityToSearch(allCards[activeIndex].query || allCards[activeIndex]);
    } else if (allCards.length === 0) {
      setCityToSearch(null);
      if (!locationError) {
        setError("No favorite cities. Add one by searching.");
      }
      setWeatherData(null);
    } else if (activeIndex >= allCards.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, allCards, locationError]);

  // --- Event Handlers ---
  // ... (все Handlers без изменений)
  // Geolocation
  const requestLocation = () => {
    setLoading(true);
    setError(null);
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationQuery = `${latitude},${longitude}`;
        setUserLocation({ name: "Current Location", query: locationQuery });
        setActiveIndex(0);
        setCityToSearch(locationQuery);
        setLocationError(false);
      },
      (err) => {
        console.error(err);
        setLocationError(true);
        setError("Please grant location access to see local weather.");
        setLoading(false);
        if(favorites.length > 0) {
          setCityToSearch(favorites[0]);
        } else {
          setCityToSearch(null);
        }
      }
    );
  };

  // Swipe
  const handleNext = () => {
    if (allCards.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % allCards.length);
  };
  const handlePrev = () => {
    if (allCards.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + allCards.length) % allCards.length);
  };
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Search and Favorites
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const newCity = cityInput.trim();
    const index = favorites.findIndex(fav => fav.toLowerCase() === newCity.toLowerCase());
    if (index > -1) {
      setActiveIndex(index + (userLocation ? 1 : 0));
    } else {
      const newFavorites = [newCity, ...favorites];
      setFavorites(newFavorites);
      setActiveIndex(userLocation ? 1 : 0);
    }
    setCityInput('');
    setSuggestions([]);
    setIsSearchFocused(false);
  };
  const handleSuggestionClick = (suggestion) => {
    const newCity = suggestion.name;
    const index = favorites.findIndex(fav => fav.toLowerCase() === newCity.toLowerCase());
    if (index > -1) {
      setActiveIndex(index + (userLocation ? 1 : 0));
    } else {
      const newFavorites = [newCity, ...favorites];
      setFavorites(newFavorites);
      setActiveIndex(userLocation ? 1 : 0);
    }
    setCityInput('');
    setSuggestions([]);
    setIsSearchFocused(false);
  };
  const handleToggleFavorite = () => {
    if (!weatherData) return;
    if (activeIndex === 0 && userLocation) {
      return;
    }
    const currentCity = weatherData.location.name;
    const index = favorites.indexOf(currentCity);
    if (index > -1) {
      handleRemoveFavorite(currentCity);
    } else {
      const newFavorites = [currentCity, ...favorites];
      setFavorites(newFavorites);
      setActiveIndex(userLocation ? 1 : 0);
    }
  };
  const handleRemoveFavorite = (cityToRemove) => {
    const newFavorites = favorites.filter(fav => fav !== cityToRemove);
    const oldIndex = favorites.indexOf(cityToRemove) + (userLocation ? 1 : 0);
    if (activeIndex === oldIndex) {
      setActiveIndex(0);
    } else if (activeIndex > oldIndex) {
      setActiveIndex(prev => prev - 1);
    }
    setFavorites(newFavorites);
  };
  const isCityInFavorites = weatherData && favorites.some(fav => fav.toLowerCase() === weatherData.location.name.toLowerCase());

  // --- Memoized Visuals ---
  // ... (без изменений)
  const visuals = useMemo(() => {
    if (!weatherData && !loading) return { theme: 'light', bgGif: 'url(https://i.gifer.com/60.gif)' }; // Error/no city
    if (!weatherData) return { theme: 'light', bgGif: 'url(https://i.gifer.com/60.gif)' }; // Loading
    return getWeatherVisuals(
      weatherData.current.condition.text,
      weatherData.current.is_day
    );
  }, [weatherData, loading]);


  // --- Render (JSX) ---
  return (
    <div className={visuals.theme}>
      {/* 1. Dynamic Background (GIF) */}
      <div
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: visuals.bgGif }}
      />

      {/* 2. Main Responsive Container */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 font-sans">

        {/* ================================================================== */}
        {/* --- 3A. DESKTOP VIEW (Без изменений) --- */}
        {/* ================================================================== */}
        <div className="hidden md:flex w-full max-w-4xl bg-gray-900/70 dark:bg-black/70 backdrop-blur-lg rounded-2xl shadow-2xl text-white overflow-hidden" style={{minHeight: '600px'}}>

          {/* --- LEFT PANEL --- */}
          <div className="w-full md:w-1/3 p-6 flex flex-col justify-between border-r border-white/20">
            <div>
              <h2 className="font-bold text-2xl text-white/90 mb-4">Favorites</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {allCards.map((city, index) => (
                  <div
                    key={typeof city === 'object' ? city.name : city}
                    className={`flex justify-between items-center group p-3 rounded-lg cursor-pointer transition ${index === activeIndex ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="text-lg text-white/80">
                      {typeof city === 'object' ? city.name : city}
                      {index === 0 && userLocation && <LocationArrowIcon />}
                    </span>
                    {index !== 0 || !userLocation ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(city);
                        }}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Remove from favorites"
                      >
                        &times;
                      </button>
                    ) : (
                      <div className="w-4 h-4"></div>
                    )}
                  </div>
                ))}
                {allCards.length === 0 && !loading && (
                   <div className="text-white/60 text-center py-10">
                    {locationError ? (
                      <>
                        <p>Location permission denied.</p>
                        <button
                          onClick={requestLocation}
                          className="mt-2 px-3 py-1 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                        >
                          Grant Access
                        </button>
                      </>
                    ) : (
                      <p>No favorites yet. Use the search below to add cities.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="border-t border-white/20 pt-4 mt-4">
              <form onSubmit={handleSearchSubmit} className="relative flex space-x-2">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search to add a city..."
                  className="flex-grow p-3 bg-white/20 dark:bg-black/20 text-white rounded-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="p-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                >
                  <SearchIcon />
                </button>
                {isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 w-full max-h-60 overflow-y-auto bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg z-20">
                    {suggestions.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onMouseDown={() => handleSuggestionClick(city)}
                        className="w-full text-left px-4 py-3 text-white/90 hover:bg-blue-500/50 transition-colors"
                      >
                        {city.name}, <span className="text-white/60">{city.region || city.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* --- RIGHT PANEL --- */}
          <div className="w-full md:w-2/3 p-6 bg-white/10 dark:bg-black/10">

            {loading && (
              <div className="text-center h-full flex flex-col justify-center items-center">
                <div className="inline-block w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-white/80">Loading...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center h-full flex flex-col justify-center items-center p-4">
                {locationError ? (
                  <>
                    <strong className="text-red-200">Error: {error}</strong>
                    <button
                      onClick={requestLocation}
                      className="mt-4 px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                    >
                      Grant Location Access
                    </button>
                  </>
                ) : (
                  <strong className="text-red-200">Error: {error}</strong>
                )}
              </div>
            )}

            {weatherData && !loading && (
              <div className="animate-fade-in">
                {/* City Name & Favorite Toggle */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-3xl font-light">
                      {weatherData.location.name}
                      {activeIndex === 0 && userLocation && <LocationArrowIcon />}
                    </p>
                    <p className="text-lg text-white/70">{weatherData.location.country}</p>
                    <p className="text-sm text-white/60 mt-2">
                      {new Date(weatherData.location.localtime).toLocaleString('en-US', {
                        weekday: 'long',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </p>
                  </div>

                  {!(activeIndex === 0 && userLocation) && (
                    <button
                      onClick={handleToggleFavorite}
                      className="p-2"
                      title={isCityInFavorites ? "Remove from favorites" : "Add to favorites"}
                    >
                      <HeartIcon filled={isCityInFavorites} />
                    </button>
                  )}
                </div>


                {/* Current Weather Main */}
                <div className="flex justify-between items-center my-6">
                  <div>
                    <span className="text-7xl font-light">
                      {Math.round(weatherData.current.temp_c)}°
                    </span>
                    <span className="text-2xl align-top">C</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-medium">{weatherData.current.condition.text}</p>
                    <p className="text-white/70">
                      Feels like: {Math.round(weatherData.current.feelslike_c)}°C
                    </p>
                  </div>
                  <img
                    src={`https:${weatherData.current.condition.icon}`.replace('64x64', '128x128')}
                    alt={weatherData.current.condition.text}
                    className="w-24 h-24 -my-4"
                  />
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-3 gap-4 text-center bg-white/10 dark:bg-black/10 p-4 rounded-lg mb-6">
                  <div>
                    <p className="text-sm text-white/60">Humidity</p>
                    <p className="text-lg font-semibold">{weatherData.current.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Wind</p>
                    <p className="text-lg font-semibold">{weatherData.current.wind_kph} kph</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">UV Index</p>
                    <p className="text-lg font-semibold">{weatherData.current.uv}</p>
                  </div>
                </div>

                {/* 3-Day Forecast */}
                <h3 className="text-xl font-bold text-white/90 mb-3">3-Day Forecast</h3>
                <div className="space-y-2">
                  {weatherData.forecast.forecastday.slice(1, 4).map((day) => (
                    <div
                      key={day.date_epoch}
                      className="flex items-center justify-between p-3 bg-white/10 dark:bg-black/10 rounded-lg"
                    >
                      <img
                        src={`https:${day.day.condition.icon}`}
                        alt={day.day.condition.text}
                        className="w-10 h-10"
                      />
                      <p className="font-semibold text-white/80 w-16">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-sm text-white/70 flex-1 truncate px-2" title={day.day.condition.text}>
                        {day.day.condition.text}
                      </p>
                      <p className="text-lg font-medium">
                        {Math.round(day.day.maxtemp_c)}°
                        <span className="text-white/50">/{Math.round(day.day.mintemp_c)}°</span>
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* --- 3B. MOBILE VIEW (ЗДЕСЬ ИЗМЕНЕНИЯ) --- */}
        {/* ================================================================== */}
        <div className="w-full max-w-md bg-gray-900/70 dark:bg-black/70 backdrop-blur-lg rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col md:hidden">

          {/* --- Search Section (Без изменений) --- */}
          <div className="p-4 border-b border-white/20">
             <form onSubmit={handleSearchSubmit} className="relative flex space-x-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search to add a city..."
                className="flex-grow p-3 bg-white/20 dark:bg-black/20 text-white rounded-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                autoComplete="off"
              />
              <button
                type="submit"
                className="p-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
              >
                <SearchIcon />
              </button>

              {isSearchFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-14 mt-2 w-auto max-h-60 overflow-y-auto bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg z-20">
                  {suggestions.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(city)}
                      className="w-full text-left px-4 py-3 text-white/90 hover:bg-blue-500/50 transition-colors"
                    >
                      {city.name}, <span className="text-white/60">{city.region || city.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* --- Main Content (Swipeable) --- */}
          <div
            className="flex-1 p-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* --- ИЗМЕНЕНИЕ: Добавлен AnimatePresence --- */}
            {/* Этот компонент будет отслеживать появление и исчезновение дочерних элементов */}
            <AnimatePresence>

              {/* Conditional Rendering: Loader / Error / Content */}
              {loading && (
                // --- ИЗМЕНЕНИЕ: div заменен на motion.div + добавлены key и props ---
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-20" // Переносим классы сюда
                >
                  <div className="inline-block w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-white/80">Loading...</p>
                </motion.div>
              )}

              {error && !loading && (
                // --- ИЗМЕНЕНИЕ: div заменен на motion.div + добавлены key и props ---
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-20 p-4" // Переносим классы сюда
                >
                  {locationError ? (
                    <>
                      <strong className="text-red-200">Error: {error}</strong>
                      <button
                        onClick={requestLocation}
                        className="mt-4 px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                      >
                        Grant Location Access
                      </button>
                    </>
                  ) : (
                    <strong className="text-red-200">Error: {error}</strong>
                  )}
                </motion.div>
              )}

              {weatherData && !loading && (
                // --- ИЗМЕНЕНИЕ: div заменен на motion.div + key = activeIndex ---
                // activeIndex - это ключ! Когда он меняется, framer-motion запускает анимацию
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  // className="animate-fade-in" // <-- Этот класс больше не нужен!
                >

                  {/* City Name & Favorite Toggle */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-2xl font-light">
                        {weatherData.location.name}
                        {activeIndex === 0 && userLocation && <LocationArrowIcon />}
                      </p>
                      <p className="text-md text-white/70">{weatherData.location.country}</p>
                    </div>
                    {!(activeIndex === 0 && userLocation) && (
                      <button
                        onClick={handleToggleFavorite}
                        className="p-2"
                        title={isCityInFavorites ? "Remove from favorites" : "Add to favorites"}
                      >
                        <HeartIcon filled={isCityInFavorites} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-white/60 mb-6">
                    {new Date(weatherData.location.localtime).toLocaleString('en-US', {
                      weekday: 'long',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </p>

                  {/* Current Weather Main (Icon left, Text right) */}
                  <div className="flex items-center justify-between mb-6">
                    <img
                      src={`https:${weatherData.current.condition.icon}`.replace('64x64', '128x128')}
                      alt={weatherData.current.condition.text}
                      className="w-28 h-28 -my-4"
                    />
                    <div className="text-right">
                      <span className="text-7xl font-light">
                        {Math.round(weatherData.current.temp_c)}°
                      </span>
                      <span className="text-2xl align-top">C</span>
                      <p className="text-lg font-medium">{weatherData.current.condition.text}</p>
                      <p className="text-white/70 text-base">
                        Feels like: {Math.round(weatherData.current.feelslike_c)}°C
                      </p>
                    </div>
                  </div>

                  {/* Additional Details Grid */}
                  <div className="grid grid-cols-3 gap-4 text-center bg-white/10 dark:bg-black/10 p-3 rounded-lg mb-6">
                    <div>
                      <p className="text-xs text-white/60">Humidity</p>
                      <p className="text-base font-semibold">{weatherData.current.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Wind</p>
                      <p className="text-base font-semibold">{weatherData.current.wind_kph} kph</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">UV Index</p>
                      <p className="text-base font-semibold">{weatherData.current.uv}</p>
                    </div>
                  </div>

                  {/* 3-Day Forecast (Vertical List as a Card) */}
                  <div className="bg-white/10 dark:bg-black/10 p-3 rounded-lg">
                    <h3 className="text-lg font-bold text-white/90 mb-3">3-Day Forecast</h3>
                    <div className="space-y-2">
                      {weatherData.forecast.forecastday.slice(1, 4).map((day) => (
                        <div
                          key={day.date_epoch}
                          className="flex items-center justify-between p-2 bg-white/10 dark:bg-black/10 rounded-lg"
                        >
                          <img
                            src={`https:${day.day.condition.icon}`}
                            alt={day.day.condition.text}
                            className="w-8 h-8"
                          />
                          <p className="font-semibold text-white/80 w-14 text-sm">
                            {new Date(day.date).toLocaleString('en-US', { weekday: 'short' })}
                          </p>
                          <p className="text-xs text-white/70 flex-1 truncate px-2" title={day.day.condition.text}>
                            {day.day.condition.text}
                          </p>
                          <p className="text-base font-medium">
                            {Math.round(day.day.maxtemp_c)}°
                            <span className="text-white/50">/{Math.round(day.day.mintemp_c)}°</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence> {/* --- ИЗМЕНЕНИЕ: Конец AnimatePresence --- */}
          </div>

          {/* --- Dots Navigation (Без изменений) --- */}
          {allCards.length > 1 && (
            <div className="flex justify-center space-x-2 p-4 border-t border-white/20">
              {allCards.map((city, index) => (
                <button
                  key={typeof city === 'object' ? city.name : city}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    index === activeIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to ${typeof city === 'object' ? city.name : city}`}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}