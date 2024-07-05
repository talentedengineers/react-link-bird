import { useEffect, useState } from "react";

export function useFetch<T>(params: {
  auto: boolean;
  dependencies: Array<any>;
  fn: (...args: Array<any>) => Promise<T | null>;
  onComplete?: (result: T | null) => Promise<void>;
}) {
  const [result, setResult] = useState(null as T | null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.auto) {
      setIsLoading(true);

      params.fn().then((obj: T | null) => {
        setResult(obj);
        setIsLoading(false);

        if (params.onComplete) {
          params.onComplete(obj);
        }
      });
    }
  }, params.dependencies);

  return {
    execute: (...args: Array<any>) => {
      setIsLoading(true);

      params.fn(...args).then((obj: T | null) => {
        setResult(obj);
        setIsLoading(false);

        if (params.onComplete) {
          params.onComplete(obj);
        }
      });
    },
    isLoading,
    result,
  };
}
