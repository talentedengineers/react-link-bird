import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_FQDN } from "../constants";
import { useFetch, usePageContext } from "../hooks";

export function AppPayment() {
  const pageContext = usePageContext(false);

  const navigate = useNavigate();

  const fetch = useFetch({
    fn: async () => {
      if (!pageContext.user) {
        return;
      }

      await axios.post(
        `https://${API_FQDN}/api/v1/beetle/payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken()}`,
          },
        }
      );
    },
    onComplete: async () => {
      navigate("/app");
    },
  });

  useEffect(() => {
    if (!pageContext.user) {
      return;
    }

    fetch.execute();
  }, [pageContext.user]);

  return <></>;
}
