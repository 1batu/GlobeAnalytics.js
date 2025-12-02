import express from 'express';
import { fetchActiveUsers } from '../services/ga4.js';
import { geocodeCity } from '../services/geocode.js';
import { getCache, setCache } from '../cache.js';

const router = express.Router();

router.get('/visitors', async (req, res) => {
  const CACHE_KEY = 'visitors_data';

  // Check cache
  const cachedData = getCache(CACHE_KEY);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    // Fetch from GA4
    const gaData = await fetchActiveUsers();

    // Geocode each location
    // Note: In production, you'd want to cache geocoding results individually to avoid rate limits
    // or use a batch geocoder. For this demo, we'll do it sequentially or parallel with limit.
    // Open-Meteo has rate limits, so be careful.

    const processedData = await Promise.all(gaData.map(async (item) => {
      if (!item.city || item.city === '(not set)') return null;

      const coords = await geocodeCity(item.city, item.country);
      if (coords) {
        return {
          ...item,
          lat: coords.lat,
          lng: coords.lng
        };
      }
      return null;
    }));

    // Filter out nulls
    const validData = processedData.filter(item => item !== null);

    // Cache result (5 minutes)
    setCache(CACHE_KEY, validData, 300);

    res.json(validData);
  } catch (error) {
    console.error('Error in /visitors route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
