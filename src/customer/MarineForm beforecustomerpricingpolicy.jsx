import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react";
import { useLocation } from "react-router-dom";

import {
  Autocomplete, TextField as MuiTextField, InputAdornment, IconButton,
  Box,
  Grid,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SaveMarineManualERPData,UpdateContractStatus  ,UpdateMarineManualERPData,UpdateMarineERPDataPricingDetails} from "../api/energyformapis";
import {
  useForm,
  useFieldArray,Controller,
} from "react-hook-form";
import {FetchCustomerList} from "../api/customerApi"
import { yupResolver } from "@hookform/resolvers/yup";
import DeleteIcon from "@mui/icons-material/Delete";
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import EditableSortable_noaction from "../components/form/EditableSortable_noaction";
import FormSelectSmall from "../components/form/FormSelectSmall";
import Erp_Form from "../marine_erp_forms/Erp_Form";
import VesselList from "../marine_erp_forms/VesselList";
import ErrorMessageModel from "../utilities/ErrorMessageModel";

import { customerSchema } from "../validation/customerSchema";
import { GetMarineManualERPFormData } from "../api/energyformapis";
import { SendSubmitEmail } from "../api/energyformapis";
import {SearchCompany} from "../api/customerApi"
import LoadingButton from "../components/LoadingButton";
import {
  opt_newaccount,
  opt_marine_uoaoffer,
  opt_casetypes,
  opt_Marine_formFields,
  opt_uoa_offer,
  opt_uoa_Currency,
  opt_uoa_invoicing_freq,
  opt_service_desc,opt_setuptype,opt_sda_samples,opt_tse,
  opt_offer_list_newUOA,opt_offer_list_newSDA
} from "./Opt_library";

import { opt_country_with_soldtoRegion,Marine_columns,Marine_initialValues } from "./Erp_Option_Library";

