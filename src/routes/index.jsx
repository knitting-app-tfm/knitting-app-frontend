import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import App from "../App";
import ImportPage from "../pages/import/ImportPage";
import ImportPdfPage from "../pages/import/ImportPdfPage";
import ImportTextPage from "../pages/import/ImportTextPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ConfirmPatternPage from "../pages/confirm/ConfirmPatternPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/import", element: <ImportPage /> },
      { path: "/import/pdf", element: <ImportPdfPage /> },
      { path: "/import/text", element: <ImportTextPage /> },
      { path: "/patterns/:id/confirm", element: <ConfirmPatternPage /> },
    ],
  },
]);

export default router;
