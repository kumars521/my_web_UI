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
import MenuItem from "@mui/material/MenuItem";
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import FormCheckbox from "../components/form/FormCheckbox";
import FormRadio from "../components/form/FormRadio";
import FormDatePicker from "../components/form/FormDatePicker";
import EditableSortableTable_OnlyEdit from "../components/form/EditableSortableTable_OnlyEdit"

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormTable from "../components/form/FormTable";
import { customerSchema } from "../validation/customerSchema";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";

import {opt_country,opt_region,opt_status,opt_vessel_Currency,opt_offer_list, opt_Currency,opt_newaccount} from "./Opt_library"
import { date } from "yup";
import {FetchInvoiceDetail} from "../api/InvoiceApis"
import {SearchCompany} from "../api/customerApi"
import {FetchInvoiceHeader} from "../api/InvoiceApis"
import {FetchPurchaseOrder} from "../api/customerApi"
import {FetchAsset} from "../api/customerApi"
import {FetchEnergyInvoiceDetail} from "../api/InvoiceApis"
import LoadingButton from "../components/LoadingButton";


const Energy_Page = forwardRef((props, ref) => {
  const { control,getValues, handleSubmit, reset, watch,setValue } = useForm({
    resolver: yupResolver(customerSchema),
      defaultValues : {
        energycompany: "",
        soldto: "",
        energyasset: "",
        shipto: "",
        energysampleprefix: "",
        energyfromdate: "",
        energytodate: "",
        purchaseorderType: "all",
      }
  });

  const opt_invice_status=[
    {label:"Pending", value:"pending"},
    {label:"Closed", value:"closed"},
    {label:"Cancelled", value:"cancelled"},
    {label:"Due", value:"due"},
    {label:"On Hold", value:"on hold"},
    {label:"re-run", value:"re-run"},
    {label:"Incomplete", value:"incomplete"},
    {label:"Local", value:"local"},
    {label:"Sanctioned", value:"sanctioned"},
    {label:"Written Off", value:"written off"}
  ]
  // Field Array (table data)
  const { fields, append, update } = useFieldArray({
    control,
    name: "tableData"
  });
  const [tab, setTab] = React.useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const chk_basic = watch("chk_basic");
  const po_required=watch("po_required");
  const erp_system=watch("erp_system");

  const invoicestatus=watch("invoicestatus");
  const [companies, setCompanies] = useState([]);
  const [AssetServiceOfferID, setAssetServiceOfferID] = useState([]);
  const [Responddata,setResponddata]=useState([]);
  const [mappedData,setMappedData]=useState([]);
  const [loading, setLoading] = useState(false);
  const [AssetOptions, setAssetOptions] = useState("");
  const [CompanyNameId, setCompanyNameId] = useState("");
  
  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

  const columns =useMemo(() => [
    { field: "InvoiceDetailID", headerName: "Invoice Detail ID", flex: 1 },
    { field: "Company", headerName: "Company", flex: 1 },
    { field: "SoldTo", headerName: "Sold To", flex: 1 },
    { field: "AssetName", headerName: "Asset Name", flex: 1 },
    { field: "ShipTo", headerName: "Ship To", flex: 1 },
    { field: "TestSuitName", headerName: "Test Suit Name", flex: 1 },
    { field: "TestSuite", headerName: "Test Suite", flex: 1 },
    { field: "SamplePointID", headerName: "Sample Point ID", flex: 1 },
    { field: "DOM", headerName: "DOM", flex: 1 },
    { field: "SampleID", headerName: "Sample ID", flex: 1 },
    { field: "ReceivedDate", headerName: "Received Date", flex: 1 },
    { field: "DateTested", headerName: "Date Tested", flex: 1 },
    { field: "Price", headerName: "Price", flex: 1 },
    { field: "Currency", headerName: "Currency", flex: 1 },
    { field: "UserAlias", headerName: "User Alias", flex: 1 },
    { field: "DateUpdated", headerName: "Date Updated", flex: 1 },
    { field: "Status", headerName: "Status", flex: 1 },
    { field: "FOC", headerName: "FOC", flex: 1 },
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

  const statusLabel =
  {
    all: "All",
    outstanding: "Outstanding",
    invioced: "Invioced",

  }[invoicestatus] || "";

  // Edit
  const handleEdit = (index) => {
    const row = fields[index];
    setSelectedRowIndex(index);
    reset({ rowData: row });
    setOpenModal(true);
  };

  const handleModalSave = (data) => {
    if (selectedRowIndex !== null) {
      update(selectedRowIndex, data.rowData); // ✅ correct way
    } else {
      append(data.rowData);
    }

    setOpenModal(false);
  };

  const handleFetchPurchaseOrder = async () => {
    try {
      // setLoading(true);

      const response = await FetchPurchaseOrder();

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      setMappedData(
        tableData.map((item, index) => ({
          id: index + 1,

          InvoiceDetailID: item.InvoiceDetailID || "",
          Company: item.Company || "",
          SoldTo: item.SoldTo || "",
          AssetName: item.AssetName || "",
          ShipTo: item.ShipTo || "",
          TestSuitName: item.TestSuitName || "",
          TestSuite: item.TestSuite || "",
          SamplePointID: item.SamplePointID || "",
          DOM: item.DOM || "",
          SampleID: item.SampleID || "",
          ReceivedDate: item.ReceivedDate || "",
          DateTested: item.DateTested || "",
          Price: item.Price || "",
          Currency: item.Currency || "",
          UserAlias: item.UserAlias || "",
          DateUpdated: item.DateUpdated || "",
          Status: item.Status || "",
          FOC: item.FOC || "",
        }))
      );

    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      // setLoading(false);
    }
  };
  const formatDate = (dateStr) => {
    console.log("date issue ",dateStr);
    if (!dateStr) return "";

    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    // return `${year}-${month}-${day}`;
    return `${day}-${month}-${year}`;
  };
  const onSubmit = async (data) => {
    try {
      console.log("FORM DATA:", data);

      const payload = {
        Company: data.energycompany,
        SoldTo:data.soldto,
        Asset: data.energyasset,
        ShipTo: data.shipto,
        From: formatDate(data.energyfromdate),
        To: formatDate(data.energytodate),
        Prefix: data.energysampleprefix,
        UserAlias :"3575qa",
        InvStatus :
          data.invoicestatus === "All"
            ? 1
            : data.invoicestatus === "Outstanding"
            ? 2
            : data.invoicestatus === "Invoiced"
            ? 3  :
            0,
      };
      console.log(JSON.stringify(payload, null, 2));
      // console.log("PAYLOAD:", payload);

      const response = await FetchEnergyInvoiceDetail(payload);

        const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

        setMappedData(
          tableData.map((item, index) => ({
            id: index + 1,
            InvoiceDetailID: item.InvoiceDetailID || "",
            Company: item.Company || "",
            SoldTo: item.SoldTo || "",
            AssetName: item.AssetName || "",
            ShipTo: item.ShipTo || "",
            TestSuitName: item.TestSuitName || "",
            TestSuite: item.TestSuite || "",
            SamplePointID: item.SamplePointID || "",
            DOM: item.DOM || "",
            SampleID: item.SampleID || "",
            ReceivedDate: item.ReceivedDate || "",
            DateTested: item.DateTested || "",
            Price: item.Price || "",
            Currency: item.Currency || "",
            UserAlias: item.UserAlias || "",
            DateUpdated: item.DateUpdated || "",
            Status: item.Status || "",
            FOC: item.FOC || "",
          }))
        );

      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  return (
<div className="container-fluid py-4 bg-light min-vh-100">

  {/* ================= PAGE HEADER ================= */}

  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">

    <div>

      <h2 className="fw-bold text-dark mb-1">
        Energy Invoice Module
      </h2>

      <p className="text-muted mb-0">
        Manage and process energy invoices
      </p>

    </div>

    <div className="d-flex flex-wrap gap-2">

    <button
        className="btn btn-success px-4 shadow-sm"
        onClick={handleAdd}
      >

        <i className="bi bi-arrow-repeat me-2"></i>
        Retrieve Energy Data 

      </button>

      <LoadingButton
        className="btn btn-primary px-4 shadow-sm"
        asyncAction={async () => handleAdd()}
        loadingKey="energy-invoice"
      >
        <i className="bi bi-gear-fill me-2"></i>
        Invoice 
      </LoadingButton>

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
                {setMappedData?.length || 0}
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
                Energy Data Sync
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

      {/* ================= MODAL ================= */}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xl"
      >

        {/* HEADER */}

        <DialogTitle
          sx={{
            background: "#17863c",
            color: "white",
            fontWeight: "bold",
          }}
        >

          {selectedRowIndex !== null
            ? "Edit Invoice"
            : "Extract Energy List"}

          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>

        </DialogTitle>

        <form
          onSubmit={handleSubmit(
            onSubmit,
            (errors) => {
              console.log(
                "VALIDATION ERRORS:",
                errors
              );
            }
          )}
        >

          <DialogContent
            sx={{
              background: "#f8fafc",
              p: 3,
            }}
          >

            {/* ================= ENERGY INFO ================= */}

            <div className="card border-0 shadow-sm rounded-4 mb-4">

              <div className="card-header bg-white fw-bold">
                Energy Information
              </div>

              <div className="card-body">

                {/* ROW 1 */}

                <div className="row g-2">

                  <div className="col-md-4">

                    <FormInput
                      name="energycompany"
                      control={control}
                      label="Energy Company"
                    />

                  </div>

                  <div className="col-md-4">

                    <FormInput
                      name="soldto"
                      control={control}
                      label="Sold To"
                    />

                  </div>

                  <div className="col-md-4">

                    <FormInput
                      name="shipto"
                      control={control}
                      label="Ship To"
                    />

                  </div>

                </div>

                {/* ROW 2 */}

                <div className="row g-2 mt-1">

                  <div className="col-md-4">

                    <FormInput
                      name="energyasset"
                      control={control}
                      label="Energy Asset"
                    />

                  </div>

                  <div className="col-md-4">

                    <FormInput
                      name="energysampleprefix"
                      control={control}
                      label="Sample Prefix"
                    />

                  </div>

                  <div className="col-md-2">

                    <label className="form-label small text-muted mb-1">
                      Start Date
                    </label>

                    <FormInput
                      type="date"
                      name="energyfromdate"
                      control={control}
                    />

                  </div>

                  <div className="col-md-2">

                    <label className="form-label small text-muted mb-1">
                      End Date
                    </label>

                    <FormInput
                      type="date"
                      name="energytodate"
                      control={control}
                    />

                  </div>

                </div>

                {/* ROW 3 */}

                <div className="row g-2 mt-1 align-items-end">

                  <div className="col-md-6">

                    <FormRadio
                      name="invoicestatus"
                      control={control}
                      label="Invoice Status"
                      options={[
                        {
                          label: "All",
                          value: "all",
                        },
                        {
                          label: "Outstanding",
                          value: "outstanding",
                        },
                        {
                          label: "Invoiced",
                          value: "invoiced",
                        },
                      ]}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* ================= FOOTER ACTIONS ================= */}

            <div className="d-flex justify-content-end gap-2 mt-4">

              <button
                className="btn btn-primary px-4"
                type="submit"
              >
                Download List
              </button>

              <button
                type="button"
                className="btn btn-outline-danger px-4"
                onClick={() => reset()}
              >
                Clear Form
              </button>

            </div>

          </DialogContent>

        </form>

      </Dialog>

      {/* ================= TABLE ================= */}

      <div className="card border-0 shadow rounded-4">

        <div className="card-header bg-white fw-bold">
          Energy Details
        </div>

        <div className="card-body">

          <EditableSortableTable_OnlyEdit
            columns={columns}
            rowData={mappedData}
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

export default Energy_Page;