import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useFormik } from "formik";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { APP_NAME } from "../constants";
import { AUTH } from "../firebase";

export function SignInRoute() {
  const navigate = useNavigate();

  const [message, setMessage] = useState(null as string | null);

  const formik = useFormik({
    initialValues: {
      emailAddress: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        await signInWithEmailAndPassword(
          AUTH,
          values.emailAddress,
          values.password
        );
        navigate("/app");
      } catch (error: any) {
        const messages: { [key: string]: string } = {
          "auth/invalid-credential":
            "Something went wrong, please try again later",
        };
        setMessage(messages[error.code]);
      }
    },
    validationSchema: Yup.object().shape({
      emailAddress: Yup.string().email().required(),
      password: Yup.string().min(4).required(),
    }),
  });

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
        <h1 className="mb-4 text-center">Welcome to Link Bird</h1>

        <Form.Group className="mb-4">
          <Form.Control
            isInvalid={
              formik.touched.emailAddress && formik.errors.emailAddress
                ? true
                : false
            }
            name="emailAddress"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                formik.submitForm();
              }
            }}
            placeholder="Enter your email address"
            size="lg"
            type="email"
            value={formik.values.emailAddress}
          />
          {message ? (
            <Form.Text className="text-danger">{message}</Form.Text>
          ) : null}
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Control
            isInvalid={
              formik.touched.password && formik.errors.password ? true : false
            }
            name="password"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                formik.submitForm();
              }
            }}
            placeholder="Enter your password"
            size="lg"
            type="password"
            value={formik.values.password}
          />
        </Form.Group>

        <div className="d-flex flex-row-reverse mb-4">
          <div>
            <Link to="/reset-password/request">Forgot your password?</Link>
          </div>
        </div>

        <Button
          className="fw-semibold mb-4 w-100"
          disabled={formik.isSubmitting}
          onClick={() => {
            formik.submitForm();
          }}
          size="lg"
          variant="primary"
        >
          Sign In
        </Button>

        <div>
          By signing in or creating an account, you agree with our{" "}
          <Link to="/terms-of-service">Terms of Service</Link> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </div>
      </Container>
    </>
  );
}
