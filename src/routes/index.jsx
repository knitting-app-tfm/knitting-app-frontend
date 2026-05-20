import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import App from "../App";
import ImportPage from "../pages/import/ImportPage";
import ImportPdfPage from "../pages/import/ImportPdfPage";
import ImportTextPage from "../pages/import/ImportTextPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ConfirmPatternPage from "../pages/confirm/ConfirmPatternPage";
import DictionaryPage from "../pages/dictionary/DictionaryPage";
import PatternDetailPage from "../pages/pattern/PatternDetailPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/import", element: <ImportPage /> },
      { path: "/import/pdf", element: <ImportPdfPage /> },
      { path: "/import/text", element: <ImportTextPage /> },
      { path: "/patterns/:id", element: <PatternDetailPage /> },
      { path: "/patterns/:id/confirm", element: <ConfirmPatternPage /> },
      { path: "/dictionary", element: <DictionaryPage /> },
    ],
  },
]);

export default router;
