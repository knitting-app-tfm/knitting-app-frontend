import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import App from "../App";
import ImportPage from "../pages/import/ImportPage";
import ImportPdfPage from "../pages/import/ImportPdfPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/import", element: <ImportPage /> },
      { path: "/import/pdf", element: <ImportPdfPage /> },
    ],
  },
]);

export default router;
