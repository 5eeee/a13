import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";

const About = lazy(() => import("./pages/About").then((m) => ({ default: m.About })));
const Services = lazy(() => import("./pages/Services").then((m) => ({ default: m.Services })));
const Projects = lazy(() => import("./pages/Projects").then((m) => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail").then((m) => ({ default: m.ProjectDetail })));
const Contacts = lazy(() => import("./pages/Contacts").then((m) => ({ default: m.Contacts })));
const Calculator = lazy(() => import("./pages/Calculator").then((m) => ({ default: m.Calculator })));
const FAQ = lazy(() => import("./pages/FAQ").then((m) => ({ default: m.FAQ })));
const Admin = lazy(() => import("./pages/Admin").then((m) => ({ default: m.Admin })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));
const Blog = lazy(() => import("./pages/Blog").then((m) => ({ default: m.Blog })));
const BlogDetail = lazy(() => import("./pages/BlogDetail").then((m) => ({ default: m.BlogDetail })));
const Clients = lazy(() => import("./pages/Clients").then((m) => ({ default: m.Clients })));
const Audience = lazy(() => import("./pages/Audience").then((m) => ({ default: m.Audience })));
const Vacancies = lazy(() => import("./pages/Vacancies").then((m) => ({ default: m.Vacancies })));
const Privacy = lazy(() => import("./pages/Privacy").then((m) => ({ default: m.Privacy })));

export const router = createBrowserRouter(
  [
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
        { path: "audience", element: <Audience /> },
        { path: "vacancies", element: <Vacancies /> },
        { path: "privacy", element: <Privacy /> },
        { path: "*", element: <NotFound /> },
      ],
    },
    { path: "admin", element: <Admin /> },
  ],
  { basename: import.meta.env.BASE_URL }
);
