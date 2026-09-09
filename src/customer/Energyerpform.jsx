import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Autocomplete, TextField as MuiTextField, InputAdornment, IconButton,
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

import { useForm, useFieldArray,Controller} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import FormSelectSmall from "../components/form/FormSelectSmall";
import FormCheckbox from "../components/form/FormCheckbox";
import { SearchCompany,GenericLookups } from "../api/customerApi";
import ShipToAddressPage from "../energy_erp_forms/Ship_To_Address";
import SoldToAddressPage from "../energy_erp_forms/Sold_ToAddress";
import PricingBillingAddress from "../energy_erp_forms/PricingBillingAddress";
import EditableSortable_noaction from "../components/form/EditableSortable_noaction"
import {GetEnergyManualERPFormData} from "../api/energyformapis"
import {Energy_ERP_createCustomerRequest} from "../api/energyformapis"
import {SaveEnergyManualERPData,UpdateEnergyManualERPData,UpdateContractStatus} from "../api/energyformapis"
import {SendSubmitEmail} from "../api/energyformapis"
import ErrorMessageModel from "../utilities/ErrorMessageModel";
import LoadingButton from "../components/LoadingButton";
import ConfirmationModal from "../components/ConfirmationModal";
import { CheckForInvoices }                              from "../api/InvoiceApis";

import {OwnershipChange_API} from "../api/postApi" 
import { customerSchema } from "../validation/customerSchema";
import {
  opt_industry, opt_Currency, opt_Salesoffice,
  opt_pl,  opt_Shipping ,opt_Delivering_plant,
  opt_Delivery, opt_Incoterm, opt_sales_org, opt_distribution_channel,
  opt_Typeofrequest, opt_energy_casetypes, opt_be_zeco,
  opt_be_zvat,  opt_it_zmot,  opt_energy_uoa_offer, opt_formFields,opt_tse
} from "./Opt_library";

import {vatFields, shiptoVatFields, payerFields, pricingCheckboxes, billToFields,opt_country_with_soldtoRegion,  Energy_columns,salesAreaFields,Energy_initialValues } from "./Erp_Option_Library";

