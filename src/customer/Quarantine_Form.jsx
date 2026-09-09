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

import EditableSortableTable_OnlyEdit from "../components/form/EditableSortableTable_OnlyEdit"
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormTable from "../components/form/FormTable";
import { customerSchema } from "../validation/customerSchema";
import CloseIcon from "@mui/icons-material/Close";

import { FetchQuarantineResponse } from "../api/postApi";
import { ProcessQuarantine } from "../api/postApi";
import { DeleteQuarantine } from "../api/customerApi";

const Quarantine_Form = forwardRef((props,ref) => {
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

  const [QuarantinemappedData,setQuarantinemappedData]=useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const rows = watch("rows") || [];
  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

    useEffect(() => {
      const savedData = JSON.parse(
        localStorage.getItem(
          "QuarantinemappedData"
        )
      ) || [];
  
      if (savedData.length) {
        setQuarantinemappedData(savedData);
      } 
      else {
        handleFetchQuarantineResponse("5547vt1");
      }
  
    }, []);
  const columns =useMemo(() => [
    { field: "companyID", headerName: "Company ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "assetID", headerName: "Asset ID", flex: 1 },
    { field: "assetName", headerName: "Asset Name", flex: 1 },
    { field: "imoNumber", headerName: "IMO Number", flex: 1 },
    { field: "businessCode", headerName: "Business Code", flex: 1 },
    { field: "feedID", headerName: "Feed ID", flex: 1 },
    { field: "sampleID", headerName: "Sample ID", flex: 1 },
    { field: "takenDate", headerName: "Taken Date", flex: 1 },
    { field: "receivedDate", headerName: "Received Date", flex: 1 },
    { field: "analysedDate", headerName: "Analysed Date", flex: 1 },
    { field: "testSuite", headerName: "Test Suite", flex: 1 },
    { field: "batchNumber", headerName: "Batch Number", flex: 1 },
    { field: "errorMessage", headerName: "Error Message", flex: 2 },

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
  const handleFetchQuarantineResponse = async (useralias) => {
    try {
      setLoading(true);

      const response = await FetchQuarantineResponse();

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      setQuarantinemappedData(
        tableData.map((item, index) => ({
        id: index + 1,

        companyID: item.companyID || "",
        name: item.name || "",
        assetID: item.assetID || "",
        assetName: item.assetName || "",
        imoNumber: item.imoNumber || "",
        businessCode: item.businessCode || "",
        feedID: item.feedID || "",
        sampleID: item.sampleID || "",

        takenDate: formatDate(item.takenDate) || "",
        receivedDate: formatDate(item.receivedDate) || "",
        analysedDate: formatDate(item.analysedDate) || "",

        testSuite: item.testSuite || "",
        batchNumber: item.batchNumber || "",
        errorMessage: item.errorMessage || "",
            }))
      );

    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow=async(rows)=>{
    console.log("Deleting row at index:", rows);
    const payload={
      UserAlias:"5547vt1",
      FeedID:rows.feedID,
      SampleID:rows.sampleID,
    }

    if (!rows) return;
    try {
      const reps=await DeleteQuarantine(payload)
      console.log("Delete response:", reps.data || "No data returned");
      handleFetchQuarantineResponse();
    } catch (error) {
      console.log("Error deleting row:", error);
    }
    
  }

  const handleProcessQuarantine=async(useralias)=>{
    try {
      const res=await ProcessQuarantine(useralias)
      console.log(res.data ||"")
    } catch (error) {
      
    }
  }

  return (
<div className="container-fluid py-4 bg-light min-vh-100">

  {/* ================= PAGE HEADER ================= */}

  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">

    <div>

      <h2 className="fw-bold text-dark mb-1">
        Quarantine Management
      </h2>

      <p className="text-muted mb-0">
        Download, review and process quarantine records
      </p>

    </div>

    <div className="d-flex flex-wrap gap-2">

      <button
        className="btn btn-success px-4 shadow-sm"
        disabled={loading}
        onClick={() =>
          handleFetchQuarantineResponse("5547vt1")
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
            Retrieve Quarantine Data
          </>
        )}

      </button>

      <button
        className="btn btn-success px-4 shadow-sm"
        onClick={() =>
          handleProcessQuarantine("5547vt1")
        }
      >

        <i className="bi bi-gear-fill me-2"></i>
        Process Quarantine

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
                {QuarantinemappedData?.length || 0}
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
                Quarantine Sync
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

    <div className="card-header bg-white border-0 py-3">

      <div className="d-flex justify-content-between align-items-center">

        <div>

          <h5 className="fw-bold mb-1">
            Quarantine Records
          </h5>

          <small className="text-muted">
            Review quarantine response data
          </small>

        </div>

        {/* <span className="badge bg-primary rounded-pill px-3 py-2">

          {QuarantinemappedData?.length || 0} Records

        </span> */}

      </div>

    </div>

    <div className="card-body">

      <EditableSortableTable_OnlyEdit
        columns={columns}
        rowData={QuarantinemappedData}
        pagination
        pageSizeOptions={[10, 25, 50, 100]}
        pagename="Quarantine"
        onDelete={handleDeleteRow}
      />

    </div>

  </div>

</div>
  );
});

export default Quarantine_Form;