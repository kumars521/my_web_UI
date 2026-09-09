import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logobp from "./../assets/castrol_logo.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const datatabs = [
  { name: "Dimensions", path: "/dimensions" },
  { name: "Offers", path: "/offers_form" },
  { name: "Quarantine", path: "/quarantine_form" },
];

const erpMenu = [
  { name: "Energy Page", path: "/energypage" },
  { name: "Energy ERP", path: "/energyerpform" },
  { name: "Marine ERP", path: "/marineerpform" },

];

const mastertabs = [
  { name: "Customer", path: "/" },
  { name: "Vessel", path: "/vessel" },
  { name: "Invoice Header", path: "/invoice" },
  { name: "Purchase Order", path: "/purchase_order" },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

const renderDropdown = (title, items) => (
  <li className="nav-item dropdown">
    <button
      className="nav-link dropdown-toggle btn btn-link text-white"
      id={`${title}-dropdown`}
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      type="button"
      style={{ textDecoration: "none" }}
    >
      {title}
    </button>

    <ul
      className="dropdown-menu"
      aria-labelledby={`${title}-dropdown`}
    >
      {items.map(({ name, path }) => (
        <li key={path}>
          <button
            className="dropdown-item"
            type="button"
            onClick={() => navigate(path)}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  </li>
);

  return (
<nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3 sticky-top">
  <div className="container-fluid">

    <Link
      className="navbar-brand d-flex align-items-center gap-2"
      to="/homepage"
    >
      <img
        src={logobp}
        alt="logo"
        style={{
          width: "auto",
          height: "100%",
          maxHeight: 56,
          objectFit: "contain",
        }}
      />

      <span className="fw-bold">
        GME UOA Invoicing Tool
      </span>
    </Link>

    {user && (
      <>
        <button
          className="navbar-toggler"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`collapse navbar-collapse ${
            openMenu ? "show" : ""
          }`}
        >

          {/* <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Master Tabs
            </button>
            <ul class="dropdown-menu">
              <li><button class="dropdown-item" href="/" type="button">Customer</button></li>
              <li><button class="dropdown-item" href="/vessel" type="button">Vessel</button></li>
              <li><button class="dropdown-item" href="/invoice" type="button">Invoice Header</button></li>
              <li><button class="dropdown-item" href="/purchase_order" type="button">Purchase Order</button></li>

            </ul>
          </div> */}
          <ul className="navbar-nav ms-auto gap-2">

            <li className="nav-item">
              <Link className="nav-link" to="/homepage">
                Home
              </Link>
            </li>
            {renderDropdown("Master Tabs", mastertabs)}

            {renderDropdown("Data Tabs", datatabs)}

            {renderDropdown("ERP", erpMenu)}

            <li className="nav-item">
              <button
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>

          </ul>
        </div>
      </>
    )}

  </div>
</nav>
  );
};

export default Header;