import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from "react";
import { useFieldArray,  Controller } from "react-hook-form";
import {
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  TextField as MuiTextField,InputAdornment,CircularProgress,Box 
} from "@mui/material";
import FormInput    from "../components/form/FormInput";
import FormSelect   from "../components/form/FormSelect";
import FormCheckbox from "../components/form/FormCheckbox";
import FormRadio    from "../components/form/FormRadio";
import EditableSortableTable from "../components/form/EditableSortableTable";
import EditableTable         from "../components/form/EditableTable";
import EditableSortableTable_GST from "../components/form/EditableSortableTable_GST";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { customerSchema } from "../validation/customerSchema";
import {UpdateEnergyManualERPData_FromUoaForm,GetEnergyManualERPFormData,GetMarineManualERPFormData,UpdateMarineManualERPData_FromUoaForm } from "../api/energyformapis";
import ErrorMessageModel from "../utilities/ErrorMessageModel";
import LoadingButton from "../components/LoadingButton";
import {
  opt_country,
  opt_region,
  opt_status,
  opt_vessel_Currency,
  opt_offer_list,
  vesseldefaultRows,
  opt_countrysalesregionmapping,
  opt_uoa_Currency,
  opt_uoa_invoicing_freq,opt_tse
} from "./Opt_library";

import { FetchAsset, GenericLookups, SearchCompany }from "../api/customerApi";
import { CreateUpdateCompany, BookInOutPreCheck,BookInOut,OwnershipChange_API,UpdateGSTName } from "../api/postApi";
import { CheckForInvoices,UpdateCompanyAssetStatus } from "../api/InvoiceApis";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import { extractValidationErrors } from "../utilities/extractValidationErrors";


