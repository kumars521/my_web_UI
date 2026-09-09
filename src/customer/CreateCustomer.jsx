import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from "react";
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import EditableSortableTable from "../components/form/EditableSortableTable";
import EditableTable from "../components/form/EditableTable";
import FormCheckbox from "../components/form/FormCheckbox";
import FormRadio from "../components/form/FormRadio";
import { useForm, Controller,useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField as MuiTextField,TextField, InputAdornment, IconButton, Typography,Button,  Table,
  TableBody,  Paper,  TableCell, TableContainer,  TableHead, TableRow,CircularProgress,Box } from "@mui/material";

import { customerSchema } from "../validation/customerSchema";

import {FetchCustomerList} from "../api/customerApi"

import {CreateUpdateCompany,OwnershipChange_API} from "../api/postApi"

import {CheckForInvoices} from "../api/InvoiceApis"

import ErrorMessageModel from "../utilities/ErrorMessageModel";

import {GetEnergyManualERPFormData,GetMarineManualERPFormData,UpdateEnergyManualERPData_FromUoaForm,UpdateMarineManualERPData_FromUoaForm} from "../api/energyformapis"

import {opt_tse} from "./Opt_library"
import {SearchCompany} from "../api/customerApi"
  /* Pricing Pre-2022 editable table columns (Energy / old offer) */
  const columns_prising = [
    { field: "offer1",  headerName: "Offer Band", type: "text",  },
    { field: "foc",      headerName: "FOC (# Samples)",  type: "text"   },
    { field: "price",    headerName: "Price per Sample",  type: "text"   },
    // { field: "currency", headerName: "Currency", type: "text",  },
  ];


