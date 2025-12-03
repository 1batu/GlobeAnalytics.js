import express from 'express';
import { fetchAnalyticsData } from '../services/ga4.js';
import { geocodeCity } from '../services/geocode.js';
import { getCache, setCache } from '../cache.js';

const router = express.Router();

router.get('/dashboard-data', async (req, res) => {
  const CACHE_KEY = 'dashboard_data';

  // Check cache
  const cachedData = getCache(CACHE_KEY);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const rawData = await fetchAnalyticsData();

    // 1. Aggregate Countries
    const countryMap = {};
    // 2. Aggregate Pages
    const pageMap = {};
    // 3. Aggregate Cities
    const cityMap = {};
    // 4. Prepare Routes (City -> Turkey)
    const routes = [];

    // Turkey Center Coordinates
    const TURKEY_LAT = 39.9334;
    const TURKEY_LNG = 32.8597;

    // Process Data
    for (const item of rawData) {
      // Country Aggregation
      if (!countryMap[item.country]) {
        countryMap[item.country] = { name: item.country, activeUsers: 0 };
      }
      countryMap[item.country].activeUsers += item.activeUsers;

      // City Aggregation
      if (item.city && item.city !== '(not set)') {
        if (!cityMap[item.city]) {
          cityMap[item.city] = { name: item.city, country: item.country, activeUsers: 0 };
        }
        cityMap[item.city].activeUsers += item.activeUsers;
      }

      // Page Aggregation
      if (!pageMap[item.page]) {
        pageMap[item.page] = { path: item.page, views: 0 };
      }
      pageMap[item.page].views += item.activeUsers; // Using active users as proxy for "live views"

      // Route Processing (Geocoding)
      if (item.city && item.city !== '(not set)') {
        const coords = await geocodeCity(item.city, item.country);
        if (coords) {
          routes.push({
            startLat: coords.lat,
            startLng: coords.lng,
            endLat: TURKEY_LAT,
            endLng: TURKEY_LNG,
            activeUsers: item.activeUsers,
            city: item.city,
            country: item.country,
            page: item.page,
            label: `${item.city} \n ${item.page}` // Multi-line label: City + Page
          });
        }
      }
    }

    const responseData = {
      countries: Object.values(countryMap).sort((a, b) => b.activeUsers - a.activeUsers),
      cities: Object.values(cityMap).sort((a, b) => b.activeUsers - a.activeUsers).slice(0, 10),
      pages: Object.values(pageMap).sort((a, b) => b.views - a.views).slice(0, 10),
      routes: routes,
      stats: {
        activeUsers: rawData.reduce((sum, item) => sum + item.activeUsers, 0),
        uniqueCountries: Object.keys(countryMap).length,
        uniqueCities: routes.length, // Approx
        totalPageViews: rawData.reduce((sum, item) => sum + item.screenPageViews, 0)
      }
    };

    setCache(CACHE_KEY, responseData, 10); // 10s cache for live feel
    res.json(responseData);

  } catch (error) {
    console.error('Error in /dashboard-data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
