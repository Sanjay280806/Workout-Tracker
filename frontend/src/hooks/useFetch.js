import { useCallback, useEffect, useState } from "react";
import getApiError from "../utils/getApiError";

function useFetch(fetchFunction, options = {}) {
  const { immediate = true } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await fetchFunction();

      setData(result);

      return result;
    } catch (error) {
      console.error(error);

      const message = getApiError(
        error,
        "Something went wrong."
      );

      setError(message);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (!immediate) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setError("");

        const result = await fetchFunction();

        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);

          setError(
            getApiError(
              error,
              "Something went wrong."
            )
          );

          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchFunction, immediate]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

export default useFetch;