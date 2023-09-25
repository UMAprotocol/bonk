import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LINKS = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "About",
    to: "/about",
  },
  {
    label: "Dashboard",
    to: "/dashboard",
  },
];

export function Navbar() {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <Link
          className="btn btn-ghost normal-case text-xl animate-none text-primary"
          to="/"
        >
          BONK!
        </Link>
      </div>
      <div className="navbar-center">
        <ul className="menu menu-horizontal px-1">
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        <ConnectButton />
      </div>
    </div>
  );
}
