import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

function RouterFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-white text-gray-500 text-sm">
      <span className="inline-block h-8 w-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      Загрузка страницы…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouterFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
