import React from "react";

const ErrorMessageModel = ({ open, name, status, onClose }) => {
  if (!open) return null;

  return (
    <div
      className={`modal fade ${open ? "show d-block" : ""}`}
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content border-0 rounded-4 shadow-lg">
          <div
            className="modal-header border-0 rounded-top-4 px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
            }}
          >
            <h5 className="modal-title fw-bold text-white mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Action Not Allowed
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <div className="modal-body bg-light p-4">
            <div className="mb-3">
              <h6 className="fw-bold mb-2">
                {name || "Unknown Customer"}
              </h6>
              <p className="mb-3">
                Status :
                <span className="badge bg-danger ms-2">
                  {status || "Unknown"}
                </span>
              </p>
              <div className="alert alert-danger mb-0">
                <strong>Edit operation is not permitted.</strong>
                <br />
                This customer is <b>not contracted</b>, therefore editing is disabled.
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 px-4 py-3">
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessageModel;
