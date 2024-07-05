import classNames from "classnames";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import { BsBarChart, BsFiles, BsKey, BsLink, BsPower } from "react-icons/bs";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { API_FQDN, APP_NAME } from "../constants";
import { usePageContext } from "../hooks";
import { useState } from "react";

export function AppRoute() {
  const location = useLocation();

  const navigate = useNavigate();

  const pageContext = usePageContext();

  const [navBarExpanded, setNavBarExpanded] = useState(false);

  if (!pageContext.user) {
    return <></>;
  }

  return (
    <>
      <Navbar
        className="d-block d-md-none"
        expand="lg"
        expanded={navBarExpanded}
        onToggle={() => setNavBarExpanded(!navBarExpanded)}
      >
        <Container>
          <Navbar.Brand
            className="align-items-center d-flex fw-semibold gap-2"
            href="/app"
          >
            {APP_NAME}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                onClick={() => setNavBarExpanded(false)}
                to="/app/dashboard"
              >
                Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                onClick={() => setNavBarExpanded(false)}
                to="/app/links"
              >
                Links
              </Nav.Link>
              <Nav.Link
                as={Link}
                onClick={() => setNavBarExpanded(false)}
                to="/app/api-keys"
              >
                API Keys
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/auth/sign-in">
                Sign Out
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container
        style={{
          paddingBottom: "6rem",
          paddingTop: "3rem",
        }}
      >
        <Row>
          <Col className="d-none d-md-block" xs={12} md={3} lg={3}>
            <div
              className="fs-4 fw-bold mb-4"
              onClick={() => navigate("/app")}
              style={{ cursor: "pointer" }}
            >
              {APP_NAME}
            </div>

            <div className="mb-4">
              {[
                [
                  location.pathname === "/app" ||
                    location.pathname === "/app/dashboard",
                  <BsBarChart strokeWidth={0.375} />,
                  "Dashboard",
                  "/app/dashboard",
                ],
                [
                  location.pathname === "/app/links" ||
                    location.pathname.startsWith("/app/links"),
                  <BsLink strokeWidth={0.375} />,
                  "Links",
                  "/app/links",
                ],
                [
                  location.pathname === "/app/api-keys",
                  <BsKey strokeWidth={0.375} />,
                  "API Keys",
                  "/app/api-keys",
                ],
              ].map((x) => (
                <div
                  className={classNames(
                    "align-items-center d-flex gap-2 py-2 mb-2",
                    {
                      "fw-bold": x[0],
                      "bg-dark": x[0],
                      "px-4": x[0],
                      rounded: x[0],
                      "text-white": x[0],
                    }
                  )}
                  key={x[2] as string}
                  onClick={() => navigate(x[3] as string)}
                  style={{ cursor: "pointer" }}
                >
                  {x[1]}
                  <span>{x[2]}</span>
                </div>
              ))}

              <div
                className="align-items-center d-flex gap-2 py-2 mb-4"
                onClick={() =>
                  window.open(`https://${API_FQDN}/docs`, "_blank")
                }
                style={{ cursor: "pointer" }}
              >
                <BsFiles strokeWidth={0.375} />
                <span>Documentation</span>
              </div>
              <div
                className="align-items-center d-flex gap-2 py-2 mb-2"
                onClick={() => navigate("/auth/sign-in")}
                style={{ cursor: "pointer" }}
              >
                <BsPower strokeWidth={0.375} />
                <span>Sign Out</span>
              </div>
            </div>
          </Col>

          <Col>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
}
