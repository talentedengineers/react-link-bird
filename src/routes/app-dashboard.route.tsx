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
    auto: true,
    dependencies: [pageContext.user, period],
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

  if (pixelEvents.isLoading || !pixelEvents.result || !pixelEvents.result) {
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
        <StatsCard label="Clicks" value={pixelEvents.result.length} />
        <StatsCard
          label="Last Click"
          value={
            pixelEvents.result.length
              ? `${moment
                  .duration(
                    moment(
                      Math.max(
                        ...pixelEvents.result.map((x) => x.timestamp)
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
                data: getSeriesData(period, pixelEvents.result),
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
    </>
  );
}
