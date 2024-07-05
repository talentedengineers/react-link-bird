import { useEffect } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import Dropdown from "react-bootstrap/Dropdown";
import { BsBarChart } from "react-icons/bs";
import { API_FQDN } from "../constants";
import { useFetch, usePageContext } from "../hooks";
import { PixelEvent } from "../models";
import { StatsCard } from "../components";
import { useSearchParams } from "react-router-dom";

// function formatReferrer(referrer: string | null): string | null {
//   if (!referrer) {
//     return null;
//   }

//   if (referrer === "android-app://com.linkedin.android/") {
//     return "linkedin.com";
//   }

//   if (!referrer.startsWith("http://") && !referrer.startsWith("https://")) {
//     return referrer;
//   }

//   const hostname: string = new URL(referrer).hostname;

//   const hostnameSplitted: Array<string> = hostname.split(".");

//   return `${hostnameSplitted[hostnameSplitted.length - 2]}.${
//     hostnameSplitted[hostnameSplitted.length - 1]
//   }`;
// }

function getSeriesData(period: string, data: Array<PixelEvent>) {
  if (period === "P7D") {
    return new Array(7)
      .fill(0)
      .map(
        (_, index) =>
          data.filter(
            (y) =>
              y.timestamp >=
                moment()
                  .startOf("days")
                  .subtract(index, "days")
                  .toDate()
                  .getTime() &&
              y.timestamp <
                moment()
                  .endOf("days")
                  .subtract(index, "days")
                  .toDate()
                  .getTime()
          ).length
      )
      .reverse();
  }

  if (period === "P14D") {
    return new Array(14)
      .fill(0)
      .map(
        (_, index) =>
          data.filter(
            (y) =>
              y.timestamp >=
                moment()
                  .startOf("days")
                  .subtract(index, "days")
                  .toDate()
                  .getTime() &&
              y.timestamp <
                moment()
                  .endOf("days")
                  .subtract(index, "days")
                  .toDate()
                  .getTime()
          ).length
      )
      .reverse();
  }

  return new Array(24)
    .fill(0)
    .map(
      (_, index) =>
        data.filter(
          (y) =>
            y.timestamp >=
              moment()
                .startOf("hours")
                .subtract(index, "hours")
                .toDate()
                .getTime() &&
            y.timestamp <
              moment()
                .endOf("hours")
                .subtract(index, "hours")
                .toDate()
                .getTime()
        ).length
    )
    .reverse();
}

function getXAxisCategories(period: string) {
  if (period === "P7D") {
    return new Array(7)
      .fill(0)
      .map((_, index) =>
        moment().startOf("days").subtract(index, "days").format("MMM, DD")
      )
      .reverse();
  }

  if (period === "P14D") {
    return new Array(14)
      .fill(0)
      .map((_, index) =>
        moment().startOf("days").subtract(index, "days").format("MMM, DD")
      )
      .reverse();
  }

  return new Array(24)
    .fill(0)
    .map((_, index) =>
      moment().startOf("hours").subtract(index, "hours").format("HH:mm")
    )
    .reverse();
}

export function AppDashboard() {
  const [urlSearchParams] = useSearchParams();

  const period: string = urlSearchParams.get("period") || "P24H";

  const pageContext = usePageContext();

  const pixelEvents = useFetch({
    fn: async () => {
      if (!pageContext.user) {
        return null;
      }

      const response = await axios.get<Array<PixelEvent>>(
        `https://${API_FQDN}/api/v1/clicks`,
        {
          headers: {
            Authorization: `Bearer ${await pageContext.user.getIdToken(true)}`,
          },
          params: {
            period,
          },
        }
      );

      return response.data;
    },
  });

  useEffect(() => {
    if (!pageContext.user) {
      return;
    }

    pixelEvents.execute();
  }, [pageContext.user]);

  if (
    pixelEvents.isLoading ||
    !pixelEvents.result ||
    !pixelEvents.result.data
  ) {
    return <></>;
  }

  return (
    <>
      <div className="align-items-center d-flex justify-content-between mb-4">
        <div className="align-items-center d-flex fs-4 fw-bold gap-2">
          <BsBarChart strokeWidth={0.375} />
          <span>Dashboard</span>
        </div>
        <div>
          <Dropdown>
            <Dropdown.Toggle variant="outline-dark">
              {period === "P24H"
                ? "Last 24 Hours"
                : period === "P7D"
                ? "Last 7 Days"
                : period === "P14D"
                ? "Last 14 Days"
                : null}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="/app/dashboard?period=P24H">
                Last 24 Hours
              </Dropdown.Item>
              <Dropdown.Item href="/app/dashboard?period=P7D">
                Last 7 Days
              </Dropdown.Item>
              <Dropdown.Item href="/app/dashboard?period=P14D">
                Last 14 Days
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row gap-4 mb-4">
        <StatsCard label="Clicks" value={pixelEvents.result.data.length} />
        <StatsCard
          label="Last Click"
          value={
            pixelEvents.result.data.length
              ? `${moment
                  .duration(
                    moment(
                      Math.max(
                        ...pixelEvents.result.data.map((x) => x.timestamp)
                      )
                    ).diff(moment())
                  )
                  .humanize()} ago`
              : "N/A"
          }
        />
      </div>

      <div className="mb-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            chart: {
              backgroundColor: "#fafcfe",
              type: "column",
            },
            legend: {
              enabled: false,
            },
            title: {
              text: null,
            },
            series: [
              {
                color: "#ffbe1a",
                data: getSeriesData(period, pixelEvents.result.data),
              },
            ],
            tooltip: {
              pointFormat: "{point.y}",
            },
            xAxis: {
              categories: getXAxisCategories(period),
              title: {
                text: null,
              },
            },
            yAxis: {
              title: {
                text: "Number of Clicks",
              },
            },
          }}
        />
      </div>

      {/* <Row className="gy-4">
        <Col xs={12} md={6} lg={6}>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: {
                backgroundColor: "#fafcfe",
                type: "pie",
              },
              legend: {
                enabled: false,
              },
              title: {
                text: null,
              },
              series: [
                {
                  data: logs.result.data.reduce(
                    (arr: Array<{ name: string; y: number }>, x) => {
                      let y = arr.find((z) => z.name === x.country);

                      if (!y) {
                        arr.push({ name: x.country || "Unknown", y: 0 });
                      }

                      y = arr.find((z) => z.name === x.country);

                      if (y) {
                        y.y += 1;
                      }

                      return arr;
                    },
                    [] as Array<{ name: string; y: number }>
                  ),
                },
              ],
              tooltip: {
                pointFormat: "{point.y}",
              },
            }}
          />
        </Col>
      </Row> */}
    </>
  );
}
