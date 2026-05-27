import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ConfirmPatternForm from "../../components/confirm/ConfirmPatternForm";
import { getPattern, confirmPattern } from "../../services/patternService";

function ConfirmPatternPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData]     = useState(null);
  const [fetchError, setFetchError]       = useState(null);
  const [fetchLoading, setFetchLoading]   = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError]     = useState(null);

  useEffect(() => {
    getPattern(id)
      .then(setInitialData)
      .catch((err) => setFetchError(err.message))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append("title", data.title);
      fd.append("craft", data.craft);
      if (data.gauge_stitches !== "" && data.gauge_stitches != null) fd.append("gauge_stitches", data.gauge_stitches);
      if (data.gauge_rows     !== "" && data.gauge_rows     != null) fd.append("gauge_rows",     data.gauge_rows);
      if (data.gauge_size     !== "" && data.gauge_size     != null) fd.append("gauge_size",     data.gauge_size);
      if (data.gauge_unit)   fd.append("gauge_unit",   data.gauge_unit);
      if (data.needle_size)  fd.append("needle_size",  data.needle_size);
      fd.append("sizes", JSON.stringify(data.sizes));
      fd.append("yarns", JSON.stringify(data.yarns));
      if (data.coverImage)   fd.append("cover_image",  data.coverImage);

      await confirmPattern(id, fd);
      navigate(`/patterns/${id}`, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" style={{ color: "var(--kn-primary)" }}>
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return <div className="alert alert-danger" role="alert">{fetchError}</div>;
  }

  return (
    <div>
      <nav className="kn-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <Link to={`/patterns/${id}`}>{initialData?.title ?? "Pattern"}</Link>
        <span className="kn-breadcrumb__sep">/</span>
        <span className="kn-breadcrumb__current">Edit metadata</span>
      </nav>

      <h1 className="kn-page-title">Review your pattern</h1>
      <p className="kn-page-subtitle">
        Check the details we extracted and fill in anything that's missing. You can always come back and edit later.
      </p>

      <ConfirmPatternForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={submitLoading}
        error={submitError}
      />
    </div>
  );
}

export default ConfirmPatternPage;