/* ---------------- REUSABLE SECTION ---------------- */
const Section = ({ title, children }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography fontWeight="bold">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

/* ---------------- CONSTANTS ---------------- */
const vesselColumns = [
  { field: "newvesselname", headerName: "New Vessel Name" },
  { field: "vessel_sap_Id", headerName: "Vessel SAP ID" },
  { field: "imolrnno", headerName: "IMO/LRN No" },
  { field: "oldvesselname", headerName: "Old Vessel Name" },
  { field: "addchangedelete", headerName: "Add/Change/Delete" },
  { field: "spotvessel", headerName: "Spot Vessel" },
  { field: "vesseltype", headerName: "Vessel Type" },
  { field: "eac", headerName: "EAC" },
  { field: "rebateinvestment", headerName: "Rebate / Investment" },
];

const MarineErpForm = forwardRef((props, ref) => {

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: Marine_initialValues,
  });
  // ---------------- STATE ----------------
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const casetype = watch("casetype");
  const salesAccountType = watch("salesaccounttype");
  const marineerpsystemtype = watch("marineerpsystemtype");
  const [tab, setTab] = useState(0);
  const [mappedData, setMappedData] = useState([]);
  const [Responddata,setResponddata]=useState([]);
  const [attachments, setAttachments] = useState([]);
  const [Assetrespdata,setAssetrespdata]=useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const amendmodifytechnicaloffer = watch("amendmodifytechnicaloffer");
  const includeuoaoffer = watch("includeuoaoffer");
  const soldtoname = watch("soldtoname");
  const tsenameemail = watch("tsenameemail");
  const offerforexistingvessel = watch("offerforexistingvessel");
  const offerfornewvessel= watch("offerfornewvessel");
  const [validationResult, setValidationResult] = useState("");
  const copiedData = watch("cddcopieddata");
  const customerName = watch("cddcustname");
  const rating = watch("rating");
  const [openErrorModel, setOpenErrorModel] = useState(false);
  const [rowCustname, setrowCustname] = useState("");
  const [rowStatus, setrowStatus] = useState("");
  // const [strDiscount, setStrDiscount] = useState("");
  const strDiscount = watch("strDiscount");
  const includeuoaofferforothercustomer=watch("includeuoaofferforothercustomer");
const getFieldColor = (fieldName) =>
  watch(fieldName) ? "#ddebe0" : "#f5cbb3";

  const isValidated =
  soldtoname && tsenameemail && "setuptype" && "priority"
  marineerpsystemtype && "requsted_by"&& "approved_by"&& "newaccountsetup" && "newvesselsetup" && "includeuoaoffer" &&
  "setuptype" && "detailsofrequest" && "cabmnmc_soldtoid" && "uoacurrency" && "uoainvoicingfreq" &&
  casetype ||
  (
    (casetype === "Modify existing UOA offer for vessel" && offerforexistingvessel) ||
    (casetype === "Modifying existing UOA offer for customer" && amendmodifytechnicaloffer)||
    (casetype === "UOA offer for new vessel" && offerfornewvessel)||
    (validationResult === "Validation Successful" && marineerpsystemtype === "JDE") 
  );

  // const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  // const erpFormRef = useRef(null);
    // ---------- FIELD ARRAYS ----------
  const {
    fields: uoaFields,
    append: addUoa,
    remove: removeUoa,
    replace: replaceUoa,
  } = useFieldArray({
    control,
    name: "uoaSamples",
  });

  const {
    fields: sdaFields,
    append: addSda,
    remove: removeSda,
    replace: replaceSda,
  } = useFieldArray({
    control,
    name: "sdaSamples",
  });
  const validateCopiedData = () => {
  if (!copiedData) {
    const message = "Copied Data is required.";
    setValidationResult(message);
    console.log("Validation Result:", message);
    return "Copied Data is required.";
  }


  const hasCustomer =
    customerName &&
    copiedData
      .toLowerCase()
      .includes(customerName.toLowerCase());

  const hasRating =
    rating &&
    copiedData
      .toLowerCase()
      .includes(rating.toLowerCase());

  if (!hasCustomer) {
    const message = "Customer Name not found in Copied Data";
    setValidationResult(message);
    return message;
  }

  if (!hasRating) {
    const message = "Rating not found in Copied Data";
    setValidationResult(message);
    return message;
  }

  setValidationResult("Validation Successful");
  return true;
  };
  const emptyUoaRows = [
    { ID:"", sample_uoa: "", focyear_uoa: "", chargeunit_uoa: "" },
  ];

  const emptySdaRows = [
    {ID:"", sample_sda: "", focyear_sda: "", chargeunit_sda: "" },
  ];
  const business = "marine"; // TODO: make dynamic if needed
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [tab]);

  // ---------------- EXPOSE METHODS ----------------
  useImperativeHandle(ref, () => ({
    open: () => setOpenModal(true),
    close: () => setOpenModal(false)
  }));
  const goToTab = (index) => {
    setTab(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Field Array (table data) casetype==="Modify existing UOA offer for vessel"
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tableData"
    // name: casetype === "Modify existing UOA offer for vessel" ?"tableData" : ""
  });
    // ---------------- HELPERS ----------------
  const createEmptyRow = () =>
    vesselColumns.reduce((acc, col) => {
      acc[col.field] = "";
      return acc;
    }, {});
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
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const d = parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    // return `${day}/${month}/${year}`;
    return `${year}${month}${day}`;
  };

  // const toDateInputValue = (value) => {
  //   if (!value) return Marine_initialValues.effective_date;
  //   const parsed = new Date(value);
  //   return Number.isNaN(parsed.getTime())
  //     ? Marine_initialValues.effective_date
  //     : parsed.toISOString().split("T")[0];
  // };

  const safeString = (value) =>
    value === undefined || value === null ? "" : String(value);

  const normalizeBooleanValue = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "y", "1"].includes(normalized)) return true;
      if (["false", "no", "n", "0"].includes(normalized)) return false;
    }
    return "";
  };

  const normalizeYesNo = (value) => {
    if (typeof value === "boolean") return value ? "yes" : "no";
    if (typeof value === "number") return value !== 0 ? "yes" : "no";
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "y", "1"].includes(normalized)) return "yes";
      if (["false", "no", "n", "0"].includes(normalized)) return "no";
    }
    return "";
  };

  const contains = (value, array) => {
    if (!array || !Array.isArray(array)) return false;
    return array.some(item => {
      if (typeof item === "object" && item !== null && "label" in item) {
        return item.label === value || item.value === value;
      }
      return item === value;
    });
  };

  const getCompanyAssetIdValue = (record) => {
    if (!record || typeof record !== "object") return null;

    const rawValue = safeString(record?.companyAssetID ?? record?.CompanyAssetID);
    if (rawValue.trim() === "") return null;

    const numericValue = Number(rawValue);
    return Number.isNaN(numericValue) ? null : numericValue;
  };

  const filterRecordsByPricingPolicy = (records, pricingPolicyValue, caseType = "") => {
    if (!Array.isArray(records) || records.length === 0) return [];

    const normalizedPolicy = safeString(pricingPolicyValue).trim().toUpperCase();
    const normalizedCaseType = safeString(caseType).trim();
    const isVesselCase = [
      "UOA offer for new vessel",
      "Modify existing UOA offer for vessel",
    ].includes(normalizedCaseType);

    if (normalizedPolicy === "CUSTOMER LEVEL" || normalizedPolicy === "CUSTOMERLEVEL") {
      if (isVesselCase) {
        if (normalizedCaseType === "UOA offer for new vessel") {
          return records.filter((record) => getCompanyAssetIdValue(record) === 0);
        }

        return records.filter((record) => {
          const assetIdValue = getCompanyAssetIdValue(record);
          return assetIdValue !== null && assetIdValue !== 0 && hasVesselData(record);
        });
      }

      return records.filter((record) => getCompanyAssetIdValue(record) === 0);
    }

    if (normalizedPolicy === "VESSEL LEVEL" || normalizedPolicy === "VESSELLEVEL") {
      return records.filter((record) => {
        const assetIdValue = getCompanyAssetIdValue(record);
        return assetIdValue !== null && assetIdValue !== 0 && hasVesselData(record);
      });
    }

    return records;
  };

  const mapAssetRecordToVesselRow = (record, index = 0) => {
    const companyAssetID = safeString(record?.companyAssetID || record?.CompanyAssetID);
    return {
      id:
        companyAssetID ||
        safeString(record?.id || record?.ID) ||
        `${safeString(record?.vessel_sap_id || record?.vessel_sap_Id || "")}-${index}`,
      companyAssetID,
      newvesselname: safeString(record?.vessel_name || record?.newvesselname),
      vessel_sap_Id: safeString(record?.vessel_sap_id || record?.vessel_sap_Id),
      imolrnno: safeString(record?.imo_number || record?.imolrnno),
      oldvesselname: safeString(record?.oldvesselname),
      addchangedelete: safeString(record?.addchangedelete),
      spotvessel: safeString(record?.spotvessel),
      vesseltype: safeString(record?.vesseltype),
      eac: safeString(record?.eac),
      rebateinvestment: safeString(record?.rebateinvestment),
    };
  };

  const buildVesselRowsFromAssetData = (records, selectedCompanyAssetID = "") => {
    if (!Array.isArray(records) || records.length === 0) return [];

    const selectedId = safeString(selectedCompanyAssetID);
    const filtered = selectedId
      ? records.filter(
          (item) =>
            safeString(item?.companyAssetID || item?.CompanyAssetID) === selectedId
        )
      : records;

    const uniqueRows = [];
    const seenKeys = new Set();

    filtered.forEach((item, index) => {
      const assetId = safeString(item?.companyAssetID || item?.CompanyAssetID);
      const fallbackKey = `${safeString(item?.vessel_sap_id || item?.vessel_sap_Id)}|${safeString(item?.imo_number || item?.imolrnno)}|${safeString(item?.vessel_name || item?.newvesselname)}`;
      const uniqueKey = assetId || fallbackKey || `${index}`;

      if (seenKeys.has(uniqueKey)) return;
      seenKeys.add(uniqueKey);
      uniqueRows.push(mapAssetRecordToVesselRow(item, index));
    });

    return uniqueRows;
  };

  const hasVesselData = (record) => {
    if (!record || typeof record !== "object") return false;
    return Boolean(
      safeString(record.vessel_name || record.newvesselname) ||
        safeString(record.vessel_sap_id || record.vessel_sap_Id) ||
        safeString(record.imo_number || record.imolrnno)
    );
  };

  const buildSamplesFromScopedRecords = (records, requireVesselData) => {
    if (!Array.isArray(records) || records.length === 0) {
      return {
        uoaSamples: Array.isArray(Marine_initialValues.uoaSamples)
          ? [...Marine_initialValues.uoaSamples]
          : [{ sample_uoa: "", focyear_uoa: "", chargeunit_uoa: "" }],
        sdaSamples: Array.isArray(Marine_initialValues.sdaSamples)
          ? [...Marine_initialValues.sdaSamples]
          : [{ sample_sda: "", focyear_sda: "", chargeunit_sda: "" }],
      };
    }

    const scopedRecords = records.filter((record) =>
      requireVesselData ? hasVesselData(record) : !hasVesselData(record)
    );

    const mappedUoas = scopedRecords
      .map((rec) => {
        const sample_uoa = safeString(
          rec.sample_uoa || rec.service_offer_Band || rec.Band
        );
        return {
            ID: safeString(rec.ID || rec.id || rec.companyID || ""),
          sample_uoa,
          focyear_uoa: safeString(rec.focyear_uoa || rec.foc || rec.FOC),
          chargeunit_uoa: safeString(rec.chargeunit_uoa || rec.price || rec.Price),
        };
      })
      .filter(
        (it) =>
          safeString(it.sample_uoa).trim() !== "" &&
          contains(it.sample_uoa, includeuoaoffer? opt_service_desc:opt_offer_list_newUOA)
      );

    const mappedSdas = scopedRecords
      .map((rec) => {
        const sample_sda = safeString(
          rec.sample_sda || rec.sdaservicedescription || rec.service_offer_Band || rec.Band
        );
        return {
            ID: safeString(rec.ID || rec.id || rec.companyID || ""),
          sample_sda,
          focyear_sda: safeString(rec.focyear_sda || rec.foc || rec.FOC),
          chargeunit_sda: safeString(rec.chargeunit_sda || rec.price || rec.Price),
        };
      })
      .filter(
        (it) =>
          safeString(it.sample_sda).trim() !== "" &&
          contains(it.sample_sda,includeuoaoffer? opt_sda_samples:opt_offer_list_newSDA)
      );

    return {
      uoaSamples:
        mappedUoas.length >= 0
          ? mappedUoas
          : Array.isArray(Marine_initialValues.uoaSamples)
          ? [...Marine_initialValues.uoaSamples]
          : [{ sample_uoa: "", focyear_uoa: "", chargeunit_uoa: "" }],
      sdaSamples:
        mappedSdas.length >= 0
          ? mappedSdas
          : Array.isArray(Marine_initialValues.sdaSamples)
          ? [...Marine_initialValues.sdaSamples]
          : [{ sample_sda: "", focyear_sda: "", chargeunit_sda: "" }],
    };
  };

  const normalizeBooleanOption = (value) => {
    const bool = normalizeBooleanValue(value);
    return bool === "" ? "" : bool;
  };

  const runWithLoading = async (callback, message = "Loading...") => {
    setIsActionLoading(true);
    setActionMessage(message);

    try {
      return await callback();
    } finally {
      setIsActionLoading(false);
      setActionMessage("");
    }
  };

  // ---------------- HANDLERS ----------------
  const handleAdd = () => {
    setSelectedRowIndex(null);
    setOpenModal(true);
  };

  const handleAddWithLoading = () =>
    runWithLoading(() => {
      handleAdd();
    }, "Opening ERP form...");

  const handleEditRow = (row) => {
    const rowIndex = MappedData.findIndex((item) => item.id === row.id);
    setSelectedRowIndex(rowIndex === -1 ? null : rowIndex);
    setEditingRow(row);
    setTab(0);
    reset(mapRowToForm(row));
    setOpenModal(true);
  };
  const handleAddRow = () => {
      append(createEmptyRow());
  };
  const handleFetchCustomerList = async (CompanySearch) => {
    try {
      const payload={
        CompanySearch:CompanySearch
      }
      console.log("Fetching Customer List:", payload);

      const res = await FetchCustomerList(payload);

      console.log("Customer List Response:", res);

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
      console.error("Error fetching customer list:", error);
    }
  };
  const handlecompanyselection = async (selectedId) => {
    const payload = { CompanyID: selectedId }
    
    try {
      console.log("Selected ID:", payload);

      const custres = await GetMarineManualERPFormData(payload);
      console.log("Customer Data Response:", custres.data);

      const tableData = Array.isArray(custres.data)
        ? custres.data
        : Array.isArray(custres.data?.data)
        ? custres.data.data
        : [];

      const customer = tableData[0] || {};

      if (tableData.length > 0) {
        const uoaSamples =
          Array.isArray(customer.uoaSamples) && customer.uoaSamples.length > 0
            ? customer.uoaSamples.map((item) => ({
                ID: safeString(item.ID || item.id || item.companyID || ""),
                sample_uoa: safeString(item.service_offer_Band || item.sample_uoa),
                focyear_uoa: safeString(item.foc || item.focyear_uoa),
                chargeunit_uoa: safeString(item.price || item.chargeunit_uoa),
              }))
            : Marine_initialValues.uoaSamples;

        const sdaSamples =
          Array.isArray(customer.sdaSamples) && customer.sdaSamples.length > 0
            ? customer.sdaSamples.map((item) => ({
                ID: safeString(item.ID || item.id || item.companyID || ""),
                sample_sda: safeString(item.service_offer_Band || item.sample_sda),
                focyear_sda: safeString(item.foc || item.focyear_sda),
                chargeunit_sda: safeString(item.price || item.chargeunit_sda),
              }))
            : Marine_initialValues.sdaSamples;

        reset({
          ...Marine_initialValues,
          uoaSamples,
          sdaSamples,
        });
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };
  const handleClose = () => {
    setWarningMessage("");
    setOpenModal(false);
  };

  const handlesearchcustomerID = async (CompanySearch) => {
    if (!CompanySearch) return;

    try {
      const payload = { CompanyID: CompanySearch };
      const resp = await GetMarineManualERPFormData(payload);

      console.log("Customer Data Response:", resp?.data);
      const tableData = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp?.data?.data)
        ? resp.data.data
        : [];

      if (tableData.length === 0) {
        setAssetrespdata([]);
        setWarningMessage("No customer data found for the provided Company ID.");
        return;
      }

      setWarningMessage("");
      const customer = tableData[0] || {};
      const retrievedDiscount = safeString(customer.discount || customer.Discount || "");
      const pricingPolicyValue = safeString(
        customer.pricingpolicy ||
          customer.PricingPolicy ||
          customer.pricingPolicy ||
          customer.sdapricingpolicy ||
          customer.SDAPricingPolicy ||
          customer.sdaPricingPolicy
      );
      const effectiveCaseType = safeString(casetype) || safeString(customer.casetype);
      const scopedRecords = filterRecordsByPricingPolicy(
        tableData,
        pricingPolicyValue,
        effectiveCaseType
      );

      setAssetrespdata(scopedRecords);
      const vesselRowsFromAssets = buildVesselRowsFromAssetData(scopedRecords);

      const findFirstDefinedValue = (rows, keys) => {
        const searchKeys = Array.isArray(keys) ? keys : [keys];
        for (const row of rows) {
          if (!row || typeof row !== "object") continue;
          for (const key of searchKeys) {
            const value = row[key];
            if (value !== undefined && value !== null && String(value).trim() !== "") {
              return safeString(value);
            }
          }
        }
        return "";
      };

      const frequencyValue = findFirstDefinedValue(tableData, ["frequency", "Frequency"]);
      const serviceBandCurrencyValue = findFirstDefinedValue(tableData, ["service_band_currency", "currency", "service_band_currency"]);
      const tseOwnerValue = findFirstDefinedValue(tableData, ["tse_owner", "TSE_owner", "tseOwner"]);

      console.log("Customer Response:", customer);

      const sourceRecords = scopedRecords;
      let uoaSamples = Array.isArray(Marine_initialValues.uoaSamples)
        ? [...Marine_initialValues.uoaSamples]
        : [{ sample_uoa: "", focyear_uoa: "", chargeunit_uoa: "" }];
      let sdaSamples = Array.isArray(Marine_initialValues.sdaSamples)
        ? [...Marine_initialValues.sdaSamples]
        : [{ sample_sda: "", focyear_sda: "", chargeunit_sda: "" }];

      const customerLevelCases = [
        "UOA Old offer for newly created customer",
        "Modifying existing UOA offer for customer",
      ];
      const vesselLevelCases = ["UOA offer for new vessel"];
      const vesselLevelCasesModify = ["Modify existing UOA offer for vessel"];

      if (customerLevelCases.includes(effectiveCaseType)) {
        const customerScopedSamples = buildSamplesFromScopedRecords(sourceRecords, false);
        uoaSamples = customerScopedSamples.uoaSamples;
        sdaSamples = customerScopedSamples.sdaSamples;
      } else if (vesselLevelCases.includes(effectiveCaseType)) {
        const zeroAssetRecords = sourceRecords.filter(
          (record) => getCompanyAssetIdValue(record) === 0
        );
        const recordsForSamples = zeroAssetRecords.length > 0 ? zeroAssetRecords : sourceRecords;
        const customerScopedSamples = buildSamplesFromScopedRecords(recordsForSamples, false);
        uoaSamples = customerScopedSamples.uoaSamples;
        sdaSamples = customerScopedSamples.sdaSamples;
      } else if (vesselLevelCasesModify.includes(effectiveCaseType)) {
        const selectedAssetId = safeString(
          getValues("assetname") || getValues("selectedassetId")
        );
        const assetMatchedRecords = selectedAssetId
          ? sourceRecords.filter(
              (item) =>
                safeString(item.companyAssetID || item.CompanyAssetID) === selectedAssetId
            )
          : sourceRecords;
        const vesselScopedSamples = buildSamplesFromScopedRecords(
          assetMatchedRecords,
          true
        );
        uoaSamples = vesselScopedSamples.uoaSamples;
        sdaSamples = vesselScopedSamples.sdaSamples;
      } else if (Array.isArray(sourceRecords) && sourceRecords.length >= 0) {
        const mappedUoas = sourceRecords
          .map((rec) => {
            const band = rec.service_offer_Band || rec.Band || rec.sample_uoa || "";
            return {
              band: safeString(band),
              ID: safeString(rec.ID || rec.id || rec.companyID || ""),
              sample_uoa: safeString(band),
              focyear_uoa: safeString(rec.foc || rec.FOC || rec.focyear_uoa),
              chargeunit_uoa: safeString(rec.price || rec.Price || rec.chargeunit_uoa),
            };
          })
          .filter((it) => contains(it.band, includeuoaoffer ? opt_service_desc : opt_offer_list_newUOA) && safeString(it.sample_uoa).trim() !== "")
          .map(({ ID, sample_uoa, focyear_uoa, chargeunit_uoa }) => ({ ID, sample_uoa, focyear_uoa, chargeunit_uoa }));

        const mappedSdas = sourceRecords
          .map((rec) => {
            const band = rec.service_offer_Band || rec.Band || rec.sample_sda || "";
            return {
              band: safeString(band),
              ID: safeString(rec.ID || rec.id || rec.companyID || ""),
              sample_sda: safeString(band),
              focyear_sda: safeString(rec.foc || rec.FOC || rec.focyear_sda),
              chargeunit_sda: safeString(rec.price || rec.Price || rec.chargeunit_sda),
            };
          })
          .filter((it) => contains(it.band, includeuoaoffer ? opt_service_desc : opt_offer_list_newSDA) && safeString(it.sample_sda).trim() !== "")
          .map(({ ID, sample_sda, focyear_sda, chargeunit_sda }) => ({ ID, sample_sda, focyear_sda, chargeunit_sda }));

        uoaSamples = mappedUoas;
        sdaSamples = mappedSdas;
      }
      setValue("strDiscount", retrievedDiscount);
      setValue("marineerpdiscount", retrievedDiscount);
      console.log("discount retrived from form:", getValues("strDiscount"));
      reset({
        ...Marine_initialValues,
        accountname: safeString(customer.accountname) || "",
        amendmodifytechnicaloffer: safeString(customer.agreementchange || customer.amendmodifytechnicaloffer) || "",
        approvalattachments: normalizeYesNo(customer.approvalattachments) || "",
        approved_by: safeString(customer.approved_by) || "",
        approvedby_secondary: safeString(customer.approvedby_secondary) || "",
        approvedcreditlimit: safeString(customer.approvedcreditlimit)||0,
        bankaccntnumber: safeString(customer.bankaccntnumber)||0,
        bankingname: safeString(customer.bankname)||"",
        banksortcode: safeString(customer.banksortcode) || "",
        beneficiary: safeString(customer.beneficiary) || "",
        billtoparty: normalizeYesNo(customer.billtoparty) || "",
        cabmnmc: safeString(customer.cabmnmc) || "",
        cabmnmc_soldtoid: safeString(customer.cabmnmc_soldtoid) ||0,
        casetype: safeString(casetype) || safeString(customer.casetype) || "",
        chargemodel: safeString(customer.chargemodel) || "",
        CompanyID: safeString(customer.companyID) ||0,
        contract_status: safeString(customer.contract_status) || "",
        contracted_date: safeString(customer.contracted_date) || "",
        creditapprovalchange: normalizeYesNo(customer.creditapprovalchange)||"",
        creditapprovalnumber: safeString(customer.creditapprovalnumber) || "",
        creditreleasedate: toDateInputValue(customer.creditreleasedate) || "",
        currency: safeString(customer.currency) || "",
        cust_name: safeString(customer.cust_name),
        custaccountname: safeString(customer.custaccountname) || "",
        custacctmnmc: safeString(customer.custacctmnmc) || "",
        custdetailschange: normalizeYesNo(customer.custdetailschanghe || customer.custdetailschange) || "",
        custometaccountmnmc: safeString(customer.custometaccountmnmc) || "",
        cabmnmc_soldtoid: safeString(customer.cabmnmc_soldtoid) || "",
        data_source: safeString(customer.data_source) || "",
        daysfrom: safeString(customer.daysfrom) || "",
        directtocustomer: normalizeBooleanOption(customer.directtocustomer) || "",
        Discount: safeString(customer.discount) || "",
        doc_num: safeString(customer.doc_num) || "",
        documentpreparedby: safeString(customer.documentpreparedby) || "",
        domestic: normalizeBooleanOption(customer.domestic) || false,
        effectivatedateratechange: toDateInputValue(customer.effectivatedateratechange) || "",
        effective_date: toDateInputValue(customer.contracted_date || customer.effective_date) || "",
        erp_system: safeString(customer.erp_system) ,
        extrainvoiceaddress: safeString(customer.extrainvoiceaddress) || "",
        faxnumber: safeString(customer.faxnumber) || "",
        FOC: safeString(customer.foc) || "",
        focyear_sda: safeString(customer.focyear_sda || customer.frequency) || "",
        GME_Country: safeString(customer.gmE_Country) || "",
        GME_Region: safeString(customer.gmE_Region) || "",
        iciscustomer: normalizeBooleanOption(customer.iciscustomer) || false,
        icisrate: safeString(customer.icisrate) || 0,
        imo_number: safeString(customer.imo_number) || "",
        includeuoaoffer: normalizeBooleanOption(customer.includeuoaoffer) || "",
        international: safeString(customer.international) || false,
        investmentapprovedby: safeString(customer.investmentapprovedby) || "",
        investmentdeatils: safeString(customer.investmentdeatils) || "",
        investmentrequired: normalizeBooleanOption(customer.investmentrequired) || false,
        invoicepoint_city: safeString(customer.invoicepoint_city) || "",
        invoicepoint_country: safeString(customer.invoicepoint_country) || "",
        invoicepoint_postcode: safeString(customer.invoicepoint_postcode) || "",
        invoicepoint_street2: safeString(customer.invoicepoint_street2) || "",
        invoicepoint_street3: safeString(customer.invoicepoint_street3) || "",
        invoicepoint_street4: safeString(customer.invoicepoint_street4) || "",
        invoicepoint_streetno: safeString(customer.invoicepoint_streetno) || "",
        invoicepointmnmc: safeString(customer.invoicepointmnmc) || "",
        invoicepointname: safeString(customer.invoicepointname) || "",
        invoicing_Type: safeString(customer.invoicing_Type) || "",
        localinternational: customer.localinternational?.toLowerCase() || "",
        name1: safeString(customer.name1) || "",
        name2: safeString(customer.name2) || "",
        name3: safeString(customer.name3) || "",
        name4: safeString(customer.name4) || "",
        netcasenumber: safeString(customer.netcasenumber) || "",
        newaccountsetup: normalizeBooleanOption(customer.newaccountsetup) || false,
        newvesselsetup: normalizeBooleanOption(customer.newvesselsetup) || "",
        offer_at_vessel_level: normalizeBooleanOption(customer.offer_at_vessel_level) || "",
        offer_band: safeString(customer.offer_band || customer.servicedescription) || "",
        originaldrn: normalizeYesNo(customer.originaldrn) || "",
        otherpaymentterm: safeString(customer.otherpaymentterm) || "",
        otherroute: safeString(customer.otherroute) || "",
        paymentmethod: safeString(customer.paymentmethod) || "",
        paymentterm: safeString(customer.paymentterm) || "",
        pdfinvoceemail: safeString(customer.pdfinvoceemail) || "",
        Price: safeString(customer.price) || "",
        pricelisttoapply: safeString(customer.pricelisttoapply) || "",
        printerlocation: safeString(customer.printerlocation) || "",
        printername: safeString(customer.printername) || "",
        priority: normalizeYesNo(customer.priority) || "",
        purou: safeString(customer.purou) || "",
        rebateattachments: safeString(customer.rebateattachments) || "",
        rebatechange: safeString(customer.rebatechange) || "",
        rebatedetails: safeString(customer.rebatedetails) || "",
        rebaterequired: normalizeBooleanOption(customer.rebaterequired) || false,
        referencerequired: safeString(customer.referencerequired) || "",
        regionalmanager: normalizeYesNo(customer.regionalmanager) || "",
        registered_city: safeString(customer.registered_city) || "",
        registered_country: safeString(customer.registered_country) || "",
        registered_postcode: safeString(customer.registered_postcode) || "",
        registered_street2: safeString(customer.registered_street2) || "",
        registered_street3: safeString(customer.registered_street3) || "",
        registered_streetno: safeString(customer.registered_streetno) || "",
        remarks: safeString(customer.remarks) || "",
        requsted_by: safeString(customer.requsted_by) || "",
        residencetownofbank: safeString(customer.residencetownofbank) || "",
        sales_Country: safeString(customer.sales_Country) || "",
        sales_Region: safeString(customer.sales_Region) || "",
        salesaccounttype: safeString(customer.salesaccounttype) || "",
        service_band_currency: safeString(customer.service_band_currency) || "",
        setuptype: normalizeYesNo(customer.setuptype) || "",
        soldto_city: safeString(customer.soldto_city) || "",
        soldtoname: safeString(customer.soldtoname) || "",
        swiftcode: safeString(customer.swiftcode) || "",
        taxcontractsignoff: normalizeYesNo(customer.taxcontractsignoff) || "",
        tse_owner: safeString(customer.tse_owner) || "",
        typeofcustomer: safeString(customer.typeofcustomer) || "",
        vatregno: safeString(customer.vatregno) || "",
        vessel_name: safeString(customer.vessel_name) || "",
        vessel_sap_id: safeString(customer.vessel_sap_id) || "",
        Band: safeString(customer.Band) || "",
        chargeunit_sda: safeString(customer.chargeunit_sda) || "",
        chargeunit_uoa: safeString(customer.chargeunit_uoa) || "",
        CompanyAssetID: safeString(customer.CompanyAssetID) || "",
        companysearch: safeString(CompanySearch) || "",
        Creditapprovedby: safeString(customer.Creditapprovedby) || "",
        Custaccountname: safeString(customer.Custaccountname) || "",
        focyear_uoa: safeString(customer.focyear_uoa) || "",
        Frequency: safeString(customer.Frequency) || "",
        localinternationalvalue: safeString(customer.localinternationalvalue) || "",
        marineerpsystemtype: safeString(customer.marineerpsystemtype || customer.erp_system) || "",
        offerforexistingvessel: safeString(customer.offerforexistingvessel) || "",
        offerfornewvessel: safeString(customer.offerfornewvessel) || "",
        prepaidsamlebottlepack: normalizeYesNo(customer.prepaidsamlebottlepack) || "",
        Pricingdetailsapprovedby: safeString(customer.Pricingdetailsapprovedby) || "",

        pricingpolicy: safeString(
          customer.pricingpolicy || customer.PricingPolicy || customer.pricingPolicy
        ),
        sdapricingpolicy: safeString(
          customer.sdapricingpolicy || customer.SDAPricingPolicy || customer.sdaPricingPolicy || customer.pricingpolicy || customer.PricingPolicy || customer.pricingPolicy
        ),
        sdaFocType: safeString(customer.sdaFocType),
        sdachargeunit: safeString(customer.sdachargeunit),
        sdaservicedescription: safeString(customer.sdaservicedescription),
        sdaofferinclude: normalizeYesNo(customer.sdaofferinclude),
        uoainvoicingfrwequency: frequencyValue,
        uoacurrency: serviceBandCurrencyValue,
        tsenameemail: tseOwnerValue,
        strDiscount: retrievedDiscount,
        marineerpdiscount: retrievedDiscount,
          tableData:
            vesselRowsFromAssets.length > 0
              ? vesselRowsFromAssets
              : scopedRecords.length > 0
              ? []
              : Array.isArray(customer.tableData)
              ? customer.tableData
              : Marine_initialValues.tableData,
        uoaSamples,
        sdaSamples,
      });
      setValue("SelectedCustomerID", CompanySearch);
    } catch (error) {
      console.error("Error searching customer:", error);
      setAssetrespdata([]);
      setWarningMessage("Failed to load customer data. Please try again.");
    }
  };

  const handleSelectAssetChange = (selectedOption) => {
    const selectedAsset = Assetrespdata?.find(
      (item) => safeString(item.companyAssetID || item.CompanyAssetID) === safeString(selectedOption)
    );

    const selectedAssetRows = buildVesselRowsFromAssetData(Assetrespdata, selectedOption);
    const selectedAssetRecords = (Assetrespdata || []).filter(
      (item) =>
        safeString(item.companyAssetID || item.CompanyAssetID) ===
        safeString(selectedOption)
    );
    const vesselBasedSamples = buildSamplesFromScopedRecords(selectedAssetRecords, true);

    const selectedAssetName = selectedAsset?.asset_name || "";
    console.log(selectedOption);
    console.log(selectedAssetName);
    // setValue("assetname", selectedOption?.asset_name || "");
    setValue("selectedassetId", selectedOption || "");
    setValue(
      "tableData",
      selectedAssetRows.length > 0 ? selectedAssetRows : Marine_initialValues.tableData
    );
    if (safeString(casetype) === "Modify existing UOA offer for vessel") {
      setValue("uoaSamples", vesselBasedSamples.uoaSamples);
      setValue("sdaSamples", vesselBasedSamples.sdaSamples);
    }
    // setValue("shipto_legal_entity", selectedAssetName || "");
    // setValue("shiptono", selectedOption.asset_shipto_id || 0);
    
  };

  // If CompanyID is present in the query string, load that customer on mount
  const location = useLocation();
  useEffect(() => {
    // handlegetmarinedata();
    const loadAndOpen = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const companyId =
          params.get("CompanyID") ||
          params.get("CompanyId") ||
          params.get("companyID") ||
          params.get("companyId");

        if (companyId) {
          await handlesearchcustomerID(companyId);
          setOpenModal(true);
        }
      } catch (err) {
        console.error("Failed to parse CompanyID from URL:", err);
      }
    };

    loadAndOpen();
  }, [location.search]);
  const handlegetmarinedata = async (CompName) => {
    const payload={
      cust_name:CompName
    }

    try {
      console.log("Fetching marine data for:", );

      const res = await GetMarineManualERPFormData(payload);

      console.log("API response:", res);
      const tableData = Array.isArray(res)
        ? res
        : res?.data || [];

      console.log("response Data",res.cabmnmc_soldtoid);
      const updatedMappedData = tableData.map((data) => ({
        companyID: data.companyID || "",
        cust_name: data.cust_name || "",
        cabmnmc_soldtoid: data.cabmnmc_soldtoid || "",
        erp_system: data.erp_system || "",
        vessel_name: data.vessel_name || "",
        vessel_sap_id: data.vessel_sap_id || "",
        imo_number: data.imo_number || "",
        tse_owner: data.tse_owner || "",
        contract_status: data.contract_status || "",
        contracted_date: data.contracted_date || "",
        gmE_Region: data.gmE_Region || "",
        gmE_Country: data.gmE_Country || "",
        sales_Region: data.sales_Region || "",
        sales_Country: data.sales_Country || "",
        currency: data.currency || "",
        business: data.business || "",
        invoicing_Type: data.invoicing_Type || "",
        offer_at_vessel_level: data.offer_at_vessel_level || "",
        Frequency: data.frequency || "",
        offer_band: data.service_offer_Band || "",
        foc: data.foc || "",
        price: data.price || "",
    }));

    setMappedData(updatedMappedData);

    } catch (err) {
      console.error(err);
      alert("Failed to fetch marine data");
    }
  };
  const handleClear = () => {
    reset(Marine_initialValues);
    setSelectedRowIndex(null);
    setTab(0);
    console.log("Form cleared");
  };

  const handleClearUoa = () => {
    replaceUoa([...emptyUoaRows]);
  };

  const handleClearSda = () => {
    replaceSda([...emptySdaRows]);
  };

  const refreshSamplesByCaseType = (caseTypeValue) => {
    const sourceRecords = Array.isArray(Assetrespdata) ? Assetrespdata : [];
    const nextCaseType = safeString(caseTypeValue);

    const defaultUoaRows = Array.isArray(Marine_initialValues.uoaSamples)
      ? [...Marine_initialValues.uoaSamples]
      : [...emptyUoaRows];
    const defaultSdaRows = Array.isArray(Marine_initialValues.sdaSamples)
      ? [...Marine_initialValues.sdaSamples]
      : [...emptySdaRows];

    // Always clear first when case/vessel type changes.
    replaceUoa([...defaultUoaRows]);
    replaceSda([...defaultSdaRows]);

    if (sourceRecords.length === 0) return;

    const customerLevelCases = [
      "UOA Old offer for newly created customer",
      "Modifying existing UOA offer for customer",
    ];
    const vesselLevelCases = [
      "UOA offer for new vessel",
      "Modify existing UOA offer for vessel",
    ];

    if (customerLevelCases.includes(nextCaseType)) {
      const customerScopedSamples = buildSamplesFromScopedRecords(sourceRecords, false);
      replaceUoa([...customerScopedSamples.uoaSamples]);
      replaceSda([...customerScopedSamples.sdaSamples]);
      return;
    }

    if (vesselLevelCases.includes(nextCaseType)) {
      if (nextCaseType === "UOA offer for new vessel") {
        const zeroAssetRecords = sourceRecords.filter(
          (record) => getCompanyAssetIdValue(record) === 0
        );
        const recordsForSamples = zeroAssetRecords.length > 0 ? zeroAssetRecords : sourceRecords;
        const vesselScopedSamples = buildSamplesFromScopedRecords(recordsForSamples, false);
        replaceUoa([...vesselScopedSamples.uoaSamples]);
        replaceSda([...vesselScopedSamples.sdaSamples]);
        return;
      }

      const selectedAssetId = safeString(getValues("assetname") || getValues("selectedassetId"));
      const assetMatchedRecords = selectedAssetId
        ? sourceRecords.filter(
            (item) =>
              safeString(item.companyAssetID || item.CompanyAssetID) === selectedAssetId
          )
        : sourceRecords;
      const vesselScopedSamples = buildSamplesFromScopedRecords(assetMatchedRecords, true);
      replaceUoa([...vesselScopedSamples.uoaSamples]);
      replaceSda([...vesselScopedSamples.sdaSamples]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendSubmitEmail = async (responseOrCompanyId,  attachmentFiles = []) => {
    const CompanyID =responseOrCompanyId;
    // Billing address (Invoice point or Bill-to) Setup request for soldname /SOL1234/,  /v1234/ ERP72RI594H
    const randomCode =
    `${Math.floor(Math.random() * 90) + 10}${String.fromCharCode(Math.floor(Math.random() * 26) + 65)}${String.fromCharCode(Math.floor(Math.random() * 26) + 65)}${Math.floor(Math.random() * 900) + 100}${String.fromCharCode(Math.floor(Math.random() * 26) + 65)}`;

    console.log("random Numbers - ",randomCode);
    let emailsubject;
    if(casetype === "UOA Old offer for newly created customer" || casetype === "UOA offer for new vessel"){
      emailsubject = getValues("soldtoname") + " - " + getValues("setuptype") +  "/ ERP" + randomCode ;
    }
    // else if(casetype === "Modify existing UOA offer for vessel"){
    //   // emailsubject = getValues("priority") + " " + getValues("setuptype") + " request for soldname /SOL" + getValues("cabmnmc_soldtoid")?.trim() + "/ v" + getValues("vessel_sap_id") + "/ ERP" + randomCode ;
    //   emailsubject = getValues("priority") + " " + getValues("setuptype") + " request for soldname /SOL" + getValues("cabmnmc_soldtoid")?.trim() + "/ ERP" + randomCode ;

    // }
    else{
      emailsubject = getValues("priority") + " " + getValues("setuptype") + " request for soldname: " + getValues("soldtoname")  + " /SOL" + getValues("cabmnmc_soldtoid")?.trim() + "/ ERP" + randomCode ;
    }
    try {

      if (attachmentFiles && attachmentFiles.length > 0) {
        const formData = new FormData();

        formData.append("CompanyID", CompanyID);
        formData.append("RecipientEmail", "Sunil.mn@bp.com");
        formData.append("BusinessType", "Marine");
        formData.append("CaseType", getValues("casetype") || " ");
        formData.append("SubCaseType", getValues("amendmodifytechnicaloffer") || " ");
        formData.append("EmailSubject", emailsubject);
        formData.append("ActionDescription", getValues("setuptype") + " for customer soldname (id: SOL" + getValues("cabmnmc_soldtoid")?.trim() + ")");
        formData.append("EffectiveFrom", getValues("effective_date" ));

        attachmentFiles.forEach((file) => {
          formData.append("attachments", file);
        });

        await SendSubmitEmail(formData);
      } else {
        const formData = new FormData();

        formData.append("CompanyID", CompanyID);
        formData.append("RecipientEmail", "Sunil.mn@bp.com");
        formData.append("BusinessType", "Marine");
        formData.append("CaseType", getValues("casetype") || "N/A");
        formData.append("SubCaseType", getValues("amendmodifytechnicaloffer") || "N/A");
        formData.append("EmailSubject", emailsubject);
        formData.append("ActionDescription", getValues("setuptype") + " for customer soldname (id: SOL" + getValues("cabmnmc_soldtoid")?.trim() + ")");
        formData.append("EffectiveFrom", getValues("effective_date"));

        await SendSubmitEmail(formData);
      }
    } catch (error) {
      console.error("Error sending submit email:", error);
    }
  };
  const toDateInputValue = (value) => {
    if (!value) return Marine_initialValues.effective_date;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? Marine_initialValues.effective_date
      : parsed.toISOString().split("T")[0];
  };
  const handleSubmitForm = async (data) => {
    console.log("Form Data on Submit:", data);

    const serviceData_New = [
        ...(data.uoaSamples ?? []).map((item) => ({
          ID: item.ID || "",
          FOC: item.focyear_uoa || "",
          Price: item.chargeunit_uoa || "",
          Band: item.sample_uoa || "",
        })),
        ...(data.sdaSamples ?? []).map((item) => ({
          ID: item.ID || "",
          FOC: item.focyear_sda || "",
          Price: item.chargeunit_sda || "",
          Band: item.sample_sda || "",
        })),
      ];
      // console.log("data.tableData:", data.tableData);
      let jsonData_NewCust = [];
      if (data.tableData.length === 0) {
        jsonData_NewCust = ({
        vessel_name:  "",
        vessel_sap_id:  "",
        imo_number:  "",
        data: serviceData_New,});
      }else{
        jsonData_NewCust = (data.tableData).map((item) => ({
        vessel_name: item.newvesselname || "",
        vessel_sap_id: item.vessel_sap_Id || "",
        imo_number: item.imolrnno || "",
        data: serviceData_New,
      })); }

    console.log("Json data for new customers:",JSON.stringify(jsonData_NewCust, null, 2));
    // console.log("Json data for new customers:", JSON.stringify(jsonData_NewCust));

    const serviceData = [
      ...(data.uoaSamples ?? []).map((item) => ({
        ID: item.ID || "",
        FOC: item.focyear_uoa || "",
        Price: item.chargeunit_uoa || "",
        service_offer_Band: item.sample_uoa || "",
      })),
      ...(data.sdaSamples ?? []).map((item) => ({
        ID: item.ID || "",
        FOC: item.focyear_sda || "",
        Price: item.chargeunit_sda || "",
        service_offer_Band: item.sample_sda || "",
      })),
    ];

    const vessels =
      data.tableData?.length > 0
        ? data.tableData
        : [
            {
              newvesselname: "",
              vessel_sap_Id: "",
              imolrnno: "",
            },
          ];

    const jsonData = vessels.flatMap((vessel) =>
      serviceData.map((service) => ({
        ...service.ID && { ID: service.ID }, // Include ID only if it exists
        vessel_name: vessel.newvesselname || "",
        vessel_sap_id: vessel.vessel_sap_Id || "",
        imo_number: vessel.imolrnno || "",
        FOC: service.FOC,
        Price: service.Price,
        service_offer_Band: service.service_offer_Band,
      }))
    );

    console.log("Json data for new customers:",JSON.stringify(jsonData, null, 2));

    const invoicepointCountryParts = (data.invoicepoint_country || "").split("||").map((item) => item.trim());
    const parsedGmeCountry = invoicepointCountryParts[0] || "";
    const parsedGmeRegion = invoicepointCountryParts[1]
      ? invoicepointCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
      : "";

    const registeredCountryParts = (data.registered_country || "").split("||").map((item) => item.trim());
    const parsedSalesCountry = registeredCountryParts[0] || "";
    const parsedSalesRegion = registeredCountryParts[1]
      ? registeredCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
      : "";
    const resolvedDiscount = safeString(
      data?.marineerpdiscount ??
      getValues("marineerpdiscount") ??
      getValues("strDiscount") ??
      data?.strDiscount ??
      data?.Discount ??
      ""
    );
    console.log("discount retrived:", resolvedDiscount);

    const payload = {
        AuditUserID: 0, // Replace with actual user ID
        jsonData: JSON.stringify(jsonData_NewCust),
        accountname: "",
        agreementchange: data.agreementchange || "",
        approvalattachments: data.approvalattachments || "",
        approved_by: data.approved_by || "",
        approvedby_secondary: data.approvedby_secondary || "",
        approvedcreditlimit: data.approvedcreditlimit || 0,
        bankaccntnumber: data.bankaccntnumber || "",
        bankname: data.bankingname || "",
        banksortcode: data.banksortcode || "",
        beneficiary: data.beneficiary || "",
        billtoparty: data.billtoparty || "",
        business: "Marine" || "",
        cabmnmc: data.cabmnmc || "",
        cabmnmc_soldtoid: data.cabmnmc_soldtoid || "",
        CaseType: data.casetype,
        chargemodel: data.chargemodel || "",
        CompanyID:casetype ==="UOA Old offer for newly created customer"? 0: data.SelectedCustomerID || "",
        CompanyAssetID:0,
        contract_status: "Contracted" || "",
        contracted_date: formatDateDDMMYYYY(data.effective_date ||""),
        creditapprovalchange: data.creditapprovalchange  || "",
        creditapprovalnumber: data.creditapprovalnumber || "",
        creditreleasedate: formatDateDDMMYYYY(data.creditreleasedate || ""),
        currency: data.uoacurrency || "",
        cust_name: data.soldtoname ,
        custaccountname: data.Custaccountname || "",
        custacctmnmc: data.custacctmnmc || "",
        custdetailschange: data.custdetailschange || "",
        custometaccountmnmc: data.custometaccountmnmc || "",
        // data_source: "",
        daysfrom: data.daysfrom || "",
        directtocustomer: data.directtocustomer || false,
        // directtocustomer: data.directtocustomer || "",
        discount: resolvedDiscount || "",
        doc_num: data.doc_num ||"0",
        documentpreparedby: data.documentpreparedby || "",
        domestic: data.domestic || false,
        effectivatedateratechange: data.effectivatedateratechange || "",
        effective_date: formatDateDDMMYYYY(data.effective_date || ""),
        erp_system: data.marineerpsystemtype || "",
        extrainvoiceaddress: data.extrainvoiceaddress || "",
        faxnumber: data.faxnumber || "",
        Frequency: data.uoainvoicingfrwequency || "",
        GME_Country: parsedGmeCountry || "",
        GME_Region: parsedGmeRegion || "",
        iciscustomer: data.iciscustomer ||false,
        icisrate: data.icisrate||0,
        // imo_number: "",
        includeuoaoffer: data.includeuoaoffer || false,
        international: data.international=== "Yes" ? true : false ||false ,
        investmentapprovedby: data.investmentapprovedby || "",
        investmentdeatils: data.investmentdeatils || "",
        investmentrequired: data.investmentrequired || false,
        invoicepoint_city: data.invoicepoint_city || "",
        invoicepoint_country: data.invoicepoint_country || "",
        invoicepoint_postcode: data.invoicepoint_postcode || "",
        invoicepoint_street2: data.invoicepoint_street2 || "",
        invoicepoint_street3: data.invoicepoint_street3 || "",
        invoicepoint_street4: data.invoicepoint_street4 || "",
        invoicepoint_streetno: data.invoicepoint_streetno || "",
        invoicepointmnmc: data.invoicepointmnmc || "",
        invoicepointname: data.invoicepointname || "",
        // invoicing_Type: "",
        localinternational: data.localinternational ||"",
        name1: data.name1 || "",
        name2: data.name2 || "",
        name3: data.name3 || "",
        name4: data.name4 || "",
        netcasenumber: data.netcasenumber || "",
        // Nettool_doc_number: "" || "",
        newaccountsetup: data.newaccountsetup || false,
        newvesselsetup: data.newvesselsetup || false,
        offer_at_vessel_level: data.offerfornewvessel==="vesselleveluoaoffer"? true: false || false,
        offer_band: data.Band || data.servicedescription,
        originaldrn: data.originaldrn || "",
        otherpaymentterm: data.otherpaymentterm || "",
        otherroute: data.otherroute || "",
        paymentmethod: data.paymentmethod || "",
        paymentterm: data.paymentterm || "",
        pdfinvoceemail: data.pdfinvoceemail || "",
        pricelisttoapply: data.pricelisttoapply || "",
        printerlocation: data.printerlocation || "",
        printername: data.printername || "",
        priority: data.priority || "",
        purou: data.purou || "",
        rebateattachments: data.rebateattachments || "",
        rebatechange: data.rebatechange||"",
        rebatedetails: data.rebatedetails || "",
        rebaterequired: data.rebaterequired || false,
        referencerequired: data.referencerequired || "",
        regionalmanager: data.regionalmanager || "",
        registered_city: data.registered_city || "",
        registered_country: data.registered_country || "",
        registered_postcode: data.registered_postcode || "",
        registered_street2: data.registered_street2 || "",
        registered_street3: data.registered_street3 || "",
        registered_streetno: data.registered_streetno || "",
        remarks: data.remarks || "",
        requsted_by: data.requsted_by || "",
        residencetownofbank: data.residencetownofbank || "",
        sales_Country: parsedSalesCountry || "",
        sales_Region: parsedSalesRegion || "",
        service_band_currency: data.service_band_currency || "",
        // service_offer_Band: Sample_uoa || "",
        setuptype: data.setuptype || "",
        soldto_city: data.soldto_city || "",
        soldtoname: data.soldtoname || "",
        swiftcode: data.swiftcode || "",
        taxcontractsignoff: data.taxcontractsignoff || "",
        tse_owner: data.tsenameemail || "",
        typeofcustomer: data.typeofcustomer || "",
        vatregno: data.vatregno || "",
        pricingpolicy: data.pricingpolicy || "",
      };
    const contractpayload = {
      CompanyID: data.SelectedCustomerID,
      CompanyAssetID: String(data.assetname),
      Business: "MARINE",
      pricingpolicy: data.pricingpolicy || "",
    };

    console.log("Contract payload:", contractpayload);
    // console.log("Submit payload:", payload);
    const jsonpayload = {jsonData: JSON.stringify(jsonData)};

    let response;

    if (casetype ==="UOA Old offer for newly created customer" || casetype ==="UOA offer for new vessel") {
      console.log("Submitting new customer data:", payload);
      response = await SaveMarineManualERPData(payload);
      console.log("Response from SaveMarineManualERPData:", response.companyID);
      if(casetype ==="UOA offer for new vessel"){
        const emailResponse = await handleSendSubmitEmail(data.SelectedCustomerID, attachments);
      }
    }
    else if (offerforexistingvessel ==="enddateexisting") {
      response = await UpdateContractStatus(contractpayload);
      const emailresp=await handleSendSubmitEmail(data.SelectedCustomerID, attachments);
      console.log("Email Response:", emailresp);
    } 
    else {
      console.log("Updating existing customer data:", payload);
      // const saveresponse = await SaveMarineManualERPData(payload);

      const updateresponse = await UpdateMarineManualERPData(payload);
      const pricingresponse = await UpdateMarineERPDataPricingDetails(jsonpayload);
      // console.log("Response from UpdateMarineManualERPData:", updateresponse);
      console.log("Response from UpdateMarineERPDataPricingDetails:", data.SelectedCustomerID);
      const emailResponse = await handleSendSubmitEmail(data.SelectedCustomerID, attachments);
    }
    setOpenModal(false);

    handlegetmarinedata(data.soldtoname);
    reset(Marine_initialValues);
  };
  const handleDeleteRow = (index) => {
      remove(index);
  };
  const handleDropdowncchange = (e) => {
      setWarningMessage("");

      const fieldName = e?.target?.name;
      const fieldValue = e?.target?.value;

      if (fieldValue === "Frequency OLD UOA Offer" && includeuoaoffer === false) {
        setWarningMessage("This Customer belongs to New Offer");
        setValue("amendmodifytechnicaloffer","");
      }
      if (fieldValue === "Frequency New UOA Offer" && includeuoaoffer === true) {
        setWarningMessage("This Customer belongs to Old Offer");
        setValue("amendmodifytechnicaloffer","");
      }

      if (fieldValue === "Currency in OLD UOA offer" && includeuoaoffer === false) {
        setWarningMessage("This Customer belongs to New Offer");
        setValue("amendmodifytechnicaloffer","");
        
      }
      if (fieldValue === "Currency New UOA Offer" && includeuoaoffer === true) {
        setWarningMessage("This Customer belongs to Old Offer");
        setValue("amendmodifytechnicaloffer","");
      }
      if (fieldValue === "UOA Pricing options for OLD UOA offer" && includeuoaoffer === false) {
        setWarningMessage("This Customer belongs to Old Offer");
        setValue("amendmodifytechnicaloffer","");
      }
      if (fieldValue === "UOA discount for New UOA offer" && includeuoaoffer === true) {
        setWarningMessage("This Customer belongs to Old Offer");
        setValue("amendmodifytechnicaloffer","");
      }

      if (fieldName) {
        setValue(fieldName, fieldValue);
      }

      // const vesselTypeFields = ["offerfornewvessel", "offerforexistingvessel"];
      // if (fieldName && vesselTypeFields.includes(fieldName)) {
      //   refreshSamplesByCaseType(casetype);
      // }
  };
  const handlecasetypechange = (value) => {
      setValue("casetype", value);
      refreshSamplesByCaseType(value);
      const customerLevelCases = [
        "UOA Old offer for newly created customer",
        "Modifying existing UOA offer for customer",
      ];

      const vesselLevelCases = [
        "UOA offer for new vessel",
        "Modify existing UOA offer for vessel",
      ];

      if (customerLevelCases.includes(value)) {
        setValue("pricingpolicy", "CUSTOMER LEVEL");
        setValue("sdapricingpolicy", "CUSTOMER LEVEL");
      } 
      if (vesselLevelCases.includes(value)) {
        setValue("pricingpolicy", "VESSEL LEVEL");
        setValue("sdapricingpolicy", "VESSEL LEVEL");
      }

      const fieldsToReset = [
      "amendmodifytechnicaloffer",
      "offerfornewvessel",
      "offerforexistingvessel",
      "req_comments"
      ];

      fieldsToReset.forEach((field) => setValue(field, ""));
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
  }

// ---------------- UI ----------------
  return (
    <div className="container-fluid py-4 marine-form-page">

      {/* ================= PAGE HEADER ================= */}

      {isActionLoading && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3" role="status">
          <div className="spinner-border spinner-border-sm text-success" aria-hidden="true"></div>
          <span>{actionMessage || "Loading..."}</span>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="bg-white border shadow-sm rounded-5 p-4">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
              <div>
                <h2 className="fw-bold text-dark mb-1">Marine Customer Management</h2>
                <p className="text-muted mb-0">Manage customer ERP and UOA flows with a modern dashboard experience.</p>
              </div>
              <div className="d-flex flex-wrap gap-2 marine-header-actions">
                <button className="btn btn-outline-success btn-lg shadow-sm" onClick={handleAddWithLoading}>
                  <i className="bi bi-plus-circle me-2"></i> ERP Form
                </button>
                {/* <button className="btn btn-outline-success btn-lg shadow-sm" onClick={() => runWithLoading(handlegetmarinedata, "Retrieving server data...")}>
                  <i className="bi bi-arrow-repeat me-2"></i> Retrieve Server Data
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-5 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center gap-3">
                <div>
                  <p className="text-uppercase text-secondary small mb-1">Total Customers</p>
                  <h3 className="fw-bold mb-0">{mappedData?.length || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-people fs-4 text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-5 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center gap-3">
                <div>
                  <p className="text-uppercase text-secondary small mb-1">System Status</p>
                  <h5 className="fw-bold text-success mb-0">Active</h5>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-check-circle fs-4 text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-5 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center gap-3">
                <div>
                  <p className="text-uppercase text-secondary small mb-1">Last Sync</p>
                  <h6 className="fw-bold mb-0">Server Connected</h6>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-cloud-check fs-4 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-4 marine-table-card">


        <div className="card-header bg-white border-0 pt-4 pb-0 pl-10">
          <div className="col-md-5">
            <div className="border rounded-4 p-3 bg-light-subtle shadow-sm marine-search-shell">
              <Controller
                name="retriveServwerDatawithCompanyName"
                control={control}
                render={({ field }) => (
                  <MuiTextField
                    {...field}
                    fullWidth
                    label="Retrive Server Data with Company Name"
                    size="small"
                    placeholder="Enter company name"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => runWithLoading(() => handlegetmarinedata(field.value), "Retrieving server data...")}
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
                        runWithLoading(() => handlegetmarinedata(field.value), "Retrieving server data...");
                      }
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* <div className="card-header bg-white border-0 pt-4 pb-0">
          <h5 className="fw-semibold text-dark">
            Customer Records
          </h5>
        </div> */}
        <div className="card-body">
          <EditableSortable_noaction
            columns={Marine_columns}
            rowData={mappedData}
            control={control}
            onDelete={handleDeleteRow}
            onEdit={handleEditRow}
          />
        </div>

      </div>

      <ErrorMessageModel
        open={openErrorModel}
        name={rowCustname}
        status={rowStatus}
        onClose={() => setOpenErrorModel(false)}
      />

      {/* Modal */}
      <div
        className={`modal fade marine-modal ${openModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)"
        }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">

          <div className="modal-content border-0 rounded-4 shadow-lg">

            {/* Modal Header */}
            <div className="modal-header border-0 pb-0 position-relative">
              <div className="pe-5">
                {/* <span className="badge rounded-pill bg-primary mb-2">Marine ERP</span> */}
                <h4 className="modal-title fw-bold text-dark">Marine ERP Form</h4>
                <p className="text-muted small mb-0">Fill customer and UOA details for a modern, responsive submission flow.</p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-black position-absolute top-0 end-0 mt-3 me-3"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            {warningMessage && (
              <div className="alert alert-danger border-0 rounded-4 py-2 px-3 mb-0" role="alert">
                <small className="fw-semibold">{warningMessage}</small>
              </div>
            )}
            {isActionLoading && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3" role="status">
                <div className="spinner-border spinner-border-sm text-success" aria-hidden="true"></div>
                <span>{actionMessage || "Loading..."}</span>
              </div>
            )}
            <div className="modal-body px-4 py-4">
              {/* Organizational Data */}
              <Section title="Organizational Data">
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    {/* Header */}
                    <div className="row align-items-center g-4 mb-4">

                        <div className="col-lg-3 col-md-4">
                        <h6 className="fw-semibold text-secondary mb-0">
                            ERP System Update Document
                        </h6>
                        </div>

                        <div className="col-lg-3 col-md-4">
                        <FormInput
                            className="w-100"
                            name="purou"
                            control={control}
                            label="PU / ROU"
                        />
                        </div>
                        <div className="col-md-3">
                          <FormInput
                            disabled
                            name="SelectedCustomerID"
                            control={control}
                            label="Customer ID from ERP"
                          />
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <FormSelect
                              sx={{
                                  backgroundColor: getFieldColor("newaccountsetup"),
                              }}
                              name="includeuoaofferforothercustomer"
                              control={control}
                              label="Include UOA Offer"
                              options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                          />
                        </div>
                    </div>

                    {/* Requested / Approved */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            sx={{
                                backgroundColor: getFieldColor("requsted_by"),
                            }}
                            className="w-100"
                            name="requsted_by"
                            control={control}
                            label="Requested By"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            sx={{
                                "& .MuiInputBase-root": {
                                  backgroundColor: getFieldColor("approved_by"),
                                },
                            }}
                            className="w-100"
                            name="approved_by"
                            control={control}
                            label="Approved By"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            type="date"
                            name="effective_date"
                            control={control}
                            label="Effective Date dd-mm-yyyy"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="doc_num"
                            control={control}
                            label="Document No"
                        />
                        </div>

                    </div>

                    {/* Case Type */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-6 col-md-6">
                        <FormSelect
                            sx={{
                                backgroundColor: getFieldColor("casetype"),
                            }}
                            name="casetype"
                            control={control}
                            label="UOA Setup Options"
                            onChange={(e) =>
                            handlecasetypechange(e.target.value)
                            }
                            options={includeuoaofferforothercustomer===true ? opt_casetypes : [{label:"No UOA Action Required",value:"No UOA Action Required"}]}
                        />
                        </div>
                        {/* {(casetype ==="UOA offer for new vessel"||casetype ==="Modifying existing UOA offer for customer" ||casetype ==="Modify existing UOA offer for vessel" ) && ( */}
                        {casetype!=="UOA Old offer for newly created customer" && (
                        <div className="col-md-3 col-lg-3">
                          <Controller
                            name="companysearch"
                            control={control}
                            render={({ field }) => (
                              <MuiTextField
                                {...field}
                                fullWidth
                                label="Customer ID"
                                size="small"
                                placeholder="Enter customer ID"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => runWithLoading(() => handlesearchcustomerID(field.value), "Searching customer...")}
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
                                    runWithLoading(() => handlesearchcustomerID(field.value), "Searching customer...");
                                  }
                                }}
                              />
                            )}
                          />
                        </div>)}
                        {casetype ==="Modify existing UOA offer for vessel" && (
                            <>
                              <div className="col-lg-3 col-md-3">
                                <FormSelect
                                  name="assetname"
                                  control={control}
                                  label="Select Asset Name"
                                  options={
                                    Array.from(
                                      new Map(
                                        (Assetrespdata || []).map((item) => [
                                          safeString(item.companyAssetID || item.CompanyAssetID),
                                          {
                                            label: safeString(item.vessel_name || item.asset_name),
                                            value: safeString(item.companyAssetID || item.CompanyAssetID),
                                          },
                                        ])
                                      ).values()
                                    )
                                  }
                                  onChange={(e) => handleSelectAssetChange(e.target.value)}
                                />
                              </div>

                            </>
                          )}
                        {offerforexistingvessel === "ownershipchange" && (
                        <div className="col-md-3 ">
                          <Controller
                            name="companynamesearch"
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
                                        onClick={() => runWithLoading(() => handleSearchCompany(field.value), "Searching company...")}
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
                                    runWithLoading(() => handleSearchCompany(field.value), "Searching company...");
                                  }
                                }}
                              />
                            )}
                          />
                        </div>)}

                        {casetype === "Modifying existing UOA offer for customer" && (
                        <div className="col-lg-6 col-md-6">
                            <FormSelect
                            name="amendmodifytechnicaloffer"
                            control={control}
                            label="Amend / Modify Existing Technical Offer"
                            onChange={handleDropdowncchange}
                            options={opt_Marine_formFields}
                            />
                        </div>
                        )}

                        {amendmodifytechnicaloffer === "UOA discount for New UOA offer"  && (
                        <div className="col-lg-3 col-md-6">
                          <FormInput
                              // disabled={amendmodifytechnicaloffer === "UOA discount for New UOA offer"}
                              className="w-100"
                              name="marineerpdiscount"
                              control={control}
                              label="Discount"
                          />
                        </div>
                         )} 

                        {casetype === "UOA offer for new vessel" && (
                        <div className="col-lg-6 col-md-6">
                            <FormSelect
                            name="offerfornewvessel"
                            control={control}
                            label="Offer for New Vessel"
                            onChange={handleDropdowncchange}
                            options={[
                                {
                                label:
                                    "Customer level UOA offer",
                                value:
                                    "custleveluoaoffer",
                                },
                                {
                                label:
                                    "Vessel specific UOA offer",
                                value:
                                    "vesselleveluoaoffer",
                                },
                            ]}
                            />
                        </div>
                        )}

                        {casetype === "Modify existing UOA offer for vessel" && (
                          <>
                        <div className="col-lg-6 col-md-6">
                            <FormSelect
                            name="offerforexistingvessel"
                            control={control}
                            label="Offer for Existing Vessel"
                            onChange={handleDropdowncchange}
                            options={opt_uoa_offer}
                            />
                        </div>
                        <div className="col-lg-4">
                          <FormInput disabled name="selectedassetId" control={control} label="Selected Asset ID:" sx={{ width: 300 }} />
                        </div>
                                            
                        </>
                        )}
                        {offerforexistingvessel === "ownershipchange" && (
                        <>
                          <div className="col-md-3 ">
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
                                      label="Select Company"
                                      size="small"
                                      placeholder="Select or type company name"
                                      inputRef={field.ref}
                                    />
                                  )}
                                />
                              )}
                            />
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <FormInput
                                className="w-100"
                                type="date"
                                name="ownershipschangeeffectivedate"
                                control={control}
                                label="Date dd-mm-yyyy"
                            />
                          </div>
                        </>
                      )}

                    </div>

                    {/* Comments */}
                    {casetype === "No UOA Action Required" && (
                      <div className="row g-3 mb-4">
                        <div className="col-12">
                            <FormInput
                            className="w-100"
                            multiline
                            rows={3}
                            name="req_comments"
                            control={control}
                            label="Request Comments"
                            />
                        </div>
                      </div>
                    )}
                    {/* ERP Type */}
                    <div className="row g-3">

                      <div className="col-lg-3 col-md-3">
                        <FormSelect
                            sx={{
                                backgroundColor: getFieldColor("marineerpsystemtype"),
                            }}
                            name="marineerpsystemtype"
                            control={control}
                            label="ERP System Type"
                            options={[
                            {
                                label: "SAP",
                                value: "SAP",
                            },
                            {
                                label: "JDE",
                                value: "JDE",
                            },
                            ]}
                        />
                      </div>

                        <div className="col-lg-3 col-md-3">
                            <FormSelect
                                name="salesaccounttype"
                                control={control}
                                label="Sales Account Type"
                                options={[
                                {
                                    label: "New Account",
                                    value: "newaccount",
                                },
                                {
                                    label: "Existing Account",
                                    value: "existingaccount",
                                },
                                ]}
                            />
                        </div>
                        {salesAccountType === "newaccount" && (
                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            disabled
                            name="salesaccountdescription_newaccount"
                            control={control}
                            label="Domestic Sales Organization"
                            // value={"Domestic Sales Organization"}
                        />
                        </div>)}
                        {salesAccountType === "existingaccount" && (
                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            disabled
                            name="salesaccountdescription_existingaccount"
                            control={control}
                            label="GB5X"
                            // value={"GB5X"}
                        />
                        </div>)}
                    </div>

                    </div>
                </div>
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                  {marineerpsystemtype === "JDE" && (
                  <div className="row g-3 mt-3">
                    <div className="col-md-3">
                      <FormInput
                        name="cddcustname"
                        control={control}
                        label="Customer Name"
                      />
                    </div>
  
                    <div className="col-md-3">
                      <FormInput
                        name="rating"
                        control={control}
                        label="Rating"
                      />
                    </div>
                    <div className="col-md-3">
                    <Typography variant="body2" className="text-muted mt-2">
                      CDD Document Date
                    </Typography>
                    </div>
                    <div className="col-md-3">
                      <FormInput
                        name="Cdddate"
                        control={control}
                        // label="CDD Document Date"
                        type="date"
                      />
                    </div>
                    <div className="col-md-3">
                      <Button variant="contained" color="primary" onClick={validateCopiedData}>
                        Validate Data
                      </Button>
                    </div>
  
                    <div className="col-md-3 text-success">
                      {validationResult ===
                        "Validation Successful" &&
                        validationResult || "Validation failed, check Customer Name and Rating in the copied data"}
                    </div>
                  </div>)}
                  {marineerpsystemtype === "JDE" && (
                  <div className="row g-3 mt-3">
                    <div className="col-md-12">
                      <FormInput
                        sx={{ width: "100%" }}
                        multiline
                        rows={4}
                        name="cddcopieddata"
                        control={control}
                        label="Paste the CDD document email content here"
                        rules={{
                          validate: validateCopiedData
                        }}
                      />
                    </div>
                  </div>)}
                </div>
                {/* Setup Details */}
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormSelect
                            sx={{
                                backgroundColor: getFieldColor("newaccountsetup"),
                            }}
                            name="newaccountsetup"
                            control={control}
                            label="New Account Setup"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormSelect
                             sx={{
                                backgroundColor: getFieldColor("newvesselsetup"),
                            }}
                            name="newvesselsetup"
                            control={control}
                            label="New Vessel Setup"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormSelect
                            sx={{
                                backgroundColor: getFieldColor("includeuoaoffer"),
                            }}
                            name="includeuoaoffer"
                            control={control}
                            label="UOA Offer"
                            options={opt_marine_uoaoffer}
                            // options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormSelect
                            name="typeofcustomer"
                            control={control}
                            label="Type Of Customer"
                            options={[
                            {
                                label: "Indirect",
                                value: "indirect",
                            },
                            {
                                label: "Direct",
                                value: "Direct",
                            },
                            {
                                label: "JD Edwards",
                                value: "jdedwards",
                            }
                            ]}
                        />
                        </div>

                    </div>

                    {/* Notes */}
                    <div className="alert alert-warning border-0 rounded-4">
                       <p className="mb-2 small">If "New Account setup" and"New Vessel setup" are marked as"Y", ensure completion of Technical email address for SDS in the UOA system data section.</p>
                        <p className="mb-0 small"> Where any "Y" is entered above,  ensure a copy of the ERP form  is emailed to the UOA team including the customer account number. </p>
                    </div>
                  </div>
                </div>
              </Section>
              {/* {offerforexistingvessel !== "ownershipchange" && ( */}
                
              {/* Approvals */}
              {offerforexistingvessel !== "ownershipchange" && (
              <Section title="Approvals">
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    {/* First Row */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="approvedby_secondary"
                            control={control}
                            label="Approved By"
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="approvalattachments"
                            control={control}
                            label="Attachments"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="netcasenumber"
                            control={control}
                            label="NET Case Number"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="investmentapprovedby"
                            control={control}
                            label="Investment Approved By"
                        />
                        </div>

                    </div>

                    {/* Second Row */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-8 col-md-12">
                        <FormSelectSmall
                            sx={{
                                backgroundColor: getFieldColor("setuptype"),
                            }}
                            name="setuptype"
                            control={control}
                            label="Setup Type"
                            options={opt_setuptype}
                        />
                        </div>
 
                        <div className="col-lg-3 col-md-6">
                        <FormSelectSmall
                            sx={{
                                backgroundColor: getFieldColor("priority"),
                            }}
                            name="priority"
                            control={control}
                            label="Priority (Optional)"
                            options={[{label:"Rushed", value:"Rushed"}, {label:"Standard", value:"Standard"}]}
                        />
                        </div>

                    </div>

                    {/* Details */}
                    <div className="row">

                        <div className="col-12">
                        <FormInput
                            sx={{
                                backgroundColor: getFieldColor("detailsofrequest"),
                            }}
                            className="w-100"
                            multiline
                            rows={6}
                            name="detailsofrequest"
                            control={control}
                            label="Details of Request (Please provide a brief description of the amendments required)"
                        />
                        </div>

                    </div>

                    </div>
                </div>
              </Section>)}
               
              {/* Customer Details */}
              {offerforexistingvessel !== "ownershipchange" && (
              <Section title="Customer Details">
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    {/* Customer Header */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="custdetailschange"
                            control={control}
                            label="Customer Details Change"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                             sx={{
                                backgroundColor: getFieldColor("soldtoname"),
                            }}
                            className="w-100"
                            name="soldtoname"
                            control={control}
                            label="Cab / Sold-to Name"
                        />
                        </div>
                      {marineerpsystemtype === "SAP" && (
                        <div className="col-lg-4 col-md-6">
                        <FormInput
                             sx={{
                                backgroundColor: getFieldColor("cabmnmc_soldtoid"),
                            }}
                            className="w-100"
                            name="cabmnmc_soldtoid"
                            control={control}
                            label="Sold-to ID"
                        />
                        </div>
                      )}

                    </div>

                    {/* Registered Address */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Registered Address
                        </h6>
                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="registered_streetno"
                            control={control}
                            label="Street / House No"
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="registered_street2"
                            control={control}
                            label="Street 2"
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="registered_street3"
                            control={control}
                            label="Street 3"
                        />
                        </div>

                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="registered_city"
                            control={control}
                            label="City"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="registered_postcode"
                            control={control}
                            label="Postal Code"
                        />
                        </div>
                        {/* <div className="row g-3"> */}

                        <div className="col-lg-6 col-md-6">
                            <FormSelectSmall
                            name="registered_country"
                            control={control}
                            label="Country"
                            options={opt_country_with_soldtoRegion}
                            />
                        </div>

                    </div>

                    {/* Account Details
                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="custaccountname"
                            control={control}
                            label="Customer A/C Name"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="custometaccountmnmc"
                            control={control}
                            label="Customer A/C MNMC"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepointname"
                            control={control}
                            label="Invoice Point Name"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepointmnmc"
                            control={control}
                            label="Invoice Point MNMC"
                        />
                        </div>

                    </div> */}

                    {/* Invoice Point Address */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Invoice Point Address
                        </h6>
                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="name1"
                            control={control}
                            label="Name 1"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="name2"
                            control={control}
                            label="Name 2"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="name3"
                            control={control}
                            label="Name 3"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="name4"
                            control={control}
                            label="Name 4"
                        />
                        </div>

                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepoint_streetno"
                            control={control}
                            label="Street / House No"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepoint_street2"
                            control={control}
                            label="Street 2"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepoint_street3"
                            control={control}
                            label="Street 3"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepoint_street4"
                            control={control}
                            label="Street 4"
                        />
                        </div>

                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepoint_city"
                            control={control}
                            label="City"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="invoicepoint_postcode"
                            control={control}
                            label="Postal Code"
                        />
                        </div>

                        <div className="col-lg-6 col-md-6">
                        <FormSelectSmall
                            name="invoicepoint_country"
                            control={control}
                            label="Country"
                            options={opt_country_with_soldtoRegion}
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="vatregno"
                            control={control}
                            label="VAT Reg. No"
                        />
                        </div>

                    </div>

                    {/* Extra Address */}
                    <div className="row">

                        <div className="col-12">
                        <FormInput
                            className="w-100"
                            multiline
                            rows={4}
                            name="extrainvoiceaddress"
                            control={control}
                            label="Extra Invoice Address"
                        />
                        </div>

                    </div>

                    </div>
                </div>
              </Section>)}
              {/* Invoice Printing and PDF Invoicing Details */}
              {offerforexistingvessel !== "ownershipchange" && (
              <Section title="Invoice Printing and PDF Invoicing Details">

                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    {/* First Row */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="billtoparty"
                            control={control}
                            label="Bill-to Party is 3rd Party Payer?"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-2 col-md-6">
                        <FormInput
                            className="w-100"
                            name="printerlocation"
                            control={control}
                            label="Printer Location"
                        />
                        </div>

                        <div className="col-lg-2 col-md-6">
                        <FormInput
                            className="w-100"
                            name="printername"
                            control={control}
                            label="Printer Number"
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="pdfinvoceemail"
                            control={control}
                            label="PDF Invoice Email Address"
                        />
                        </div>

                    </div>

                    {/* Route Details */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="faxnumber"
                            control={control}
                            label="Fax Number"
                        />
                        </div>

                        <div className="col-lg-5 col-md-6">

                        <h6 className="fw-semibold text-black mb-2">
                            Route
                        </h6>

                        <FormSelect sx={{minWidth:150}}
                            name="directtocustomer"
                            control={control}
                            label="Direct to Customer"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}
                        />

                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="otherroute"
                            control={control}
                            label="Other (Please Specify)"
                        />
                        </div>

                    </div>

                    {/* Sign Offs */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="originaldrn"
                            control={control}
                            label="Required Original DRN"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="taxcontractsignoff"
                            control={control}
                            label="Tax Contract Sign Off"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="regionalmanager"
                            control={control}
                            label="Regional Credit Manager Sign Off"
                            options={opt_newaccount}
                        />
                        </div>

                    </div>

                    {/* Credit Approvals */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Credit Approvals
                        </h6>
                    </div>

                    <div className="row g-3">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="creditapprovalchange"
                            control={control}
                            label="Credit Approvals Change"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="approvedcreditlimit"
                            control={control}
                            label="Approved Credit Limit"
                        />
                        </div>

                        <div className="col-lg-2 col-md-6">
                        <FormInput
                            className="w-100"
                            name="Creditapprovedby"
                            control={control}
                            label="Approved By"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="creditapprovalnumber"
                            control={control}
                            label="Credit Approval Number"
                        />
                        </div>

                    </div>

                    </div>
                </div>
              </Section>)}

              {/* /Vessel List :/ */}
              {offerforexistingvessel !== "ownershipchange" && (
                <>
              {/* {(casetype==="UOA offer for new vessel" || casetype==="Modify existing UOA offer for vessel") && ( */}
              {(casetype==="UOA offer for new vessel" || casetype==="Modify existing UOA offer for vessel") && (
                <Section title="Vessel List">
                  <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-header bg-light border-0 py-3 px-4">
                      <div className="d-flex justify-content-between align-items-center">
                        {/* <h5 className="mb-0 fw-semibold">Vessel Information</h5> */}

                        <LoadingButton
                          type="button"
                          className="btn btn-primary rounded-pill px-2"
                          asyncAction={async () => handleAddRow()}
                          loadingKey="marine-add-vessel"
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Add Vessel
                        </LoadingButton>
                        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                          {fields.length} Vessel{fields.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="card-body p-0">
                      <div
                        className="table-responsive"
                        style={{
                          overflowX: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* {casetype==="UOA offer for new vessel" && (
                          <VesselList
                            columns={vesselColumns}
                            rows={fields}
                            control={control}
                            onDelete={handleDeleteRow}
                        />)} */}
                        {/* {casetype==="Modify existing UOA offer for vessel" && ( */}
                          <VesselList
                            columns={vesselColumns}
                            rows={fields}
                            control={control}
                            onDelete={handleDeleteRow}
                          />
                        {/* )} */}
                      </div>
                    </div>
                  </div>
                </Section>
              )}</>
              )}
              {/* Agreements */}
              {offerforexistingvessel !== "ownershipchange" && (
              <Section title="Agreements">
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    {/* Agreement Type */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="agreementchange"
                            control={control}
                            label="Customer Agreement Change"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-2 col-md-6 d-flex align-items-center">
                        <h6 className="fw-semibold text-black mb-0">
                            International
                        </h6>
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormSelectSmall
                            name="localinternational"
                            control={control}
                            label="Local International"
                            options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormSelectSmall
                            name="domestic"
                            control={control}
                            label="Domestic"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}
                        />
                        </div>

                    </div>

                    {/* ICIS Details */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="iciscustomer"
                            control={control}
                            label="ICIS Customer"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-2 col-md-6">
                        <FormInput
                            className="w-100"
                            name="icisrate"
                            control={control}
                            label="ICIS Rate"
                        />
                        </div>

                        <div className="col-lg-6 col-md-12">
                        <FormInput
                            className="w-100"
                            name="remarks"
                            control={control}
                            label="Remarks"
                        />
                        </div>

                    </div>

                    {/* Payment Terms */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            type="date"
                            className="w-100"
                            name="effectivatedateratechange"
                            control={control}
                            label="Effective Date of Rate Change"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="paymentterm"
                            control={control}
                            label="Payment Terms"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormSelectSmall
                            name="daysfrom"
                            control={control}
                            label="Days From"
                            options={[
                            {
                                label: "Delivery Date",
                                value: 1,
                            },
                            {
                                label: "Invoicing Date",
                                value: 2,
                            },
                            ]}
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="otherpaymentterm"
                            control={control}
                            label="Other"
                        />
                        </div>

                    </div>

                    {/* Pricing Details */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="Pricingdetailsapprovedby"
                            control={control}
                            label="Approved By"
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="pricelisttoapply"
                            control={control}
                            label="Price List to Apply"
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="chargemodel"
                            control={control}
                            label="Charge Model"
                        />
                        </div>

                    </div>

                    {/* Currency Section */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Currency
                        </h6>
                    </div>

                    <div className="row g-3">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="international"
                            control={control}
                            label="International"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="localinternationalvalue"
                            control={control}
                            label="Local International"
                        />
                        </div>

                    </div>

                    </div>
                </div>
              </Section>)}
              {/* Rebates / Investments */}
              {offerforexistingvessel !== "ownershipchange" && (
              <Section title="Rebates / Investments">
                <div className="bg-white rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-4">

                    {/* Rebate Details */}
                    <div className="row g-3 mb-4">

                        <div className="col-lg-4 col-md-6">
                        <FormSelectSmall
                            name="rebatechange"
                            control={control}
                            label="Rebate / Investment Change"
                            options={opt_newaccount}
                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormSelect
                            className="w-100"
                            name="rebaterequired"
                            control={control}
                            label="Rebate Required"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-4 col-md-6">
                        <FormInput
                            className="w-100"
                            name="rebatedetails"
                            control={control}
                            label="Rebate Details"
                        />
                        </div>

                    </div>

                    {/* Investment Section */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Investment (Credit note upfront for full amount of investment)
                        </h6>
                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                          <FormSelect
                            className="w-100"
                            name="investmentrequired"
                            control={control}
                            label="Investment Required"
                            options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="investmentdeatils"
                            control={control}
                            label="Investment Details"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="paymentmethod"
                            control={control}
                            label="Payment Method"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            type="date"
                            className="w-100"
                            name="creditreleasedate"
                            control={control}
                            label="Credit Release Date"
                        />
                        </div>

                    </div>

                    {/* Bank Details */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Customer Bank Details
                        </h6>
                    </div>

                    <div className="row g-3 mb-4">

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="Custaccountname"
                            control={control}
                            label="Account Name"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="bankingname"
                            control={control}
                            label="Bank Name"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="banksortcode"
                            control={control}
                            label="Bank Sort Code"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="beneficiary"
                            control={control}
                            label="Beneficiary"
                        />
                        </div>

                    </div>

                    {/* Payment to Customer */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Payment to Customer Details
                        </h6>

                        <p className="text-muted small mb-0">
                        (Applicable if payment method is payment to customer)
                        </p>
                    </div>
                    <div className="row g-3 mb-4">
                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="bankaccntnumber"
                            control={control}
                            label="Bank A/C Number"
                        />
                        </div>
                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="residencetownofbank"
                            control={control}
                            label="Residence (Town) of Bank"
                        />
                        </div>
                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="referencerequired"
                            control={control}
                            label="Reference Required"
                        />
                        </div>
                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="swiftcode"
                            control={control}
                            label="Swift Code"
                        />
                        </div>
                    </div>

                    {/* ERP Team Info */}
                    <div className="mb-3">
                        <h6 className="fw-semibold text-black">
                        Invoicing Information (To be completed by ERP Team)
                        </h6>
                    </div>
                    <div className="row g-3">
                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="cabmnmc"
                            control={control}
                            label="CAB MNMC"
                        />
                        </div>
                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="custacctmnmc"
                            control={control}
                            label="Cust_acct MNMC (International)"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="documentpreparedby"
                            control={control}
                            label="Document Prepared By"
                        />
                        </div>

                        <div className="col-lg-3 col-md-6">
                        <FormInput
                            className="w-100"
                            name="rebateattachments"
                            control={control}
                            label="Attachments (Detail)"
                        />
                        </div>

                    </div>

                    </div>
                </div>
              </Section>)}
              {/* {casetype!="offerfornewvessel" &&( */}
                <>
              {/* UOA */}
              {offerforexistingvessel !== "ownershipchange"  &&(
              <>
              <Section title="UOA System Data">
                <Grid container spacing={2}>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="uoainvoicingfrwequency" control={control}
                      label="UOA Invoicing Frequency :"
                      options={opt_uoa_invoicing_freq}
                      sx={{
                          backgroundColor: getFieldColor("uoainvoicingfrwequency"),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="uoacurrency" control={control}
                      label="Currency :"
                      options={opt_uoa_Currency}
                      sx={{
                          backgroundColor: getFieldColor("uoacurrency"),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="prepaidsamlebottlepack" control={control}
                      label="Prepaid Sample Bottle Pack :"
                      options={opt_newaccount}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 2 }} sx={ {minWidth: 300}}>
                      {/* <FormInput sx={ {width: 300}} name="tsenameemail" control={control}  label="TSE name/E-mail address :" /> */}
                      <FormSelect name="tsenameemail" control={control}  label="TSE name/E-mail address :"
                      options={opt_tse}
                       sx={{
                          backgroundColor: getFieldColor("tsenameemail"),
                      }}
                      />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      <FormInput sx={ {width: 350}} name="technicalemail" control={control}  label="Technical E-mail Address for SDS :" />
                  </Grid>
                  <Grid item xs={12} md={2} mt={1} sx={{minWidth: 250}}>
                      <FormSelect name="pricingpolicy" control={control}  label="Pricing Policy :"
                      options={[
                        {label:"VESSEL LEVEL",value:"VESSEL LEVEL"},
                        {label:"CUSTOMER LEVEL",value:"CUSTOMER LEVEL"}
                        ]}/>
                      {/* <FormInput sx={ {width: 250}} name="pricingpolicy" control={control}  label="Pricing Policy :" /> */}
                  </Grid>
                  </Grid>
                  <Grid container spacing={2} mt={2}>
                  <Grid item xs={12} md={2} sx={{ mt: 2, minWidth: 120}}>
                      <Typography variant="subtitle1" fontWeight="bold"> UOA ID :</Typography>
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1,minWidth: 400}}>
                      <Typography variant="subtitle1" fontWeight="bold"> Service Description :</Typography>

                      {/* <FormInput sx={ {width: 400} } fontWeight="bold" disabled name="servicedescription" control={control}  label="Service Description :" />         */}
                        {/* <FormSelect name="Band" control={control}  label="Service Description :" options={opt_service_desc} /> */}
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1, minWidth: 150}}>
                      <Typography variant="subtitle1" fontWeight="bold"> FOC/Year :</Typography>

                      {/* <FormInput sx={ {width: 150} } name="FOC" control={control}  label="FOC/Year :" /> */}
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 ,minWidth: 150}}>
                      <Typography variant="subtitle1" fontWeight="bold"> Charge/Unit :</Typography>
                      {/* <FormInput sx={{width: 150}} name="Price" control={control}  label="Charge/Unit :" /> */}
                  </Grid>

                  {/* Dynamic rows */}
                  {uoaFields.map((item, index) => (
                    <Grid container spacing={2} key={item.id} mt={1} >
                      <Grid item md={3}>
                        <FormInput disabled sx={{width:100}} name={`uoaSamples.${index}.ID`} control={control} />
                      </Grid>
                      <Grid item xs={4} sx={{minWidth: 400}}>
                        <FormSelect
                          name={`uoaSamples.${index}.sample_uoa`}
                          control={control}
                          disabled={safeString(casetype) === "UOA offer for new vessel" && offerfornewvessel ==="custleveluoaoffer"}
                          options={opt_service_desc}
                          options={includeuoaoffer ? opt_service_desc : opt_offer_list_newUOA}

                        />
                      </Grid>
                      <Grid item xs={3}>
                        <FormInput sx={{width: 150}}
                          name={`uoaSamples.${index}.focyear_uoa`}
                          control={control}
                          disabled={safeString(casetype) === "UOA offer for new vessel" && offerfornewvessel ==="custleveluoaoffer"}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <FormInput sx={{width: 150}}
                          name={`uoaSamples.${index}.chargeunit_uoa`}
                          control={control}
                          disabled={safeString(casetype) === "UOA offer for new vessel" && offerfornewvessel ==="custleveluoaoffer"}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button color="inherit" onClick={() => removeUoa(index)}>
                          <DeleteIcon />
                        </Button>
                      </Grid>
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Button onClick={() => addUoa({ sample_uoa: "", focyear_uoa: "", chargeunit_uoa: "" })}>
                      + Add Row
                    </Button>

                    <Button
                      sx={{ ml: 2 }}
                      color="secondary"
                      onClick={handleClearUoa}
                    >
                      Clear UOA
                    </Button>
                  </Grid>

                </Grid>
              </Section>
              </>
              )}
              {/* SDA */}
              {/* {(offerforexistingvessel !== "ownershipchange" || amendmodifytechnicaloffer !== "Name of the customer") && ( */}
              {offerforexistingvessel !== "ownershipchange"  && (
              
                <>
              <Section title="SDA Analysis">
                <Grid container spacing={2}>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="sdaofferinclude" control={control}
                      label="SDA Offer Include"
                      options={opt_newaccount}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}  sx={{minWidth: 180}}>
                      <FormSelect name="sdapricingpolicy" control={control}  label="Pricing Policy :"
                      options={[
                        {label:"VESSEL LEVEL",value:"VESSEL LEVEL"},
                        {label:"CUSTOMER LEVEL",value:"CUSTOMER LEVEL"}
                        ]}/>
                  </Grid>
                </Grid>
                <Grid container spacing={4} mt={2}>
                  <Grid item xs={12} md={2} sx={{ mt: 2, minWidth: 120}}>
                      <Typography variant="subtitle1" fontWeight="bold"> SDA ID :</Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mt: 2, minWidth: 250}}>
                    <Typography variant="subtitle1" fontWeight="bold"> Service Description :</Typography>
                  </Grid>
                  <Grid item xs={12} md={2} mt={1} sx={{minWidth: 180}}>
                      {/* <Typography variant="subtitle1" fontWeight="bold"> Charge/Unit :</Typography> */}

                      <FormSelect name="sdaFocType" control={control}  label="* Select * :"
                      options={[
                        {label:"*select*",value:"*select*"},
                        {label:"Annual FOC",value:"AnnualFOC"},
                        {label:"One Off FOC",value:"OneOffFOC"}
                        ]}/>
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 ,minWidth: 130}}>
                    <Typography variant="subtitle1" fontWeight="bold"> Charge/Unit :</Typography>
                  </Grid>


                    {sdaFields.map((item, index) => (
                      <Grid container spacing={2} key={item.id} mt={1}>
                        <Grid item md={3}>
                          <FormInput disabled sx={{width:150}} name={`sdaSamples.${index}.ID`} control={control} />
                        </Grid>
                        <Grid item xs={4} sx={{ minWidth: 250 }}>
                          <FormSelect
                            name={`sdaSamples.${index}.sample_sda`}
                            control={control}
                            disabled={safeString(casetype) === "UOA offer for new vessel" && offerfornewvessel ==="custleveluoaoffer"}
                            options={includeuoaoffer ? opt_sda_samples : opt_offer_list_newSDA}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormInput sx={{width:180}} name={`sdaSamples.${index}.focyear_sda`} control={control} disabled={safeString(casetype) === "UOA offer for new vessel" && offerfornewvessel ==="custleveluoaoffer"} />
                        </Grid>
                        <Grid item xs={3}>
                          <FormInput sx={{width:180}} name={`sdaSamples.${index}.chargeunit_sda`} control={control} disabled={safeString(casetype) === "UOA offer for new vessel" && offerfornewvessel ==="custleveluoaoffer"}/>
                        </Grid>

                        <Grid item xs={2}>
                          <Button color="inherit" onClick={() => removeSda(index)}>
                            <DeleteIcon />
                          </Button>
                        </Grid>

                      </Grid>
                    ))}
                  <Grid item xs={12}>
                    <Button onClick={() => addSda({ sample_sda: "", focyear_sda: "", chargeunit_sda: "" })}>
                      + Add SDA Row
                    </Button>
                    <Button
                      sx={{ ml: 2 }}
                      color="secondary"
                      onClick={handleClearSda}
                    >
                      Clear SDA
                    </Button>
                  </Grid>
                </Grid>
              </Section>
              </>)}

              {/* COMMENTS */}
              {offerforexistingvessel !== "ownershipchange" && (
              <Section title="Comments">
                <FormInput sx={{width:980}}
                  name="sdacomments"
                  control={control}
                  multiline
                  rows={4}
                />
              </Section>)}
              </>
              {offerforexistingvessel !== "ownershipchange" && (
              <div className="col-lg-4 col-md-6">
                <label className="form-label small mb-1">Upload Files</label>
                <input
                  type="file"
                  multiple
                  className="form-control form-control-sm"
                  onChange={handleFileChange}
                />
                {attachments.length > 0 && (
                  <ul className="list-unstyled mt-2 small">
                    {attachments.map((f, idx) => (
                      <li key={idx} className="d-flex align-items-center justify-content-between">
                        <span className="text-truncate" style={{maxWidth: '75%'}}>{f.name}</span>
                        <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => removeAttachment(idx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>)}
          </div>

            {/* Modal Footer */}
            <div className="modal-footer border-0 pt-0">
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-end w-100">
                <button className="btn btn-outline-danger btn-lg w-sm-auto" onClick={handleClear}>
                  Clear
                </button>
                  
                  <LoadingButton
                    className="btn btn-primary btn-lg shadow-sm w-sm-auto"
                    asyncAction={async () => await handleSubmit(handleSubmitForm)()}
                    loadingKey="marine-submit"
                    disabled={!isValidated}
                  >
                    Submit
                  </LoadingButton>
                
                {/* {isValidated && (
                  <LoadingButton
                    className="btn btn-primary btn-lg shadow-sm w-sm-auto"
                    asyncAction={async () => await handleSubmit(handleSubmitForm)()}
                    loadingKey="marine-submit"
                  >
                    Submit
                  </LoadingButton>
                )} */}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

export default MarineErpForm;