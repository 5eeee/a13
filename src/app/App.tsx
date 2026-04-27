import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { PageLoader } from "./components/PageLoader";
import { router } from "./routes";

function RouterFallback() {
  return <PageLoader caption="Загрузка страницы…" />;
}

export default function App() {
  return (
    <Suspense fallback={<RouterFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
