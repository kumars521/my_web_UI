import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUsers,
  FaShip,
  FaFileInvoice,
  FaClipboardList,
  FaBolt,
  FaDatabase,
  FaCog,
  FaShieldAlt,
  FaTags,
} from "react-icons/fa";

const cards = [
  
  { title: "Customer", route: "/customer", icon: <FaUsers /> },
  { title: "Vessel / Asset", route: "/vessel", icon: <FaShip /> },
  { title: "Invoice", route: "/invoice", icon: <FaFileInvoice /> },
  { title: "Purchase Order", route: "/purchase_order", icon: <FaClipboardList /> },
  { title: "Energy Page", route: "/energypage", icon: <FaBolt /> },
  { title: "Energy ERP Forms", route: "/energyerpform", icon: <FaCog /> },
  { title: "Marine ERP Forms", route: "/marineerpform", icon: <FaShip /> },
  { title: "Quarantine", route: "/quarantine_form", icon: <FaShieldAlt /> },
  { title: "Offer Page", route: "/Offers_Form", icon: <FaTags /> },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="container-fluid min-vh-100 py-5"
      style={{ background: "linear-gradient(135deg, #f8fbff 0%, #e9eff8 100%)" }}
    >
      <div className="container-fluid px-4 py-4">
      <style>{`
        .card-hover-scale:hover {
          transform: translateY(-6px) scale(1.03) !important;
          box-shadow: 0 24px 40px rgba(15, 23, 42, 0.12) !important;
        }
      `}</style>
        <div className="row justify-content-center text-center mb-5">
          <div className="col-12">
            <div className="bg-white border border-1 border-body-secondary rounded-4 shadow-sm p-5 mx-auto" style={{ maxWidth: 1320 }}>
              <div
                className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle mb-4"
                style={{ width: 90, height: 90}}
              >
                <div className="fs-2 text-success">
                  <FaClipboardList />
                </div>
              </div>
              <h1 className="display-5 fw-bold mb-3 text-dark">UOA Invoicing Dashboard</h1>
              <p className="lead text-secondary mb-0">
                Manage invoices, customers, vessels, purchase orders, and ERP operations from one central dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* ================= DASHBOARD CARDS ================= */}

        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
          {cards.map(({ title, route, icon }) => (
            <div className="col" key={title}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(route)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") navigate(route);
                }}
                className="card h-100 border-0 shadow-sm rounded-4 text-center card-hover-scale"
                style={{ cursor: "pointer", minHeight: 250, transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center p-4">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-sm"
                    style={{ width: 90, height: 90 ,color: "#1e9f10", boxShadow: "0 4px 6px rgba(1, 141, 69, 0.5)"}}
                  >
                    <div className="fs-2 text-success">{icon}</div>
                  </div>
                  <h5 className="fw-semibold text-dark mb-2">{title}</h5>
                  <p className="text-muted mb-0">Open {title} module.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= FOOTER ================= */}

        <div className="text-center mt-5">
          <small className="text-muted">UOA Invoicing Management System Dashboard</small>
        </div>

      </div>
    </div>
  );
};

export default HomePage;