import { useState, useEffect, useReducer, useMemo } from "react";
import DictionaryFilters from "../../components/dictionary/DictionaryFilters";
import AbbreviationList from "../../components/dictionary/AbbreviationList";
import AbbreviationDetail from "../../components/dictionary/AbbreviationDetail";
import { getAbbreviations } from "../../services/abbreviationService";
import "./DictionaryPage.css";

const initialFetchState = {
  abbreviations: [],
  loading: true,
  error: null,
  selected: null,
};

function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null, selected: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, abbreviations: action.data };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.message };
    case "SELECT":
      return { ...state, selected: action.abbreviation };
    case "DESELECT":
      return { ...state, selected: null };
    default:
      return state;
  }
}

function DictionaryPage() {
  const [state, dispatch] = useReducer(fetchReducer, initialFetchState);
  const { abbreviations, loading, error, selected } = state;
  const [craft, setCraft] = useState(null);
  const [type, setType] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    getAbbreviations(craft, type)
      .then((data) => dispatch({ type: "FETCH_SUCCESS", data }))
      .catch((err) => dispatch({ type: "FETCH_ERROR", message: err.message }));
  }, [craft, type]);

  const filtered = useMemo(() => {
    if (!search.trim()) return abbreviations;
    const q = search.toLowerCase();
    return abbreviations.filter(
      (a) =>
        a.abbreviation.toLowerCase().includes(q) ||
        a.full_name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)),
    );
  }, [abbreviations, search]);

  const handleFilterChange = ({ craft: c, type: t }) => {
    setCraft(c);
    setType(t);
  };

  return (
    <div className="dict-page">
      <div className="dict-header">
        <h2>Dictionary</h2>
        <div className="dict-header__search">
          <input
            type="search"
            className="form-control dict-search"
            placeholder="Search abbreviations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DictionaryFilters
        craft={craft}
        type={type}
        onChange={handleFilterChange}
      />

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className={`dict-body${selected ? " dict-body--split" : ""}`}>
        {loading ? (
          <div className="dict-loading">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="dict-list-col">
            <AbbreviationList
              abbreviations={filtered}
              onSelect={(abbr) =>
                dispatch({ type: "SELECT", abbreviation: abbr })
              }
              selectedId={selected?.id}
            />
          </div>
        )}

        <div
          className={`dict-detail-col${selected ? " dict-detail-col--open" : ""}`}
        >
          <AbbreviationDetail
            abbreviation={selected}
            onClose={() => dispatch({ type: "DESELECT" })}
          />
        </div>
      </div>
    </div>
  );
}

export default DictionaryPage;
