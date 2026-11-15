import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route: /shop (list) and /shop/$slug (product page) render inside this <Outlet />.
export const Route = createFileRoute("/shop")({
  component: () => <Outlet />,
});
