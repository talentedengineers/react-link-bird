import axios from "axios";
import { useFormik } from "formik";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { BsLink } from "react-icons/bs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { API_FQDN } from "../constants";
import { useFetch, usePageContext } from "../hooks";
import { Link as LinkModel } from "../models";

export function AppLinks() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const pageContext = usePageContext();

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fqdn: "lnkbrd.com",
      longUrl: "",
    },
    onSubmit: async (values) => {
      if (!pageContext.user) {
        return;
      }

      const response = await axios.post<LinkModel>(
        `https://${API_FQDN}/api/v1/links`,
        {
          longUrl: values.longUrl,
          shortUrlFqdn: values.fqdn,
        },
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
          },
        }
      );

      navigate(`/app/links/${response.data.code}`);
    },
    validationSchema: Yup.object().shape({
      fqdn: Yup.string().required(),
      longUrl: Yup.string()
        .matches(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
        )
        .required(),
    }),
  });

  const links = useFetch({
    auto: true,
    dependencies: [pageContext.user, urlSearchParams],
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      const response = await axios.get<{
        data: Array<LinkModel>;
        meta: {
          page: number;
          pageSize: number;
          total: number;
        };
      }>(`https://${API_FQDN}/api/v1/links`, {
        headers: {
          Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
        },
        params: {
          page: urlSearchParams.get("page") || "1",
          pageSize: "10",
        },
      });

      return response.data;
    },
  });

  if (links.isLoading || !links.result || !links.result.data) {
    return <></>;
  }

  return (
    <>
      <div className="align-items-center d-flex fs-4 fw-bold gap-2 mb-4">
        <BsLink strokeWidth={0.375} />
        <span>Links</span>
      </div>

      <div className="mb-4">
        <Row className="gy-4">
          <Col xs={12} md={3} lg={3}>
            <Form.Group>
              <Form.Select
                className="w-100"
                id="fqdn"
                isInvalid={
                  formik.touched.fqdn && formik.errors.fqdn ? true : false
                }
                name="fqdn"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    formik.submitForm();
                  }
                }}
                value={formik.values.fqdn}
              >
                <option value="lnkbrd.com">lnkbrd.com</option>
                {pageContext.consumer?.metadata
                  ? pageContext.consumer.metadata["fqdns"]
                      ?.split(",")
                      .map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))
                  : null}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6} lg={6}>
            <Form.Group>
              <Form.Control
                className="w-100"
                id="longUrl"
                isInvalid={
                  formik.touched.longUrl && formik.errors.longUrl ? true : false
                }
                name="longUrl"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    formik.submitForm();
                  }
                }}
                placeholder="https://example.com"
                type="url"
                value={formik.values.longUrl}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={3} lg={3}>
            <Button
              className="fw-medium w-100"
              disabled={formik.isSubmitting}
              onClick={() => formik.submitForm()}
              variant="primary"
            >
              Create
            </Button>
          </Col>
        </Row>
      </div>

      {links.result.data.length ? (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {links.result.data.map((x, index) => (
                <tr key={index}>
                  <td>
                    <Link to={`/app/links/${x.code}`}>
                      {x.name || x.shortUrl}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination>
            {new Array(
              Math.ceil(links.result.meta.total / links.result.meta.pageSize)
            )
              .fill(0)
              .map((_, index) => (
                <Pagination.Item
                  active={
                    (urlSearchParams.get("page") || "1") === `${index + 1}`
                      ? true
                      : false
                  }
                  key={index + 1}
                  onClick={() =>
                    setUrlSearchParams({
                      page: `${index + 1}`,
                    })
                  }
                >
                  {index + 1}
                </Pagination.Item>
              ))}
          </Pagination>
        </>
      ) : (
        <div className="d-flex justify-content-center">
          <div
            style={{
              maxWidth: "576px",
            }}
          >
            <img className="w-100" src="/undraw_empty_re_opql.svg" />
          </div>
        </div>
      )}
    </>
  );
}
