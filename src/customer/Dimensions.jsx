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


import { FetchInvoicingDimensions } from "../api/InvoiceApis";


const Dimensions = forwardRef((props,ref) => {
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

  const [dimensionsmappedData,setdimensionsmappedData]=useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));
  useEffect(() => {
    const savedData = JSON.parse(
      localStorage.getItem(
        "dimensionsmappedData"
      )
    ) || [];

    if (savedData.length) {
      setdimensionsmappedData(savedData);
    } else {
      handleFetchInvoicingDimensions();
    }

  }, []);
  const columns =useMemo(() => [
    { field: "serviceOfferBandID", headerName: "Service Offer Band ID", flex: 1 },
    { field: "serviceOfferBand", headerName: "Service Offer Band", flex: 1 },
    { field: "baseRateUSD", headerName: "Base Rate (USD)", flex: 1 },
    { field: "materialCode", headerName: "Material Code", flex: 1 },
    { field: "mnemonic", headerName: "Mnemonic", flex: 1 },
    { field: "marketingPackage", headerName: "Marketing Package", flex: 1 },
    { field: "invoiceGroupingCode", headerName: "Invoice Grouping Code", flex: 1 },
    { field: "offerVersion", headerName: "Offer Version", flex: 1 },
    { field: "testSuite", headerName: "Test Suite", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "sofiaEqv", headerName: "Sofia Eqv", flex: 1 }

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
  const parseDateValue = (value) => {
    if (value === undefined || value === null || value === "") return null;

    if (typeof value === "number") {
      return new Date(value);
    }

    if (typeof value === "string") {
      const m = value.match(/\/Date\((-?\d+)\)\//);
      if (m) {
        return new Date(Number(m[1]));
      }

      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d;
      }

      const alt = new Date(value.replace(/-/g, "/"));
      if (!Number.isNaN(alt.getTime())) {
        return alt;
      }
    }

    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const d = parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
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


  const handleFetchInvoicingDimensions = async (useralias) => {
    try {
      setLoading(true);

      const response = await FetchInvoicingDimensions(useralias);

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      setdimensionsmappedData(
        tableData.map((item, index) => ({
          id: index + 1,

          serviceOfferBandID: item.serviceOfferBandID || "",
          serviceOfferBand: item.serviceOfferBand || "",
          baseRateUSD: item.baseRateUSD || "",
          materialCode: item.materialCode || "",
          mnemonic: item.mnemonic || "",
          marketingPackage: item.marketingPackage || "",
          invoiceGroupingCode: item.invoiceGroupingCode || "",
          offerVersion: item.offerVersion || "",
          testSuite: item.testSuite || "",
          description: item.description || "",
          sofiaEqv: item.sofiaEqv || ""
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
        Dimensions Management
      </h2>

      <p className="text-muted mb-0">
        Download, review and process Dimensions records
      </p>

    </div>

    <div className="d-flex flex-wrap gap-2">

      <button
        className="btn btn-success px-4 shadow-sm"
        disabled={loading}
        onClick={() =>
          handleFetchInvoicingDimensions("3575qa")
        }
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
            Retrieve Dimensions Data
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
                Total Records
              </p>

              <h3 className="fw-bold mb-0">
                {dimensionsmappedData?.length || 0}
              </h3>

            </div>

            <div className="bg-primary bg-opacity-10 p-3 rounded-circle">

              <i className="bi bi-table fs-4 text-primary"></i>

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
                Status
              </p>

              <h5 className="fw-bold text-success mb-0">
                Ready to Process
              </h5>

            </div>

            <div className="bg-success bg-opacity-10 p-3 rounded-circle">

              <i className="bi bi-check-circle fs-4 text-success"></i>

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
                Last Action
              </p>

              <h6 className="fw-bold mb-0">
                Dimensions Sync
              </h6>

            </div>

            <div className="bg-warning bg-opacity-10 p-3 rounded-circle">

              <i className="bi bi-arrow-repeat fs-4 text-warning"></i>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

      {/* ================= TABLE ================= */}

      <div className="card border-0 shadow rounded-4">

        <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">

          <span>Dimensions List</span>

          {/* <span className="badge bg-secondary">
            {dimensionsmappedData?.length || 0} Records
          </span> */}

        </div>

        <div className="card-body">

          <EditableSortable_noaction
            columns={columns}
            rowData={dimensionsmappedData}
            pagination
            pageSizeOptions={[
              10,
              25,
              50,
              100
            ]}
          />

        </div>

      </div>

    </div>
  );
});

export default Dimensions;