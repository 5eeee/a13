import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Contacts } from "./pages/Contacts";
import { Calculator } from "./pages/Calculator";
import { FAQ } from "./pages/FAQ";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";
import { Blog } from "./pages/Blog";
import { BlogDetail } from "./pages/BlogDetail";
import { Clients } from "./pages/Clients";
import { Vacancies } from "./pages/Vacancies";

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "services", element: <Services /> },
      { path: "gallery", element: <Projects /> },
      { path: "gallery/:id", element: <ProjectDetail /> },
      { path: "calculator", element: <Calculator /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetail /> },
      { path: "faq", element: <FAQ /> },
      { path: "contacts", element: <Contacts /> },
      { path: "clients", element: <Clients /> },
      { path: "vacancies", element: <Vacancies /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "admin", element: <Admin /> },
]);