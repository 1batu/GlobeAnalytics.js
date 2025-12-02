import fetch from 'node-fetch';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const geocodeCity = async (city, country) => {
  if (!city) return null;

  try {
    const url = `${BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      // Optional: Verify country matches if needed, but Open-Meteo usually gives best match
      return {
        lat: result.latitude,
        lng: result.longitude,
        country: result.country,
        city: result.name
      };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding ${city}:`, error);
    return null;
  }
};
