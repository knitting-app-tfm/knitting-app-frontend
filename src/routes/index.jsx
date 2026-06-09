import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import App from "../App";
import ImportPage from "../pages/import/ImportPage";
import ImportPdfPage from "../pages/import/ImportPdfPage";
import ImportTextPage from "../pages/import/ImportTextPage";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import PatternListPage from "../pages/pattern/PatternListPage";
import ConfirmPatternPage from "../pages/confirm/ConfirmPatternPage";
import DictionaryPage from "../pages/dictionary/DictionaryPage";
import PatternDetailPage from "../pages/pattern/PatternDetailPage";
import PatternTranslationPage from "../pages/pattern/PatternTranslationPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/patterns", element: <PatternListPage /> },
      { path: "/import", element: <ImportPage /> },
      { path: "/import/pdf", element: <ImportPdfPage /> },
      { path: "/import/text", element: <ImportTextPage /> },
      { path: "/patterns/:id", element: <PatternDetailPage /> },
      { path: "/patterns/:id/confirm", element: <ConfirmPatternPage /> },
      {
        path: "/patterns/:id/translation",
        element: <PatternTranslationPage />,
      },
      { path: "/dictionary", element: <DictionaryPage /> },
    ],
  },
]);

export default router;
