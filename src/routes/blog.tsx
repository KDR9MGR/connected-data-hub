import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route: /blog (list) and /blog/$slug (post) render inside this <Outlet />.
export const Route = createFileRoute("/blog")({
  component: () => <Outlet />,
});
