import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import App from "../App";
import ImportPage from "../pages/import/ImportPage";
import ImportPdfPage from "../pages/import/ImportPdfPage";
import ImportTextPage from "../pages/import/ImportTextPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/import", element: <ImportPage /> },
      { path: "/import/pdf", element: <ImportPdfPage /> },
      { path: "/import/text", element: <ImportTextPage /> },
    ],
  },
]);

export default router;
