import { useState, useEffect, useCallback } from 'react';

export function useFetch(apiFn, autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message || 'An error occurred';
      setError(typeof message === 'string' ? message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, []);

  return { data, loading, error, execute, setData };
}
