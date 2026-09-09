import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo
} from "react";

import {
  Box,
  Grid,
  Tabs, Tab,Typography ,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from "@mui/material";

import EditableSortable_noaction from "../components/form/EditableSortable_noaction"

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormTable from "../components/form/FormTable";
import { customerSchema } from "../validation/customerSchema";

import CloseIcon from "@mui/icons-material/Close";


import { SearchCompany } from "../api/customerApi";


const Offers_Form = forwardRef((props,ref) => {
  const { control,getValues, handleSubmit, reset, watch,setValue } = useForm({
    resolver: yupResolver(customerSchema),
      defaultValues : {
      }
  });

  // Field Array (table data)
  const { fields, append, update } = useFieldArray({
    control,
    name: "tableData"
  });

  const [OffersmappedData,setOffersmappedData]=useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

  useEffect(() => {
    const savedData = JSON.parse(
      localStorage.getItem(
        "OffersmappedData"
      )
    ) || [];

    if (savedData.length) {
      setOffersmappedData(savedData);
    } 
    else {
      handleSearchCompanyOffersmappedData();
    }

  }, []);
  const columns =useMemo(() => [
    { field: "assetServiceOfferID", headerName: "Asset Service Offer ID", flex: 1 },
    { field: "company", headerName: "Company", flex: 1 },
    { field: "sourceERPSystem", headerName: "Source ERP System", flex: 1 },
    { field: "assetName", headerName: "Asset Name", flex: 1 },
    { field: "serviceOfferBand", headerName: "Service Offer Band", flex: 1 },
    { field: "foc", headerName: "FOC", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "remainingFOC", headerName: "Remaining FOC", flex: 1 },
    { field: "currencyCode", headerName: "Currency Code", flex: 1 },
    { field: "offerVersion", headerName: "Offer Version", flex: 1 },
    { field: "soldTo", headerName: "Sold To", flex: 1 },
    { field: "companyStatus", headerName: "Company Status", flex: 1 },
    { field: "assetStatus", headerName: "Asset Status", flex: 1 },
    { field: "discount", headerName: "Discount", flex: 1 }
  ], []);

  // Add
  const handleAdd = () => {
    setSelectedRowIndex(null);

    const emptyRow = columns.reduce(
      (acc, col) => ({ ...acc, [col.field]: "" }),
      {}
    );

    reset({ rowData: emptyRow });
    setOpenModal(true);
  };

  // Edit
  const handleEdit = (index) => {
    const row = fields[index];
    setSelectedRowIndex(index);
    reset({ rowData: row });
    setOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      await saveCustomer(data);
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving customer");
    }
  };


  const handleSearchCompanyOffersmappedData = async (useralias) => {
    try {
      setLoading(true);

      const response = await SearchCompany(useralias);

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      setOffersmappedData(
        tableData.map((item, index) => ({
          id: index + 1,

          assetServiceOfferID: item.assetServiceOfferID || "",
          company: item.company || "",
          sourceERPSystem: item.sourceERPSystem || "",
          assetName: item.assetName || "",
          serviceOfferBand: item.serviceOfferBand || "",

          foc: item.foc || "",
          price: item.price || "",
          remainingFOC: item.remainingFOC || "",

          currencyCode: item.currencyCode || "",
          offerVersion: item.offerVersion || "",
          soldTo: item.soldTo || "",

          companyStatus: item.companyStatus || "",
          assetStatus: item.assetStatus || "",
          discount: item.discount || ""
            }))
      );

    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* ================= PAGE HEADER ================= */}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">

        <div>

          <h2 className="fw-bold text-dark mb-1">
            Offers Management
          </h2>

          <p className="text-muted mb-0">
            Download and review customer offer records
          </p>

        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            className="btn btn-success px-4 shadow-sm"
            disabled={loading}
            onClick={() =>handleSearchCompanyOffersmappedData()}
          >

            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Loading...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-repeat me-2"></i>
                Retrieve Offers Data
              </>
            )}

          </button>

        </div>

      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Total Offers
                  </p>

                  <h3 className="fw-bold mb-0">
                    {OffersmappedData?.length || 0}
                  </h3>

                </div>

                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">

                  <i className="bi bi-file-earmark-text fs-4 text-primary"></i>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Download Status
                  </p>

                  <h5 className="fw-bold text-success mb-0">
                    Ready
                  </h5>

                </div>

                <div className="bg-success bg-opacity-10 p-3 rounded-circle">

                  <i className="bi bi-cloud-check fs-4 text-success"></i>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Customer
                  </p>

                  <h6 className="fw-bold mb-0">
                    SEROS SHIPPING PVT LTD
                  </h6>

                </div>

                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">

                  <i className="bi bi-building fs-4 text-warning"></i>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= OFFERS TABLE ================= */}

      <div className="card border-0 shadow rounded-4">

        <div className="card-header bg-white border-0 py-3">

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h5 className="fw-bold mb-1">
                Offers List
              </h5>

              <small className="text-muted">
                Customer offers and pricing information
              </small>

            </div>

            {/* <span className="badge bg-primary rounded-pill px-3 py-2">

              {OffersmappedData?.length || 0} Records

            </span> */}

          </div>

        </div>

        <div className="card-body">

          <EditableSortable_noaction
            columns={columns}
            rowData={OffersmappedData}
            pagination
            pageSizeOptions={[10, 25, 50, 100]}
          />

        </div>

      </div>

    </div>
  );
});

export default Offers_Form;