const EnergyErpForm = forwardRef((props, ref) => {
  const defaultFormValues = Energy_initialValues;

  const { control, watch, reset, setValue, getValues, handleSubmit, trigger } = useForm({
    resolver: yupResolver(customerSchema),
    mode: "onSubmit",
    defaultValues: defaultFormValues,
    energyERPfrequency: "QUARTERLY",
  });

  const { fields, append, update, remove } = useFieldArray({ control, name: "tableData" });

  const [tab, setTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openErrorModel, setOpenErrorModel] = useState(false);
  const [rowCustname, setrowCustname] = useState("");
  const [rowStatus, setrowStatus] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const copiedData = watch("cddcopieddata");
  const customerName = watch("cddcustname");
  const rating = watch("rating");
  const business = watch("business");
  const [validationResult, setValidationResult] = useState("");
  const energyERPaccounttype = watch("energyERPaccounttype");
  const erpnewaccounttype = watch("erpnewaccounttype"); 
  const casetype = watch("casetype");
  const amendmodifytechnicaloffer = watch("amendmodifytechnicaloffer");
  const [Responddata,setResponddata]=useState([]);
  const [searchcompanyResponddata,setsearchcompanyResponddata]=useState([]);
  const offerforexistingvessel = watch("offerforexistingvessel");
  const isModalFieldsDisabled = casetype === "Modifying existing UOA offer for customer";
  const [warningModalMessage, setWarningModalMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const contractStatus = watch("contractStatus");

  const requiredFields = watch([
    "energyERPcustType",
    "energyERPsystem",
    "cust_name",
    "typeofrequest",
    "energyERPaccounttype",
    "erpnewaccounttype",
    "casetype",
    "legal_entity",
  ]);
  const requiredFieldNames = [
    "energyERPcustType",
    "energyERPsystem",
    "cust_name",
    "requsted_by",
    "approved_by",
    "effective_date",
    "typeofrequest",
    "energyERPaccounttype",
    "casetype",
    "legal_entity",
    "soldto_careoff",
    "tsenameemail",
  ];
  const [mappedData, setMappedData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const energyERPsystem = watch("energyERPsystem");
  useEffect(() => {
    const anyModalOpen = openModal ||  showWarningModal  ;

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
  }, [openModal,  showWarningModal ]);
  useEffect(() => {
    setValue("po_required", business === "energy");
  }, [business, setValue]);

  useImperativeHandle(ref, () => ({
    openAdd: handleAdd,
  }));

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    handlegetenergyerpdata();
    const loadAndOpen = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const companyIdKeys = ["CompanyID", "CompanyId", "companyID", "companyId"];
        const companyId = companyIdKeys.reduce(
          (value, key) => value || params.get(key),
          null
        );

        if (companyId) {
          await handlesearchcustomerID(companyId);
          setOpenModal(true);
          // Remove only the CompanyID variant from the query string
          companyIdKeys.forEach((key) => params.delete(key));
          const newSearch = params.toString();
          navigate(
            `${location.pathname}${newSearch ? `?${newSearch}` : ""}`,
            { replace: true }
          );
        }
      } catch (err) {
        console.error("Failed to parse CompanyID from URL:", err);
      }
    };

    loadAndOpen();
  }, [location.search, navigate]);
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
  const formatDateforownership = (dateStr) => {
    if (!dateStr) return "";

    const d = parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${day}/${month}/${year}`;
  };
  const toDateInputValue = (value) => {
    if (!value) return Energy_initialValues.effective_date;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? Energy_initialValues.effective_date
      : parsed.toISOString().split("T")[0];
  };
  const validateCopiedData = () => {
  if (!copiedData) {
    const message = "Copied Data is required.";
    setValidationResult(message);
    setWarningModalMessage(message);
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

  // Determine whether submit should be enabled (all required fields filled)
  const isSubmitEnabled = () => {
    const allFilled = Array.isArray(requiredFields) && requiredFields.every((v) => v !== undefined && v !== null && String(v).trim() !== "");
    if (energyERPsystem === "JDE") {
      return allFilled && validationResult === "Validation Successful";
    }
    return allFilled;
  };
  const Section = ({ title, children }) => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );

  const opt_accounttype=[
    {
      label:"New Account", value:"newaccount"
    },
    {
      label:"Existing Account",value:"existingaccount"
    }
  ]
  const handlecasetypechange = (value) => {
    setValue("casetype", value);
      const customerLevelCases = [
        "UOA offer for newly created customer",
        "Modifying existing UOA offer for customer",
      ];

      const vesselLevelCases = [
        "UOA offer for new vessel",
        "Modify existing UOA offer for vessel",
      ];

      if (customerLevelCases.includes(value)) {
        setValue("PricingPolicy", "CUSTOMER LEVEL");
      }
      if (vesselLevelCases.includes(value)) {
        setValue("PricingPolicy", "VESSEL LEVEL");
      }
    const fieldsToReset = [
      "amendmodifytechnicaloffer",
      "offerfornewvessel",
      "offerforexistingvessel",
      "req_comments"
    ];

    fieldsToReset.forEach((field) => setValue(field, ""));
  };
  const previousValue = watch("offerforexistingvessel");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDropdownValue, setPendingDropdownValue] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Confirm action");
  const [confirmOnConfirm, setConfirmOnConfirm] = useState(() => () => setConfirmOpen(false));

  const handleDropdowncchange = async (e) => {
    const value = e.target.value;

    console.log("Dropdown value changed to:", value);

    if (value === "enddateexisting") {
      console.log("Checking for invoices for selectedCompanyID", getValues("SelectedCustomerID"));

      const invoiceCheck = await CheckForInvoices(getValues("SelectedCustomerID"));
      console.log("invoiceCheck.hasInvoices:", invoiceCheck.hasInvoices);
      if (invoiceCheck.hasInvoices) {
        setPendingDropdownValue(value);
        setConfirmTitle("Confirm action");
        setConfirmMessage("Active invoices exist for this customer. Do you still want to end the existing UOA offer?");
        setConfirmOnConfirm(() => () => {
          setValue("offerforexistingvessel", "");
          setConfirmOpen(false);
          setPendingDropdownValue(null);
        });
        setConfirmOpen(true);
        return;
      }
    }

    setValue("offerforexistingvessel", value);
  };

  const handleCancelModal = () => {
    setConfirmOpen(false);
    setPendingDropdownValue(null);
    setValue("offerforexistingvessel", "");
    // keep previous value
  };
  const handleAdd = () => {
    setSelectedRowIndex(null);
    setOpenModal(true);
  };

  const handleEdit = (index) => {
    const row = fields[index];
    if (row?.contract_status?.trim().toLowerCase() === "lost") {
      setrowCustname(row.cust_name || row.name || row.company || "Unknown Customer");
      setrowStatus(row.contract_status || row.status || "Lost");
      setOpenErrorModel(true);
      return;
    }

    setSelectedRowIndex(index);
    reset(row); // Load row data
    setOpenModal(true);
  };
  const handleDeleteRow = (index) => {
      remove(index);
  };
  const handleModalSave = (data) => {
    if (selectedRowIndex !== null) {
      update(selectedRowIndex, data);
    } else {
      append(data);
    }
    setOpenModal(false);
  };


  const handlegetenergyerpdata  = async () => {
    try {
      const res = await GetEnergyManualERPFormData();

      console.log("API response:", res);
    const tableData = Array.isArray(res)
      ? res
      : res?.data || [];

    console.log("response Data",res);

    const updatedMappedData = tableData.map((item) => ({
      billtono: item.billtono || "",
      business: item.business || "",
      casetype: item.casetype || "",
      companyID: item.companyID || "",
      asset_name: item.asset_name || "",
      companyAssetID: item.companyAssetID || "",
      contract_status: item.contract_status || "",
      contracted_date: toDateInputValue(item.contracted_date) || "",
      currency: item.currency || "",
      cust_name: item.cust_name || "",
      customer_group: item.customer_group || "",
      division: item.division || "",
      doc_num: item.doc_num || "",
      effective_date: toDateInputValue(item.effective_date || ""),
      erp_system: item.erp_system || "",
      file_name: item.file_name || "",
      frequency: item.frequency || "",
      requsted_by: item.requsted_by || "",
      sales_org: item.sales_org || "",
      soldtono: item.soldtono || "",
      towncity: item.towncity || "",
      tse_owner: item.tse_owner || "",
      typeofrequest: item.typeofrequest || ""

    }));
      
    setMappedData(updatedMappedData);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch Energy ERP data");
    }
  };
  const handleSelectAssetChange = (selectedOption) => {
    console.log(Responddata);
    const selectedAsset = Responddata?.find(
      item => item.companyAssetID === selectedOption
    );
    console.log(selectedAsset?.cust_name);

    const selectedAssetName = selectedAsset?.asset_name || "";

    // console.log(selectedOption);
    console.log(selectedOption + " - " + selectedAsset?.contract_status  );
    // setValue("assetname", selectedOption?.asset_name || "");

    const contractStatus = selectedAsset?.contract_status || "";
    setValue("selectedassetId", selectedOption || "");
    setValue("shipto_legal_entity", selectedAssetName || "");
    setValue( "shiptono", selectedOption  || "");
    setValue("contractStatus", contractStatus || "");

    if (contractStatus?.trim().toLowerCase() === "lost") {
      setrowCustname(selectedAsset?.asset_name|| "");
      setrowStatus(selectedAsset?.contract_status  || "");
      setOpenErrorModel(true);
      return;
    }
    
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
  const handleSearchCompany_ownership = async (CompanySearch) => {
    try {
      console.log("Fetching Company Names:", CompanySearch);

      const ownercompanyres = await SearchCompany(CompanySearch);

      console.log("SearchCompany Response:", ownercompanyres);

        const data = Array.isArray(ownercompanyres.data)
          ? ownercompanyres.data
          : Array.isArray(ownercompanyres.data?.data)
          ? ownercompanyres.data.data
          : [];

        if (!data || data.length === 0) {
          // alert("No data found for given input");
          setsearchcompanyResponddata("No data found for given input");
        } else {
          setsearchcompanyResponddata(data);
        }
      // alert(errorMessage);
    }catch (error) {
      console.error("Error fetching company names:", error);
    }
  };

  const handlesearchcustomerID = async (CompanySearch) => {
    try {
      const payload = { CompanyID: CompanySearch };
      // reset(defaultFormValues); // Reset form to default values before populating with new data
      
      console.log("Searching for CompanyID:", payload);
      const resp = await GetEnergyManualERPFormData(payload);

      console.log("Customer Data Response:", resp.data);

      const tableData = Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.data?.data)
        ? resp.data.data
        : [];

      if (!tableData || tableData.length === 0) { 
        // alert("No data found for given input");
        // setResponddata("No data found for given input");
        setWarningModalMessage("No data found for given input");
        return;
      } else {
        setResponddata(tableData);
      }

      const customer = tableData[0] || {};

      console.log("Customer Response:", customer);

      const parseBool = (value) => String(value).toLowerCase() === "true";
      const toDateInputValue = (value) => {
        if (!value) return defaultFormValues.effective_date;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime())
          ? defaultFormValues.effective_date
          : parsed.toISOString().split("T")[0];
      };
      const invoicepointCountryParts = (customer.invoicepoint_country || "").split("||").map((item) => item.trim());
      const parsedGmeCountry = invoicepointCountryParts[0] || "";
      const parsedGmeRegion = invoicepointCountryParts[1]
        ? invoicepointCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
        : "";
      if (tableData.length > 0) {
        reset({
          ...defaultFormValues,
          a513: parseBool(customer.a513),
          a513_duplicate: parseBool(customer.a513_duplicate),
          a520: parseBool(customer.a520),
          a560: parseBool(customer.a560),
          a626: parseBool(customer.a626),
          acc_assgmt_group: customer.acc_assgmt_group || "",
          account_manager: customer.account_manager || "",
          approved_by: customer.approved_by || "",
          bill_name: customer.bill_name || "",
          billto_careoff: customer.billto_careoff || "",
          billto_city: customer.billto_city || "",
          billto_country: customer.billto_country || "",
          billto_district: customer.billto_disctrict || "",
          billto_postcode: customer.billto_postcode || "",
          billto_street2: customer.billto_street2 || "",
          billto_street3: customer.billto_street3 || "",
          billto_streetno: customer.billto_Streetno || "",
          billtono: customer.billtono || "",
          business: customer.business || "",
          casetype: casetype || customer.casetype || "",
          amendmodifytechnicaloffer: amendmodifytechnicaloffer  || "",
          currency: customer.currency || "",
          cust_name: customer.cust_name || "",
          customer_group: customer.customer_group || "",
          // contract_status: customer.contract_status || "",
          delivery_priority: customer.delivery_priority || "",
          delivering_plant: customer.delivering_plant || "",
          dist_channel: customer.dist_channel || "",
          division: customer.division || defaultFormValues.division,
          doc_num: customer.doc_num || "",
          effective_date: toDateInputValue(customer.effective_date),
          energyERPsystem: customer.erp_system || "",
          energyERPaccounttype: customer.energyERPaccounttype || customer.account_type || "",
          erpnewaccounttype: customer.erpnewaccounttype || "",
          file_name: customer.file_name || "",
          frequency: customer.frequency || "",
          inco_terms: customer.inco_terms || "",
          industry_key: customer.industry_key || "",
          invoice_brand: customer.invoice_brand || "",
          invoicing_dates: customer.invoicing_dates || "",
          key_account_manager: customer.key_account_manager || "",
          language_key: customer.language_key || "",
          legal_entity: customer.legal_entity || "",
          offerforexistingvessel: customer.offerforexistingvessel || "",
          offerfornewvessel: customer.offerfornewvessel || "",
          payer_name: customer.payer_name || "",
          payerno: customer.payerno || "",
          payerto_careoff: customer.payerto_careoff || "",
          payerto_city: customer.payerto_city || "",
          payerto_country: customer.payerto_country || "",
          payerto_disctrict: customer.payerto_disctrict || "",
          payerto_postcode: customer.payerto_postcode || "",
          payerto_street2: customer.payerto_street2 || "",
          payerto_street3: customer.payerto_street3 || "",
          payerto_streetno: customer.payerto_Streetno || "",
          payment_method: customer.payment_method || "",
          payment_term: customer.payment_term || "",
          price_group: customer.price_group || "",
          price_list: customer.price_list || "",
          pricing_condition: customer.pricing_condition || "",
          PricingPolicy: customer.pricingPolicy || "",
          profile_centre_assignment: customer.profile_centre_assignment || "",
          req_comments: customer.req_comments || "",
          requsted_by: customer.requsted_by || "",
          sales_office: customer.sales_office || "",
          sales_org: customer.sales_org || "",
          shipping_conditions: customer.shipping_conditions || "",
          shipto_careoff: customer.shipto_careoff || "",
          shipto_name: customer.asset_name || "",
          shipto_city: customer.shipto_city || "",
          shipto_country: customer.shipto_country || "",
          shipto_district: customer.shipto_district || "",
          shipto_postcode: customer.shipto_postcode || "",
          shipto_street2: customer.shipto_street2 || "",
          shipto_street3: customer.shipto_street3 || "",
          shipto_streetno: customer.shipto_Streetno || "",
          shipto_bezeco: customer.shipto_bezeco || "",
          shipto_bezvat: customer.shipto_bezvat || "",
          shipto_dkzeco: customer.shipto_dkzeco || "",
          shipto_dkzvat: customer.shipto_dkzvat || "",
          shipto_fizeco: customer.shipto_fizeco || "",
          shipto_fizvat: customer.shipto_fizvat || "",
          shipto_frzeco: customer.shipto_frzeco || "",
          shipto_frzvat: customer.shipto_frzvat || "",
          shipto_gbzvat: customer.shipto_gbzvat || "",
          shipto_iezvat: customer.shipto_iezvat || "",
          shipto_itzcou: customer.shipto_itzcou || "",
          shipto_itzmot: customer.shipto_itzmot || "",
          shipto_itzvat: customer.shipto_itzvat || "",
          shipto_nlzvat: customer.shipto_nlzvat || "",
          shipto_nozvat: customer.shipto_nozvat || "",
          shipto_nozeco: customer.shipto_nozeco || "",
          shipto_sezvat: customer.shipto_sezvat || "",
          shipto_trzvat: customer.shipto_trzvat || "",
          transport_zone: customer.transport_zone || "",
          tsenameemail: customer.tse_owner || customer.tsenameemail || "",
          typeofrequest: customer.typeofrequest || "",
          soldto_Creditapproveno: customer.soldto_Creditapproveno || "",
          soldto_bezeco: customer.soldto_bezeco || "",
          soldto_bezvat: customer.soldto_bezvat || "",
          soldto_dkzeco: customer.soldto_dkzeco || "",
          soldto_dkzvat: customer.soldto_dkzvat || "",
          soldto_fizeco: customer.soldto_fizeco || "",
          soldto_fizvat: customer.soldto_fizvat || "",
          soldto_frzeco: customer.soldto_frzeco || "",
          soldto_frzvat: customer.soldto_frzvat || "",
          soldto_gbzvat: customer.soldto_gbzvat || "",
          soldto_iezvat: customer.soldto_iezvat || "",
          soldto_itzcou: customer.soldto_itzcou || "",
          soldto_itzmot: customer.soldto_itzmot || "",
          soldto_itzvat: customer.soldto_itzvat || "",
          soldto_nlzvat: customer.soldto_nlzvat || "",
          soldto_nozvat: customer.soldto_nozvat || "",
          soldto_nozeco: customer.soldto_nozeco || "",
          soldto_sezvat: customer.soldto_sezvat || "",
          soldto_trzvat: customer.soldto_trzvat || "",
          soldto_careoff: customer.soldto_careoff || "",
          soldto_city: customer.soldto_city || "",
          soldto_country: customer.soldto_country || "",
          soldto_email: customer.soldto_email || "",
          soldto_faxno: customer.soldto_faxno || "",
          soldto_mobile: customer.soldto_mobile || "",
          soldto_postcode: customer.soldto_postcode || "",
          soldto_street2: customer.soldto_street2 || "",
          soldto_street3: customer.soldto_street3 || "",
          soldto_streetno: customer.soldto_streetno || "",
          soldto_telno: customer.soldto_telno || "",
          soldto_vat: customer.soldto_vat || "",
          soldtono: customer.soldtono || "",
          sub_sector: customer.sub_sector || "",
          towncity: customer.towncity || "",
          tableData: Array.isArray(customer.tableData) ? customer.tableData : defaultFormValues.tableData,
          
        });
      }
      setValue("SelectedCustomerID", CompanySearch);
      if(casetype==="Modifying existing UOA offer for customer"){
          setValue("PricingPolicy", "CUSTOMER LEVEL" );
      }
      if (casetype==="UOA offer for new vessel" || casetype==="Modify existing UOA offer for vessel") {
      
        setValue("PricingPolicy", "VESSEL LEVEL" );}

      
    } catch (err) {
      console.error("Error fetching energy customer:", err);
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

  const handleClear = () => {
    reset({ ...defaultFormValues });
    setAttachments([]);
    setSelectedRowIndex(null);
    setMappedData([]);
  };
  
  const handleSendSubmitEmail = async (responseOrCompanyId,  attachmentFiles = []) => {
    const CompanyID =responseOrCompanyId;

    try {

      if (attachmentFiles && attachmentFiles.length > 0) {
        const formData = new FormData();

        formData.append("CompanyID", CompanyID);
        formData.append("RecipientEmail", "Sunil.mn@bp.com");
        formData.append("BusinessType", "Energy");
        formData.append("CaseType", getValues("casetype") || "N/A");
        formData.append("SubCaseType", getValues("amendmodifytechnicaloffer") || "N/A");

        attachmentFiles.forEach((file) => {
          formData.append("attachments", file);
        });
        console.log("Sending email with data:", CompanyID);

        await SendSubmitEmail(formData);
      } else {
        const formData = new FormData();
        formData.append("CompanyID", CompanyID);
        formData.append("RecipientEmail", "Sunil.mn@bp.com");
        formData.append("BusinessType", "Energy");
        formData.append("CaseType", getValues("casetype") || "N/A");
        formData.append("SubCaseType", getValues("amendmodifytechnicaloffer") || "N/A");

        console.log("Sending email with data:", CompanyID);

        await SendSubmitEmail(formData);
      }
    } catch (error) {
      console.error("Error sending submit email:", error);
    }
  };
  
  const onSubmit = async (data) => {

    try {
      console.log("Form Data:", data);

      const selectedAsset = Responddata?.find(
        item => item.companyAssetID === data.assetname
      );

      const selectedAssetName = selectedAsset?.asset_name || "";

      const contractpayload = {
        CompanyID: data.SelectedCustomerID,
        CompanyAssetID: String(data.assetname),
        Business: "ENERGY",
        PricingPolicy: data.PricingPolicy || "",
      };

      // const genlookpayload={
      //   LookupSource:"company",
      //   Filter:data.ownercompnyname
      // }
      // const genericres=await GenericLookups(genlookpayload)

      // const ownershippayload = {
      //   AssetID: String(data.assetname),
      //   NewOwner:data.ownercompnyname,
      //   // NameOwner:genericres.data[0].name,
      //   TransferDate:formatDateforownership(new Date().toISOString().split("T")[0]),
      //   Level: 2,
      // };

      // console.log("generick lookup data",ownershippayload)
      
      // console.log("Contract Payload:", selectedAssetName);

      let res;

      if (casetype ==="UOA offer for newly created customer" || casetype ==="UOA offer for new vessel") {
        res = await SaveEnergyManualERPData(data);
        const emailresp=await handleSendSubmitEmail(res.companyID, attachments);
        console.log("Email Response:", emailresp);
      }else if (offerforexistingvessel ==="enddateexisting") {
        res = await UpdateContractStatus(contractpayload);
        const emailresp=await handleSendSubmitEmail(data.SelectedCustomerID, attachments);
        console.log("Email Response:", emailresp);
      }else if (offerforexistingvessel==="ownershipchange"){
        // console.log("ownership payload",ownershippayload)
        // const owresp=await OwnershipChange_API(ownershippayload);
        // console.log("ownership response",owresp);
      }else {
        res = await UpdateEnergyManualERPData(selectedAssetName, data);
        console.log("Update API called with data:", data.SelectedCustomerID);
        const emailresp=await handleSendSubmitEmail(data.SelectedCustomerID, attachments);
        console.log("Email Response:", emailresp);
      }

      setOpenModal(false);
      reset({ ...defaultFormValues }); 
      handlegetenergyerpdata();

    } catch (err) {
      console.error(err);
      alert("Error saving customer");
    }
  };
  const isCustomerNameDisabled =  isModalFieldsDisabled &&  amendmodifytechnicaloffer !== "Name of the customer";
  const isTseDisabled =  isModalFieldsDisabled &&  amendmodifytechnicaloffer !== "TSE Owner";
  const isCurrencyDisabled =  isModalFieldsDisabled &&  amendmodifytechnicaloffer !== "Currency in UOA offer";
  const isFrequencyDisabled =  isModalFieldsDisabled &&  amendmodifytechnicaloffer !== "Frequency UOA Offer";
  const shouldShowCddClearance =
    energyERPsystem === "JDE" &&
    ["UOA offer for newly created customer", "UOA Old offer for newly created customer"].includes(casetype);

  const shouldShowSubmitButton =
  (energyERPsystem === "SAP" ||energyERPsystem === "JDE"  ? !shouldShowCddClearance ||  validationResult === "Validation Successful" : true) &&
  (offerforexistingvessel !== "" && (contractStatus?.trim().toLowerCase() === "contracted" ||contractStatus?.trim().toLowerCase() === "own_change") )|| amendmodifytechnicaloffer !== "" ;
  ;
  
  // const shouldShowSubmitButton =
  // (  energyERPsystem === "JDE"  ? !shouldShowCddClearance ||  validationResult === "Validation Successful" : true) &&
   
  //   ( offerforexistingvessel !== "" && contractStatus?.trim().toLowerCase() === "contracted"  ) ||
  //   amendmodifytechnicaloffer !== ""
  // ;

  const handleSubmitButtonClick = async () => {
    const isValid = await trigger(requiredFieldNames);
    if (!isValid) {
      setWarningModalMessage("Please fill all mandatory fields before submitting.");
      setShowWarningModal(true);
      return;
    }

    if (offerforexistingvessel === "Enddate existing UOA offer for vessel") {
      setConfirmTitle("Confirm action");
      setConfirmMessage("Active invoices exist for this asset. You cannot end date the asset until all outstanding invoices are closed. Please reach out to Eleftheria.Katsikavella@ec1.bp.com or GCastrolUOASupport@bp.com for assistance. Click OK to return to the previous screen.");
      setConfirmOnConfirm(() => async () => {
        try {
          const resp = await handleSubmit(onSubmit)();
          console.log("Form submission response:", resp);
        } catch (err) {
          console.error("Submit error:", err);
        } finally {
          setConfirmOpen(false);
        }
      });
      setConfirmOpen(true);
      return;
    }

    const resp = await handleSubmit(onSubmit)();
    console.log("Form submission response:", resp);
  };
  
  const salesAreaFields_erp = [
      { name: "sales_office", label: "Sales Office", component: FormSelectSmall, options: opt_Salesoffice,width:330,disabled:isModalFieldsDisabled },
      { name: "currency", label: "Currency", component: FormSelectSmall, options: opt_Currency,width:200,disabled:isCurrencyDisabled },
      { name: "price_group", label: "Price Group", component: FormInput,disabled:isModalFieldsDisabled },
      { name: "price_list", label: "Price List", component: FormSelectSmall, options: opt_pl,width:200,disabled:isModalFieldsDisabled },
  ];
  const pricingCheckboxes = [
      { name: "a560", label: "Sales org./Distr. Chl/Division/Price list/Pr ref Material", code: "A560" ,disabled:isModalFieldsDisabled },
      { name: "a513", label: "Sales org./Distr. Chl/Division/Sold-to pt/Pr ref Material", code: "A513",disabled:isModalFieldsDisabled  },
      { name: "a520", label: "Sales org/Distr Chl/Division/Sold-to/Ship-to/Pr ref Material", code: "A520",disabled:isModalFieldsDisabled  },
      { name: "a513_duplicate", label: "Sales org./Distr. Chl/Division/Sold-to pt/Pr ref Material", code: "A513",disabled:isModalFieldsDisabled  },
      { name: "a626", label: "Sales org./Distr. Chl/Division/Customer Hierarchy/Material", code: "A626",disabled:isModalFieldsDisabled  },
    ];

  
  return (
    <div className="container-fluid py-4 bg-light min-vh-100 energy-erp-form-page">

      {/* ================= PAGE HEADER ================= */}

      <div className="row align-items-center mb-4">

        <div className="col-lg">
          <h2 className="fw-bold text-dark mb-1">
            Energy Customer Management
          </h2>
          <p className="text-muted mb-0">Create, manage and maintain Energy ERP customer records</p>
        </div>

        <div className="col-lg-auto d-flex flex-wrap gap-2 justify-content-lg-end energy-header-actions">
          <button className="btn btn-outline-success btn-lg shadow-sm" onClick={handleAdd}>
            <i className="bi bi-plus-circle me-2"></i> ERP Form
          </button>
          <button
            className="btn btn-outline-success btn-lg shadow-sm"
            onClick={handlegetenergyerpdata}
            onClick={handlegetenergyerpdata}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Retrieve Server Data
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

                  <p className="text-muted mb-1">Total ERP Forms</p>

                  <h3 className="fw-bold mb-0">{mappedData?.length || 0}</h3>

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

                  <p className="text-muted mb-1">System Status</p>

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

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">Last Sync</p>

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

      {/* ================= TABLE ================= */}

      <div className="card border-0 shadow rounded-4 energy-table-card">

        <div className="card-header bg-white border-0 py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="fw-bold mb-0">
              Energy ERP Customer List
            </h5>

            <span className="btn px-4 shadow-sm text-white"
            style={{ backgroundColor: "#1e9f10", borderColor: "#1e9f10" }}>
              {mappedData?.length || 0} Records
            </span>

          </div>

        </div>

        <div className="card-body">

          <EditableSortable_noaction
            columns={Energy_columns}
            rowData={mappedData}
            control={control}
            onDelete={handleDeleteRow}
            pagination
            pageSizeOptions={[10, 25, 50, 100]}
          />

        </div>

      </div>

      <ErrorMessageModel
        open={openErrorModel}
        name={rowCustname}
        status={rowStatus}
        onClose={() => setOpenErrorModel(false)}
      />

      <ConfirmationModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage || "This Asset/Vessel has outstanding invoice(s). Cannot change the Ownership."}
        onConfirm={confirmOnConfirm}
        onCancel={handleCancelModal}
        confirmLabel="Ok"
        cancelLabel="No"
      />

      {/* ================= MODAL ================= */}

      <div
        className={`modal fade energy-modal ${openModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(3px)"
        }}
      >

        <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-xl-down modal-xl">

          <div className="modal-content border-0 rounded-4 shadow-lg">

            {/* ===== MODAL HEADER ===== */}
            <div className="modal-header border-0 text-white rounded-top-4" style={{ backgroundColor: "#1e9f10" }} >

              <div>

                <h4 className="modal-title fw-bold">

                  {selectedRowIndex !== null
                    ? "Edit Customer"
                    : "Energy ERP Form"}

                </h4>

                <small className="opacity-75">
                  ERP Customer Information Management
                </small>

              </div>

              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setOpenModal(false)}
              ></button>

            </div>
            {/* ===== MODAL BODY ===== */}
            <div className="modal-body bg-light p-4">
              {/* Address Sections */}

            {/* <SoldToAddressPage /> */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">

            {/* <div className="card-header  text-black fw-semibold py-3">
              CDD Clearence Form
            </div> */}
            <div className="card-body p-4">
              <div className="row g-3 mt-3">
                  <div className="col-md-3">
                    <FormSelect
                      disabled={isModalFieldsDisabled}
                      name="energyERPcustType"
                      control={control}
                      label="Type Of Customer"
                      options={[{label:"Indirect",value:"indirect"},{label:"direct",value:"Direct"},{label:"JD Edwards",value:"jdedwards"},{label:"Industrial",value:"Industrial"}]}
                    />
                  </div>
                  <div className="col-md-3">
                    <FormSelect
                      required
                      disabled={isModalFieldsDisabled}
                      name="energyERPsystem"
                      control={control}
                      label="ERP System"
                      options={[{label:"SAP",value:"SAP"},{label:"JDE",value:"JDE"}]}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      // required
                      name="SelectedCustomerID"
                      control={control}
                      label="Customer ID from ERP"
                    />
                  </div>
                  <div className="col-md-3">
                    <FormInput
                      disabled
                      // required
                      name="PricingPolicy"
                      control={control}
                      label="Pricing Policy"
                    />
                  </div>
                </div>
                {shouldShowCddClearance && (
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

                  <div
                    className={`col-md-3 mt-2 ${
                      validationResult === "Validation Successful"
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {validationResult === "Validation Successful"
                      ? validationResult
                      : "Validation failed, check Customer Name and Rating in the copied data"}
                  </div>
                </div>)}
                {shouldShowCddClearance && (
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
            </div>
            {/* CUSTOMER MASTER */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">

              <div className="card-header  text-black fw-semibold py-3">
                Customer Master Form
              </div>

              <div className="card-body p-4">

                <div className="row g-3">

                  {/* <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled && amendmodifytechnicaloffer !== "Name of the customer"}
                      name="cust_name"
                      control={control}
                      label="Customer Name"
                    />
                  </div> */}

                  <div className="col-md-3">
                    <FormInput
                      required
                      disabled={isCustomerNameDisabled}
                      name="cust_name"
                      control={control}
                      label="Customer Name"
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor: isCustomerNameDisabled ? "#f5f5f5" : "#b4eca9", // Light yellow when enabled
                        },
                      }}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      required
                      disabled={isModalFieldsDisabled}
                      name="requsted_by"
                      control={control}
                      label="Requested By"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      required
                      disabled={isModalFieldsDisabled}
                      name="approved_by"
                      control={control}
                      label="Approved By"
                    />
                  </div>

                  <div className="col-md-3">
                    {/* <Typography>Effective Date</Typography> */}

                    <FormInput
                      required
                      disabled={isModalFieldsDisabled}
                      sx={{width:230}}
                      type="date"
                      name="effective_date"
                      control={control}
                      label="Effective Date"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="doc_num"
                      control={control}
                      label="Document No"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
                      disabled={isModalFieldsDisabled}
                      name="sales_org"
                      control={control}
                      label="Sales Organisation"
                      options={opt_sales_org}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
                      disabled={isModalFieldsDisabled}
                      name="dist_channel"
                      control={control}
                      label="Distribution Channel"
                      options={opt_distribution_channel}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
                      disabled={isModalFieldsDisabled}
                      name="division"
                      control={control}
                      label="Division"
                      options={[
                        {
                          label:"02 (Lubricants)",
                          value:"02 (Lubricants)"
                        }
                      ]}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
                     required
                      disabled={isModalFieldsDisabled}
                      name="typeofrequest"
                      control={control}
                      label="Type Of Request"
                      options={opt_Typeofrequest}
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <FormSelect
                     required
                      disabled={isModalFieldsDisabled}
                      name="energyERPaccounttype"
                      control={control}
                      label="Type Of Account"
                      options={opt_accounttype}
                    />
                  </div>
                  <div className="col-lg-3">
                    <FormSelect
                      // disabled={isModalFieldsDisabled && amendmodifytechnicaloffer !== "Frequency UOA Offer"}
                      disabled={isFrequencyDisabled}
                      name="energyERPfrequency"
                      control={control}
                      label="Energy ERP Frequency"
                      options={[
                        { label: "1M", value: "MONTHLY" },
                        { label: "3M", value: "QUARTERLY",defaultValue:"3M" },
                        { label: "6M", value: "HALFYEARLY" },
                        { label: "12M", value: "YEARLY" }
                      ]}
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor: isFrequencyDisabled ? "#f5f5f5" : "#b4eca9", // Light yellow when enabled
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="row g-3 mt-3">
                  <div className="col-md-3">
                    <Grid item xs={12} md={2}  sx={{ minWidth: 300 }}>
                      {/* <FormInput name="tsenameemail" control={control} label="TSE Name/Email Address No :" sx={{ width: 300 }} /> */}
                      <FormSelect 
                      required
                      disabled={isTseDisabled}
                      name="tsenameemail" control={control}  label="TSE Name/Email Address No :"
                      options={opt_tse}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: isTseDisabled ? "#f5f5f5" : "#b4eca9",
                          "& fieldset": {
                            borderColor: isTseDisabled ? "#d0d0d0" : "#2e7d32",
                          },
                          "&:hover fieldset": {
                            borderColor: "#2e7d32",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#2e7d32",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: isTseDisabled ? "#757575" : "#2e7d32",
                          fontWeight: isTseDisabled ? 400 : 600,
                        },
                      }}
                      />
                    </Grid>
                  </div>
                </div>

              </div>

            </div>
            {/* CASE DETAILS */}
            <div className="card shadow-sm border-0 rounded-4">

              <div className="card-header  text-black fw-semibold py-3">
                Case Information
              </div>

              <div className="card-body p-4">

                <div className="row g-3">

                  <div className="col-lg-6 col-md-6">

                    <FormSelect
                     required
                      name="casetype"
                      control={control}
                      label="Case Type"
                      options={opt_energy_casetypes}
                      onChange={(e)=>
                        handlecasetypechange(
                          e.target.value
                        )
                      }
                    />

                  </div>
                  {(casetype ==="UOA offer for new vessel"|| casetype ==="Modifying existing UOA offer for customer" || casetype ==="Modify existing UOA offer for vessel" ) && (
                  <div className="col-md-3">
                    <Controller
                      name="companysearch"
                      control={control}
                      render={({ field }) => (
                        <MuiTextField
                          {...field}
                          fullWidth
                          label="Search Customer by ID"
                          size="small"
                          placeholder="Enter customer ID"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => handlesearchcustomerID(field.value)}
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
                              handlesearchcustomerID(field.value);
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
                            Responddata?.map((item) => ({
                              label: item.asset_name,
                              value: item.companyAssetID,
                            })) || []
                          }
                          onChange={(e) => handleSelectAssetChange(e.target.value)}
                        />
                      </div>

                    </>
                  )}

                  {casetype ==="Modifying existing UOA offer for customer" && (
                    <div className="col-lg-6 col-md-6">
                      <FormSelect
                        name="amendmodifytechnicaloffer"
                        control={control}
                        label="Amend / Modify Existing Technical Offer"
                        options={opt_formFields}
                        onChange={
                          handleDropdowncchange
                        }
                      />

                    </div>

                  )}

                  {casetype ===  "Modify existing UOA offer for vessel" && (
                    <>
                    <div className="col-md-6">

                      <FormSelect
                        name="offerforexistingvessel"
                        control={control}
                        label="Offer For Existing Vessel"
                        options={opt_energy_uoa_offer}
                        onChange={
                          handleDropdowncchange
                        }
                      />

                    </div>
                    <div className="col-md-3">
                      <FormInput
                        disabled={isModalFieldsDisabled} disabled name="selectedassetId" control={control} label="Selected Asset ID:" sx={{ width: 200 }} />
                    </div>
                    <div className="col-md-3">
                      <FormInput
                        disabled={isModalFieldsDisabled} disabled name="contractStatus" control={control} label="Asset Status:" sx={{ width: 200 }} />
                    </div>
                    </>
                  )}
                  {offerforexistingvessel==="ownershipchange"  && (
                  <div className="row g-3 align-items-center ">
                    {/* Search Input */}
                    <div className="col-md-4 ">
                      <Controller
                        name="companysearchforownership"
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
                                    onClick={() => handleSearchCompany_ownership(field.value)}
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
                                handleSearchCompany_ownership(field.value);
                              }
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="col-md-6 mt-3">
                      <Controller
                        name="ownercompnyname"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            freeSolo
                            options={
                              Array.isArray(searchcompanyResponddata)
                                ? searchcompanyResponddata.map((item) => ({
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
                              Array.isArray(searchcompanyResponddata)
                                ? searchcompanyResponddata.find((o) => o.assetServiceOfferID === field.value)
                                  ? {
                                      label: searchcompanyResponddata.find((o) => o.assetServiceOfferID === field.value)?.company,
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
                  </div>)}
                  {casetype === "other" && (

                    <div className="col-12">

                      <FormInput
                        disabled={isModalFieldsDisabled}
                        multiline
                        rows={4}
                        name="req_comments"
                        control={control}
                        label="Request Comments"
                      />

                    </div>

                  )}

                </div>

              </div>

            </div>
              {/* </Section> */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header fw-bold">
                SOLD TO Address
              </div>

              <div className="card-body">

                <div className="row g-3">
                {energyERPsystem === "SAP" && (
                  <div className="col-md-3">
                    <FormInput

                      disabled={isModalFieldsDisabled}
                      name="soldtono"
                      control={control}
                      label="SOLD TO No"
                    />
                  </div>
                )}

                  <div className="col-md-3">
                    <FormInput
                     required
                      disabled={isModalFieldsDisabled}
                      name="legal_entity"
                      control={control}
                      label="Legal Entity"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      required
                      disabled={isModalFieldsDisabled}
                      name="soldto_careoff"
                      control={control}
                      label="C/O"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_streetno"
                      control={control}
                      label="Street / House No"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_street2"
                      control={control}
                      label="Street 2"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_street3"
                      control={control}
                      label="Street 3"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_city"
                      control={control}
                      label="City"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_postcode"
                      control={control}
                      label="Postal Code"
                    />
                  </div>

                  <div className="col-md-6">

                    <FormSelectSmall
                      disabled={isModalFieldsDisabled}
                      name="soldto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_telno"
                      control={control}
                      label="Telephone"
                    />

                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_faxno"
                      control={control}
                      label="Fax"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_mobile"
                      control={control}
                      label="Mobile"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_email"
                      control={control}
                      label="Email"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_vat"
                      control={control}
                      label="VAT Registration"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-3">

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="soldto_Creditapproveno"
                      control={control}
                      label="Credit Approval No"
                    />

                  </div>

                  {vatFields.map(f => (

                  <div
                    className="col-md-3"
                    key={f.name}
                  >

                    <FormSelectSmall
                      disabled={isModalFieldsDisabled}
                      disabled={isModalFieldsDisabled}
                      name={f.name}
                      control={control}
                      label={f.label}
                      options={f.options}
                    />

                  </div>

                  ))}

                </div>

              </div>
            </div>

              {/* <ShipToAddressPage /> */}
                  {/* SHIP TO ADDRESS */}

            <div className="card shadow-sm rounded-4 mb-4">

              <div className="card-header fw-bold">
                General Data : SHIP TO Address
              </div>

              <div className="card-body">

                {/* Header */}

                <div className="row g-3">

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shiptono"
                      control={control}
                      label="Ship TO No."
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_legal_entity"
                      control={control}
                      label="Ship to Name 1"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_careoff"
                      control={control}
                      label="C/O"
                    />
                  </div>

                </div>

                {/* Street Details */}

                <div className="row g-3 mt-2">

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_streetno"
                      control={control}
                      label="Street / House No"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_street2"
                      control={control}
                      label="Street 2"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_street3"
                      control={control}
                      label="Street 3"
                    />

                  </div>

                </div>

                {/* City */}

                <div className="row g-3 mt-2">

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_city"
                      control={control}
                      label="City"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_postcode"
                      control={control}
                      label="Postal Code"
                    />

                  </div>

                  <div className="col-md-6">

                    <FormSelectSmall
                      disabled={isModalFieldsDisabled}
                      name="shipto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="transport_zone"
                      control={control}
                      label="Transportation Zone"
                    />

                  </div>

                </div>

                {/* Additional Fields */}

                <div className="row g-3 mt-2">

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="language_key"
                      control={control}
                      label="Language Key"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="shipto_district"
                      control={control}
                      label="District (UK County)"
                    />

                  </div>

                  {shiptoVatFields.map(f => (

                    <div
                      className="col-md-3"
                      key={f.name}
                    >

                      <FormSelectSmall
                        disabled={isModalFieldsDisabled}
                        name={f.name}
                        control={control}
                        label={f.label}
                        options={f.options}
                      />

                    </div>

                  ))}

                </div>

              </div>

            </div>
            {/* BILL TO ADDRESS */}
            <div className="card shadow-sm rounded-4 mb-4">
              <div className="card-header fw-bold">
                General Data : BILL TO Address
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {billToFields.map(f => (
                    <div
                      className="col-md-3"
                      key={f.name}
                    >
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name={f.name}
                        control={control}
                        label={f.label}
                      />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <FormSelectSmall
                      disabled={isModalFieldsDisabled}
                      name="billto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />
                  </div>
                  <div className="col-md-3">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="billto_district"
                      control={control}
                      label="District"
                    />
                  </div>
                  <div className="col-md-6">
                    <FormInput
                      disabled={isModalFieldsDisabled}
                      name="billingemail"
                      control={control}
                      label="Billing Email Address"
                    />
                  </div>
                </div>
              </div>
            </div>

              {/* <PricingBillingAddress /> */}
              <div className="card-header fw-bold">
                General Data : PAYER Address
              </div>

              <div className="card-body">

                <div className="row g-3">

                  {payerFields.map((f) => (

                    <div
                      className="col-md-3"
                      key={f.name}
                    >

                      {f.name ===
                      "payerto_country" ? (

                        <FormSelectSmall
                      disabled={isModalFieldsDisabled}
                          name={f.name}
                          control={control}
                          label={f.label}
                          options={opt_country_with_soldtoRegion}
                        />

                      ) : (

                        <FormInput
                      disabled={isModalFieldsDisabled}
                          name={f.name}
                          control={control}
                          label={f.label}
                        />

                      )}

                    </div>

                  ))}

                </div>

              </div>


              {/* ================= SALES REP ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Sales Representative
                  </h6>
                </div>

                <div className="card-body">

                  <div className="row g-4">

                    <div className="col-md-6">

                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="account_manager"
                        control={control}
                        label="Account Manager (ZR)"
                      />

                    </div>

                    <div className="col-md-6">

                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="key_account_manager"
                        control={control}
                        label="Key Account Manager (ZA)"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* ================= CONTROL DATA ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    General Data - Control & Marketing
                  </h6>
                </div>

                <div className="card-body">

                  <div className="row">

                    <div className="col-md-4">

                      <FormSelect
                        name="industry_key"
                        control={control}
                        label="Industry Key"
                        options={opt_industry}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* ================= SALES AREA ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Sales Area Data
                  </h6>
                </div>

                <div className="card-body">

                  <div className="row g-4">

                    {salesAreaFields_erp.map(field => (

                      <div
                        className="col-md-3"
                        key={field.name}
                      >

                        <field.component
                          required={field.required}
                          name={field.name}
                          control={control}
                          label={field.label}
                          options={field.options || []}
                          disabled={field.disabled}
                        />

                      </div>

                    ))}

                  </div>

                </div>

              </div>

              {/* ================= SHIPPING ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Shipping Information
                  </h6>
                </div>

                <div className="card-body">

                  <div className="row g-4">

                    <div className="col-md-4">

                      <FormSelect
                        disabled={isModalFieldsDisabled}
                        name="shipping_conditions"
                        control={control}
                        label="Shipping Conditions"
                        options={opt_Shipping}
                      />

                    </div>

                    <div className="col-md-4">

                      <FormSelect
                        disabled={isModalFieldsDisabled}
                        name="delivering_plant"
                        control={control}
                        label="Delivering Plant"
                        options={opt_Delivering_plant}
                      />

                    </div>

                    <div className="col-md-4">

                      <FormSelect
                        disabled={isModalFieldsDisabled}
                        name="Delivery_priority"
                        control={control}
                        label="Delivery Priority"
                        options={opt_Delivery}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* ================= BILLING ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Billing Details
                  </h6>
                </div>

                <div className="card-body">

                  <div className="row g-4">

                    <div className="col-md-4">
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="invoicing_dates"
                        control={control}
                        label="Invoicing Dates"
                      />
                    </div>

                    <div className="col-md-4">
                      <FormSelect
                        disabled={isModalFieldsDisabled}
                        name="inco_terms"
                        control={control}
                        label="Inco Terms"
                        options={opt_Incoterm}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="towncity"
                        control={control}
                        label="Town / City"
                      />
                    </div>

                  </div>

                </div>

              </div>

              {/* ================= CUSTOMER ATTRIBUTES ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Customer Attributes
                  </h6>
                </div>

                <div className="card-body">

                  <div className="row g-4">

                    <div className="col-md-3">
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="profile_centre_assignment"
                        control={control}
                        label="Profile Centre Assignment"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="invoice_brand"
                        control={control}
                        label="Invoice Brand"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="sub_sector"
                        control={control}
                        label="Sub Sector"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="customer_group"
                        control={control}
                        label="Customer Group"
                      />
                    </div>

                  </div>

                </div>

              </div>

              {/* ================= PRICING ================= */}

              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    Pricing Configuration
                  </h6>
                </div>

                <div className="card-body">

                  <div className="alert alert-warning border-0 rounded-3">

                    <i className="bi bi-info-circle me-2"></i>

                    Please send a copy of SAP upload
                    template for pricing amendments

                  </div>

                  <div className="row g-4 mb-4">

                    <div className="col-md-6">

                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="file_name"
                        control={control}
                        label="File Name"
                      />

                    </div>

                    <div className="col-md-6">

                      <FormInput
                      disabled={isModalFieldsDisabled}
                        name="pricing_condition"
                        control={control}
                        label="Pricing Condition"
                      />

                    </div>

                  </div>

                  <div className="table-responsive">

                    <table className="table align-middle table-hover">

                      <thead className="table-light">

                        <tr>
                          <th>Pricing Type</th>
                          <th>Code</th>
                        </tr>

                      </thead>

                      <tbody>

                        {pricingCheckboxes.map(chk => (

                          <tr key={chk.name}>

                            <td>

                              <FormCheckbox
                                name={chk.name}
                                control={control}
                                label={chk.label}
                                disabled={chk.disabled}
                              />

                            </td>

                            <td>
                              <span className="badge bg-secondary">
                                {chk.code}
                              </span>
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>
              <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-header bg-white border-0 py-3">
                  <h6 className="fw-bold mb-0">
                    CDD Clearance Attachments
                  </h6>
                </div>

                <div className="card-body">
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

            {/* ===== FOOTER ===== */}

            <div className="modal-footer border-0 bg-white">

              <button
                className="btn btn-outline-danger px-4"
                onClick={handleClear}
              >
                Clear
              </button>
              {shouldShowSubmitButton && (
                <LoadingButton
                  className="btn btn-primary px-4 shadow-sm"
                  asyncAction={async () => handleSubmitButtonClick()}
                  loadingKey="energy-submit"
                >
                  Submit
                </LoadingButton>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
});

export default EnergyErpForm;