import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function Layout() {
  return (
    <>
      <NavBar />
      <main className="px-4 py-4 text-start">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