/* ─── constants ──────────────────────────────────────────────────────────────── */

  const opt_offer_band = [
    { label: "Energy All-in-One",        value: "Energy All-in-One" },
    { label: "Marine Standard",          value: "Marine Standard"   },
    { label: "Marine Premium",           value: "Marine Premium"    },
  ];

  const opt_currency_vessel = [
    { label: "DKK", value: "DKK" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
    { label: "JPY", value: "JPY" },
    { label: "NOK", value: "NOK" },
    { label: "SEK", value: "SEK" },
    { label: "USD", value: "USD" },
  ];
  const isReadOnly = true;
  /* Pricing Pre-2022 editable table columns (Energy / old offer) */
  const columns_prising = [
    { field: "offer1",  headerName: "Offer Band", type: "text",disabled: true, },
    { field: "foc",      headerName: "FOC (# Samples)",  type: "text"   },
    { field: "price",    headerName: "Price per Sample",  type: "text"   },
    { field: "currency", headerName: "Currency", type: "text", disabled: true, },
  ];
  const currencyOptions= [
    { label: "TRY", value: "TRY" },
    { label: "DKK", value: "DKK" },
    { label: "EUR", value: "EUR" },
    { label: "GBP", value: "GBP" },
    { label: "JPY", value: "JPY" },
    { label: "NOK", value: "NOK" },
    { label: "SEK", value: "SEK" },
    { label: "USD", value: "USD" }
  ]

  const opt_frequency = [
    { label: "1M",  value: "1M"  },
    { label: "3M",  value: "3M"  },
    { label: "6M",  value: "6M"  },
    { label: "12M", value: "12M" },
  ];

  const opt_foc = [
    { label: "Inherited",      value: "Inherited"      },
    { label: "Pro-rata based", value: "Pro-rata based"  },
  ];
  const defaultRows_Prising = [
    { offer1: "", foc: "", price: "", currency: "" },
  ];
  /* ─── Vessels component ──────────────────────────────────────────────────────── */

const Vessels = forwardRef((props, ref) => {

  /* ── initial form values ── */
  const initialValues = {
    SelectedCustomer:          "",
    vessel_asset:          "",
    searchimo_number:      "",
    search:                "",
    customer:              "",
    gt_name:               "",
    business:              "energy",
    name:                  "",
    imonumber:             "",
    erpnumber:             "",
    offervesselassetlevel: false,
    noimo:                 false,
    foc:                   "",
    status:                "",
    vesselassetowner:      "",
    gmeregion:             "",
    gmecountry:            "",
    salesregion:           "",
    salescountry:          "",
    startdate:             "",
    enddate:               "",
    invoicingtype:         "",
    vesselnotes:           "",
    currency2:             "",
    frequency2:            "3M",
    chk_basic:             false,
    basic_service:         "",
    chk_sda:               false,
    chk_specialist:        false,
    rows: defaultRows_Prising,
  };
  const ASSET_MODAL_DEFAULT_VALUES = {
    assetCustomer: "",
    assetName: "",
    searchTerm: "",
    assetType: "",
    assetDate: "",
    ownerassetDate:new Date().toISOString().split("T")[0],
  };
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
  const { control, handleSubmit, reset, watch, setValue, getValues } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: initialValues,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerId = params.get("customerId");
    const customerName = params.get("customerName");

    if (customerId) {
      handleFetchAsset(customerId, "companyId");
      return;
    }

    if (customerName) {
      handleFetchAsset(customerName, "companyName");
    }
  }, [location.search]);

  /* ── local state ── */
  const [tab,                     setTab]                     = useState(0);
  const [openModal,               setOpenModal]               = useState(false);
  const [selectedRowIndex,        setSelectedRowIndex]        = useState(null);
  const [MappedData,              setMappedData]              = useState([]);
  const [selectedTableRow,        setSelectedTableRow]        = useState(null);   // row highlighted in table
  const [customerSearchResults,   setCustomerSearchResults]   = useState([]);
  const [isSearchingCustomer,     setIsSearchingCustomer]     = useState(false);
  const [openOwnershipModal, setOpenOwnershipModal] = useState(false);
  const [openErrorModel, setOpenErrorModel] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningModalMessage, setWarningModalMessage] = useState("");
  const [ownershipRow, setOwnershipRow] = useState(null);
  const [ownershipOwner, setOwnershipOwner] = useState("");
  /* Change-Ownership modal state */
  const [changeOwnershipModal,    setChangeOwnershipModal]    = useState(false);
  const [selectedVesselForAction, setSelectedVesselForAction] = useState(null);
  const [newOwnerName,            setNewOwnerName]            = useState("");
  const [ownershipEffDate,        setOwnershipEffDate]        = useState("");
  const [ownershipWarning,        setOwnershipWarning]        = useState("");
  const [ownershipLoading,        setOwnershipLoading]        = useState(false);
  const [gstModalOpen,            setGstModalOpen]            = useState(false);
  const [gstModalRows,            setGstModalRows]            = useState([]);
  const [gstModalSaving,          setGstModalSaving]          = useState(false);
  const [Responddata,setResponddata]=useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  /* save state */
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveError,  setSaveError]  = useState("");
  const [saveToast,  setSaveToast]  = useState(false);
  const [rowCustname,setrowCustname]=useState("");
  const [rowStatus,setrowStatus]=useState("");
  const business = watch("business");
  const statusWatch  = watch("status");
  const salesCountry = watch("salescountry");
  const rows = watch("rows") || [];
  const [editingRow, setEditingRow] = useState(null);
  const contractstatus = editingRow?.contractstatus || watch("contractstatus");
  const businesstype = String(editingRow?.business || watch("business") || "").trim().toLowerCase();
  const offerVersion = String(editingRow?.offerVersion || watch("offerVersion") || "").trim();
  const disablePre2022 = offerVersion === "2022";
  const disable2022 = offerVersion === "Pre-2022";
  const offervesselassetlevel = watch("offervesselassetlevel");
  const searchtype = watch("searchtype");
  // const disablePre2022 = offerVersion === "2022";
  // const disable2022 = offerVersion === "Pre-2022";

  useEffect(() => {
    const anyModalOpen = openModal || openOwnershipModal || showWarningModal || changeOwnershipModal || gstModalOpen;

    if (anyModalOpen) {
      const previousBodyOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      };
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [openModal, openOwnershipModal, showWarningModal, changeOwnershipModal, gstModalOpen]);

  


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

  /* ── auto-populate Sales Region from Sales Country ── */
  useEffect(() => {
    if (!salesCountry) return;
    const region = opt_countrysalesregionmapping?.[salesCountry];
    if (region) setValue("salesregion", region);
  }, [salesCountry]);

  /* ── when status = Lost, clear end-date so user sets it explicitly ── */
  useEffect(() => {
    if (statusWatch === "lost") {
      setValue("enddate", "");
    }
  }, [statusWatch]);

  /* ── table columns ── */
  const columns = [
    { field: "assetId",                   headerName: "Asset ID",                  flex: 1 },
    { field: "vesselAssetName",           headerName: "Vessel / Asset Name",       flex: 1 },
    { field: "customer",                 headerName: "Customer",                  flex: 1 },
    { field: "bookedOut",                 headerName: "Booked Out",                flex: 1 },
    { field: "status",                    headerName: "Status",                    flex: 1 },
    { field: "CompanyID",                 headerName: "Company ID",                flex: 1 },
    { field: "business",                  headerName: "Business",                  flex: 1 },
    { field: "gstName",                   headerName: "GST Name",                  flex: 1 },
    { field: "vesselAssetName",           headerName: "Vessel / Asset Name",       flex: 1 },
    { field: "imoNumber",                 headerName: "IMO Number",                flex: 1 },
    { field: "erpNumber",                 headerName: "ERP Number",                flex: 1 },
    { field: "erpSystem",                 headerName: "ERP System",                flex: 1 },
    { field: "gmeRegion",                 headerName: "GME Region",                flex: 1 },
    { field: "country",                   headerName: "Country",                   flex: 1 },
    { field: "salesRegion",               headerName: "Sales Region",              flex: 1 },
    { field: "salesCountry",              headerName: "Sales Country",             flex: 1 },
    { field: "vesselOrAssetTSEOwner",     headerName: "Vessel / Asset TSE Owner",  flex: 1 },
    { field: "customerTSEOwner",          headerName: "Customer TSE Owner",        flex: 1 },
    { field: "validPO",                   headerName: "Valid PO",                  flex: 1 },
    { field: "startDate",                 headerName: "Start Date",                flex: 1 },
    { field: "endDate",                   headerName: "End Date",                  flex: 1 },
    { field: "currency",                  headerName: "Currency",                  flex: 1 },
    { field: "frequency",                 headerName: "Frequency",                 flex: 1 },
    { field: "status",                    headerName: "Status",                    flex: 1 },
    { field: "bookedOut",                 headerName: "Booked Out",                flex: 1 },
    { field: "automaticInvoicing",        headerName: "Automatic Invoicing",       flex: 1 },
    { field: "notes",                     headerName: "Notes",                     flex: 1 },
    { field: "dummyIMONumber",            headerName: "Dummy IMO Number",          flex: 1 },
    { field: "assetLevelPricing",         headerName: "Asset Level Pricing",       flex: 1 },
    { field: "smartMonitor",              headerName: "SmartMonitor",              flex: 1 },
    { field: "specialistSDAInvoice",      headerName: "Specialist SDA Invoice",    flex: 1 },
    { field: "allUOAInvoiced",            headerName: "All UOA Invoiced",          flex: 1 },
    { field: "smSampleNotInvoiced",       headerName: "SM Sample Not Invoiced",    flex: 1 },
    { field: "upfrontPayment",            headerName: "Upfront Payment",           flex: 1 },
    { field: "serviceSubscription",       headerName: "Service Subscription",      flex: 1 },
    { field: "allIncludedSubscription",   headerName: "All Included Subscription", flex: 1 },
    { field: "smStartDate",               headerName: "SM Start Date",             flex: 1 },
    { field: "smEndDate",                 headerName: "SM End Date",               flex: 1 },
    { field: "smContractMonths",          headerName: "SM Contract Months",        flex: 1 },
    { field: "smTotSubscriptionfees",     headerName: "SM Tot Subscription Fees",  flex: 1 },
    { field: "offerVersion",              headerName: "Offer Version",             flex: 1 },
    { field: "serviceOfferBandBasic",     headerName: "Service Offer Band Basic",  flex: 1 },
    { field: "serviceOfferBandBasicAuto", headerName: "Service Offer Band Basic Auto",  flex: 1 },
    { field: "serviceOfferBandBasicValue",headerName: "Service Offer Band Basic Value", flex: 1 },
    { field: "serviceOfferBandSDA",       headerName: "Service Offer Band SDA",    flex: 1 },
    { field: "serviceOfferBandSpecialist",headerName: "Service Offer Band Specialist",  flex: 1 },
    { field: "prorata",                   headerName: "Prorata",                   flex: 1 },
    { field: "openInvoices",              headerName: "Open Invoices",             flex: 1 },
  ];

    /* ── table columns ── */
  const GST_columns = [
    { field: "assetId",                   headerName: "Asset ID",                  flex: 2, width: 250 },
    { field: "customer",                  headerName: "Customer",                  flex: 1, width: 220 },
    { field: "CompanyID",                 headerName: "Company ID",                flex: 1, width: 150 },
    { field: "gstName",                   headerName: "GST Name",                  flex: 1, minWidth: 260 },
    { field: "vesselAssetName",           headerName: "Vessel / Asset Name",       flex: 1, width: 260 },
    { field: "imoNumber",                 headerName: "IMO Number",                flex: 1, width: 160 },
    { field: "erpNumber",                 headerName: "ERP Number",                flex: 1, width: 160 },
    { field: "erpSystem",                 headerName: "ERP System",                flex: 1, width: 150 },
    { field: "gmeRegion",                 headerName: "GME Region",                flex: 1, width: 170 },
    { field: "country",                   headerName: "Country",                   flex: 1, width: 170 },
    { field: "vesselOrAssetTSEOwner",     headerName: "Vessel / Asset TSE Owner",  flex: 1, width: 260 },
    { field: "business",                  headerName: "Business",                  flex: 1, width: 150 },
    { field: "startDate",                 headerName: "Start Date",                flex: 1, width: 140 },
    { field: "endDate",                   headerName: "End Date",                  flex: 1, width: 140 },
    { field: "status",                    headerName: "Status",                    flex: 1, width: 140 },
    { field: "bookedOut",                 headerName: "Booked Out",                flex: 1, width: 140 },
  ];

  const businessOptions = [
    {
      label: "Energy",
      value: "energy",
      icon: "bi-lightning-charge-fill",
      color: "warning",
      disabled: true,
    },
    {
      label: "Marine",
      value: "marine",
      icon: "bi-water",
      color: "info",
      disabled: false,
    },
  ];

  const handleBusinessChange = (value) => {
    setValue("business", value);
    setTab(0);
  };

  const buildPricingRowsFromRecords = (records = []) => {
    const normalizedRecords = Array.isArray(records) ? records : [];
    const zeroAssetRecords = normalizedRecords.filter((item) => {
      const assetId = item?.companyAssetID ?? item?.CompanyAssetID ?? item?.customerAssetID ?? item?.CustomerAssetID;
      return assetId === 0 || assetId === "0";
    });

    const sourceRecords = zeroAssetRecords.length > 0 ? zeroAssetRecords : normalizedRecords;

    if (sourceRecords.length === 0) {
      return [{ offer1: "", foc: "", price: "", currency: "" }];
    }

    return sourceRecords.map((item, index) => ({
      id: index + 1,
      offer1: item?.service_offer_Band || "",
      foc: item?.foc || "",
      price: item?.price || "",
      currency: item?.currency || "",
    }));
  };

  // /* ── row ↔ form mapping ── */
  const mapRowToForm = (row) => ({
    SelectedCustomer: String(row.CompanyID),
    vessel_asset: row.assetId || "",
    vesselorassetname: row.vesselAssetName || "",

    searchimo_number: row.imoNumber || "",
    search: row.vesselAssetName || "",

    customer: row.customer || "",
    gt_name: row.gstName || "",

    business: row.business?.trim().toLowerCase() || "energy",

    imonumber: row.imoNumber || "",
    erpnumber: row.erpNumber || "",

    
    offervesselassetlevel:row.business ? "Energy": "false" || "true",
    noimo: row.dummyIMONumber === "True",

    foc: row.prorata || "",
    status: row.status || "",

    vesselassetowner: row.vesselOrAssetTSEOwner || "",

    gmeregion: row.gmeRegion || "",
    gmecountry: row.country || "",

    salesregion: row.salesRegion || "",
    salescountry: row.salesCountry || "",

    startdate: row.startDate || "",
    enddate: row.endDate || "",

    invoicingtype: row.automaticInvoicing || "",

    vesselnotes: row.notes || "",

    currency2: row.currency || "",
    frequency2: row.frequency || "3M",

    chk_basic: row.serviceOfferBandBasic === "True",
    basic_service: row.serviceOfferBandBasicValue || "",

    chk_sda: row.serviceOfferBandSDA === "True",
    chk_specialist: row.serviceOfferBandSpecialist === "True",
  });

  const mapFormToRow = (data, existing = {}) => ({
    ...existing,
    id:                     existing.id       ?? data.id ?? MappedData.length + 1,
    assetId:                existing.assetId  ?? data.imonumber ?? "",
    customer:               data.customer,
    gstName:                data.gt_name,
    vesselAssetName:        data.name,
    imoNumber:              data.imonumber,
    erpNumber:              data.erpnumber,
    erpSystem:              existing.erpSystem        || "",
    gmeRegion:              data.gmeregion,
    country:                data.gmecountry,
    salesRegion:            data.salesregion,
    salesCountry:           data.salescountry,
    vesselOrAssetTSEOwner:  data.vesselassetowner,
    customerTSEOwner:       existing.customerTSEOwner || "",
    business:               data.business,
    status:                 data.status,
    startDate:              data.startdate,
    endDate:                data.enddate,
    currency:               data.currency2,
    frequency:              data.frequency2,
    assetLevelPricing:      data.offervesselassetlevel,
    noimo:                  data.noimo,
    foc:                    data.foc,
    notes:                  data.vesselnotes,
    automaticInvoicing:     data.invoicingtype || "",
    chk_basic:              data.chk_basic,
    basic_service:          data.basic_service,
    chk_sda:                data.chk_sda,
    chk_specialist:         data.chk_specialist,
  });

  const parseDateValue = (value) => {
    if (!value) return null;

    // dd-MM-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [day, month, year] = value.split("-");
      return new Date(year, month - 1, day);
    }

    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return new Date(year, month - 1, day);
    }

    return new Date(value);
  };

  const toDateInputValue = (value) => {
    const d = parseDateValue(value);
    if (!d || Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
  const formatDateforownership = (dateStr) => {
    if (!dateStr) return "";

    const d = parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    // return `${day}/${month}/${year}`;
    return `${year}${month}${day}`;
  };
  const opt_invoicesearch= [
    {label:"Filter", value:"Filter"},
    {label:"Asset ID", value:"AssetID"},
    {label:"User Alias", value:"UserAlias"},
    {label:"Company ID", value:"CompanyID"},
    {label:"Company Search", value:"CompanySearch"},
    {label:"GST Name", value:"GSTName"},
    {label:"Asset Search", value:"AssetSearch"},
    {label:"IMO Search", value:"IMOSearch"},
    {label:"Source ERP Search", value:"SourceERPSearch"},
    {label:"GME Region Search", value:"GMERegionSearch"},
    {label:"Country Search", value:"CountrySearch"},
    {label:"Sales Region Search", value:"SalesRegionSearch"},
    {label:"Sales Country Search", value:"SalesCountrySearch"},
    {label:"TSE Owner Search", value:"TSEOwnerSearch"},
    {label:"Business Search", value:"BusinessSearch"},
    {label:"Valid PO Search", value:"ValidPOSearch"},
    {label:"Status Search", value:"StatusSearch"},
    {label:"Booked Out Search", value:"BookedOutSearch"},
    {label:"Auto Invoicing Search", value:"AutoInvoicingSearch"},
    {label:"Search Prospecting", value:"SearchProspecting"},
    {label:"Customer TSE Owner", value:"CustomerTSEOwner"}
  ]

  const handleFetchAsset = async (selectedId, options = {}) => {
    const { searchType = getValues("searchtype") || "CompanySearch" } = options;
    try {
      let payload;
      setLoadingAction(true);
      if (selectedId) {
        payload = { [searchType]: selectedId ||"",  };
      }

      // let response;

      // if (selectedId) {
        console.log("Fetching asset for selected ID:", payload);
        const response = await FetchAsset(payload);
      // } 
      // else {
      //   console.log("Fetching all assets");
      //   response = await FetchAsset();
      // }
      // if(!response){
      console.log("FetchAsset response:", response);
      const tableData  = Array.isArray(response) ? response : response?.data || [];

      console.log("Table data:", tableData);

      const mappedData = tableData.map((item, index) => ({
        id:                     item.assetID              || index + 1,
        assetId:                item.assetID              || "",
        CompanyID:              item.companyID          || "",
        customer:               item.customer || item.company || item.companyName || "",
        gstName:                item.gstName              || "",
        vesselAssetName:        item.vesselOrAssetName    || "",
        imoNumber:              item.imoNumber            || "",
        erpNumber:              item.erpNumber            || "",
        erpSystem:              item.erpSystem            || "",
        gmeRegion:              item.salesRegion            || "",
        country:                item.country              || "",
        salesRegion:            item.salesRegion          || "",
        salesCountry:           item.salesCountry         || "",
        vesselOrAssetTSEOwner:  item.vesselOrAssetTSEOwner || "",
        customerTSEOwner:       item.customerTSEOwner     || "",
        business:               item.business             || "",
        validPO:                item.validPO              || "",
        startDate:              formatDate(item.startDate) || "",
        endDate:                formatDate(item.endDate)   || "",
        currency:               item.currency             || "",
        frequency:              item.frequency            || "",
        status:                 item.status || item.Status || "",
        bookedOut:              item.bookedOut            || "",
        automaticInvoicing:     item.automaticInvoicing   || "",
        notes:                  item.notes                || "",
        dummyIMONumber:         item.dummyIMONumber       || "",
        assetLevelPricing:      item.assetLevelPricing    || "",
        smartMonitor:           item.smartMonitor         || "",
        specialistSDAInvoice:   item.specialistSDAInvoice || "",
        allUOAInvoiced:         item.allUOAInvoiced       || "",
        smSampleNotInvoiced:    item.smSampleNotInvoiced  || "",
        upfrontPayment:         item.upfrontPayment       || "",
        serviceSubscription:    item.serviceSubscription  || "",
        allIncludedSubscription:item.allIncludedSubscription || "",
        smStartDate:            item.smStartDate          || "",
        smEndDate:              item.smEndDate            || "",
        smContractMonths:       item.smContractMonths     || "",
        smTotSubscriptionfees:  item.smTotSubscriptionfees|| "",
        offerVersion:           item.offerVersion         || "",
        serviceOfferBandBasic:  item.serviceOfferBandBasic || "",
        serviceOfferBandBasicAuto:  item.serviceOfferBandBasicAuto  || "",
        serviceOfferBandBasicValue: item.serviceOfferBandBasicValue || "",
        serviceOfferBandSDA:        item.serviceOfferBandSDA        || "",
        serviceOfferBandSpecialist: item.serviceOfferBandSpecialist || "",
        prorata:                item.prorata              || "",
        openInvoices:           item.openInvoices         || "",
      }));
      setMappedData(mappedData);
    } catch (error) {
      alert("No data found for the given Customer ID.");
    }finally {
      setLoadingAction(false);
    }
    
    
    // }else{
    //   alert("No data found for the given Customer ID.");
    // }
  };

  /* ── search vessel/asset by IMO inside modal ── */
  const handleSearchProspect = async () => {
    const payload = {
      ...(getValues("searchimo_number")
        ? { IMOSearch: getValues("searchimo_number") }
        : { AssetSearch: getValues("vessel_asset") }),
    };
    console.log("payload data", payload);
    try {
      const response  = await FetchAsset(payload);
      console.log("IMO search response:", response);
      const tableData = Array.isArray(response) ? response : response?.data || [];
      if (tableData.length > 0) {
        const first = tableData[0];
        // Pre-fill form with the found vessel's details
        reset(mapRowToForm({
          customer:          first.customer            || "",
          gstName:           first.gstName             || "",
          business:          first.business            || "marine",
          vesselAssetName:   first.vesselOrAssetName   || "",
          imoNumber:         first.imoNumber           || "",
          erpNumber:         first.erpNumber           || "",
          gmeRegion:         first.gmeRegion           || "",
          country:           first.country             || "",
          salesRegion:       first.salesRegion         || "",
          salesCountry:      first.salesCountry        || "",
          vesselOrAssetTSEOwner: first.vesselOrAssetTSEOwner || "",
          status:            first.status              || "",
          startDate:         first.startDate           || "",
          endDate:           first.endDate             || "",
          currency:          first.currency            || "",
          frequency:         first.frequency           || "3M",
          notes:             first.notes               || "",
          assetLevelPricing: first.assetLevelPricing   || false,
        }));
      }
    } catch (err) {
      console.error("IMO search error:", err);
    }
  };

  /* ── search customer by name / Sold-to ID ── */
  const handleSearchCustomer = async () => {
    const searchValue = getValues("search");
    if (!searchValue) return;
    setIsSearchingCustomer(true);
    try {
      const results = await SearchCompany(searchValue);
      const arr = Array.isArray(results) ? results : results?.data || [];
      setCustomerSearchResults(arr.map((c) => ({
        label: c.company || c.companyName || String(c),
        value: c.assetserviceifferID || c.soldToID || String(c),
        ...c,
      })));
    } catch (err) {
      console.error("SearchCompany error:", err);
      setCustomerSearchResults([]);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleBookInFunction=async(row)=>{
    if (!row) return;    
    try {
      handleBookInOut(row?.assetId,2);
    } catch (error) {
      console.error("BookIn error:", error);
    }
  };

  /* ── Book In / Book Out ── */
  const handleBookInOut= async (rowasset,level) => {
    console.log("handleBookInOut called with AssetID:", rowasset, "Level:", level);
    try {
      const resprecheck = await BookInOutPreCheck({
        AssetID:    rowasset,
        Level:      level,
      });
      console.log("BookInOutPreCheck status code:", resprecheck?.statusCode);
      console.log("BookInOutPreCheck message:", resprecheck?.message);

      if (resprecheck?.statusCode === 1) {
        const result = await BookInOut({
          assetID: rowasset,
          level: level,
        });
        console.log(result);
        return true;
      }

      const message = resprecheck?.message || "Unable to process Book In/Out.";
      setOwnershipWarning(message);
      setWarningModalMessage(message);
      setShowWarningModal(true);
      return false;
    } catch (err) {
      console.error("BookInOut error:", err);
      return false;
    }
  };
  const [companyAssetIDRow, setCompanyAssetIDRow] = useState(null);

  const prepareOwnershipChange = async (row) => {
    const invoiceCheck = await CheckForInvoices(row?.assetId);
    console.log("invoiceCheck.hasInvoices:", invoiceCheck?.hasInvoices);
    if (invoiceCheck?.hasInvoices) {
      const message = "This Asset/Vessel has outstanding invoice(s). Cannot change the Ownership.";
      setWarningModalMessage(message);
      setShowWarningModal(true);
      setOpenOwnershipModal(false);
      return false;
    }

    const id = row?.assetId;
    setCompanyAssetIDRow(id);
    setOwnershipRow(row);
    setOwnershipOwner(row.customerTSEOwner || "");
    setOwnershipWarning("");
    setWarningModalMessage("");
    setConfirmTitle("Change the Ownership?");
    setConfirmMessage("Are you sure you wish to change the Ownership?");
    setConfirmOnConfirm(() => async () => {
      setConfirmOpen(false);
      setOpenOwnershipModal(true);
    });
    setConfirmOpen(true);
    return true;
  };

  const handleOwnershipOpen = async (row) => {
    console.log("Opening Change Ownership for row:", row);
    if (!row.bookedOut) {
      console.log("Row is not booked out, proceeding to handle booked out.");
      const bookInSuccess = await handleBookInOut(row?.assetId, 2);
      if (!bookInSuccess) {
        return;
      }
    }
    if (!row) {
      const message = "Please select a vessel or asset before changing ownership.";
      setOwnershipWarning(message);
      setWarningModalMessage(message);
      setShowWarningModal(true);
      return;
    }

    if (!row.assetId) {
      const message = "The selected vessel or asset is missing an Asset ID.";
      setOwnershipWarning(message);
      setWarningModalMessage(message);
      setShowWarningModal(true);
      return;
    }

    if (!row.customer && !row.vesselAssetName) {
      const message = "The selected vessel or asset is missing customer or asset details.";
      setOwnershipWarning(message);
      setWarningModalMessage(message);
      setShowWarningModal(true);
      return;
    }

    if (row.status?.trim().toLowerCase() === "lost") {
      console.log("Row status is 'lost', opening confirmation modal.", row?.assetId);
      const id = row?.assetId;
      setCompanyAssetIDRow(id);
      setConfirmTitle("Confirm action");
      setConfirmMessage("This CompanyAsset Status is Lost, do you want to change Vessel status from lost to contacted?");
      setConfirmOnConfirm(() => async () => {
        try {
          await UpdateCompanyAssetStatus({ companyAssetID: id });
          await prepareOwnershipChange(row);
          setOpenOwnershipModal(true);
        } catch (err) {
          const message = extractValidationErrors(err) || "Update failed.";
          setWarningModalMessage(message);
          setShowWarningModal(true);
        } finally {
          setConfirmOpen(false);
        }
      });
      setConfirmOpen(true);
      return;
    }

    await prepareOwnershipChange(row);
  };
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Confirm action");
  const [confirmOnConfirm, setConfirmOnConfirm] = useState(() => async () => setConfirmOpen(false));

  const handleCancelModal = () => {
    setConfirmOpen(false);
    setOpenOwnershipModal(false);
  };

  const handleSearchCompany = async (CompanySearch) => {
    try {
      console.log("Fetching Company Names:", CompanySearch);

      const res = await SearchCompany(CompanySearch);
      console.log("SearchCompany Response:", res);

      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setResponddata(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching company names:", error);
      setResponddata([]);
    }
  };

  const companyOptions = Array.isArray(Responddata)
    ? Responddata.map((item) => ({
        label: item?.company || "",
        value: item?.assetServiceOfferID || "",
      }))
    : [];

  const handleCompanyChange = async(selected, field) => {
    const value =
      typeof selected === "string"
        ? selected
        : selected?.value || "";

    field.onChange(value);

    if (selected?.value) {
      // console.log(selected.label); // your custom function
      const genlookpayload={
        LookupSource:"company",
        Filter:selected.label
      }
      const genericres=await GenericLookups(genlookpayload)
      setValue("ownercompnyname",genericres.data[0].name)
      console.log("generick lookup data",genericres.data[0].name)
    }
  };


  /* ── CRUD helpers ── */
  const handleAdd = () => {
    setSelectedRowIndex(null);
    reset(initialValues);
    setOpenModal(true);
  };

  useImperativeHandle(ref, () => ({ openAdd: handleAdd }));

  const handleEdit = async(row) => {
    console.log("Editing row:", row);
    if (!row) return;

    if (row.status?.trim().toLowerCase() === "lost") {
      setrowCustname(row.customer || row.company || row.companyName || "");
      setrowStatus(row.status || row.Status || "");
      setOpenErrorModel(true);
      return;
    }

    setrowCustname(row.customer);
    setrowStatus(row.status);
    try {
        const rowIndex = MappedData.findIndex((item) => item.id === row.id);

        console.log("gmeRegion from API:", row.gmeRegion);
        console.log("Setting gmeregion:", row.gmeRegion?.trim().toLowerCase());

        if (rowIndex === -1) return;
          reset({
        ...initialValues,  
          SelectedCustomer: String(row.CompanyID) || "",
          vessel_asset: row.assetId || "",
          vesselorassetname: row.vesselAssetName || "",

          searchimo_number: row.imoNumber || "",
          search: row.vesselAssetName || "",

          customer: row.customer || "",
          gt_name: row.gstName || "",

          business: row.business?.trim().toLowerCase() || "energy",

          imonumber: row.imoNumber || "",
          erpnumber: row.erpNumber || "",

          offervesselassetlevel:row.business === "Energy" ? false : true,
          noimo: row.dummyIMONumber === "True",

          foc: row.prorata?.toLowerCase() || "",
          
          vesselstatus: row.status?.trim().toLowerCase()  || "",

          vesselassetowner: row.customerTSEOwner || "",
          
          gmeregion: row.gmeRegion || "",
          gmecountry: row.country  || "",

          salesregion: row.salesRegion || "",
          salescountry: row.salesCountry  || "",

          startdate: toDateInputValue(row.startDate || ""),
          enddate: toDateInputValue(row.endDate || ""),

          invoicingtype:  row.automaticInvoicing?.toLowerCase() === "yes"  ? "Automatic"  : "Manual",

          vesselnotes: row.notes || "",
          pricingfrequency: row.frequency || "",
          pricingcurrency: row.currency || "",
          currency2: row.currency || "",
          frequency2: row.frequency || "3M",
          offerVersion: row.offerVersion || "",

          chk_basic: row.serviceOfferBandBasic === "True" || row.serviceOfferBandBasic === true,
          basic_service: row.serviceOfferBandBasicValue || "",

          chk_sda: row.serviceOfferBandSDA === "True" || row.serviceOfferBandSDA === true,
          chk_specialist: row.serviceOfferBandSpecialist === "True" || row.serviceOfferBandSpecialist === true });
        
        
        const rowBusiness = String(row.business || "").trim().toLowerCase();
        const rowOfferVersion = String(row.offerVersion || "").trim().toLowerCase();

        setTab(0);

        if (rowBusiness === "energy") {
          const payload = { CompanyAssetID: row.assetId || "" };

          const res = await GetEnergyManualERPFormData(payload);

          console.log("Energy ERP Form Data:", res.data);
          console.log("Energy ERP Form FOC :", res.data[0].foc);
          console.log("Energy ERP Form Price :", res.data[0].price);
          console.log("Energy ERP Form Currency :", res.data[0].currency);

          setValue(`rows.${0}.offer1`, "Energy All In One");
          setValue(`rows.${0}.foc`, res.data[0].foc ||0);
          setValue(`rows.${0}.price`, res.data[0].price ||0);
          setValue(`rows.${0}.currency`, res.data[0].currency || "");
        }

        if (rowBusiness === "marine" && rowOfferVersion === "pre-2022") {
          const payload = { CompanyAssetID: row.assetId || "" };
          const res = await GetMarineManualERPFormData(payload);
          const marineData = Array.isArray(res?.data) ? res.data : [];
          const pricingRows = buildPricingRowsFromRecords(marineData);

          console.log("Marine Manual ERP Form Data:", marineData);
          setValue("rows", pricingRows);
          setTab(0);
        }

        if (rowBusiness === "marine" && rowOfferVersion === "2022") {
          setTab(0);
        }

        setOpenModal(true);
      } catch (error) {
        console.error("Error fetching form data:", error); 
      }
    
  
  };

  /* ── Save → CreateUpdateCompany API ── */
  const handleModalSave = async (data) => {
    console.log("Saving data:", data);
    const payload={
      companyID: data.SelectedCustomer,
      companyAssetID: data.vessel_asset,
      foc:data.rows[0].foc,
      price: data.rows[0].price,
      currency: data.pricingcurrency,
      invoicing_Type: data.invoicingtype, 
      frequency:data.pricingfrequency,
    }
    const Marinepayload={
      companyID: data.cust_num,
      companyAssetID: data.vessel_asset,
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
      console.log("Payload for CreateUpdateCompany:", payload);
      // await CreateUpdateCompany(payload);
      if(data.business?.toLowerCase() === "energy") {
        const res = await UpdateEnergyManualERPData_FromUoaForm(payload);
      }else{
        const res = await UpdateMarineManualERPData_FromUoaForm(Marinepayload);
      }
      // console.log("Update API called with data:", data.SelectedCustomerID);
      if(getValues("gt_name")!==null && getValues("gt_name")!=="" && getValues("gt_name")!==undefined){
        handleUpdateGSTName();
      }
      setTimeout(() => setSaveToast(false), 3000);
      setOpenModal(false);
      setSelectedRowIndex(null);
    } catch (err) {
      const message = extractValidationErrors(err) || "Save failed.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Book In / Book Out ── */
  const handleBookInOutPrecheck = async (row) => {
    console.log("Book In/Out for row:", row);
    if (!row) return;
    try {
      const result = await BookInOutPreCheck({
        AssetID:    row.assetId,
        Level:      2,
      });
      console.log(result.message);
    } catch (err) {
      console.error("BookInOut error:", err);
    }
  };

  /* ── Change Ownership ── */
  const openChangeOwnership = (row) => {
    console.log("Opening Change Ownership for row:", row);
    handleBookInOut();
    if (!row) return;
    setSelectedVesselForAction(row);
    setNewOwnerName("");
    setOwnershipEffDate("");
    setOwnershipWarning("");
    setChangeOwnershipModal(true);
  };
  const handleclearsearch=()=>{
    // setValue("customernamesearch","");
    setValue("customeridsearch","");
  }
  const handleChangeOwnership = async () => {
    const selectedOwnerName = String(getValues("ownercompnyname") || "").trim();
    const selectedTransferDate = getAssetValues("ownerassetDate");

    if (!selectedOwnerName || !selectedTransferDate) {
      const message = "Please enter both new customer name and effective date.";
      setOwnershipWarning(message);
      setWarningModalMessage(message);
      setShowWarningModal(true);
      return;
    }

    setOwnershipLoading(true);
    setOwnershipWarning("");
    try {
      const payload = {
        AssetID: selectedVesselForAction?.assetId || ownershipRow?.assetId || "",
        NewOwner: `${getValues("ownercompnyname") ?? ""}`,
        TransferDate: formatDateforownership(selectedTransferDate),
        Level: 2,
      };

      const result = await OwnershipChange_API(payload);
      console.log(result);
      setOpenOwnershipModal(false)
      // setChangeOwnershipModal(false);
      const customerId = getValues("customeridsearch");
      if (customerId) handleFetchAsset(customerId,"companyId");
    } finally {
      setOwnershipLoading(false);
    }
  };

  const openOwnershipConfirm = () => {
    const selectedOwnerName = String(getValues("ownercompnyname") || "").trim();
    const selectedTransferDate = getAssetValues("ownerassetDate");

    if (!selectedOwnerName || !selectedTransferDate) {
      const message = "Please enter both new customer name and effective date.";
      setOwnershipWarning(message);
      setWarningModalMessage(message);
      setShowWarningModal(true);
      return;
    }

    setConfirmTitle("Change the Ownership?");
    setConfirmMessage("Are you sure you wish to change the ownership?");
    setConfirmOnConfirm(() => async () => {
      try {
        await handleChangeOwnership();
      } finally {
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleGstNameChange = (row, value) => {
    const rowIdentifier = String(row?.assetId ?? row?.imoNumber ?? "");

    setGstModalRows((prevRows) =>
      prevRows.map((currentRow) => {
        const currentIdentifier = String(currentRow?.assetId ?? currentRow?.imoNumber ?? "");
        return currentIdentifier === rowIdentifier
          ? { ...currentRow, gstName: value }
          : currentRow;
      })
    );
  };

  const handleSaveGstNames = async () => {
    const changes = gstModalRows.filter((row) => {
      const original = MappedData.find(
        (orig) => String(orig.assetId) === String(row.assetId) && String(orig.imoNumber) === String(row.imoNumber)
      );
      return original && (original.gstName || "") !== (row.gstName || "");
    });

    if (changes.length === 0) {
      setGstModalOpen(false);
      return;
    }

    setGstModalSaving(true);
    try {
      await Promise.all(
        changes.map(async (row) => {
          const result = await UpdateGSTName({
            CompanyAssetID: row.assetId || "",
            IMONumber: row.imoNumber || "",
            GSTName: row.gstName || "",
          });

          if (!result?.success) {
            throw new Error(result?.message || "GST update failed");
          }

          return result;
        })
      );

      setMappedData((prev) =>
        prev.map((orig) => {
          const updated = changes.find(
            (row) => String(row.assetId) === String(orig.assetId) && String(row.imoNumber) === String(orig.imoNumber)
          );
          return updated ? { ...orig, gstName: updated.gstName } : orig;
        })
      );

      alert("GST Name updates saved successfully.");
      setGstModalOpen(false);
    } catch (error) {
      console.error("Error saving GST Name updates:", error);
      alert("Unable to save GST Name updates. Check console for details.");
    } finally {
      setGstModalSaving(false);
    }
  };

  const handleCloseGstModal = () => {
    setGstModalOpen(false);
  };

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="container-fluid py-4 bg-light min-vh-100">
      {loadingAction && (
        <div display="flex" alignItems="center" gap={1} my={2}>
          <CircularProgress size={20} />
          <Typography>Loading customer list...</Typography>
        </div>
      )}
      {/* ── Success toast ── */}
      {saveToast && (
        <div
          className="alert alert-success alert-dismissible position-fixed top-0 end-0 m-3 shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <i className="bi bi-check-circle me-2"></i>
          Vessel / Asset saved successfully.
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Vessel &amp; Asset Management</h2>
          <p className="text-muted mb-0">Create, update and manage vessels and assets</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-success shadow-sm"
            onClick={() => runWithLoading("create-vessel", handleAdd)}
            disabled={loadingAction === "create-vessel"}
          >
            {renderButtonContent("create-vessel", "Create Vessel", "Creating...", "bi-plus-circle")}
          </button>

          {/* <button
            className="btn btn-outline-success shadow-sm"
            disabled={!selectedTableRow || loadingAction === "edit-vessel"}
            title={!selectedTableRow ? "Click a row in the table first" : ""}
            onClick={() => selectedTableRow && runWithLoading("edit-vessel", () => handleEdit(selectedTableRow))}
          >
            {renderButtonContent("edit-vessel", "Edit Vessel", "Loading...", "bi-pencil-square")}
          </button> */}

          <button
            className="btn btn-success shadow-sm"
            onClick={() => runWithLoading("update-gst", () => {
              if (!MappedData || MappedData.length === 0) {
                alert("No vessel records available to update.");
                return;
              }
              setGstModalRows(MappedData.map((row) => ({ ...row, gstName: row.gstName || "" })));
              setGstModalOpen(true);
            })}
            disabled={loadingAction === "update-gst"}
          >
            {renderButtonContent("update-gst", "Update GST Name", "Opening...", "bi-cloud-upload")}
          </button>

          {/* <button
            className="btn btn-warning shadow-sm"
            // disabled={!selectedTableRow || loadingAction === "book-in-out"}
            disabled={loadingAction === "book-in-out"}
            title={!selectedTableRow ? "Click a row in the table first" : ""}
            onClick={() => selectedTableRow && runWithLoading("book-in-out", () => handleBookInOut(selectedTableRow))}
          >
            {renderButtonContent("book-in-out", "Book In / Out", "Processing...", "bi-box-arrow-left")}
          </button> */}

          {/* <button
            className="btn btn-dark shadow-sm"
            disabled={!selectedTableRow}
            title={!selectedTableRow ? "Click a row in the table first" : ""}
            onClick={() => selectedTableRow && openChangeOwnership(selectedTableRow)}
          >
            <i className="bi bi-arrow-left-right me-2"></i>Change Ownership
          </button> */}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Vessels</p>
                  <h3 className="fw-bold mb-0">{MappedData.length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-ship fs-4 text-success"></i>
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
                  <p className="text-muted mb-1">Energy Assets</p>
                  <h3 className="fw-bold mb-0">
                    {MappedData.filter((i) => i.business?.toLowerCase() === "energy").length}
                  </h3>
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
                  <p className="text-muted mb-1">Marine Vessels</p>
                  <h3 className="fw-bold mb-0">
                    {MappedData.filter((i) => i.business?.toLowerCase() === "marine").length}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-water fs-4 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH CARD ── */}
      <div className="card border-0 shadow rounded-4 mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">Search Vessel / Asset by Customer</h5>
        </div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-3 mt-2">
              <FormSelect
                name="searchtype"
                control={control}
                label="Search Type *"
                options={opt_invoicesearch}
              />
            </div>

            <div className="col-md-4">
              {/* <FormInput name="customeridsearch" control={control} label="Customer ID Search" /> */}
              <div className="col-md-6 ">
                  <Controller
                    name="customeridsearch"
                    control={control}
                    disabled={loadingAction === "fetch-vessels"}
                    render={({ field }) => (
                      <MuiTextField
                        {...field}
                        value={field.value ?? ""}
                        fullWidth
                        label={`${getValues("searchtype") || "Search Type"} ID`}
                        size="small"
                        placeholder="Enter company name"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleFetchAsset(field.value, "companyId")}
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
                            handleFetchAsset(field.value,"companyId");
                          }
                        }}
                      />
                    )}
                  />
              </div>
            </div>
            {/* <div className="col-md-4">
              <div className="col-md-12 ">
                  <Controller
                    name="customernamesearch"
                    control={control}
                    disabled={loadingAction === "fetch-vessels"}
                    render={({ field }) => (
                      <MuiTextField
                        {...field}
                        value={field.value ?? ""}
                        fullWidth
                        label="Search by Company Name"
                        size="small"
                        placeholder="Enter company name"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleFetchAsset(field.value,"companyName")}
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
                            handleFetchAsset(field.value, "companyName");
                          }
                        }}
                      />
                    )}
                  />
              </div>

            </div> */}
            {/* <div className="col-md-3">
              <button
                type="button"
                className="btn btn-success w-35 shadow-sm"
                onClick={handleclearsearch}
              >
                Clear
              </button>
            </div> */}
            {/* <div className="col-md-3"> */}
              {/* <button
                className="btn btn-success w-100 shadow-sm"
                onClick={() => runWithLoading("fetch-vessels", () => handleFetchAsset(getValues("customeridsearch")))}
                disabled={loadingAction === "fetch-vessels"}
              >
                {renderButtonContent("fetch-vessels", "Fetch Vessel Data", "Fetching...", "bi-download")}
              </button> */}
            {/* </div> */}
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="card border-0 shadow rounded-4">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-1">Vessel / Asset Records</h5>
              <small className="text-muted">Manage all vessel and asset information</small>
            </div>
            <span className="badge bg-success rounded-pill px-3 py-2">
              {MappedData.length} Records
            </span>
          </div>
        </div>
        <div className="card-body">
          <EditableSortableTable
            columns={columns}
            rowData={MappedData}
            onEdit={(row) => { setSelectedTableRow(row); handleEdit(row); }}
            onRowClick={(row) => setSelectedTableRow(row)}
            selectedRow={selectedTableRow}
            onOwnership={handleOwnershipOpen}
            // onBookInOut={handleBookInOut}
            onBookInOut={handleBookInFunction}
          />
        </div>
      </div>

      {gstModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-success text-white border-0 rounded-top-4">
                <div>
                  <h4 className="modal-title fw-bold mb-1">Update GST Name</h4>
                  <small className="opacity-75">Edit GST Name only; all other values are read-only.</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseGstModal}
                ></button>
              </div>
              <div className="modal-body bg-light p-4">
                <EditableSortableTable_GST
                  columns={GST_columns.map((col) => ({
                    ...col,
                    renderCell: (row) =>
                      col.field === "gstName" ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.gstName || ""}
                          onChange={(e) => handleGstNameChange(row, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row[col.field] ?? ""}
                          disabled
                        />
                      ),
                  }))}
                  rowData={gstModalRows}
                  pagination={false}
                  pageSizeOptions={[10, 25, 50]}
                  loading={false}
                />
              </div>
              <div className="modal-footer border-0 bg-white">
                <button className="btn btn-outline-secondary" onClick={handleCloseGstModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSaveGstNames}
                  disabled={gstModalSaving}
                >
                  {gstModalSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-5" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    "Save GST Name"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE / EDIT VESSEL MODAL
      ══════════════════════════════════════════════════════════════ */}
      {openModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-lg">

              {/* MODAL HEADER */}
              <div className="modal-header bg-success text-white border-0 rounded-top-4">
                <div>
                  <h4 className="modal-title fw-bold mb-1">
                    {selectedRowIndex !== null ? "Edit Vessel / Asset" : "Add New Vessel / Asset"}
                  </h4>
                  <small className="opacity-75">Vessel &amp; Asset Information Form</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setOpenModal(false)}
                ></button>
              </div>

              {/* MODAL BODY */}
              <div className="modal-body bg-light p-4">

                {/* ── Search Existing Vessel / Prospecting ── */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-header bg-white border-0 py-3">
                    <h6 className="fw-bold mb-0">
                      Search Existing Vessel / Asset (by IMO or Name)
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-4 align-items-end">
                      <div className="col-md-4">
                        <FormInput name="vessel_asset" control={control} label="Vessel or Asset Name" />
                      </div>
                      <div className="col-md-2">
                        <FormInput name="searchimo_number" control={control} label="IMO Number" />
                      </div>
                      <div className="col-md-2">
                        <button
                          className="btn btn-success w-100"
                          onClick={() => runWithLoading("search-prospect", handleSearchProspect)}
                          disabled={loadingAction === "search-prospect"}
                        >
                          {renderButtonContent("search-prospect", "Search", "Searching...", "bi-search")}
                        </button>
                      </div>
                      <div className="col-md-4">
                        <FormInput name="SelectedCustomer" control={control} label="Selected Customer Id" disabled />
                      </div>
                    </div>
                    {business === "energy" && (
                      <div className="alert alert-info mt-3 mb-0 py-2 small">
                        <i className="bi bi-info-circle me-2"></i>
                        For <strong>Energy</strong> customers, IMO numbers are dummy values
                        auto-assigned by the system. Check &quot;No IMO / Assign Dummy&quot; below.
                      </div>
                    )}
                    {business === "marine" && (
                      <div className="alert alert-info mt-3 mb-0 py-2 small">
                        <i className="bi bi-info-circle me-2"></i>
                        For <strong>Marine</strong> vessels, the IMO number is provided by sales.
                        Search by IMO first — if an existing offer is found you can
                        use <em>Change Ownership</em> instead.
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Customer Search ── */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-header bg-white border-0 py-3">
                    <h6 className="fw-bold mb-0">Customer</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-4 align-items-end">
                      <div className="col-md-5">
                        <FormInput name="search" control={control} label="Search by Customer Name or Sold-To ID" />
                      </div>
                      <div className="col-md-3">
                        <button
                          className="btn btn-success w-100"
                          onClick={handleSearchCustomer}
                          disabled={isSearchingCustomer}
                        >
                          {isSearchingCustomer
                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Searching…</>
                            : <><i className="bi bi-search me-2"></i>Search</>}
                        </button>
                      </div>
                    </div>

                    <div className="row g-4 mt-2">
                      <div className="col-md-6">
                        <FormSelect
                          name="customer"
                          control={control}
                          label="Customer *"
                          options={
                            customerSearchResults.length > 0
                              ? customerSearchResults
                              : [{ label: "— search above —", value: "" }]
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <FormInput disabled name="gt_name" control={control} label="GST Name" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── TABS ── */}
                <ul className="nav nav-pills nav-fill shadow-sm rounded-4 p-2 mb-4" style={{ backgroundColor: "#e8f5e9" }}>
                  <li className="nav-item">
                    <button
                      className={`nav-link rounded-3 ${tab === 0 ? "active" : ""}`}
                      onClick={() => setTab(0)}
                      style={tab === 0 ? { backgroundColor: "#2e7d32", color: "#fff" } : { color: "#2e7d32" }}
                    >
                      Vessel / Asset
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-3 ${tab === 1 ? "active" : ""}`}
                      disabled={disablePre2022}
                      onClick={() => setTab(1)}
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
                </ul>

                {/* ══ TAB 0 – Vessel / Asset Details ══ */}
                {tab === 0 && (
                  <div className="d-flex flex-column gap-3">

                    {/* Section: Vessel / Asset Details */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-4" style={{ borderColor: "#e9ecef" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="bg-success bg-opacity-10 p-2 rounded-3 lh-1">
                            <i className="bi bi-ship fs-6 text-success"></i>
                          </span>
                          <h6 className="fw-bold mb-0 text-success">Vessel / Asset Details</h6>
                        </div>
                      </div>
                      <div className="card-body px-4 py-4">

                        {/* Business toggle */}
                        <div className="mb-3 d-flex align-items-center gap-3">
                          <p className="small fw-semibold text-muted mb-0" style={{ minWidth: 80 }}>
                            Business *
                          </p>
                            {/* <div className="d-flex gap-2">
                              {[
                                {
                                  label: "Energy",
                                  value: "energy",
                                  icon: "bi-lightning-charge-fill",
                                  color: "warning",
                                  disabled: true,
                                },
                                {
                                  label: "Marine",
                                  value: "marine",
                                  icon: "bi-water",
                                  color: "info",
                                  disabled: false,
                                },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  disabled={opt.disabled}
                                  onClick={() => {
                                    if (opt.disabled) return;

                                    setValue("business", opt.value);
                                    setTab(0);
                                  }}
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
                            </div> */}
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

                        </div>

                        {/* Row 1: Name + IMO + ERP */}
                        <div className="row g-3 mb-3">
                          <div className="col-md-4">
                            <FormInput name="vesselorassetname" control={control} label="Vessel / Asset Name *" />
                          </div>
                          <div className="col-md-3">
                            <FormInput
                              name="imonumber"
                              control={control}
                              label={business === "energy" ? "IMO Number (Dummy)" : "IMO Number *"}
                              disabled={watch("noimo") && business === "energy"}
                            />
                          </div>
                          <div className="col-md-3">
                            <FormInput
                              name="erpnumber"
                              control={control}
                              label={business === "marine" ? "ERP Number (SAP ID / Ship-To ID) *" : "ERP Number"}
                            />
                          </div>
                        </div>

                        {/* Row 2: checkboxes + FOC */}
                        <div className="row g-3 align-items-center">
                          <div className="col-auto">
                            <FormCheckbox
                              name="noimo"
                              control={control}
                              label={business === "energy"
                                ? "No IMO – Assign Dummy IMO"
                                : "No IMO"}
                            />
                          </div>
                          {business === "energy" && (
                            <>
                              <div className="col-auto">
                                <FormCheckbox
                                  name="offervesselassetlevel"
                                  control={control}
                                  label="Offer at Vessel / Asset Level"
                                />
                              </div>
                              <div className="col-md-3">
                                <FormSelect
                                  name="foc"
                                  control={control}
                                  label="FOC (Free-of-Charge S..."
                                  options={opt_foc}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section: GME & Sales Region */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-4" style={{ borderColor: "#e9ecef" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="bg-success bg-opacity-10 p-2 rounded-3 lh-1">
                            <i className="bi bi-globe fs-6 text-success"></i>
                          </span>
                          <h6 className="fw-bold mb-0 text-success">Region &amp; Sales</h6>
                        </div>
                      </div>
                      <div className="card-body px-4 py-4">
                        {/* GME */}
                        <div className="row g-3">
                          <div className="col-12">
                            <p className="small fw-semibold text-muted mb-2 border-bottom pb-1">GME *</p>
                          </div>
                          <div className="col-md-4">
                            <FormSelect  name="gmeregion"  control={control} label="GME Region"  options={opt_region}  />
                          </div>
                          <div className="col-md-5">
                            <FormSelect  name="gmecountry" control={control} label="GME Country" options={opt_country} />
                          </div>
                        </div>
                        {/* Sales */}
                        <div className="row g-3 mt-1">
                          <div className="col-12">
                            <p className="small fw-semibold text-muted mb-2 border-bottom pb-1">
                              Sales *
                              <span className="text-info ms-2 fw-normal small">
                                (Sales Region auto-populates from country)
                              </span>
                            </p>
                          </div>
                          <div className="col-md-4">
                            <FormSelect  name="salesregion"  control={control} label="Sales Region"  options={opt_region}  />
                          </div>
                          <div className="col-md-5">
                            <FormSelect  name="salescountry" control={control} label="Sales Country" options={opt_country} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Ownership, Status & Invoicing */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-4" style={{ borderColor: "#e9ecef" }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="bg-warning bg-opacity-10 p-2 rounded-3 lh-1">
                            <i className="bi bi-person-check fs-6 text-warning"></i>
                          </span>
                          <h6 className="fw-bold mb-0 text-warning">Ownership &amp; Contract</h6>
                        </div>
                      </div>
                      <div className="card-body px-4 py-4">
                        <div className="row g-3 mb-3">
                          <div className="col-md-5">
                            <FormSelect
                              disabled
                              name="vesselassetowner"
                              control={control}
                              label="Vessel / Asset TSE Owner *"
                              options={opt_tse}
                            />
                          </div>
                          <div className="col-md-3">
                            <FormSelect name="vesselstatus" control={control} label="Status *" options={opt_status} />
                          </div>
                        </div>

                        {/* Status = Lost warning */}
                        {statusWatch === "lost" && (
                          <div className="alert alert-warning py-2 small mb-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Status <strong>Lost</strong>: set the End Date to
                            <strong> Effective Date − 1</strong> per end-dating procedure.
                          </div>
                        )}

                        {/* Invoicing type */}
                        <div className="mb-3">
                          <FormRadio
                            name="invoicingtype"
                            control={control}
                            label="Invoicing Type (leave blank to inherit from customer) *"
                            options={[
                              { label: "Automatic", value: "Automatic" },
                              { label: "Manual",    value: "Manual"    },
                            ]}
                          />
                        </div>

                        {/* Dates */}
                        <div className="row g-3">
                          <div className="col-12">
                            <p className="small fw-semibold text-muted mb-2 border-bottom pb-1">
                              Contract Dates (dd/mm/yyyy) *
                            </p>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold text-muted mb-1">
                              Start Date (Effective Date)
                            </label>
                            <FormInput type="date" name="startdate" control={control} sx={{ width: "100%" }} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold text-muted mb-1">
                              End Date {statusWatch === "lost" && <span className="text-danger">*</span>}
                            </label>
                            <FormInput type="date" name="enddate" control={control} sx={{ width: "100%" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Notes */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body px-4 py-3">
                        <FormInput
                          sx={{ width: "100%" }}
                          name="vesselnotes"
                          control={control}
                          multiline
                          rows={3}
                          label="Notes"
                          placeholder={
                            business === "energy"
                              ? "e.g. Industrial Account — managed by Charles Swift"
                              : "Additional notes…"
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ══ TAB 1 – Pricing Pre-2022 (Energy / Old Offer) ══ */}
                {tab === 1 && (
                  <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <div className="d-flex align-items-center gap-2">
                      <span className="bg-warning bg-opacity-10 p-2 rounded-3 lh-1">
                        <i className="bi bi-tag fs-6 text-warning"></i>
                      </span>

                      <h6 className="fw-bold mb-0 text-warning">
                        Pricing Pre-2022 (Old Offer)
                      </h6>

                      {/* <span className="badge bg-warning text-dark ms-2">
                        Energy
                      </span> */}
                    </div>
                  </div>

                  <div className="card-body px-4 pb-4">
                    <div className="alert alert-info py-2 small mb-4">
                      <i className="bi bi-info-circle me-2"></i>
                      Select <strong>"Energy All-in-One"</strong> as the Offer Band
                      to avoid quarantine errors. Currency and Frequency are mandatory.
                      Price listing is <em>not</em> entered for Energy customers in this tool —
                      it is transferred to the UOA invoicing report by the Infosys Support team.
                    </div>

                    {/* Filters */}
                    <div className="row g-3 align-items-end mb-4">
                      <div className="col-md-4">
                        <FormSelect
                          disabled={offervesselassetlevel===false}
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
                          disabled={offervesselassetlevel===false}
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
                    </div>

                    {/* Pricing Table */}
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: 400,
                        overflow: "auto",
                      }}
                    >
                      <Table disabled size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {columns_prising.map((col) => (
                              <TableCell key={col.field}>
                                {col.headerName}
                                {col.disabled}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                      <TableBody>
                        {rows.map((row, index) => (
                          <TableRow key={index}>
                            {columns_prising.map((col) => (
                              <TableCell key={col.field}>
                                <Controller
                                  disabled={offervesselassetlevel===false}
                                  name={`rows.${index}.${col.field}`}
                                  control={control}
                                  defaultValue={row[col.field] || ""}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      value={field.value ?? ""}
                                      size="small"
                                      fullWidth
                                    />
                                  )}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </div>
                )}

                {/* ══ TAB 2 – Pricing 2022 (Marine / New Offer) ══ */}
                {tab === 2 && (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-4" style={{ borderColor: "#e9ecef" }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="bg-info bg-opacity-10 p-2 rounded-3 lh-1">
                          <i className="bi bi-currency-dollar fs-6 text-info"></i>
                        </span>
                        <h6 className="fw-bold mb-0 text-info">Pricing 2022 (New Offer)</h6>
                        {/* <span className="badge bg-info text-dark ms-2">Energy</span> */}
                      </div>
                    </div>
                    <div className="card-body px-4 py-4">
                      <div className="alert alert-info py-2 small mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        Enter <strong>Currency</strong> and <strong>Frequency</strong> first and
                        save — only then can the pricing band options (FOC / price per sample)
                        be modified.
                      </div>

                      {/* Currency + Frequency */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <FormSelect
                            name="currency2"
                            control={control}
                            label="Currency *"
                            options={opt_currency_vessel}
                          />
                        </div>
                        <div className="col-md-4">
                          <FormSelect
                            disabled
                            name="frequency2"
                            control={control}
                            label="Frequency *"
                            options={opt_frequency}
                          />
                        </div>
                      </div>

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
                )}

                {/* Save error */}
                {saveError && (
                  <div className="alert alert-danger mt-3 py-2 small">
                    <i className="bi bi-exclamation-triangle me-2"></i>{saveError}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="modal-footer bg-white border-0">
                <button className="btn btn-outline-secondary px-4" onClick={() => reset(initialValues)}>
                  Clear
                </button>
                <button className="btn btn-outline-danger px-4" onClick={() => setOpenModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-success px-4 shadow-sm"
                  onClick={handleSubmit(handleModalSave)}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</>
                    : <><i className="bi bi-check-circle me-2"></i>Save</>}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

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
              style={{ background: "linear-gradient(135deg, #9be7e1 0%, #7d918f 100%)" }}>
              <h5 className="modal-title fw-bold mb-0 text-black">Change Ownership</h5>
              <button
                type="button"
                className="btn-close btn-close-white ms-auto"
                onClick={() => setOpenOwnershipModal(false)}
              />
            </div>
            <div className="modal-body bg-light p-4">
              <div className="mb-3">
                <p className="mb-2">Customer</p>
                <strong>{ownershipRow?.customer || "—"}</strong>
              </div>
              <div className="mb-3">
                <p className="mb-2">Asset Name</p>
                <strong>{ownershipRow?.vesselAssetName || "—"}</strong>
              </div>
              {/* <div className="mb-3">
                <p className="mb-2">Asset ID</p>
                <strong>{ownershipRow?.assetId || "—"}</strong>
              </div> */}
              <div className="row g-3 align-items-center ">
                {/* Search Input */}
                <div className="col-md-12 ">
                  <Controller
                    name="companysearch"
                    control={control}
                    render={({ field }) => (
                      <MuiTextField
                        {...field}
                        value={field.value ?? ""}
                        fullWidth
                        label="Search Company"
                        size="small"
                        placeholder="Enter company name"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleSearchCompany(field.value)}
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
                  render={({ field }) => {
                    const selectedOption = companyOptions.find(
                      (option) => option.value === field.value
                    );

                    return (
                      <Autocomplete
                        freeSolo
                        disablePortal
                        options={companyOptions.length > 0 ? companyOptions : []}
                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : option.label
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.value === value?.value
                        }
                        value={selectedOption || null}
                        inputValue={
                          selectedOption?.label ||
                          (typeof field.value === "string" ? field.value : "")
                        }
                        onChange={(_, selected) =>
                          handleCompanyChange(selected, field)
                        }
                        onInputChange={(_, value) => field.onChange(value)}
                        noOptionsText="Data not available"
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
                    );
                  }}
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
                  Asset ID
                </Typography>
                <strong style={{ color: "#555" }}
                /><strong>{ownershipRow?.assetId || "—"}</strong>
              </div>
              {/* <div className="mb-3">
                <p className="mb-2">Asset ID</p>
                <strong>{ownershipRow?.assetId || "—"}</strong>
              </div> */}
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
              {/* <LoadingButton> */}
              <button
                type="button"
                className="btn btn-success px-4"
                onClick={openOwnershipConfirm}
                disabled={loadingAction === "ownership-save"}
              >
                {renderButtonContent("ownership-save", "Update Owner", "Updating...", "bi-person-check")}
              </button>
              {/* </LoadingButton> */}
            </div>
            {/* <div className="col-6">
              <FormInput
                name="ownerchangecustomerID"
                control={assetControl}
                // sx={{ display: "none" }}
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>

      <div className="container-fluid mt-4">
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-header bg-dark text-white py-3">
            <ErrorMessageModel
              open={openErrorModel}
              name={rowCustname}
              status={rowStatus}
              onClose={() => setOpenErrorModel(false)}
            />
          </div>
        </div>
      </div>
      <ConfirmationModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={confirmOnConfirm}
        onCancel={handleCancelModal}
        confirmLabel="Yes"
        cancelLabel="No"
      />

      <div
        className={`modal fade ${showWarningModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content border-0 rounded-4 shadow-lg">
            <div className="modal-header border-0 rounded-top-4 px-4 py-3" style={{ background: "linear-gradient(135deg, #f4b400 0%, #d97706 100%)" }}>
              <h5 className="modal-title fw-bold mb-0 text-white">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Validation Warning
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowWarningModal(false)} />
            </div>
            <div className="modal-body bg-light p-4">
              <div className="alert alert-warning mb-0">
                <strong>{warningModalMessage || "Validation failed."}</strong>
              </div>
            </div>
            <div className="modal-footer border-0 px-4 py-3">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowWarningModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default Vessels;
