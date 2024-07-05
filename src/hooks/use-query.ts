import { useEffect, useState } from "react";

export function useQuery<T>(params: {
  actionFn?: ((action: string, obj: any) => Promise<T>) | undefined;
  enabled: boolean;
  key: Array<string | undefined>;
  findFn: () => Promise<T | null>;
}) {
  const [result, setResult] = useState(null as { data: T | null } | null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!params.enabled) {
      return;
    }

    setIsLoading(true);

    params.findFn().then((obj: T | null) => {
      setResult({
        data: obj,
      });
      setIsLoading(false);
    });
  }, [...params.key, params.enabled]);

  return {
    action: async <U>(action: string, obj?: U | undefined) => {
      if (!params.actionFn) {
        throw new Error("");
      }

      setIsLoading(true);

      const result = await params.actionFn(action, obj);

      setResult({
        data: result,
      });

      setIsLoading(false);

      return result;
    },
    find: () => {
      setIsLoading(true);

      params.findFn().then((obj: T | null) => {
        setResult({
          data: obj,
        });
        setIsLoading(false);
      });
    },
    isLoading,
    result,
  };
}
