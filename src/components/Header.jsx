import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  { name: "Energy ERP", path: "/energyerpform" },
  { name: "Marine ERP", path: "/marineerpform" },
];

const salesforcemenu = [
  { name: "Energy ERP", path: "/energyerpform_Salesforce" },
  { name: "Marine ERP", path: "/MarineForm_SalesForce" },
];
const mastertabs = [
  { name: "Customer", path: "/customer" },
  { name: "Vessel", path: "/vessel" },
  { name: "Invoice Header", path: "/invoice" },
  { name: "Invoice Details", path: "/invoicedetails" },
  { name: "Purchase Order", path: "/purchase_order" },
  { name: "Energy Page", path: "/energypage" },
];

const Header = () => {
  // const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(false);

  const handleNav = (path) => {
    setOpenMenu(false);
    navigate(path);
  };

  // const handleLogout = () => {
  //   logout();
  //   navigate("/login");
  // };
const isERPForm = ["/marineerpform", "/energyerpform"].includes(location.pathname);

const renderDropdown = (title, items) => (
  <li className="nav-item dropdown">
    <button
      className="nav-link dropdown-toggle btn btn-link text-black text-decoration-none"
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
      className="dropdown-menu custom-nav-dropdown"
      aria-labelledby={`${title}-dropdown`}
    >
      {items.map(({ name, path }) => (
        <li key={path}>
          <button
            className="dropdown-item"
            type="button"
            onClick={() => handleNav(path)}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  </li>
);

  return (
    <nav className="navbar navbar-expand-md navbar-dark shadow-sm px-3 sticky-top app-header" style={{ backgroundColor: "#ffffff" }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img
            src={logobp}
            alt="logo"
            style={{
              width: "auto",
              height: "120%",
              maxHeight: 70,
              objectFit: "contain",
            }}
          />

          <span
            className="fw-bold app-header-title"
            style={{
              fontSize: "1.3rem",
              fontFamily: "Arial, sans-serif",
              color: "#e80120",
              paddingTop: "5px",
            }}
          >
            {isERPForm ? "Castrol ERP Data Form" : "Castrol GME UOA Invoicing Tool"}
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setOpenMenu(!openMenu)}
          aria-expanded={openMenu}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`navbar-collapse ${openMenu ? "show d-block" : "d-none"} d-md-flex`}
          style={{ display: openMenu ? "block" : "none" }}
        >
          <ul className="navbar-nav ms-auto gap-2 align-items-md-center">
            <li className="nav-item">
              <Link className="nav-link text-black" to="/" onClick={() => setOpenMenu(false)}>
                Home
              </Link>
            </li>
            {renderDropdown("Master Tabs", mastertabs)}
            {renderDropdown("Data Tabs", datatabs)}
            {renderDropdown("ERP", erpMenu)}
            {/* {renderDropdown("Salesforce", salesforcemenu)} */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;