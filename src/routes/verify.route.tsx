import axios from "axios";
import crypto from "crypto";
import { useState } from "react";
import { useFormik } from "formik";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { API_FQDN, APP_NAME } from "../constants";
import { useFetch, usePageContext } from "../hooks";

export function VerifyRoute() {
  const navigate = useNavigate();

  const pageContext = usePageContext(false);

  const [message, setMessage] = useState(null as string | null);

  useFetch({
    auto: true,
    dependencies: [pageContext.user],
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      try {
        const codeChallenge: string = [
          ...new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(pageContext.user.uid)
            )
          ),
        ]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");

        await axios.get("https://onetimepassword.co/api/v1/verify", {
          params: {
            code_challenge: codeChallenge,
            destination: pageContext.user.email,
          },
        });
      } catch {}

      return {};
    },
  });

  const formik = useFormik({
    initialValues: {
      code: "",
    },
    onSubmit: async (values) => {
      try {
        if (!pageContext.user) {
          return;
        }

        const response = await axios.post<{ access_token: string }>(
          "https://onetimepassword.co/api/v1/verify",
          {
            code: values.code,
            code_verifier: pageContext.user.uid,
          }
        );

        await axios.get<{
          emailAddress: string;
          id: string;
          metadata: { [key: string]: string | undefined };
          subscription: string | null;
          verified: boolean;
        }>(`https://${API_FQDN}/api/v1/beetle/consumers/verify`, {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken()}`,
          },
          params: {
            access_token: response.data.access_token,
          },
        });

        navigate("/app");
      } catch {
        setMessage("The OTP you've entered is incorrect, please try again.");

        formik.resetForm();
      }
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().min(4).required(),
    }),
  });

  if (!pageContext.user) {
    return <></>;
  }

  return (
    <>
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand className="fw-semibold" href="/">
            {APP_NAME}
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container
        style={{
          maxWidth: "576px",
          paddingBottom: "6rem",
          paddingTop: "3rem",
        }}
      >
        <h1 className="mb-1 text-center">Verify Your Email Address</h1>
        <div className="mb-4 text-center">
          Enter the one-time password (OTP) sent to your email adddress to
          continue.
        </div>

        <Form.Group className="mb-4">
          <Form.Control
            isInvalid={formik.touched.code && formik.errors.code ? true : false}
            name="code"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                formik.submitForm();
              }
            }}
            placeholder="Enter your OTP"
            size="lg"
            type="email"
            value={formik.values.code}
          />
          {message ? (
            <Form.Text className="text-danger">{message}</Form.Text>
          ) : null}
        </Form.Group>

        <Button
          className="fw-semibold mb-4 w-100"
          disabled={formik.isSubmitting}
          onClick={() => {
            formik.submitForm();
          }}
          size="lg"
          variant="primary"
        >
          Verify
        </Button>
      </Container>
    </>
  );
}
