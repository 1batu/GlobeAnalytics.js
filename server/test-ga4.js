import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  console.log('Testing GA4 Connection...');
  console.log('Property ID:', process.env.GA4_PROPERTY_ID);
  console.log('Credentials Path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  const analyticsDataClient = new BetaAnalyticsDataClient();

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
    });
    console.log('Success! Data received:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('FAILED:', error.message);
    if (error.details) console.error('Details:', error.details);
  }
};

run();
