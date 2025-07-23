// src/hooks/useTracking.js
import { useEffect } from 'react';
import axios from 'axios';

export default function useTracking(path, vehicleId = null) {
  useEffect(() => {
    const track = async () => {
      try {
        await axios.post('/api/track-activity/', {
          path: path,
          vehicle_id: vehicleId
        });
      } catch (error) {
        console.error('Tracking error:', error);
      }
    };
    
    // Only track in production
    if (process.env.NODE_ENV === 'production') {
      track();
    }
  }, [path, vehicleId]);
}