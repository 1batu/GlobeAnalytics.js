import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

// Initialize GA4 client
// Expects GOOGLE_APPLICATION_CREDENTIALS in .env pointing to a JSON key file
// OR credentials passed directly if preferred, but file path is standard.
const analyticsDataClient = new BetaAnalyticsDataClient({
  gaxOpts: {
    timeout: 10000, // 10 seconds global timeout
    retry: {
      retryCodes: [14, 4], // UNAVAILABLE, DEADLINE_EXCEEDED
      backoffSettings: {
        initialRetryDelayMillis: 1000,
        retryDelayMultiplier: 1.3,
        maxRetryDelayMillis: 10000,
        initialRpcTimeoutMillis: 10000,
        rpcTimeoutMultiplier: 1.0,
        maxRpcTimeoutMillis: 10000,
        totalTimeoutMillis: 30000, // 30 seconds total
      }
    }
  }
});

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

export const fetchAnalyticsData = async () => {
  // MOCK DATA MODE (If no credentials)
  if (!process.env.GA4_PROPERTY_ID) {
    console.log('GA4_PROPERTY_ID missing. Serving Mock Data.');

    const mockCountries = [
      { country: 'United States', city: 'New York', page: '/home', device: 'desktop', weight: 0.3 },
      { country: 'United States', city: 'San Francisco', page: '/dashboard', device: 'mobile', weight: 0.2 },
      { country: 'Germany', city: 'Berlin', page: '/pricing', device: 'desktop', weight: 0.15 },
      { country: 'United Kingdom', city: 'London', page: '/blog', device: 'mobile', weight: 0.15 },
      { country: 'Japan', city: 'Tokyo', page: '/home', device: 'desktop', weight: 0.1 },
      { country: 'Brazil', city: 'Sao Paulo', page: '/features', device: 'mobile', weight: 0.05 },
      { country: 'India', city: 'Mumbai', page: '/docs', device: 'tablet', weight: 0.05 },
    ];

    const data = [];
    // Generate 20-30 random active sessions
    const sessionCount = Math.floor(Math.random() * 10) + 20;

    for (let i = 0; i < sessionCount; i++) {
      const rand = Math.random();
      let cumulativeWeight = 0;
      let selected = mockCountries[0];

      for (const item of mockCountries) {
        cumulativeWeight += item.weight;
        if (rand < cumulativeWeight) {
          selected = item;
          break;
        }
      }

      // Add some randomness to active users per session
      const activeUsers = Math.floor(Math.random() * 50) + 10;

      data.push({
        country: selected.country,
        city: selected.city,
        page: selected.page,
        device: selected.device,
        activeUsers: activeUsers,
        screenPageViews: activeUsers * (Math.floor(Math.random() * 3) + 1)
      });
    }

    return data;
  }

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [
        { name: 'country' },
        { name: 'city' },
        { name: 'unifiedScreenName' },
        { name: 'deviceCategory' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ],
    });

    // Transform response
    const data = response.rows.map(row => ({
      country: row.dimensionValues[0].value,
      city: row.dimensionValues[1].value,
      page: row.dimensionValues[2].value,
      device: row.dimensionValues[3].value,
      activeUsers: parseInt(row.metricValues[0].value, 10),
      screenPageViews: parseInt(row.metricValues[1].value, 10) || 0,
    }));

    return data;
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    return [];
  }
};
