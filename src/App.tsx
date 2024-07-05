import { useEffect } from "react";
import mixpanel from "mixpanel-browser";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AppApiKeys,
  AppDashboard,
  AppLinks,
  AppLinksCode,
  AppRoute,
  SignInRoute,
  SignUpRoute,
} from "./routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignUpRoute />,
  },
  {
    path: "/app",
    element: <AppRoute />,
    children: [
      {
        path: "",
        element: <AppDashboard />,
      },
      {
        path: "dashboard",
        element: <AppDashboard />,
      },
      {
        path: "api-keys",
        element: <AppApiKeys />,
      },
      {
        path: "links",
        element: <AppLinks />,
      },
      {
        path: "links/:code",
        element: <AppLinksCode />,
      },
    ],
  },
  {
    path: "/auth/sign-in",
    element: <SignInRoute />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpRoute />,
  },
]);

function App() {
  useEffect(() => {
    mixpanel.init("6570fb6b55412e8145762b070dd25c3b");

    mixpanel.track("Page View");

    router.subscribe(() => {
      mixpanel.track("Page View");
    });
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
