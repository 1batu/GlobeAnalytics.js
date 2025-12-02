const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchVisitors = async () => {
  try {
    const response = await fetch(`${API_URL}/visitors`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return [];
  }
};
