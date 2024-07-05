import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./use-auth";
import { useFetch } from "./use-query";
import { API_FQDN } from "../constants";

export function usePageContext(requireSubscription: boolean = true) {
  const navigate = useNavigate();

  const { isLoading, user } = useAuth();

  const fetch = useFetch({
    fn: async () => {
      if (!user) {
        return null;
      }

      const response = await axios.get<{ subscription: string | null }>(
        `https://${API_FQDN}/api/v1/beetle/consumers`,
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );

      return response.data;
    },
    onComplete: async (consumer) => {
      if (!requireSubscription) {
        return;
      }

      console.log(consumer);

      // if (consumer && consumer.subscription) {
      //   return;
      // }

      // window.location.href = "https://buy.stripe.com/4gw8xc03R8tO0wg8ww";
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(`/auth/sign-up`);

      return;
    }

    fetch.execute();
  }, [isLoading, user]);

  if (isLoading || !user) {
    return {
      user: null,
    };
  }

  // if (
  //   requireSubscription &&
  //   (!fetch.result || !fetch.result.data || !fetch.result.data.subscription)
  // ) {
  //   return {
  //     user: null,
  //   };
  // }

  return {
    user,
  };
}
