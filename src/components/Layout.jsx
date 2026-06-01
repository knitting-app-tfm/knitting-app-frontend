import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import "./Layout.css";

function Layout() {
  return (
    <>
      <NavBar />
      <main className="kn-main">
        <div className="kn-main__inner">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default Layout;
