import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

// Initialize GA4 client
// Expects GOOGLE_APPLICATION_CREDENTIALS in .env pointing to a JSON key file
// OR credentials passed directly if preferred, but file path is standard.
const analyticsDataClient = new BetaAnalyticsDataClient();

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

export const fetchAnalyticsData = async () => {
  if (!process.env.GA4_PROPERTY_ID) {
    console.error('GA4_PROPERTY_ID is missing in .env');
    return [];
  }

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [
        { name: 'country' },
        { name: 'city' },
        // Note: 'pagePath' might not be available in real-time API for all properties.
        // Using 'unifiedScreenName' or similar if pagePath fails, but sticking to standard first.
        // For Realtime API, standard dimensions are limited. Let's try 'unifiedScreenName' as a proxy for page/screen.
        { name: 'unifiedScreenName' }
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
      activeUsers: parseInt(row.metricValues[0].value, 10),
      screenPageViews: parseInt(row.metricValues[1].value, 10) || 0,
    }));

    return data;
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    return [];
  }
};
