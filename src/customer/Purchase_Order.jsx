import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback
} from "react";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
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

import { opt_status } from "./Opt_library"
import { FetchPurchaseOrder } from "../api/customerApi"
import { CreateUpdatePurchaseOrder } from "../api/postApi"
import { SearchCompany } from "../api/customerApi"
import { GenericLookups } from "../api/customerApi"


const Purchase_Order = forwardRef((props, ref) => {
  const { control,getValues, handleSubmit, reset, watch,setValue } = useForm({
    resolver: yupResolver(customerSchema),
      defaultValues : {
        purchaseOrderId: "",
        customer: "",
        poNumber: "",
        purchaseorderType: "",
        assetName: "",
        amount: "",
        startDate: "",
        endDate: "",
        notes: "",
        compnyname:"",
        
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

  const purchaseorderType=watch("purchaseorderType");
  const [companies, setCompanies] = useState([]);
  const [AssetServiceOfferID, setAssetServiceOfferID] = useState([]);
  const [Responddata,setResponddata]=useState([]);
  const [allLookups, setAllLookups] = useState([]);
  const [mappedData,setMappedData]=useState([]);
  const [loading, setLoading] = useState(false);
  const [AssetOptions, setAssetOptions] = useState("");
  const [CompanyNameId, setCompanyNameId] = useState("");
  // Log messages only in development
  const notify = (msg) => {
    if (process.env.NODE_ENV === "development") {
      console.info(msg);
    }
  };
  
  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

  useEffect(() => {
    const savedData = JSON.parse(
      localStorage.getItem(
        "MappedData"
      )
    ) || [];

    if (savedData.length) {
      setMappedData(savedData);
    } else {
      handleFetchPurchaseOrder();
    }

  }, []);
  // Filter the loaded lookup list (assets/companies) by the search term and
  // populate the dropdown. When the term matches a single/exact entry, select
  // it automatically so the asset/company appears pre-selected.
  const applyCompanyFilter = useCallback((list, term) => {
    const q = String(term ?? "").trim().toLowerCase();
    const nameOf = (item) =>
      String(item?.name ?? item?.company ?? "");
    const idOf = (item) =>
      item?.id ?? item?.assetServiceOfferID ?? "";

    const filtered = q
      ? list.filter((item) => nameOf(item).toLowerCase().includes(q))
      : list;

    setResponddata(filtered);

    if (q && filtered.length) {
      const exact = filtered.find(
        (item) => nameOf(item).trim().toLowerCase() === q
      );
      const chosen =
        exact || (filtered.length === 1 ? filtered[0] : null);
      if (chosen) {
        const id = idOf(chosen);
        setValue("compnyname", id);
        setAssetOptions(id);
        setCompanyNameId(nameOf(chosen));
      }
    }
  }, [setValue]);

  const handleGenericLookups = useCallback(async (data) => {
    if (!data) return;

    const payload = { LookupSource: data };
    try {
      const res = await GenericLookups(payload);
      const list = res?.data || [];
      setAllLookups(list);
      // Auto-search using whatever is already in the "Search Company" field
      // (e.g. the asset/company name pre-filled when editing a row).
      applyCompanyFilter(list, getValues("companysearch"));
    } catch (error) {
      console.error("Error fetching generic lookups:", error);
      setAllLookups([]);
      setResponddata([]);
    }
  }, [applyCompanyFilter, getValues]);
  // Handle generic lookups when purchase order type changes
  useEffect(() => {
    if (purchaseorderType && openModal) {
      handleGenericLookups(purchaseorderType);
    }
  }, [purchaseorderType, openModal, handleGenericLookups]);
  
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
  const columns =useMemo(() => [
    { field: "purchaseOrderId", headerName: "PurchaseOrder ID", flex: 1 },
    { field: "customer", headerName: "Customer", flex: 1 },
    { field: "poNumber", headerName: "PONumber", flex: 1 },
    { field: "orderType", headerName: "OrderType", flex: 1 },
    { field: "assetName", headerName: "AssetName", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    { field: "notes", headerName: "Notes", flex: 1 },
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
    company: "Company",
    asset: "Asset",

  }[purchaseorderType] || "";

  const [showPOID, setShowPOID] = useState(false);

  const handleEdit = (row) => {
    setShowPOID(true);

    const rowIndex = mappedData.findIndex((item) => item.id === row.id);
    setSelectedRowIndex(rowIndex);

    const toISODate = (val) => {
      const d = parseDateValue(val);
      return d ? d.toISOString().split("T")[0] : "";
    };

    reset({
      POID: row.purchaseOrderId ?? "",
      companysearch:
        row.orderType === "Company"
          ? row.customer
          : row.orderType === "Asset"
          ? row.assetName
          : row.orderType ?? "",
      poNumber: row.poNumber ?? "",
      purchaseorderType:
        row.orderType === "Company"
          ? "company"
          : row.orderType === "Asset"
          ? "asset"
          : row.orderType ?? "",
      assetName: row.assetName ?? "",
      poamount: row.amount ?? "",
      inoicestartdate: formatDate(row.startDate)??"",
      inoiceenddate: formatDate(row.endDate)??"",
      ponotes: row.notes ?? "",
      compnyname: row.customer ?? "",
    });

    setOpenModal(true);
  };

  const handleModalSave = (data) => {
    if (selectedRowIndex !== null && selectedRowIndex >= 0) {
      setMappedData((prev) => {
        const updated = prev.map((item, idx) =>
          idx === selectedRowIndex ? { ...item, ...data.rowData } : item
        );
        localStorage.setItem("MappedData", JSON.stringify(updated));
        return updated;
      });
    } else {
      setMappedData((prev) => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
        const updated = [...prev, { id: nextId, ...data.rowData }];
        localStorage.setItem("MappedData", JSON.stringify(updated));
        return updated;
      });
    }

    setOpenModal(false);
  };

  const handleFetchPurchaseOrder = async () => {
    try {
      setLoading(true);

      // Call API once and use the response consistently
      const resp = await FetchPurchaseOrder();
      const data = Array.isArray(resp) ? resp : (resp?.data || []);

      const mapped = data.map(
        (item, index) => ({
          id: index + 1,
          purchaseOrderId: item.purchaseOrderID ?? "",
          customer:  item.customer ?? "",
          poNumber: item.poNumber ?? "",
          orderType: item.orderType ?? "",
          assetName: item.assetName ?? "",
          amount: item.amount ?? "",
          startDate: formatDate(item.startDate ?? ""),
          endDate: formatDate(item.endDate ?? ""),
          notes: item.notes ?? "",
        })
      );

      setMappedData(mapped);
      localStorage.setItem(
        "MappedData",
        JSON.stringify(mapped)
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearchCompany = async (CompanySearch) => {
    // The dropdown is populated from the GenericLookups list (assets or
    // companies) loaded on open. Search simply filters that list by name.
    if (!allLookups.length) {
      // Lookups not loaded yet (e.g. no type chosen) — load then filter.
      await handleGenericLookups(purchaseorderType);
      return;
    }
    applyCompanyFilter(allLookups, CompanySearch);
  };
  const handlecompanyselection = (selectedId) => {
    const selectedCompany = Responddata.find(
      (item) =>
        String(item.id ?? item.assetServiceOfferID) === String(selectedId)
    );

    if (selectedCompany) {
      setCompanyNameId(selectedCompany.name ?? selectedCompany.company ?? "");
      setAssetOptions(
        selectedCompany.id ?? selectedCompany.assetServiceOfferID ?? ""
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        POID: Number(data.poid) || 0,
        PONumber: String(data.poNumber || ""),
        Amount: Number(data.poamount) || 0,
        Startdt: data.inoicestartdate || null,
        Enddt: data.inoiceenddate || null,
        CompanyLevel: data.purchaseorderType === "company" ? 1 : 0,
        AssetLevel: data.purchaseorderType === "asset" ? 1 : 0,
        AssetID: Number(AssetOptions) || 0,
        Notes: String(data.ponotes || ""),
        UserAlias: "3575qa" || "",
      };

      const res = await CreateUpdatePurchaseOrder(payload);
      
      if (res?.statusCode === 200 || res?.success) {
        setOpenModal(false);
        await handleFetchPurchaseOrder();
        reset();
        setSelectedRowIndex(null);
        setShowPOID(false);
      } else {
        console.error("Save failed:", res?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Error saving purchase order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="container-fluid py-4 bg-light min-vh-100">

  {/* ================= PAGE HEADER ================= */}

  <div className="row align-items-center mb-4">

    <div className="col-lg">
      <h2 className="fw-bold text-dark mb-1">Purchase Order Management</h2>
      <p className="text-muted mb-0">Create, manage and track purchase orders</p>
    </div>

    <div className="col-lg-auto d-flex flex-wrap gap-2 justify-content-lg-end">
      <button className="btn btn-primary px-4 shadow-sm" onClick={handleAdd}>
        <i className="bi bi-plus-circle me-2"></i> Create Purchase Order
      </button>
      <button className="btn btn-success px-4 shadow-sm" onClick={handleFetchPurchaseOrder}>
        <i className="bi bi-arrow-repeat me-2"></i> Retrieve Server Data
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
                Total Purchase Orders
              </p>

              <h3 className="fw-bold mb-0">
                {mappedData?.length || 0}
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
                System Status
              </p>

              <h5 className="fw-bold text-success mb-0">
                Active
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
                Last Sync
              </p>

              <h6 className="fw-bold mb-0">
                Server Connected
              </h6>

            </div>

            <div className="bg-warning bg-opacity-10 p-3 rounded-circle">

              <i className="bi bi-cloud-check fs-4 text-warning"></i>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

  {/* ================= PURCHASE ORDER TABLE ================= */}

  <div className="card border-0 shadow rounded-4">

    <div className="card-header bg-white border-0 py-3">

      <div className="d-flex justify-content-between align-items-center">

        <div>

          <h5 className="fw-bold mb-1">
            Purchase Orders
          </h5>

          <small className="text-muted">
            Manage all purchase order records
          </small>

        </div>

        {/* <span className="badge bg-primary rounded-pill px-3 py-2">

          {mappedData?.length || 0} Records

        </span> */}

      </div>

    </div>

    <div className="card-body">

      <EditableSortableTable_OnlyEdit
        columns={columns}
        rowData={mappedData}
        onEdit={handleEdit}
        pagination
        pageSizeOptions={[10, 25, 50, 100]}
      />

    </div>

  </div>

  {/* ================= MODAL ================= */}

  <div
    className={`modal fade ${openModal ? "show d-block" : ""}`}
    tabIndex="-1"
    style={{
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(3px)"
    }}
  >

    <div className="modal-dialog modal-dialog-scrollable modal-xl">

      <div className="modal-content border-0 rounded-4 shadow-lg">

        {/* ===== HEADER ===== */}

        <div className="modal-header bg-success text-white border-0 rounded-top-4">

          <div>

            <h4 className="modal-title fw-bold mb-1">

              {selectedRowIndex !== null
                ? "Edit Purchase Order"
                : "Create Purchase Order"}

            </h4>

            <small className="opacity-75">
              Purchase Order Information Form
            </small>

          </div>

          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setOpenModal(false)}
          ></button>

        </div>

        {/* ===== FORM ===== */}

        <form
          onSubmit={handleSubmit(
            onSubmit,
            (errors) => notify({ message: "VALIDATION ERRORS", errors })
          )}
        >

          <div className="modal-body bg-light p-4">

            {/* =====================================
                COMPANY INFORMATION
            ====================================== */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">

              <div className="card-header bg-white border-0 py-3">
                <h5 className="fw-bold mb-0">
                  Company Information
                </h5>
                <small className="text-muted">
                  Select purchase order type and company details
                </small>
              </div>

              <div className="card-body">

                {/* Purchase Type */}
                <div className="row g-1 align-items-center mb-3">

                  {/* <div className="col-lg-4 col-md-6"> */}
                    {/* <div className="d-flex align-items-end gap-2 flex-wrap"> */}
                      <div className="col-lg-3 col-md-3">
                        <label className="fw-semibold mt-3 mb-2">
                          Purchase Order For
                        </label>
                      </div>
                      <div className="col-lg-3 col-md-3">
                        <FormRadio
                          
                          name="purchaseorderType"
                          control={control}
                          options={[
                            {
                              label: "Company",
                              value: "company"
                            },
                            {
                              label: "Asset",
                              value: "asset"
                            }
                          ]}
                        />
                      </div>
                    {/* </div> */}
                  {/* </div> */}

                </div>

                {/* Search Section */}
                <div className="row g-3 align-items-end">

                  <div className="col-lg-4 col-md-6">
                    <FormInput
                      name="companysearch"
                      control={control}
                      label="Search Company"
                    />
                  </div>

                  <div className="col-lg-2 col-md-3">
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={() =>
                        handleSearchCompany(getValues("companysearch"))
                      }
                    >
                      <i className="bi bi-search me-2"></i>
                      Search
                    </button>
                  </div>

                  <div className="col-lg-6 col-md-12">
                    <FormSelect
                      name="compnyname"
                      control={control}
                      label={statusLabel}
                      onChange={(e) => handlecompanyselection(e.target.value)}
                      options={Responddata.map((item) => ({
                        label: item.name ?? item.company,
                        value: item.id ?? item.assetServiceOfferID
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* =====================================
                PURCHASE ORDER DETAILS
            ====================================== */}
            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-header bg-white border-0 py-3">

                <h5 className="fw-bold mb-0">
                  Purchase Order Details
                </h5>
                <small className="text-muted">
                  Enter PO information and validity dates
                </small>
              </div>
              <div className="card-body">
                {/* Row 1 */}
                <div className="row g-4">
                  <div className="col-lg-3 col-md-6">
                    <FormInput 
                      sx={{mt: 4}}
                      name="poNumber"
                      control={control}
                      label="PO Number"
                    />
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <FormInput
                      sx={{mt: 4}}
                      name="poamount"
                      control={control}
                      label="Amount"
                    />
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <label className="form-label mb-1">Start Date</label>
                    <FormInput
                      type="date"
                      name="inoicestartdate"
                      control={control}
                      label=""
                    />
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <label className="form-label mb-1">End Date</label>
                    <FormInput
                      type="date"
                      name="inoiceenddate"
                      control={control}
                      label=""
                    />
                  </div>
                </div>
                {/* Notes */}
                <div className="row mt-4">
                  <div className="col-12">
                    <FormInput
                      sx={{ width: "100%" }}
                      multiline
                      rows={4}
                      name="ponotes"
                      control={control}
                      label="Purchase Notes"
                    />
                  </div>
                </div>
                {/* PO ID */}
                {showPOID && (
                  <div className="row mt-4">
                    <div className="col-lg-4 col-md-6">
                      <FormInput
                        name="POID"
                        control={control}
                        label="PO ID"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* =====================================
              FOOTER ACTIONS
          ====================================== */}
          <div className="modal-footer bg-white border-0 py-3">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => reset()}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 shadow-sm"
            >
              Submit Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
  );
});
export default Purchase_Order;