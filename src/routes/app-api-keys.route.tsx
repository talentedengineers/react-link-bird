import { useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { BsFiles, BsKey } from "react-icons/bs";
import { API_FQDN } from "../constants";
import { useFetch, usePageContext } from "../hooks";

export function AppApiKeys() {
  const pageContext = usePageContext();

  const tokens = useFetch({
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      const response = await axios.get<Array<string>>(
        `https://${API_FQDN}/api/v1/beetle/tokens`,
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken()}`,
          },
        }
      );

      return response.data;
    },
    onComplete: async (result) => {
      if (!pageContext.user) {
        return;
      }

      if (!result) {
        return;
      }

      if (result.length) {
        return;
      }

      await axios.post<Array<string>>(
        `https://${API_FQDN}/api/v1/beetle/tokens`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken()}`,
          },
        }
      );

      tokens.execute();
    },
  });

  const createToken = useFetch({
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      const response = await axios.post<Array<string>>(
        `https://${API_FQDN}/api/v1/beetle/tokens`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
          },
        }
      );

      return response.data;
    },
    onComplete: async () => {
      tokens.execute();
    },
  });

  useEffect(() => {
    if (!pageContext.user) {
      return;
    }

    tokens.execute();
  }, [pageContext.user]);

  if (tokens.isLoading || !tokens.result || !tokens.result.data) {
    return <></>;
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <div className="align-items-center d-flex fs-4 fw-bold gap-2 mb-4">
          <BsKey strokeWidth={0.375} />
          <span>API Keys</span>
        </div>
        <div>
          <Button
            className="fw-medium"
            disabled={createToken.isLoading}
            onClick={() => createToken.execute()}
          >
            New API Key
          </Button>
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Token</th>
          </tr>
        </thead>
        <tbody>
          {tokens.result.data.map((x) => (
            <tr key={x}>
              <td className="align-items-center d-flex gap-4">
                <span>{x}</span>
                <BsFiles
                  onClick={() => navigator.clipboard.writeText(x)}
                  style={{ cursor: "pointer" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
