import { useCallback, useEffect, useState } from 'react';
import { insightsApi } from '../api';
import { useAuth } from './useAuth';

function browserPosition(timeout = 6000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation unsupported'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      reject,
      { timeout, maximumAge: 30 * 60 * 1000 }
    );
  });
}

/**
 * Current environmental conditions. Uses the saved profile location if present,
 * otherwise asks the browser (and saves it to the profile for next time).
 * status: 'loading' | 'ready' | 'needs-location' | 'error'
 */
export function useWeather() {
  const { user, updateProfile } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const hasSavedLocation = user?.latitude != null && user?.longitude != null;

  const locate = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const { lat, lon } = await browserPosition();
      const data = await insightsApi.weather(lat, lon);
      setState({ status: 'ready', data, error: null });
      updateProfile({ latitude: lat, longitude: lon }).catch(() => {});
    } catch (error) {
      setState({ status: error?.status ? 'error' : 'needs-location', data: null, error });
    }
  }, [updateProfile]);

  useEffect(() => {
    let active = true;
    const load = hasSavedLocation ? insightsApi.weather() : browserPosition().then(({ lat, lon }) => insightsApi.weather(lat, lon));
    load
      .then((data) => active && setState({ status: 'ready', data, error: null }))
      .catch((error) => active && setState({ status: error?.status ? 'error' : 'needs-location', data: null, error }));
    return () => {
      active = false;
    };
  }, [hasSavedLocation]);

  return { ...state, locate };
}
