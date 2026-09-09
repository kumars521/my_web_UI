import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
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
  IconButton,
  InputAdornment
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
import LoadingButton from "../components/LoadingButton";
import { customerSchema } from "../validation/customerSchema";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";

import {opt_country,opt_region,opt_status,opt_vessel_Currency,opt_offer_list, opt_Currency} from "./Opt_library"
import { date } from "yup";
import {FetchInvoiceDetail} from "../api/InvoiceApis"
import {SearchCompany} from "../api/customerApi"
import {FetchInvoiceHeader} from "../api/InvoiceApis"
import {FetchCustomerList} from "../api/customerApi"
import {FetchAsset} from "../api/customerApi"
import {CreateUpdateInvoiceHeader} from "../api/InvoiceApis"
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";


const Createinvoice = forwardRef((props, ref) => {
  const { control,getValues, handleSubmit, reset, watch,setValue } = useForm({
    resolver: yupResolver(customerSchema),
      defaultValues : {
        companysearch:"",
        compnyname:"",
        companysearchName:"",
        fetchcompanydata:"",
        caid:"",
        vesselorasset:"",
        imoNumber:"",
        invoiceheaderid:"",
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

  const navigate = useNavigate();

  const [tab, setTab] = React.useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const chk_basic = watch("chk_basic");
  const po_required=watch("po_required");
  const erp_system=watch("erp_system");

  const contract_status=watch("contract_statusp");
  const [companies, setCompanies] = useState([]);
  const [AssetServiceOfferID, setAssetServiceOfferID] = useState([]);
  const [Responddata,setResponddata]=useState([]);
  const [MappedData,setMappedData]=useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [invoiceHeaderDropdown ,setInvoiceHeaderDropdown]=useState([]);
  const [InvoiceData, setInvoiceData] = useState([]);
  const [FilteredData,setFilteredData] = useState([]);
  const [ResponddataforDD,setResponddataforDD]= useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const searchtype=watch("searchtype");
  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

  useEffect(() => {
    const loadData = async () => {
      const company =
        localStorage.getItem(
          "fetchcompanydata"
        );

      if (company) {

        const res =
          await SearchCompany(
            company
          );

        const data =
          res.data || [];

        setResponddata(data);

        setValue(
          "fetchcompanydata",
          company
        );

        await handlecompanyselection_table(
          company
        );
      }
    };

    loadData();
  }, []);


  const columns = [
    {
      field: "invoiceHeaderId",
      headerName: "Invoice Header ID",
      flex: 1,
      renderCell: (row) => (
        <button
          type="button"
          className="btn btn-link p-0"
          onClick={() => handleInvoiceDetails(row.invoiceHeaderId)}
          style={{ textDecoration: "underline", cursor: "pointer" }}
        >
          {row.invoiceHeaderId}
        </button>
      )
    },
    { field: "customer", headerName: "Customer" , width:250 },
    { field: "assetName", headerName: "Asset Name",flex: 1 },
    { field: "imoNumber", headerName: "IMO Number",flex: 1 },
    { field: "salesCountry", headerName: "Sales Country",flex: 1 },
    { field: "erpSystem", headerName: "ERP System",flex: 1 },
    { field: "erpNumber", headerName: "ERP Number",flex: 1 },
    { field: "soldTo", headerName: "SoldTo",flex: 1 },
    { field: "caid", headerName: "CAID" },
    { field: "poNumber", headerName: "PO Number" },
    { field: "currency", headerName: "Currency" },
    { field: "invoiceLevel", headerName: "Invoice Level" },
    { field: "dateCreated", headerName: "Date Created" },
    { field: "dateInvoiced", headerName: "Date Invoiced" },
    { field: "status", headerName: "Status" },
    { field: "userUpdated", headerName: "User Updated" },
    { field: "dateUpdated", headerName: "Date Updated" },
    { field: "notes", headerName: "Notes" },
    { field: "legacyAssociate", headerName: "LegacyAssociate" },
    { field: "frequency", headerName: "Frequency" },
    { field: "invoicedId", headerName: "InvoicedID" },
    { field: "offerVersion", headerName: "OfferVersion" }

  ];

  const opt_invoicesearch= [
    {label:"Company Search", value:"CompanySearch"},
    {label:"Asset Name", value:"AssetNameSearch"},
    {label:"IMO Number", value:"IMONumberSearch"},
    {label:"ERP System", value:"ERPSystemSearch"},
    {label:"ERP Number", value:"ERPNumberSearch"},
    {label:"Sold To Search", value:"SoldToSearch"},
    {label:"CAID Search", value:"CAIDSearch"},
    {label:"Valid PO Search", value:"ValidPOSearch"},
    {label:"Currency", value:"CurrencySearch"},
    {label:"Invoice Level", value:"InvoiceLevelSearch"},
    {label:"Invoice Date Created", value:"InvoiceDateCreatedSearch"},
    {label:"Status", value:"StatusSearch"},
    {label:"Legacy Associate", value:"LegacyAssociate"},
    {label:"Sales Country", value:"SalesCountry"},
    {label:"Frequency", value:"Frequency"},
    {label:"Offer Version", value:"OfferVersion"}
  ]

  const handleinvoicesearch = async (value) => {}

  const handleCompanyChange = (value) => {

    setValue("fetchcompanydata", value);

    localStorage.setItem(
      "fetchcompanydata",
      value
    );

    handlecompanyselection_table(value);
  };

  const handleInvoiceHeaderChange = (value) => {

      setValue("invoiceheaderid", value);

      localStorage.setItem(
        "invoiceheaderid",
        value
      );
    };

    const handleSelectRow = (row) => {
    const exists = selectedRows.some(
      (item) => item.id === row.id
    );

    if (exists) {
      setSelectedRows(
        selectedRows.filter(
          (item) => item.id !== row.id
        )
      );
    } else {
      setSelectedRows([
        ...selectedRows,
        row,
      ]);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(rows);
    } else {
      setSelectedRows([]);
    }
  };
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
  const handleEdit = async (row) => {
    try {
      console.log("row selected", row);

      const customerName = String(
        row?.customer ?? ""
      ).trim();
      const customerCode = customerName.slice(0, 3);

      const response = customerCode
        ? await SearchCompany(customerCode)
        : { data: [] };
      const data = response?.data || [];

      setResponddata(data);

      const normalize = (value) =>
        String(value ?? "")
          .trim()
          .toLowerCase();

      const selectedCompany =
        data.find(
          ({ company }) =>
            normalize(company) ===
            normalize(customerName)
        ) ||
        data.find(
          ({ soldTo }) =>
            String(soldTo ?? "") ===
            String(row?.soldTo ?? "")
        ) ||
        data.find(
          ({ caid }) =>
            String(caid ?? "") ===
            String(row?.caid ?? "")
        );

      const companyId =
        selectedCompany?.assetServiceOfferID
          ? String(
              selectedCompany.assetServiceOfferID
            )
          : "";

      console.log("companyId", companyId);

      if (companyId) {
        // While opening Edit, avoid the customer-list fetch inside
        // handlecompanyselection (it auto-selects the first asset and would
        // clobber the matched vessel). We still need the CAID from the
        // customer list separately below.
        await handlecompanyselection(companyId, data, {
          loadCustomerList: false,
        });
      }
      setValue("compnyname", companyId);

      // The real CAID only comes from the customer list (keyed by Sold To).
      // Fetch it here without side effects so it survives the reset() below.
      const customerCaid = selectedCompany?.soldTo
        ? await handleFetchCustomerList(
            selectedCompany.soldTo,
            { applyToForm: false }
          )
        : "";

      const assetCustomerId =
        customerCaid ||
        selectedCompany?.caid ||
        row?.caid ||
        "";
      const assetList = assetCustomerId
        ? await handleFetchAsset(assetCustomerId)
        : [];

      console.log(
        "Selected Company:",
        selectedCompany
      );

      // Match asset by IMO Number from fresh list, then fallback to existing options.
      let matchedAssetName = "";
      const assets =
        assetList.length > 0
          ? assetList
          : assetOptions;
      if (assets.length > 0) {
        const normalize = (value) =>
          String(value ?? "")
            .trim()
            .toLowerCase();

        const matchedAsset = assets.find(
          (asset) =>
            String(asset.imoNumber ?? "").trim() ===
              String(row?.imoNumber ?? "").trim() ||
            normalize(asset.value) ===
              normalize(row?.assetName)
        );
        if (matchedAsset) {
          matchedAssetName =
            matchedAsset.value;
          console.log(
            "Matched asset by IMO:",
            matchedAssetName
          );
        }
      }

      if (
        !matchedAssetName &&
        String(row?.assetName ?? "").trim()
      ) {
        matchedAssetName = String(
          row.assetName
        ).trim();
      }

      const invoicedDate =
        parseDateValue(row?.dateInvoiced);
      const invoiceDateValue =
        invoicedDate &&
        !Number.isNaN(
          invoicedDate.getTime()
        )
          ? `${invoicedDate
              .getFullYear()
              .toString()}
             -${String(
                invoicedDate.getMonth() + 1
              ).padStart(2, "0")}
             -${String(
                invoicedDate.getDate()
              ).padStart(2, "0")}`.replace(
              /\s+/g,
              ""
            )
          : "";

      const rowIndex = MappedData.findIndex(
        (item) =>
          item.invoiceHeaderId ===
          row.invoiceHeaderId
      );
      setSelectedRowIndex(
        rowIndex !== -1
          ? rowIndex
          : null
      );

      setOpenModal(true);
      reset({
        forminvoiceheaderid:
          row.invoiceHeaderId ?? "",
        companysearch: customerCode,
        compnyname: companyId,
        assetName: row.assetName ?? "",
        invoiceimo: row.imoNumber || "",
        salesCountry:
          row.salesCountry ?? "",
        erpsystem: row.erpSystem ?? "",
        erpNumber: row.erpNumber ?? "",
        soldto: row.soldTo ?? "",
        caid:
          customerCaid ||
          selectedCompany?.caid ||
          row.caid ||
          "",
        ponumber: row.poNumber ?? "",
        currency: row.currency ?? "",
        vesselorasset:
          matchedAssetName ||
          row.assetName ||
          "",
        inoicedate: invoiceDateValue,
        invoicestatus:
          row.status?.toLowerCase() || "",
        invoicenotes: row.notes ?? "",
      });
    } catch (error) {
      console.error(
        "Error while preparing edit form:",
        error
      );
      alert(
        "Unable to load full edit details. Opening the row with available data."
      );

      const rowIndex = MappedData.findIndex(
        (item) =>
          item.invoiceHeaderId ===
          row.invoiceHeaderId
      );
      setSelectedRowIndex(
        rowIndex !== -1
          ? rowIndex
          : null
      );
      setOpenModal(true);
      reset({
        forminvoiceheaderid:
          row?.invoiceHeaderId ?? "",
        companysearch: "",
        compnyname: "",
        assetName: row?.assetName ?? "",
        invoiceimo: row?.imoNumber || "",
        salesCountry:
          row?.salesCountry ?? "",
        erpsystem: row?.erpSystem ?? "",
        erpNumber: row?.erpNumber ?? "",
        soldto: row?.soldTo ?? "",
        caid: row?.caid ?? "",
        ponumber: row?.poNumber ?? "",
        currency: row?.currency ?? "",
        vesselorasset:
          row?.assetName || "",
        inoicedate: "",
        invoicestatus:
          row?.status?.toLowerCase() || "",
        invoicenotes: row?.notes ?? "",
      });
    }
  };
  const handleModalSave = (data) => {
    if (selectedRowIndex !== null) {
      update(selectedRowIndex, data.rowData); // ✅ correct way
    } else {
      append(data.rowData);
    }

    setOpenModal(false);
  };

  const onSubmit = async (data) => {
    try {
      console.log("FORM DATA:", data);

      const payload = {
        UserAlias: "3575qa",
        InvoiceHeaderID: String(data.forminvoiceheaderid) || "0", //pass zero dont pass ID
        CompanyID: String(data.caid || ""), // convert to string
        IMONumber: String(data.invoiceimo || ""),
        StartDt: formatDate(data.inoicedate || ""),
        Status: data.invoicestatus || "",
        Currency: data.currency || "",
        PurchaseOrder: data.ponumber || "",
        Notes: data.invoicenotes || ""
      };
      console.log(typeof payload);
      console.log(payload);
      // console.log("PAYLOAD:", payload);

      const res = await CreateUpdateInvoiceHeader(payload);
      console.log(res);
      setOpenModal(false);
      // handleFetchPurchaseOrder();
      handleFetchInvoiceHeader(data.soldto);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvoiceDetails = async (InvoiceNumber) => {
    try {
      const res = await FetchInvoiceDetail(InvoiceNumber);

      // Save API response
      localStorage.setItem(
        "invoiceData",
        JSON.stringify(res.data)
      );

      // Find selected invoice row from table data
    // Filter table by selected invoice header
      const selectedRows = MappedData.filter(
        item =>
          Number(item.invoiceHeaderId) === Number(InvoiceNumber)
      );

      console.log(selectedRows);

      const headerRow = selectedRows?.[0] || null;

      localStorage.setItem(
        "invoiceDetails",
        JSON.stringify(selectedRows || {})
      );

      navigate("/invoicedetails", {
        state: {
          invoiceHeaderId: InvoiceNumber,
          headerRow
        }
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchInvoiceHeader = async (data) => {
    console.log(data);

    const searchType = getValues("searchtype");
    if (!searchType) {
      alert("Please select a search type before fetching invoices.");
      return;
    }

    const payload = { [searchType]: data || "" };

    try {
      console.log("Fetching Company Details:", searchType, payload);

      const res = await FetchInvoiceHeader(payload);

      setResponddata(res.data || []);

      const tableData = Array.isArray(res)
        ? res
        : res?.data || [];

      console.log("response Data",res);

      const distinctData =Array.from(
        new Map(
          tableData.map((item) => [item.invoiceHeaderID, item])
        ).values()
      );
      setInvoiceData(distinctData);
      // Dropdown options
      const invoiceHeaderDropdown = distinctData?.map((item) => ({
        label: item.invoiceHeaderID?.toString(),
        value: item.invoiceHeaderID?.toString(),
      }));

      // setValue(
      //   "invoiceheaderid",
      //   row.invoiceHeaderID?.toString()
      // );

      console.log("Dropdown Data:", invoiceHeaderDropdown);

      const updatedMappedData = distinctData.map((item) => ({
        invoiceHeaderId: item.invoiceHeaderID || "",
        customer: item.customer || "",
        assetName: item.assetName || "A",
        imoNumber: item.imoNumber || "",
        salesCountry: item.salesCountry || "",
        erpSystem: item.erpSystem || "",
        erpNumber: item.erpNumber || "",
        soldTo: item.soldTo || "",
        caid: item.caid || "",
        poNumber: item.poNumber || "",
        currency: item.currency || "",
        invoiceLevel: item.invoiceLevel || "",
        dateCreated: formatDate(item.dateCreated) || "",
        dateInvoiced: formatDate(item.dateInvoiced) || "",
        status: item.status || "",
        userUpdated: item.userUpdated || "",
        dateUpdated: formatDate(item.dateUpdated) || "",
        notes: item.notes || " ",
        legacyAssociate: item.legacyAssociate || "",
        frequency: item.frequency || "",
        invoicedId: item.invoicedId || "",
        offerVersion: item.offerVersion || "",
      }));
    
      setMappedData(updatedMappedData);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch company details");
    }
  };

  const handleSearchCompany = async (CompanySearch) => {
    try {
      console.log("Fetching Company Names:", CompanySearch);

      const res = await SearchCompany(CompanySearch);

      setResponddata(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch company names");
    }
  };
  const handleAssetselection = (selectedValue) => {
    console.log("Selected Value:", selectedValue);
    console.log("Asset Options:", assetOptions);

    const selectedAsset = assetOptions.find(
      (item) => String(item.value) === String(selectedValue)
    );

    console.log("Selected Asset:", selectedAsset);

    if (!selectedAsset) {
      setValue("invoiceimo", "");
      return;
    }

    setValue(
      "invoiceimo",
      selectedAsset.imoNumber || ""
    );
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

      const ddmmyyyy = value.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      );
      if (ddmmyyyy) {
        const day = Number(ddmmyyyy[1]);
        const month = Number(ddmmyyyy[2]);
        const year = Number(ddmmyyyy[3]);
        const parsed = new Date(year, month - 1, day);
        if (
          parsed.getFullYear() === year &&
          parsed.getMonth() === month - 1 &&
          parsed.getDate() === day
        ) {
          return parsed;
        }
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
  const handleFetchAsset = async (cust_Id) => {
    console.log("selected Cust Id", cust_Id);
    try {
      // FetchAsset expects an object of query params; the backend filters the
      // vessel list by CompanyID (the customer's CAID). Passing a bare scalar
      // made axios throw "target must be an object" so no vessels ever loaded.
      const response = await FetchAsset({ CompanyID: cust_Id });

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      const updatedMappedData = tableData.map((item) => ({
        label: item.vesselOrAssetName,
        value: item.vesselOrAssetName,
        imoNumber: item.imoNumber || "",
      }));

      setAssetOptions(updatedMappedData);
      console.log(updatedMappedData);
      // IMPORTANT:
      // set value only after options exist
      if (updatedMappedData.length > 0) {
        setValue("vesselorasset", updatedMappedData[0].value);
      }

      return updatedMappedData;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleFetchCustomerList = async (sold_to, options = {}) => {
    // applyToForm=false lets callers (e.g. Edit first-open) read the CAID
    // without mutating the form or auto-selecting the first asset.
    const { applyToForm = true, fetchAssets = true } = options;
    const payload = {
      SoldToSearch: sold_to || "",
    }
    try {
      console.log("Fetching Customer List:", payload);

      const response = await FetchCustomerList(payload);

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      console.log("Customer Response:", tableData);

      if (tableData.length > 0) {
        const customerID = tableData[0].customerID || "";

        if (applyToForm) {
          setValue("caid", customerID);

          if (fetchAssets) {
            handleFetchAsset(customerID);
          }
        }

        return customerID;
      }

      return "";
    } catch (err) {
      console.error(err);
      if (applyToForm) {
        alert("Failed to fetch customer list");
      }
      return "";
    }
  };

  const handlecompanyselection = async (
    selectedId,
    dataSource = Responddata,
    options = {}
  ) => {
    const { loadCustomerList = true } = options;
    console.log("Selected ID:", selectedId);

    const selectedCompany = dataSource.find(
      (item) => item.assetServiceOfferID === Number(selectedId)
    );

    console.log("Selected Company:", selectedCompany);

    if (selectedCompany) {
      setValue("soldto", selectedCompany.soldTo || "");
      setValue("caid", selectedCompany.caid || "");
      setValue("erpsystem", selectedCompany.sourceERPSystem || "");

      if (loadCustomerList) {
        await handleFetchCustomerList(
          selectedCompany.soldTo
        );
      }
    }
  };

  const handlecompanyselection_table = async (selectedId) => {
    console.log("Selected ID:", selectedId);

    const selectedCompany =
      Responddata.find(
        item =>
          item.assetServiceOfferID ===
          Number(selectedId)
      );

    if (!selectedCompany) return;
      const response = await FetchInvoiceHeader( selectedCompany.company );

    const tableData = Array.isArray(response)
      ? response
      : response?.data || [];

    console.log("response Data",response);

    // setInvoiceData(response);

    // Remove duplicate invoiceHeaderID
    const distinctData =Array.from(
      new Map(
        tableData.map((item) => [item.invoiceHeaderID, item])
      ).values()
    );
    setInvoiceData(distinctData);
    // Dropdown options
    // const invoiceHeaderDropdown = distinctData.map((item) => ({
    //   label: item.invoiceHeaderID,
    //   value: item.invoiceHeaderID,
    // }));
      const invoiceHeaderDropdown =
        distinctData?.map((item) => ({
          label:
            item.invoiceHeaderID?.toString(),
          value:
            item.invoiceHeaderID,
        }));
    console.log("Dropdown Data:", invoiceHeaderDropdown);

    const updatedMappedData = distinctData.map((item) => ({
      invoiceHeaderId: item.invoiceHeaderID || "",
      customer: item.customer || "",
      assetName: item.assetName || "A",
      imoNumber: item.imoNumber || "",
      salesCountry: item.salesCountry || "",
      erpSystem: item.erpSystem || "",
      erpNumber: item.erpNumber || "",
      soldTo: item.soldTo || "",
      caid: item.caid || "",
      poNumber: item.poNumber || "",
      currency: item.currency || "",
      invoiceLevel: item.invoiceLevel || "",
      dateCreated: formatDate(item.dateCreated) ||"",
      dateInvoiced: formatDate(item.dateInvoiced) || "",
      status: item.status || "",
      userUpdated: item.userUpdated || "",
      dateUpdated: formatDate(item.dateUpdated) || "",
      notes: item.notes || " ",
      legacyAssociate: item.legacyAssociate || "",
      frequency: item.frequency || "",
      invoicedId: item.invoicedId || "",
      offerVersion: item.offerVersion || "",
    }));
    
    setMappedData(updatedMappedData);

    // Set dropdown data
    setInvoiceHeaderDropdown(invoiceHeaderDropdown);

    console.log(updatedMappedData);
  };
  const actionButtons = [

    {
      text: "Create Invoice",
      icon: "bi bi-plus-circle",
      className: "btn btn-primary",
      onClick: handleAdd,
    },

    // {
    //   text: "Download Details",
    //   icon: "bi bi-download",
    //   className: "btn btn-info text-white",
    //   onClick: () =>
    //     handleInvoiceDetails(
    //       getValues("invoiceheaderid")
    //     ),
    // },

    {
      text: "New Offer Version",
      icon: "bi bi-file-earmark-plus",
      className: "btn btn-warning text-dark",
      onClick: () => {
        console.log("New Offer Version");
      },
    },

    // {
    //   text: "Export to CSV",
    //   icon: "bi bi-filetype-csv",
    //   className: "btn btn-success",
    //   onClick: () => {
    //     console.log("Export CSV");
    //   },
    // },

  ];
  return (
<div className="container-fluid py-4 bg-light min-vh-100">

  {/* ================= PAGE HEADER ================= */}

  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">

    <div>

      <h2 className="fw-bold text-dark mb-1">
        Invoice Header Management
      </h2>

      <p className="text-muted mb-0">
        Search, create and manage invoice headers
      </p>

    </div>

    <div className="d-flex flex-wrap gap-2">

    </div>


    <div className="d-flex flex-wrap gap-3">
        
        {/* <div className="col-md-3"> */}

            {actionButtons.map(
            ({ text, className, onClick, icon, }) => (
                <button
                key={text}
                className={` ${className} shadow-sm d-flex align-items-center
                    gap-2 px-4 py-2 rounded-3 fw-semibold `}
                onClick={onClick}
                >
                <i className={icon}></i> {text}
                </button>
            )
            )}
            

        <div className="col-md-3 mt-2">
          <FormSelect
            name="searchtype"
            control={control}
            label="Search Type *"
            options={opt_invoicesearch}
          />
        </div>
          <FormInput
            sx={{ width: 200, mt: 1 }}
            name="soldtoidsearch"
            control={control}
            label={`${getValues("searchtype") || "Search Type"} ID`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="bi bi-search" />
                </InputAdornment>
              ),
            }}
          />
        <button  className="shadow-sm  align-items-center  gap-2  px-4 py-2 rounded-3 fw-semibold"
            disabled={loading || !searchtype}
            onClick={() =>
                handleFetchInvoiceHeader(
                getValues("soldtoidsearch")
                )
            }  >

            {loading ? (
            <>
                <span
                className="spinner-border spinner-border-sm "
                role="status"
                ></span>
                Loading...
            </>
            ) : (
            <>
                <i className="bi bi-arrow-repeat me-2"></i>
                Fetch Invoices
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
                {MappedData?.length || 0}
              </h3>

            </div>

            <div className="bg-success bg-opacity-10 p-3 rounded-circle">

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
                Invoice Data Sync
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
                Invoice Header Table
              </h5>
              <small className="text-muted">
                Invoice header records and details
              </small>
            </div>
          </div>
        </div>
        <div className="card-body">

          <EditableSortableTable_OnlyEdit
            columns={columns}
            rowData={MappedData}
            control={control}
            onEdit={handleEdit}
            pagename="invoiceheader"
            onRowClick={(rows) => {

              const lastSelectedId =
                rows.length > 0
                  ? rows[rows.length - 1]
                      .invoiceHeaderId
                  : null;

              setValue(
                "selectedinvoiceid",
                lastSelectedId
              );

              setValue(
                "invoiceheaderid",
                lastSelectedId
              );

            }}
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
      {/* ================= MODAL ================= */}
      <div
        className={`modal fade ${
          openModal ? "show d-block" : ""
        }`}
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)"
        }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            {/* ================= MODAL HEADER ================= */}
            <div className="modal-header bg-success text-white border-0 rounded-top-4">
              <div>
                <h4 className="modal-title fw-bold mb-1">
                  Invoice Header
                </h4>
                <small className="opacity-75">
                  Manage invoice company and vessel information
                </small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() =>
                  setOpenModal(false)
                }
              ></button>
            </div>
            {/* ================= MODAL BODY ================= */}
            <div className="modal-body bg-light p-4">
              {/* ================= COMPANY INFO ================= */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Company Information
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-2 align-items-end">

                    {/* Search Input */}
                    <div className="col-md-3">
                      <FormInput
                        name="companysearch"
                        control={control}
                        label="Search Company"
                      />
                    </div>

                    {/* Search Button */}
                    <div className="col-auto">
                      <LoadingButton
                        className="btn btn-primary mt-4"
                        asyncAction={async () => handleSearchCompany(getValues("companysearch"))}
                        loadingKey="invoice-search"
                      >
                        Search
                      </LoadingButton>
                    </div>

                    {/* Company Select */}
                    <div className="col-md-4">
                      <FormSelect
                        name="compnyname"
                        control={control}
                        label="Company"
                        onChange={(e) =>
                          handlecompanyselection(
                            e.target.value
                          )
                        }
                        options={Responddata.map((item) => ({
                          label: item.company,
                          value: item.assetServiceOfferID
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="row g-2 align-items-end  mt-2">
                    {/* ERP System */}
                    <div className="col-md-2">
                      <FormInput
                        disabled
                        name="erpsystem"
                        control={control}
                        label="ERP System"
                      />
                    </div>

                    {/* Sold To */}
                    <div className="col-md-2">
                      <FormInput
                        disabled
                        name="soldto"
                        control={control}
                        label="Sold To"
                      />
                    </div>

                    {/* CAID */}
                    <div className="col-md-2">
                      <FormInput
                        disabled
                        name="caid"
                        control={control}
                        label="CAID"
                      />
                    </div>

                  </div>
                </div>
              </div>
              {/* ================= VESSEL INFO ================= */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">

                  <h6 className="fw-bold mb-0">
                    Vessel / Asset Information
                  </h6>

                </div>

                <div className="card-body">

                  <div className="row g-4">

                    <div className="col-md-6">

                      <FormSelect
                        name="vesselorasset"
                        control={control}
                        value={
                          watch(
                            "vesselorasset"
                          ) || ""
                        }
                        label="Vessel"
                        onChange={(e) => {

                          const value =
                            e.target.value;

                          setValue(
                            "vesselorasset",
                            value
                          );

                          handleAssetselection(
                            value
                          );

                        }}
                        options={[
                          {
                            label: "Select",
                            value: "",
                          },
                          ...assetOptions,
                        ]}
                      />

                    </div>

                    <div className="col-md-3">

                      <FormInput
                        name="invoiceimo"
                        control={control}
                        label="IMO"
                      />

                    </div>

                  </div>

                </div>

              </div>
              {/* ================= INVOICE DETAILS ================= */}
              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-header bg-white border-0 py-3">

                  <h6 className="fw-bold mb-0">
                    Invoice Details
                  </h6>

                </div>

                <div className="card-body">

                <div className="row g-1 align-items-end">

                  <div className="col">

                    <label className="form-label mb-1 small text-muted">
                      Invoice Date
                    </label>

                    <FormInput
                      type="date"
                      name="inoicedate"
                      control={control}
                    />

                  </div>

                  <div className="col">

                    <FormSelect
                      name="currency"
                      control={control}
                      label="Currency"
                      options={opt_Currency}
                    />

                  </div>

                  <div className="col">

                    <FormSelect
                      name="invoicestatus"
                      control={control}
                      label="Status"
                      options={opt_invice_status}
                    />

                  </div>

                  <div className="col">

                    <FormInput
                      name="ponumber"
                      control={control}
                      label="PO Number"
                    />

                  </div>

                </div>

                  <div className="row g-3 mt-1">

                    <div className="col-md-12 ">

                      <FormInput 
                        sx={{ width: "100%" }}
                        multiline
                        rows={4}
                        name="invoicenotes"
                        control={control}
                        label="Notes"
                      />

                    </div>

                  </div>

                  <hr className="my-4" />

                  <div className="row align-items-end">

                    <div className="col-md-4">

                      <FormInput
                        disabled
                        name="forminvoiceheaderid"
                        control={control}
                        label="Invoice Header ID"
                      />

                    </div>

                    <div className="col-md-8">

                      <div className="d-flex justify-content-end gap-2">

                        <button
                          className="btn btn-outline-danger px-4"
                          onClick={() =>
                            reset()
                          }
                        >
                          Clear
                        </button>

                        <LoadingButton
                          className="btn btn-primary px-4 shadow-sm"
                          asyncAction={async () => await handleSubmit(onSubmit)()}
                          loadingKey="invoice-save"
                        >
                          Save Invoice
                        </LoadingButton>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Createinvoice;