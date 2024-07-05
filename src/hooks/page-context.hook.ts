import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./use-auth";
import { useFetch } from "./use-fetch";
import { API_FQDN } from "../constants";

export function usePageContext() {
  const navigate = useNavigate();

  const { isLoading, user } = useAuth();

  const fetch = useFetch({
    auto: true,
    dependencies: [user],
    fn: async () => {
      if (!user) {
        return null;
      }

      const response = await axios.get<{
        metadata: { [key: string]: string | undefined } | undefined;
      }>(`https://${API_FQDN}/api/v1/beetle/consumers`, {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });

      return response.data;
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(`/auth/sign-up`);

      return;
    }
  }, [isLoading, user]);

  if (isLoading || !user) {
    return {
      user: null,
    };
  }

  return {
    consumer: fetch.result,
    user,
  };
}
