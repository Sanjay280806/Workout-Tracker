import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import getApiError from "../utils/getApiError";

function useFetch(
  fetchFunction,
  options = {}
) {
  const { immediate = true } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] =
    useState(immediate);
  const [error, setError] = useState("");

  const abortControllerRef = useRef(null);

  // ==========================================
  // REFETCH
  // ==========================================

  const refetch = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setIsLoading(true);
    setError("");

    try {
      const result = await fetchFunction(
        controller.signal
      );

      if (controller.signal.aborted) {
        return null;
      }

      setData(result);

      return result;
    } catch (error) {
      // Request was intentionally cancelled
      if (controller.signal.aborted) {
        return null;
      }

      console.error(error);

      setError(
        getApiError(
          error,
          "Something went wrong."
        )
      );

      return null;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchFunction]);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    if (!immediate) {
      return;
    }

    let cancelled = false;

    const controller = new AbortController();

    abortControllerRef.current = controller;

    async function load() {
      try {
        const result = await fetchFunction(
          controller.signal
        );

        if (cancelled || controller.signal.aborted) {
          return;
        }

        setData(result);
        setError("");
        setIsLoading(false);
      } catch (error) {
        if (
          cancelled ||
          controller.signal.aborted
        ) {
          return;
        }

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

    load();

    return () => {
      cancelled = true;
      controller.abort();

      if (
        abortControllerRef.current ===
        controller
      ) {
        abortControllerRef.current = null;
      }
    };
  }, [fetchFunction, immediate]);

  // ==========================================
  // UNMOUNT CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

export default useFetch;