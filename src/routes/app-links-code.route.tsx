import axios from "axios";
import { useFormik } from "formik";
import moment from "moment";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import { BsFiles, BsLink, BsPlus } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { API_FQDN } from "../constants";
import { useFetch, usePageContext } from "../hooks";
import { Link } from "../models";
import { StatsCard } from "../components";

export function AppLinksCode() {
  const pageContext = usePageContext();

  const params = useParams();

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      longUrl: "",
      geoTargeting: [] as Array<{ country: string; longUrl: string }>,
      name: "",
    },
    onSubmit: async (values) => {
      if (!pageContext.user || !link.result || !link.result) {
        return;
      }

      await axios.put<Link>(
        `https://${API_FQDN}/api/v1/links/${params.code}`,
        {
          ...link.result,
          geoTargeting: values.geoTargeting,
          longUrl: values.longUrl,
          name: values.name || null,
        },
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
          },
        }
      );

      link.execute();
    },
    validationSchema: Yup.object().shape({
      longUrl: Yup.string()
        .matches(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
        )
        .required(),
      geoTargeting: Yup.array()
        .of(
          Yup.object().shape({
            country: Yup.string().required(),
            longUrl: Yup.string()
              .matches(
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
              )
              .required(),
          })
        )
        .required(),
      name: Yup.string().optional(),
    }),
  });

  const link = useFetch({
    auto: true,
    dependencies: [pageContext.user, params],
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      const response = await axios.get<Link>(
        `https://${API_FQDN}/api/v1/links/${params.code}`,
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
          },
        }
      );

      return response.data;
    },
    onComplete: async (link) => {
      if (!link) {
        return;
      }

      formik.setFieldValue("geoTargeting", link.geoTargeting || []);
      formik.setFieldValue("longUrl", link.longUrl || "");
      formik.setFieldValue("name", link.name || "");
    },
  });

  const linkDelete = useFetch({
    auto: false,
    dependencies: [],
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      const response = await axios.delete(
        `https://${API_FQDN}/api/v1/links/${params.code}`,
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
          },
        }
      );

      return response.data;
    },
    onComplete: async () => {
      navigate("/app/links");
    },
  });

  if (link.isLoading || !link.result || !link.result) {
    return <></>;
  }

  return (
    <>
      <div className="align-items-center d-flex fs-4 fw-bold gap-2 mb-4">
        <BsLink strokeWidth={0.375} />
        <span>Links - {link.result.code}</span>
      </div>

      <Row className="gy-4">
        <Col
          className="d-block d-md-none"
          xs={{ order: 1, span: 12 }}
          md={{ order: 1, span: 7 }}
          lg={{ order: 1, span: 7 }}
        >
          <div className="d-flex flex-column flex-md-row gap-4 mb-4">
            <StatsCard label="Clicks" value={link.result.clicks.count} />
            <StatsCard
              label="Last Click"
              value={
                link.result.clicks.timestamp
                  ? `${moment
                      .duration(
                        moment(link.result.clicks.timestamp).diff(moment())
                      )
                      .humanize()} ago`
                  : "N/A"
              }
            />
          </div>
        </Col>
        <Col
          xs={{ order: 3, span: 12 }}
          md={{ order: 2, span: 7 }}
          lg={{ order: 2, span: 7 }}
        >
          <div className="d-none d-md-flex flex-column flex-md-row gap-4 mb-4">
            <StatsCard label="Clicks" value={link.result.clicks.count} />
            <StatsCard
              label="Last Click"
              value={
                link.result.clicks.timestamp
                  ? `${moment
                      .duration(
                        moment(link.result.clicks.timestamp).diff(moment())
                      )
                      .humanize()} ago`
                  : "N/A"
              }
            />
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="mb-1 text-muted">
              <small>Name</small>
            </Form.Label>
            <Form.Control
              isInvalid={
                formik.touched.name && formik.errors.name ? true : false
              }
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.name}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="mb-1 text-muted">
              <small>Short URL</small>
            </Form.Label>
            <InputGroup>
              <Form.Control
                disabled={true}
                name="longUrl"
                type="text"
                value={link.result.shortUrl}
              />
              <InputGroup.Text
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() =>
                  navigator.clipboard.writeText(link.result?.shortUrl || "")
                }
              >
                <BsFiles />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="mb-1 text-muted">
              <small>Long URL (Required)</small>
            </Form.Label>
            <Form.Control
              isInvalid={
                formik.touched.longUrl && formik.errors.longUrl ? true : false
              }
              name="longUrl"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.longUrl}
            />
          </Form.Group>

          <div>
            <div className="d-flex justify-content-between">
              <div className="fw-bold mb-4">Geo Targeting</div>
              <div>
                <Button
                  onClick={() => {
                    formik.setFieldValue("geoTargeting", [
                      ...formik.values.geoTargeting,
                      {
                        country: "",
                        longUrl: "",
                      },
                    ]);
                  }}
                  size="sm"
                  variant="secondary"
                >
                  <BsPlus />
                </Button>
              </div>
            </div>

            {formik.values.geoTargeting.length ? (
              formik.values.geoTargeting.map((_, index) => (
                <Row key={index}>
                  <Col xs={12} md={4} lg={4}>
                    <Form.Group className="mb-4">
                      <Form.Label className="mb-1 text-muted">
                        <small>Country</small>
                      </Form.Label>
                      <Form.Control
                        name={`geoTargeting[${index}].country`}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="text"
                        value={formik.values.geoTargeting[index]?.country}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={8} lg={8}>
                    <Form.Group className="mb-4">
                      <Form.Label className="mb-1 text-muted">
                        <small>Long URL</small>
                      </Form.Label>
                      <Form.Control
                        name={`geoTargeting[${index}].longUrl`}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="text"
                        value={formik.values.geoTargeting[index]?.longUrl}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ))
            ) : (
              <Row>
                <Col xs={12} md={4} lg={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="mb-1 text-muted">
                      <small>Country</small>
                    </Form.Label>
                    <Form.Control disabled={true} type="text" value="ALL" />
                  </Form.Group>
                </Col>
                <Col xs={12} md={8} lg={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="mb-1 text-muted">
                      <small>Long URL</small>
                    </Form.Label>
                    <Form.Control
                      disabled={true}
                      isInvalid={
                        formik.touched.longUrl && formik.errors.longUrl
                          ? true
                          : false
                      }
                      name="longUrl"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.longUrl}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </div>

          <Button
            className="fw-medium mb-4 w-100"
            disabled={formik.isSubmitting}
            onClick={() => formik.submitForm()}
            variant="primary"
          >
            Save Changes
          </Button>

          <Button
            className="fw-medium mb-4 w-100"
            disabled={linkDelete.isLoading}
            onClick={() => linkDelete.execute()}
            variant="outline-dark"
          >
            Delete Link
          </Button>
        </Col>
        <Col
          xs={{ order: 2, span: 12 }}
          md={{ order: 2, span: 5 }}
          lg={{ order: 2, span: 5 }}
        >
          <div
            className="border border-2 border-dark rounded"
            style={{ backgroundColor: "#f2f3f5" }}
          >
            <img
              className="mb-4 w-100"
              src={link.result.openGraph?.image || ""}
            />
            <div className="pb-2 px-2">
              <div className="mb-1 text-muted text-uppercase">
                <small>{new URL(link.result.longUrl).hostname}</small>
              </div>
              <div className="fw-bold mb-1">{link.result.openGraph?.title}</div>
              <div className="mb-1">
                <small>{link.result.openGraph?.description}</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}
