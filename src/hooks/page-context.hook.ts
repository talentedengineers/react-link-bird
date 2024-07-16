import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./use-auth";
import { useFetch } from "./use-fetch";
import { API_FQDN } from "../constants";

export function usePageContext(verified: boolean = true) {
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
        emailAddress: string;
        id: string;
        metadata: { [key: string]: string | undefined };
        subscription: string | null;
        verified: boolean;
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

    if (verified && fetch.result && !fetch.result.verified) {
      navigate(`/auth/verify`);

      return;
    }
  }, [isLoading, user, fetch.result]);

  if (isLoading || !user) {
    return {
      consumer: null,
      user: null,
    };
  }

  if (!fetch.result || (verified && !fetch.result.verified)) {
    return {
      consumer: null,
      user: null,
    };
  }

  return {
    consumer: fetch.result,
    user,
  };
}
