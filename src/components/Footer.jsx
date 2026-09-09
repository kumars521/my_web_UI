import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const footerStyle = {
  background: "linear-gradient(90deg,#1f2937,#111827)",
  color: "#fff",
  padding: "12px 24px",
  borderTop: "1px solid rgba(255,255,255,.1)",
  backdropFilter: "blur(8px)",
};

function Footer() {
  return (
    <footer
      className="fixed-bottom shadow-sm"
      style={footerStyle}
    >
      <div className="container-fluid">
        <div className="row align-items-center">

          <div className="col-md-4 text-center text-md-start">
            <strong>Castrol Limited</strong>
          </div>

          <div className="col-md-4 text-center">
            Copyright © 1999-2026
          </div>

          <div className="col-md-4 text-center text-md-end">
            <span
              style={{
                fontSize: 14,
                opacity: 0.8,
              }}
            >
              Powered by React + MUI
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;