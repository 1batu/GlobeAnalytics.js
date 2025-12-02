import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

// Initialize GA4 client
// Expects GOOGLE_APPLICATION_CREDENTIALS in .env pointing to a JSON key file
// OR credentials passed directly if preferred, but file path is standard.
const analyticsDataClient = new BetaAnalyticsDataClient();

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

export const fetchActiveUsers = async () => {
  if (!PROPERTY_ID) {
    console.error('GA4_PROPERTY_ID is missing in .env');
    return [];
  }

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${PROPERTY_ID}`,
      dimensions: [
        { name: 'country' },
        { name: 'city' },
      ],
      metrics: [
        { name: 'activeUsers' },
      ],
    });

    // Transform response
    const data = response.rows.map(row => ({
      country: row.dimensionValues[0].value,
      city: row.dimensionValues[1].value,
      activeUsers: parseInt(row.metricValues[0].value, 10),
    }));

    return data;
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    return [];
  }
};