const CreateCustomer = forwardRef((props, ref) => {
  const navigate = useNavigate();

  const FORM_DEFAULT_VALUES = {
    // Tab 0
    custname: "",
    gst_name: "",
    cust_num: "",
    erp_system: "",
    business: "",
    sold_to: "",
    caid: "",
    uao_account: "",
    customer_tse_owner: "",
    po_required: false,
    valid_po: "",
    contract_status: "",
    contractdate: new Date().toISOString().split("T")[0],
    invoicing: "",
    notes: "",

    // Tab 2
    currency2: "USD",
    frequency2: "3M",
    discount: "0",
    chk_basic: true,
    basic_service: "basic_Auto",
    chk_sda: false,
    chk_specialist: false,

    // Optional
    chk_Prorata: false,
    chk_FOC: false,
    rows: [{ id: 1, offer1: "", foc: "", price: "" }],
  };

  const { control,getValues, handleSubmit, reset, watch,setValue, formState: { errors } } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });
  const [tab, setTab] = React.useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openAssetModal, setOpenAssetModal] = useState(false);
  const [openOwnershipModal, setOpenOwnershipModal] = useState(false);
  const [ownershipRow, setOwnershipRow] = useState(null);
  const [ownershipOwner, setOwnershipOwner] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [assetSearchResult, setAssetSearchResult] = useState("");
  const chk_basic = watch("chk_basic");
  const po_required=watch("po_required");
  const erp_system=watch("erp_system");
  const business =watch("business");
  const contract_status=watch("contract_status");
  const [Responddata,setResponddata]=useState([]);
  const [MappedData, setMappedData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [openErrorModel, setOpenErrorModel] = useState(false);
  const [rowCustname, setrowCustname] = useState("");
  const [rowStatus, setrowStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const searchtype = watch("searchtype");

  const rows = watch("rows") || [];
  // const offerVersion = watch("offerVersion") || "";
  const ASSET_MODAL_DEFAULT_VALUES = {
    assetCustomer: "",
    assetName: "",
    searchTerm: "",
    assetType: "",
    assetDate: "",
    ownerassetDate:new Date().toISOString().split("T")[0],
  };
  const currencyOptions= [
    { label: "DKK", value: "DKK" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
    { label: "JPY", value: "JPY" },
    { label: "NOK", value: "NOK" },
    { label: "SEK", value: "SEK" },
    { label: "USD", value: "USD" }
  ]

  const columns = [
    {
      field: "customerID",
      headerName: "Customer ID",
      flex: 1,
      renderCell: (row) => (
        <button
          type="button"
          className="btn btn-link p-0"
          style={{ textDecoration: "underline", color: "#0d6efd" }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/vessel?customerId=${encodeURIComponent(row.customerID || "")}`);
          }}
        >
          {row.customerID || "-"}
        </button>
      ),
    },
    {
      field: "name",
      headerName: "Customer Name",
      flex: 1,
      renderCell: (row) => (
        <button
          type="button"
          className="btn btn-link p-0"
          style={{ textDecoration: "underline", color: "#0d6efd" }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/vessel?customerName=${encodeURIComponent(row.name || "")}`);
          }}
        >
          {row.name || "-"}
        </button>
      ),
    },
    { field: "gstName", headerName: "GST Name", flex: 1 },
    { field: "soldTo", headerName: "Sold To", flex: 1 },
    { field: "business", headerName: "Business", flex: 1 },
    { field: "currency", headerName: "Currency", flex: 1 },
    { field: "sourceERPSystem", headerName: "ERP System", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "frequency", headerName: "Frequency", flex: 1 },
    { field: "offerVersion", headerName: "Offer Version", flex: 1 },
    { field: "contractedDate", headerName: "Contracted Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    { field: "automaticInvoicing", headerName: "Automatic Invoicing", flex: 1 },
    { field: "annualSDA", headerName: "Annual SDA", flex: 1 },
    { field: "prorata", headerName: "Prorata", flex: 1 },
    { field: "poRequired", headerName: "PO Required", flex: 1 },
    { field: "validPO", headerName: "Valid PO", flex: 1 },
    { field: "openInvoices", headerName: "Open Invoices", flex: 1 },
    { field: "discount", headerName: "Discount", flex: 1 },
    { field: "notes", headerName: "Notes", flex: 1 },
    { field: "accountNeumonic", headerName: "Account Neumonic", flex: 1 },
    { field: "basicUOAOverride", headerName: "Basic UOA Override", flex: 1 },
    { field: "bookedOut", headerName: "Booked Out", flex: 1 },
    { field: "caid", headerName: "CAID", flex: 1 },
    { field: "customerTSEOwner", headerName: "Customer TSE Owner", flex: 1 },
    { field: "serviceoffer", headerName: "Service Offer", flex: 1 },
    { field: "serviceOfferBandBasic", headerName: "Service Offer Band Basic", flex: 1 },
    { field: "serviceOfferBandBasicAuto", headerName: "Service Offer Band Basic Auto", flex: 1 },
    { field: "serviceOfferBandBasicValue", headerName: "Service Offer Band Basic Value", flex: 1 },
    { field: "serviceOfferBandSDA", headerName: "Service Offer Band SDA", flex: 1 },
    { field: "serviceOfferBandSpecialist", headerName: "Service Offer Band Specialist", flex: 1 },
  ];
  const opt_frequency = [
    { label: "1M",  value: "1M"  },
    { label: "3M",  value: "3M"  },
    { label: "6M",  value: "6M"  },
    { label: "12M", value: "12M" },
  ];
  const {
    control: assetControl,
    handleSubmit: handleAssetSubmit,
    reset: resetAssetForm,
    watch: watchAsset,
    setValue: setAssetValue,
    getValues: getAssetValues,
  } = useForm({
    defaultValues: ASSET_MODAL_DEFAULT_VALUES,
  });

  const runWithLoading = async (actionKey, action) => {
    if (loadingAction) return;
    setLoadingAction(actionKey);
    try {
      await Promise.resolve(action());
    } finally {
      setLoadingAction(null);
    }
  };

  const renderButtonContent = (actionKey, label, loadingLabel, iconClass) => {
    const isActive = loadingAction === actionKey;
    return isActive ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {loadingLabel}
      </>
    ) : (
      <>
        <i className={`bi ${iconClass} me-2`}></i>
        {label}
      </>
    );
  };

  useEffect(() => {
    handleFetchCustomerList();
  if (business === "energy") {
    setValue("po_required", true);
  } else {
    setValue("po_required", false); // optional
  }
  }, [business, setValue]);

  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));
  const toLower = (val) => val ? val.toLowerCase() : "";
  const toBool = (val) => String(val).toLowerCase() === "true";
  const parseDateValue = (value) => {
    if (value === undefined || value === null || value === "") return null;

    if (typeof value === "number") {
      return new Date(value);
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      const m = trimmed.match(/\/Date\((-?\d+)\)\//);
      if (m) {
        return new Date(Number(m[1]));
      }

      const dayFirstMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (dayFirstMatch) {
        const [, day, month, year] = dayFirstMatch;
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        if (!Number.isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      const yearFirstMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (yearFirstMatch) {
        const [, year, month, day] = yearFirstMatch;
        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
        if (!Number.isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      const d = new Date(trimmed);
      if (!Number.isNaN(d.getTime())) {
        return d;
      }

      const alt = new Date(trimmed.replace(/-/g, "/"));
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

  // Returns YYYY-MM-DD for <input type="date">
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toDateInputValue = (value) => {
    const d = parseDateValue(value);
    if (!d || Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const normalizeInvoicing = (val) => {
    const v = String(val || "").toLowerCase().trim();
    if (v === "yes" || v === "true" || v === "1") return "yes";
    if (v === "no"  || v === "false"|| v === "0") return "no";
    return v;
  };

  const offerVersion = editingRow?.offerVersion || watch("offerVersion");
  const disablePre2022 = offerVersion === "2022";
  const disable2022 = offerVersion === "Pre-2022";


  // Add
  const handleAdd = () => {
    setSelectedRowIndex(null);
    setEditingRow(null);
    setTab(0);
    reset(FORM_DEFAULT_VALUES);
    setOpenModal(true);
  };

  const handleInvoiceApis = async (customerID) => {
    try {
      const resp=await CheckForInvoices(customerID);
      console.log(resp);
    } catch (error) {
      
    }
  };
  const handleAssetSave = (data) => {
    console.log("Asset modal values:", data);
    setOpenAssetModal(false);
    resetAssetForm(ASSET_MODAL_DEFAULT_VALUES);
  };

  const handleOwnershipOpen = (row) => {
    setOwnershipRow(row);
    setOwnershipOwner(row.customerTSEOwner || "");
    setOpenOwnershipModal(true);
  };

  const handleOwnershipSave = async () => {
    const transferDate = getAssetValues("ownerassetDate");

    const payload = {
      UserAlias: "3575qa",
      AssetID: ownershipRow?.customerID ?? "",
      NewOwner: `${getValues("ownercompnyname") ?? ""} / ${ownershipRow?.soldTo ?? ""}`,      
      TransferDate: formatDate(transferDate
        ? new Date(transferDate).toISOString().split("T")[0] // YYYY-MM-DD
        : null),
      Level: 2,
    };

    console.log("Ownership Transfer Payload:", payload);

    try {
      const result = await OwnershipChange(payload);
      console.log(result);

      setOpenOwnershipModal(false);
    } catch (error) {
      console.error("Ownership transfer failed:", error);
    }
  };
  const contractStatus = watch("contract_status");
  const isContractLost = String(contractStatus || "").trim().toLowerCase() === "lost";
  const statusLabel =
  {
    contracted: "Contracted",
    prospect: "Prospect",
    lost: "Lost",
  }[contractStatus] || "";

  const opt_invoicesearch= [
    {label:"Company Search", value:"CompanySearch"},
    {label:"Company ID", value:"CompanyID"},
    {label:"Sold To Search", value:"SoldToSearch"},
    // {label:"GST Company Search", value:"GSTCompanySearch"},
    // {label:"Source ERP Search", value:"SourceERPSearch"},
    // {label:"Business Search", value:"BusinessSearch"},
    // {label:"Sold To Search", value:"SoldToSearch"},
    // {label:"TSE Owner Search", value:"TSEOwnerSearch"},
    // {label:"CAID Search", value:"CAIDSearch"},
    // {label:"Basic CAID Search", value:"BasicCAIDSearch"},
    // {label:"Currency Search", value:"CurrencySearch"},
    // {label:"Frequency Search", value:"FrequencySearch"},
    // {label:"Valid PO Search", value:"ValidPOSearch"},
    // {label:"PO Required", value:"PORequired"},
    // {label:"Status Search", value:"StatusSearch"},
    // {label:"Booked Out Search", value:"BookedOutSearch"},
    // {label:"Auto Invoicing Search", value:"AutoInvoicingSearch"}
  ]

  const handleFetchCustomerList = async (searchValue , options = {}) => {
    const { searchType = getValues("searchtype") || "CompanySearch" } = options;
    let response;
    try {
      const payload = { [searchType]: searchValue || "" };
      if (![searchType]) {
        response = await FetchCustomerList(payload);
      }else{
         response = await FetchCustomerList();
      }

      

      console.log("FULL RESPONSE:", response);

      const tableData = Array.isArray(response?.data)
        ? response.data
        : [];

      console.log("TABLE DATA:", tableData);

      const mappedData = tableData.map((item, index) => ({
        id: index + 1, // important for table row key
        customerID: item.customerID || "",
        invoiceHeaderID: item.invoiceHeaderID || "",
        name: item.name || "",
        gstName: item.gstName || "",
        soldTo: item.soldTo || "",
        business: item.business || "",
        currency: item.currency || "",
        sourceERPSystem: item.sourceERPSystem || "",
        status: item.status || "",
        frequency: item.frequency || "",
        offerVersion: item.offerVersion || "",
        contractedDate: formatDate(item.contractedDate) || "",
        endDate: formatDate(item.endDate) || "",
        automaticInvoicing: item.automaticInvoicing || "",
        annualSDA: item.annualSDA || "",
        prorata: item.prorata || "",
        poRequired: item.poRequired || "",
        validPO: item.validPO || "",
        openInvoices: item.openInvoices || "",
        discount: item.discount || "",
        notes: item.notes || "",

        accountNeumonic: item.accountNeumonic || "",
        basicUOAOverride: item.basicUOAOverride || "",
        bookedOut: item.bookedOut || "",
        caid: item.caid || "",
        customerTSEOwner: item.customerTSEOwner || "",
        serviceoffer: item.serviceoffer || "",
        serviceOfferBandBasic: item.serviceOfferBandBasic || "",
        serviceOfferBandBasicAuto: item.serviceOfferBandBasicAuto || "",
        serviceOfferBandBasicValue: item.serviceOfferBandBasicValue || "",
        serviceOfferBandSDA: item.serviceOfferBandSDA || "",
        serviceOfferBandSpecialist: item.serviceOfferBandSpecialist || "",
      }));

      console.log("MAPPED DATA:", mappedData);

      setMappedData(mappedData); // IMPORTANT
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  const mapRowToForm = (row) => ({
    custname: row.name || "",
    gst_name: row.gstName || "",
    cust_num: row.customerID || "",
    erp_system: row.sourceERPSystem?.toLowerCase() || "",
    business: row.business?.toLowerCase() || "",
    sold_to: row.soldTo || "",
    caid: row.caid || "",
    uao_account: row.uao_account || "",
    customer_tse_owner: row.customerTSEOwner || "",
    po_required:
    row.poRequired === true || row.poRequired === "TRUE" || row.poRequired === "true" || false,
    valid_po: row.validPO || "",
    contract_status: row.status?.toLowerCase() || "",
    contractdate: toDateInputValue(row.contractedDate) || "",
    invoicing: normalizeInvoicing(row.automaticInvoicing),
    notes: row.notes || "",

    pricingcurrency: row.currency || "",
    pricingfrequency: row.frequency || "",
    // Tab 2
    currency2: row.currency ,
    frequency2: row.frequency || "3M",
    
    discount: row.discount || "0",
    chk_basic: row.chk_basic !== undefined ? row.chk_basic : true,
    basic_service: row.basic_service || "basic_Auto",
    chk_sda: row.chk_sda !== undefined ? row.chk_sda : false,
    chk_specialist: row.chk_specialist !== undefined ? row.chk_specialist : false,
  });

  const mapFormToRow = (data) => ({
    custname: data.custname,
    gst_name: data.gst_name,
    cust_num: data.cust_num,
    erp_system: data.erp_system,
    business: data.business,
    sold_to: data.sold_to,
    caid: data.caid,
    uao_account: data.uao_account,
    customer_tse_owner: data.customer_tse_owner,
    po_required: data.po_required,
    valid_po: data.valid_po,
    contract_status: data.contract_status,
    contractdate: data.contractdate,
    invoicing: data.invoicing,
    notes: data.notes,

    // Tab 2
    currency2: data.currency2,
    frequency2: data.frequency2,
    discount: data.discount,
    chk_basic: data.chk_basic,
    basic_service: data.basic_service,
    chk_sda: data.chk_sda,
    // CompanyID:"1234987654"
    chk_specialist: data.chk_specialist,

    // // Optional
    // Prorata: data.chk_Prorata,
    // chk_FOC: data.chk_FOC,
  });

  const buildPricingRowsFromRecords = (records = []) => {
    const normalizedRecords = Array.isArray(records) ? records : [];
    const zeroAssetRecords = normalizedRecords.filter((item) => {
      const assetId = item?.companyAssetID ?? item?.CompanyAssetID ?? item?.customerAssetID ?? item?.CustomerAssetID;
      return assetId === 0 || assetId === "0";
    });

    const sourceRecords = zeroAssetRecords.length > 0 ? zeroAssetRecords : normalizedRecords;

    if (sourceRecords.length === 0) {
      return [{ id: 1, offer1: "", foc: "", price: "" }];
    }

    return sourceRecords.map((item, index) => ({
      id: index + 1,
      offer1: item?.service_offer_Band || "",
      foc: item?.foc || "",
      price: item?.price || "",
    }));
  };

  // Edit
  const handleEdit =async (row) => {
    if (row.status?.trim().toLowerCase() === "lost") {
      setrowCustname(row.name || row.customer || "Unknown Customer");
      setrowStatus(row.status || row.contract_status || "Lost");
      setOpenErrorModel(true);
      return;
    }

    console.log("Editing row:", row);
    const rowIndex = MappedData.findIndex((item) => item.id === row.id);
    setSelectedRowIndex(rowIndex === -1 ? null : rowIndex);
    setEditingRow(row);
    setTab(0);
    reset(mapRowToForm(row));
    setOpenModal(true);

    if(row.business?.toLowerCase() === "energy"){
      const payload = {CompanyID: row.customerID || ""};
      const res = await GetEnergyManualERPFormData(payload);
      const energyRow = {
        id: 1,
        offer1: "Energy All In One",
        foc: res?.data?.[0]?.foc || 0,
        price: res?.data?.[0]?.price || 0,
      };

      setValue("rows", [energyRow]);
    } 
    if(row.business?.toLowerCase() === "marine" && row.offerVersion === "Pre-2022"){
      const payload = {CompanyID: row.customerID || ""};
      const res = await GetMarineManualERPFormData(payload);
      const marineData = Array.isArray(res?.data) ? res.data : [];
      const pricingRows = buildPricingRowsFromRecords(marineData);

      console.log("Marine Manual ERP Form Data:", marineData);
      setValue("rows", pricingRows);
      // setTab(1);
    }
  };

  /* ── Save → CreateUpdateCompany API ── */
  const handleModalSave = async (data) => {
    console.log("Saving data:", data);
    const energypayload={
      companyID: data.cust_num,
      companyAssetID: 0,
      foc:data.rows[0].foc ||"0",
      price: data.rows[0].price||"0",
      currency: data.pricingcurrency,
      invoicing_Type: data.invoicingtype, 
      frequency:data.pricingfrequency,
    }
    const Marinepayload={
      companyID: data.cust_num,
      companyAssetID: 0,
      foc:data.rows[0].foc,
      price: data.rows[0].price,
      currency: data.currency2,
      frequency:data.frequency2,
      discount:data.rows[0].discount,
      serviceOfferBandBasic:data.chk_basic ? "True" : "False",
      serviceOfferBandBasicValue:data.basic_service,
      serviceOfferBandSDA:data.chk_sda ? "True" : "False",
      serviceOfferBandSpecialist:data.chk_specialist ? "True" : "False",
    }
    try {
      console.log("Payload for CreateUpdateCompany:", energypayload);
      if(data.business?.toLowerCase() === "energy") {
        const res = await UpdateEnergyManualERPData_FromUoaForm(energypayload);
      }else{
        const res = await UpdateMarineManualERPData_FromUoaForm(Marinepayload);
      }
      setOpenModal(false);
      setSelectedRowIndex(null);
    } catch (err) {
      console.log("Error saving data:", err);
      // setSaveError(err?.response?.data?.message || err.message || "Save failed.");
    } 
    // finally {
    //   setIsSaving(false);
    // }
  };
  const handleSearchCompany = async (CompanySearch) => {
    try {
      console.log("Fetching Company Names:", CompanySearch);

      const res = await SearchCompany(CompanySearch);

      console.log("SearchCompany Response:", res);

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (!data || data.length === 0) {
          // alert("No data found for given input");
          setResponddata("No data found for given input");
        } else {
          setResponddata(data);
        }
      // alert(errorMessage);
    }catch (error) {
      console.error("Error fetching company names:", error);
    }
  };

  const handlebookinout = (row) => {
    const rowIndex = MappedData.findIndex((item) => item.id === row.id);
  };
  const handleSubmitCustomerData  = async (data, rowBeingEdited = null) => {
    try {
      console.log("FORM DATA:", data);

      const payload = {
        CompanyID:"0",
        UserAlias: "3575qa",
        Name: String(data.custname),
        GSTName: String(data.gst_name),
        AccNeumonic: String(data.cust_num),
        SourceSystem: String(data.erp_system),
        BusinessCode: String(data.business),
        SoldTo: String(data.sold_to),
        CAID: String(data.caid),
        uao_account: String(data.uao_account),
        TSEOwner: String(data.customer_tse_owner),
        PORequired: String(data.po_required),
        valid_po: String(data.valid_po),
        CompanyStatus: String(data.contract_status),
        ContractedDate: data.contractdate,
        IsAutoInvoicing: String(data.invoicing),
        companyNotes: String(data.notes),
        offerVersion: String(data.business === "energy" ? "Pricing Pre-2022" : "Pricing-2022"),
        // Tab 2
        prorata: "FALSE",
        Currency: String(data.currency2),
        Frequency: String(data.frequency2),
        Discount: String(data.discount),
        BasicCAID: String(data.chk_basic),
        AnnualSDA: String(data.chk_sda),
        Foc:"",
        price:"",
        
      };

      console.log("Payload:", payload);

      const res = await CreateUpdateCompany(payload);
      console.log(res);

      setOpenModal(false);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      {loadingAction && (
        <div display="flex" alignItems="center" gap={1} my={2}>
          <CircularProgress size={20} />
          <Typography>Loading customer list...</Typography>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body py-4 px-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h3 className="fw-bold mb-1">Customer Management</h3>
              <p className="text-muted mb-0">Create, edit and manage customers</p>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <button
                className="btn btn-success px-4 shadow-sm"
                onClick={() => runWithLoading("create-customer", handleAdd)}
                disabled={loadingAction === "create-customer"}
              >
                {renderButtonContent("create-customer", "Create Customer", "Opening...", "bi-plus-circle")}
              </button>
              <button
                className="btn btn-outline-success px-4 shadow-sm"
                onClick={() => runWithLoading("refresh-list", () => handleFetchCustomerList(getValues("soldtidsearch")))}
                disabled={loadingAction === "refresh-list"}
              >
                {renderButtonContent("refresh-list", "Refresh List", "Refreshing...", "bi-arrow-repeat")}
              </button>
              <div className="col-md-3 mt-2">
                <FormSelect
                  name="searchtype"
                  control={control}
                  label="Search Type *"
                  options={opt_invoicesearch}
                />
              </div>
              <div className="col-md-3 mt-2 ">
                <Controller
                  name="soldtidsearch"
                  control={control}
                  render={({ field }) => (
                    <MuiTextField
                      {...field}
                      fullWidth
                      label={`${getValues("searchtype") || "Search Type"} ID`}
                      size="small"
                      placeholder="Enter SoldTo ID"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                runWithLoading("search-customer", () =>
                                  handleFetchCustomerList(field.value, {
                                    searchType: getValues("searchtype") || "CompanySearch",
                                  })
                                )
                              }
                              edge="end"
                              size="small"
                              aria-label="search"
                            >
                              <i className="bi bi-search"></i>
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          runWithLoading("search-customer", () =>
                            handleFetchCustomerList(field.value, {
                              searchType: getValues("searchtype") || "CompanySearch",
                            })
                          );
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Customers</p>
                  <h3 className="fw-bold mb-0">{MappedData.length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-people fs-4 text-success"></i>
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
                  <p className="text-muted mb-1">Energy Customers</p>
                  <h3 className="fw-bold mb-0">{MappedData.filter((item) => item.business?.toLowerCase() === "energy").length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-lightning-charge fs-4 text-success"></i>
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
                  <p className="text-muted mb-1">Marine Customers</p>
                  <h3 className="fw-bold mb-0">{MappedData.filter((item) => item.business?.toLowerCase() === "marine").length}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-ship fs-4 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow rounded-4">
        <div className="card-header bg-white border-0 py-1">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">Customer List</h5>
              <small className="text-muted">Manage all customer records</small>
            </div>

          </div>
        </div>
        <div className="card-body">
          <EditableSortableTable
            columns={columns}
            rowData={MappedData}
            onEdit={handleEdit}
            onOwnership={handleOwnershipOpen}
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
        <div className="modal-dialog modal-dialog-scrollable modal-xl" style={{ maxHeight: "90vh" }}>
          <div className="modal-content border-0 rounded-4 shadow-lg" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header border-0 rounded-top-4 px-4 py-3"
              style={{ background: "linear-gradient(135deg, #198754 0%, #157347 100%)" }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-25 p-2 rounded-3">
                  <i className={`bi ${editingRow ? "bi-pencil-square" : "bi-person-plus"} fs-5 text-white`}></i>
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0 text-white">
                    {editingRow !== null ? "Edit Customer" : "Create New Customer"}
                  </h5>
                  <small className="text-white opacity-75">
                    {editingRow ? `Editing: ${editingRow.name || "—"}` : "Fill in the customer details below"}
                  </small>
                </div>
              </div>
              <button type="button" className="btn-close btn-close-white ms-auto" onClick={() => { setOpenModal(false); setEditingRow(null); setSelectedRowIndex(null); reset(FORM_DEFAULT_VALUES); setTab(0); }} />
            </div>
            <form onSubmit={handleSubmit(handleModalSave, (errors) => console.log(errors))}>
              <div className="modal-body bg-light p-4" style={{ maxHeight: "calc(90vh - 150px)", overflowY: "auto", flex: "1" }}>

                <ul className="nav nav-tabs mb-4 rounded-4 p-2" style={{ backgroundColor: "#e8f5e9" }}>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${tab === 0 ? "active" : ""}`}
                      onClick={() => setTab(0)}
                      style={tab === 0 ? { backgroundColor: "#2e7d32", color: "#fff" } : { color: "#2e7d32" }}
                    >
                      Customer
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${tab === 1 ? "active" : ""}`}
                      disabled={disablePre2022}
                      onClick={() => setTab(1)}
                      // style={
                      //   tab === 1
                      //     ? { backgroundColor: "#2e7d32", color: "#fff" }
                      //     : { color: "#2e7d32" }
                      // }
                      style={
                        disablePre2022
                          ? { backgroundColor: "#d0d0d0", color: "#6c757d", cursor: "not-allowed" }
                          : tab === 1
                            ? { backgroundColor: "#2e7d32", color: "#fff" }
                            : { color: "#2e7d32" }
                      }
                    >
                      Pricing Pre-2022
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${tab === 2 ? "active" : ""}`}
                      disabled={disable2022}
                      onClick={() => setTab(2)}
                      // style={
                      //   tab === 2
                      //     ? { backgroundColor: "#2e7d32", color: "#fff" }
                      //     : { color: "#2e7d32" }
                      // }
                      style={
                        disable2022
                          ? { backgroundColor: "#d0d0d0", color: "#6c757d", cursor: "not-allowed" }
                          : tab === 2
                            ? { backgroundColor: "#2e7d32", color: "#fff" }
                            : { color: "#2e7d32" }
                      }
                    >
                      Pricing 2022
                    </button>
                  </li>
                  {/* <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${tab === 1 ? "active" : ""}`}
                      disabled={businesstype === "marine"}
                      onClick={() => setTab(1)}
                      style={
                        businesstype === "marine"
                          ? { backgroundColor: "#d0d0d0", color: "#6c757d", cursor: "not-allowed" }
                          : tab === 1
                            ? { backgroundColor: "#2e7d32", color: "#fff" }
                            : { color: "#2e7d32" }
                      }
                    >
                      Pricing Pre-2022
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${tab === 2 ? "active" : ""}`}
                      disabled={businesstype === "energy"}
                      onClick={() => setTab(2)}
                      style={
                        businesstype === "energy"
                          ? { backgroundColor: "#d0d0d0", color: "#6c757d", cursor: "not-allowed" }
                          : tab === 2
                            ? { backgroundColor: "#2e7d32", color: "#fff" }
                            : { color: "#2e7d32" }
                      }
                    >
                      Pricing 2022
                    </button>
                  </li> */}
                </ul>

                {tab === 0 && (
                  <div className="container-fluid py-3">

                    {/* ── SECTION 1: Customer Information ── */}
                    <div className="card border-0 shadow-sm rounded-4 mb-3">
                      <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-4"
                        style={{ borderColor: "#e9ecef" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="bg-success bg-opacity-10 p-2 rounded-3 lh-1">
                            <i className="bi bi-person-badge fs-6 text-success"></i>
                          </span>
                          <h6 className="fw-bold mb-0 text-success">Customer Information</h6>
                        </div>
                      </div>
                      <div className="card-body px-4 py-4">

                        {/* Row 1: Customer Name */}
                        <div className="row g-3 mb-3">
                          <div className="col-md-5">
                            <FormInput name="custname" control={control} label="Customer Name" />
                          </div>
                        </div>

                        {/* Row 2: Business toggle */}
                        <div className="mb-3 d-flex align-items-center gap-3">
                          <p className="small fw-semibold text-muted mb-0" style={{ minWidth: 100 }}>Business Type</p>
                          <div className="d-flex gap-2">
                            {[
                              { label: "Energy", value: "energy", icon: "bi-lightning-charge-fill", color: "warning" },
                              { label: "Marine", value: "marine", icon: "bi-water",                 color: "info"    },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setValue("business", opt.value)}
                                className={`btn btn-sm px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 ${
                                  business === opt.value
                                    ? `btn-${opt.color}`
                                    : `btn-outline-${opt.color}`
                                }`}
                              >
                                <i className={`bi ${opt.icon}`}></i>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          {/* hidden RHF field kept in sync via setValue above */}
                        </div>

                        {/* Row 3: Account Neumonic + ERP + conditional */}
                        <div className="row g-3 align-items-end">
                          <div className="col-md-4">
                            <FormInput name="cust_num" control={control} label="Account Neumonic" />
                          </div>
                          <div className="col-md-3">
                            <FormSelect
                              name="erp_system"
                              control={control}
                              label="ERP System"
                              options={[
                                { label: "SAP", value: "sap" },
                                { label: "JDE", value: "jde" },
                                { label: "ISP", value: "isp" },
                                { label: "ALL", value: "all" },
                              ]}
                            />
                          </div>
                          {erp_system === "sap" && (
                            <div className="col-md-4">
                              <FormInput name="sold_to" control={control} label="Sold To" />
                            </div>
                          )}
                          {erp_system === "isp" && (
                            <>
                              <div className="col-md-3">
                                <FormInput name="caid" control={control} label="CAID" />
                              </div>
                              <div className="col-md-3">
                                <FormInput name="uao_account" control={control} label="UOA Account" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── SECTION 2: Contract Details ── */}
                    <div className="card border-0 shadow-sm rounded-4 mb-3">
                      <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-4"
                        style={{ borderColor: "#e9ecef" }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="bg-success bg-opacity-10 p-2 rounded-3 lh-1">
                            <i className="bi bi-file-earmark-check fs-6 text-success"></i>
                          </span>
                          <h6 className="fw-bold mb-0 text-success">Contract Details</h6>
                          {isContractLost && (
                            <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Customer contact status is lost
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="card-body px-4 py-4">

                        {/* Row 1: TSE Owner | Status | PO Required */}
                        <div className="row g-3 align-items-end mb-3">
                          <div className="col-md-5">
                            <Controller
                              name="customer_tse_owner"
                              control={control}
                              render={({ field }) => (
                                <Autocomplete
                                  options={opt_tse}
                                  getOptionLabel={(opt) =>
                                    typeof opt === "string" ? opt : opt.label
                                  }
                                  isOptionEqualToValue={(opt, val) =>
                                    opt.value === val || opt.value === val?.value
                                  }
                                  value={
                                    opt_tse.find((o) => o.value === field.value) ?? null
                                  }
                                  onChange={(_, selected) =>
                                    field.onChange(selected ? selected.value : "")
                                  }
                                  disablePortal
                                  ListboxProps={{ style: { maxHeight: "55vh" } }}
                                  renderInput={(params) => (
                                    <MuiTextField
                                      {...params}
                                      label="TSE Owner"
                                      size="small"
                                      placeholder="Search..."
                                      inputRef={field.ref}
                                    />
                                  )}
                                />
                              )}
                            />
                          </div>
                          <div className="col-md-3">
                            <FormSelect
                              disabled={isContractLost}
                              name="contract_status"
                              control={control}
                              label="Status"
                              options={[
                                { label: "Contracted", value: "contracted" },
                                { label: "Prospect",   value: "prospect"   },
                                { label: "Lost",       value: "lost"       },
                              ]}
                            />
                          </div>
                          <div className="col-md-3 d-flex align-items-center" style={{ paddingBottom: "2px" }}>
                            <FormCheckbox name="po_required" control={control} label="PO Required" />
                            {po_required && (
                              <div className="ms-3" style={{ minWidth: 140 }}>
                                <FormInput name="valid_po" control={control} label="Valid PO" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Row 2: Contract Date | Automatic Invoicing + Yes / No */}
                        <div className="row g-3 align-items-center">
                          <div className="col-md-4">
                            <FormInput
                              name="contractdate"
                              type="date"
                              control={control}
                              label={`${statusLabel} Date`}
                              sx={{ width: "100%" }}
                            />
                          </div>
                          <div className="col d-flex align-items-center gap-3">
                            <span className="small fw-semibold text-muted text-nowrap">Automatic Invoicing</span>
                            <div className="d-flex gap-2">
                              {[
                                { label: "Yes", value: "yes", color: "success", icon: "bi-check-circle-fill" },
                                { label: "No",  value: "no",  color: "danger",  icon: "bi-x-circle-fill"     },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setValue("invoicing", opt.value)}
                                  className={`btn btn-sm px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 ${
                                    watch("invoicing") === opt.value
                                      ? `btn-${opt.color}`
                                      : `btn-outline-${opt.color}`
                                  }`}
                                >
                                  <i className={`bi ${opt.icon}`}></i>
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── SECTION 3: Notes ── */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body px-4 py-3">
                        <FormInput
                          sx={{ width: "100%" }}
                          name="notes"
                          control={control}
                          multiline
                          rows={3}
                          label="Notes"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {tab === 1 && (

                  <div className="row g-3 align-items-end mb-4">
                    <div className="col-md-4">
                      <FormSelect
                        name="pricingcurrency"
                        control={control}
                        label="Currency"
                        options={currencyOptions}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormSelect
                        name="pricingfrequency"
                        control={control}
                        label="Frequency"
                        options={opt_frequency}
                      />
                    </div>

                    <div className="col-md-auto">
                      <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled
                      >
                        Add Service Band
                      </Button>
                    </div>
                    {/* Pricing Table */}
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: 400,
                        overflow: "auto",
                      }}
                    >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {columns_prising.map((col) => (
                            <TableCell key={col.field}>
                              {col.headerName}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, index) => (
                          <TableRow key={index}>
                            {columns_prising.map((col) => {
                              const fieldName = `rows.${index}.${col.field}`;
                              const fieldValue = row[col.field] || "";

                              return (
                                <TableCell key={col.field}>
                                  <Controller
                                    name={fieldName}
                                    control={control}
                                    defaultValue={fieldValue}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        value={field.value ?? fieldValue}
                                        size="small"
                                        fullWidth
                                      />
                                    )}
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </TableContainer>
                  </div>

                )}

                {tab === 2 && (
                  <div className="card border-0 shadow-sm rounded-6 mb-4">
                    <div className="card-body">
                      <div className="row g-4">
                        <div className="col-md-4">
                          <FormSelect
                            name="currency2"
                            control={control}
                            label="Currency"
                            options={currencyOptions}
                          />
                        </div>
                        <div className="col-md-4">
                          <FormSelect
                            name="frequency2"
                            control={control}
                            label="Frequency"
                            options={[
                              { label: "1M", value: "1M" },
                              { label: "3M", value: "3M" },
                              { label: "6M", value: "6M" },
                              { label: "12M", value: "12M" }
                            ]}
                          />
                        </div>
                        <div className="col-md-4">
                          <FormInput name="discount" control={control} label="Discount" />
                        </div>
                      </div>
                      <div className="row g-4">
                      {/* Basic */}
                      <div className="border rounded-3 p-3 mb-3">
                        <div className="row g-3 align-items-center">
                          <div className="col-md-3">
                            <FormCheckbox name="chk_basic" control={control} label="Basic" />
                          </div>
                          <div className="col-md-8">
                            <FormRadio
                              name="basic_service"
                              control={control}
                              label="Basic Service Offer Band:"
                              options={[
                                { label: "Basic (Auto)",  value: "basic_Auto"  },
                                { label: "Basic (Value)", value: "basic_value" },
                              ]}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SDA + Specialist */}
                      <div className="border rounded-3 p-3">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <FormCheckbox name="chk_sda" control={control} label="SDA"        />
                          </div>
                          <div className="col-md-4">
                            <FormCheckbox name="chk_specialist" control={control} label="Specialist" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-danger px-4"
                  onClick={() => runWithLoading("cancel-customer", () => { setOpenModal(false); setEditingRow(null); setSelectedRowIndex(null); reset(FORM_DEFAULT_VALUES); setTab(0); })}
                  disabled={loadingAction === "cancel-customer"}
                >
                  {renderButtonContent("cancel-customer", "Cancel", "Closing...", "bi-x-lg")}
                </button>
                {!isContractLost && disablePre2022 && (
                <button
                  type="button"
                  className="btn btn-outline-success px-4"
                  onClick={() => runWithLoading("convert-newoffer", () => { alert("Testing convert to new offer"); })}
                  disabled={loadingAction === "convert-newoffer"}
                >
                  {renderButtonContent("convert-newoffer", "Convert to New Offer", "Converting...", "bi-arrow-right")}
                </button>)}

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-warning px-4 border"
                    onClick={() => runWithLoading("clear-customer", () => reset())}
                    disabled={loadingAction === "clear-customer"}
                  >
                    {renderButtonContent("clear-customer", "Clear", "Clearing...", "bi-arrow-counterclockwise")}
                  </button>
                  {!isContractLost && (
                  <button
                    // disabled={isContractLost}
                    type="button"
                    className="btn btn-success px-5 shadow-sm fw-semibold"
                    onClick={() => runWithLoading("save-customer", () => handleSubmit(handleModalSave)())}
                    disabled={loadingAction === "save-customer"}
                  >
                    {loadingAction === "save-customer" ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving…</>
                    ) : (
                      <><i className={`bi ${editingRow ? "bi-floppy" : "bi-plus-circle"} me-2`}></i>{editingRow !== null ? "Save Changes" : "Create Customer"}</>
                    )}
                  </button>
                   )} 
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ================= OWNERSHIP MODAL ================= */}
      <div
        className={`modal fade ${openOwnershipModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(3px)"
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-0 rounded-top-4 px-4 py-3"
              style={{ background: "linear-gradient(135deg, #198754 0%, #157347 100%)" }}>
              <h5 className="modal-title fw-bold mb-0 text-white">Change Ownership</h5>
              <button
                type="button"
                className="btn-close btn-close-white ms-auto"
                onClick={() => setOpenOwnershipModal(false)}
              />
            </div>
            <div className="modal-body bg-light p-4">
              <div className="mb-3">
                <p className="mb-2">Customer</p>
                <strong>{ownershipRow?.name || "—"}</strong>
              </div>
              <div className="mb-3">
                <p className="mb-2">Asset</p>
                <strong>{"All"}</strong>
              </div>
              <div className="mb-3">
                <p className="mb-2">Sold To</p>
                <strong>{ownershipRow?.soldTo || "—"}</strong>
              </div>
              <div className="row g-3 align-items-center ">
                {/* Search Input */}
                <div className="col-md-12 ">
                  <Controller
                    name="companysearch"
                    control={control}
                    render={({ field }) => (
                      <MuiTextField
                        {...field}
                        fullWidth
                        label="Search Company"
                        size="small"
                        placeholder="Enter company name"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => runWithLoading("search-company", () => handleSearchCompany(field.value))}
                                edge="end"
                                size="small"
                                aria-label="search"
                                disabled={loadingAction === "search-company"}
                              >
                                <i className="bi bi-search"></i>
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleSearchCompany(field.value);
                          }
                        }}
                      />
                    )}
                  />
                </div>

              </div>
              <div className="col-md-12 mt-2">
                <Controller
                  name="ownercompnyname"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      freeSolo
                      options={
                        Array.isArray(Responddata)
                          ? Responddata.map((item) => ({
                              label: item.company,
                              value: item.assetServiceOfferID,
                            }))
                          : []
                      }
                      getOptionLabel={(opt) =>
                        typeof opt === "string" ? opt : opt.label || ""
                      }
                      isOptionEqualToValue={(opt, val) =>
                        opt.value === val || opt.value === val?.value
                      }
                      value={
                        Array.isArray(Responddata)
                          ? Responddata.find((o) => o.assetServiceOfferID === field.value)
                            ? {
                                label: Responddata.find((o) => o.assetServiceOfferID === field.value)?.company,
                                value: field.value,
                              }
                            : field.value || ""
                          : field.value || ""
                      }
                      onChange={(_, selected) =>
                        field.onChange(
                          typeof selected === "string"
                            ? selected
                            : selected?.value || ""
                        )
                      }
                      inputValue={field.value || ""}
                      onInputChange={(_, value) => {
                        field.onChange(value);
                      }}
                      disablePortal
                      renderInput={(params) => (
                        <MuiTextField
                          {...params}
                          label="Company"
                          size="small"
                          placeholder="Select or type company name"
                          inputRef={field.ref}
                        />
                      )}
                    />
                  )}
                />
              </div>
              <div className="row g-3 align-items-center mb-3">
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary" >
                  Date
                </Typography>
                <FormInput
                  name="ownerassetDate"
                  control={assetControl}
                  type="date"
                />
              </div>
              <div className="col-6">
                <Typography name="ownerchangecustomerID" variant="subtitle2" color="textSecondary" >
                  Customer ID
                </Typography>
                <strong style={{ color: "#555" }}
                /><strong>{ownershipRow?.customerID || "—"}</strong>
              </div>
              </div>
            </div>
            <div className="modal-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => setOpenOwnershipModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success px-4"
                onClick={() => runWithLoading("ownership-save", handleOwnershipSave)}
                disabled={loadingAction === "ownership-save"}
              >
                {renderButtonContent("ownership-save", "Update Owner", "Updating...", "bi-person-check")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ErrorMessageModel
        open={openErrorModel}
        name={rowCustname}
        status={rowStatus}
        onClose={() => setOpenErrorModel(false)}
      />
    </div>
  );
});

export default CreateCustomer;