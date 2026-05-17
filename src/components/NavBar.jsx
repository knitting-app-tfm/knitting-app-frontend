import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "salmon" }}
      data-bs-theme="light"
    >
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          CastOn
        </NavLink>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <NavLink className="nav-link" to="/import">
              Import
            </NavLink>
          </li>
        </ul>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/register">
              Register
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
