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
import LoadingButton from "../components/LoadingButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

import { useForm, useFieldArray,Controller} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import FormSelectSmall from "../components/form/FormSelectSmall";
import FormCheckbox from "../components/form/FormCheckbox";

import ShipToAddressPage from "../energy_erp_forms/Ship_To_Address";
import SoldToAddressPage from "../energy_erp_forms/Sold_ToAddress";
import PricingBillingAddress from "../energy_erp_forms/PricingBillingAddress";
import EditableSortable_noaction from "../components/form/EditableSortable_noaction"
import {GetEnergyManualERPFormData} from "../api/energyformapis"
import {Energy_ERP_createCustomerRequest} from "../api/energyformapis"
import {SaveEnergyManualERPData} from "../api/energyformapis"
import {SendSubmitEmail} from "../api/energyformapis"

import { customerSchema } from "../validation/customerSchema";
import {
  opt_industry, opt_Currency, opt_Salesoffice,
  opt_pl,  opt_Shipping ,opt_Delivering_plant,
  opt_Delivery, opt_Incoterm, opt_sales_org, opt_distribution_channel,
  opt_Typeofrequest, opt_casetypes, opt_be_zeco,
  opt_be_zvat,  opt_it_zmot,  opt_uoa_offer, opt_formFields
} from "./Opt_library";

import {vatFields, shiptoVatFields, payerFields, pricingCheckboxes, billToFields,opt_country_with_soldtoRegion,  Marine_columns,salesAreaFields } from "./Erp_Option_Library";

const EnergyErpForm = forwardRef((props, ref) => {
  const defaultFormValues = {
    // CDD Clearance
    energyERPcustType: "",
    energyERPsystem: "",
    cddcustname: "",
    rating: "",
    cddcopieddata: "",
    business: "",
    po_required: false,

    // Customer Master
    cust_name: "",
    requsted_by: "",
    approved_by: "",
    effective_date: new Date()
      .toISOString()
      .split("T")[0],
    doc_num: "",
    sales_org: "",
    dist_channel: "",
    division: "02 (Lubricants)",
    typeofrequest: "",
    energyERPaccounttype: "",
    erpnewaccounttype: "",
    tsenameemail: "",

    // Case Information
    casetype: "",
    amendmodifytechnicaloffer: "",
    offerfornewvessel: "",
    offerforexistingvessel: "",
    req_comments: "",

    // Sold To Address
    soldtono: "",
    legal_entity: "",
    soldto_careoff: "",
    soldto_streetno: "",
    soldto_street2: "",
    soldto_street3: "",
    soldto_city: "",
    soldto_postcode: "",
    soldto_country: "",
    soldto_telno: "",
    soldto_faxno: "",
    soldto_mobile: "",
    soldto_email: "",
    soldto_vat: "",
    soldto_Creditapproveno: "",
    soldto_bezeco: "",
    soldto_bezvat: "",
    soldto_dkzeco: "",
    soldto_dkzvat: "",
    soldto_fizeco: "",
    soldto_fizvat: "",
    soldto_frzeco: "",
    soldto_frzvat: "",
    soldto_gbzvat: "",
    soldto_iezvat: "",
    soldto_itzcou: "",
    soldto_itzmot: "",
    soldto_itzvat: "",
    soldto_nlzvat: "",
    soldto_nozvat: "",
    soldto_nozeco: "",
    soldto_sezvat: "",
    soldto_trzvat: "",

    // Ship To Address
    shiptono: "",
    shipto_legal_entity: "",
    shipto_careoff: "",
    shipto_streetno: "",
    shipto_street2: "",
    shipto_street3: "",
    shipto_city: "",
    shipto_postcode: "",
    shipto_country: "",
    transport_zone: "",
    language_key: "",
    shipto_district: "",
    shipto_bezeco: "",
    shipto_bezvat: "",
    shipto_dkzeco: "",
    shipto_dkzvat: "",
    shipto_fizeco: "",
    shipto_fizvat: "",
    shipto_frzeco: "",
    shipto_frzvat: "",
    shipto_gbzvat: "",
    shipto_iezvat: "",
    shipto_itzcou: "",
    shipto_itzmot: "",
    shipto_itzvat: "",
    shipto_nlzvat: "",
    shipto_nozvat: "",
    shipto_nozeco: "",
    shipto_sezvat: "",
    shipto_trzvat: "",

    // Bill To Address
    billtono: "",
    bill_name: "",
    billto_careoff: "",
    billto_streetno: "",
    billto_street2: "",
    billto_street3: "",
    billto_city: "",
    billto_postcode: "",
    billto_country: "",
    billto_district: "",
    billingemail: "",

    // Payer Address / Pricing Billing
    payerno: "",
    payer_name: "",
    payerto_careoff: "",
    payerto_streetno: "",
    payerto_street2: "",
    payerto_street3: "",
    payerto_city: "",
    payerto_postcode: "",
    payerto_country: "",
    payerto_disctrict: "",
    payment_term: "",
    acc_assgmt_group: "",
    payment_method: "",

    // Sales / Control / Shipping / Billing / Attributes / Pricing
    account_manager: "",
    key_account_manager: "",
    industry_key: "",
    sales_office: "",
    currency: "",
    price_group: "",
    price_list: "",
    shipping_conditions: "",
    delivering_plant: "",
    Delivery_priority: "",
    invoicing_dates: "",
    inco_terms: "",
    towncity: "",
    profile_centre_assignment: "",
    invoice_brand: "",
    sub_sector: "",
    customer_group: "",
    file_name: "",
    pricing_condition: "",
    a560: false,
    a513: false,
    a520: false,
    a513_duplicate: false,
    a626: false,
    tableData: [],
  };

  const { control, watch, reset, setValue, handleSubmit } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: defaultFormValues,
  });

  const { fields, append, update, remove } = useFieldArray({ control, name: "tableData" });

  const [tab, setTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const copiedData = watch("cddcopieddata");
  const customerName = watch("cddcustname");
  const rating = watch("rating");
  const business = watch("business");
  const [validationResult, setValidationResult] = useState("");
  const energyERPaccounttype = watch("energyERPaccounttype");
  const erpnewaccounttype = watch("erpnewaccounttype"); 
  const casetype = watch("casetype");
  const [mappedData, setMappedData] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const energyERPsystem = watch("energyERPsystem");
  
  useEffect(() => {
    setValue("po_required", business === "energy");
  }, [business, setValue]);

  useImperativeHandle(ref, () => ({
    openAdd: handleAdd,
  }));

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
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

    const fieldsToReset = [
      "amendmodifytechnicaloffer",
      "offerfornewvessel",
      "offerforexistingvessel",
      "req_comments"
    ];

    fieldsToReset.forEach((field) => setValue(field, ""));
  };
  const handleDropdowncchange = (e) => {
    const value = e.target.value;
  };
  const handleAdd = () => {
    setSelectedRowIndex(null);
    setOpenModal(true);
  };

  const handleEdit = (index) => {
    setSelectedRowIndex(index);
    const row = fields[index];
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
      contract_status: item.contract_status || "",
      contracted_date: item.contracted_date || "",
      currency: item.currency || "",
      cust_name: item.cust_name || "",
      customer_group: item.customer_group || "",
      division: item.division || "",
      doc_num: item.doc_num || "",
      effective_date: item.effective_date || "",
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
  
    const handlesearchcustomerID = async (CompanySearch) => {
      try {
        const payload = { CompanyID: CompanySearch };
        console.log("Searching for CompanyID:", payload);
        const resp = await GetEnergyManualERPFormData(payload);

        console.log("Customer Data Response:", resp.data);

        const tableData = Array.isArray(resp.data)
          ? resp.data
          : Array.isArray(resp.data?.data)
          ? resp.data.data
          : [];
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
            casetype: customer.casetype || "",
            currency: customer.currency || "",
            cust_name: customer.cust_name || "",
            customer_group: customer.customer_group || "",
            delivery_priority: customer.delivery_priority || "",
            delivering_plant: customer.delivering_plant || "",
            dist_channel: customer.dist_channel || "",
            division: customer.division || defaultFormValues.division,
            doc_num: customer.doc_num || "",
            effective_date: toDateInputValue(customer.effective_date),
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
            profile_centre_assignment: customer.profile_centre_assignment || "",
            req_comments: customer.req_comments || "",
            requsted_by: customer.requsted_by || "",
            sales_office: customer.sales_office || "",
            sales_org: customer.sales_org || "",
            shipping_conditions: customer.shipping_conditions || "",
            shipto_careoff: customer.shipto_careoff || "",
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
    const CompanyID =
      typeof responseOrCompanyId === "object"
        ? responseOrCompanyId.companyID
        : responseOrCompanyId;

    try {

      if (attachmentFiles && attachmentFiles.length > 0) {
        const formData = new FormData();

        formData.append("CompanyID", CompanyID);
        formData.append("RecipientEmail", "Sunil.mn@bp.com");
        formData.append("BusinessType", "Energy");

        attachmentFiles.forEach((file) => {
          formData.append("attachments", file);
        });

        await SendSubmitEmail(formData);
      } else {
        console.log("No attachments to send for email.");
      }
    } catch (error) {
      console.error("Error sending submit email:", error);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      const payload = {
        a513: data.a513,
        a513_duplicate: data.a513_duplicate,
        a520: data.a520,
        a560: data.a560,
        a626: data.a626,
        asset_name:data.shipto_legal_entity,
        asset_shipto_id:"0",
        acc_assgmt_group: data.acc_assgmt_group,
        account_manager: data.account_manager,
        approved_by: data.approved_by,
        bill_name: data.bill_name,
        billto_careoff: data.billto_careoff,
        billto_city: data.billto_city,
        billto_country: data.billto_country,
        billto_disctrict: data.billto_district,
        billto_postcode: data.billto_postcode,
        billto_street2: data.billto_street2,
        billto_street3: data.billto_street3,
        billto_Streetno: data.billto_streetno,
        billtono: data.billtono,
        Business: "Energy",
        casetype: data.casetype,
        CompanyID: 0,
        companyAssetID: 0,
        Contract_status: "Contracted",
        Contracted_date: data.effective_date,
        currency: data.currency,
        cust_name: data.cust_name,
        customer_group: data.customer_group,
        delivering_plant: data.delivering_plant,
        Delivery_priority: data.Delivery_priority,
        dist_channel: data.dist_channel,
        division: data.division,
        doc_num: data.doc_num,
        effective_date: data.effective_date,
        erp_system: data.energyERPsystem,
        file_name: data.file_name,
        Frequency: "",
        inco_terms: data.inco_terms,
        industry_key: data.industry_key,
        invoice_brand: data.invoice_brand,
        invoicing_dates: data.invoicing_dates,
        Invoicing_Type: "",
        key_account_manager: data.key_account_manager,
        language_key: data.language_key,
        legal_entity: data.legal_entity,
        offerforexistingvessel: data.offerforexistingvessel,
        offerfornewvessel: data.offerfornewvessel,
        payer_name: data.payer_name,
        payerno: data.payerno,
        payerto_careoff: data.payerto_careoff,
        payerto_city: data.payerto_city,
        payerto_country: data.payerto_country,
        payerto_disctrict: data.payerto_disctrict,
        payerto_postcode: data.payerto_postcode,
        payerto_street2: data.payerto_street2,
        payerto_street3: data.payerto_street3,
        payerto_Streetno: data.payerto_streetno,
        payment_method: data.payment_method,
        payment_term: data.payment_term,
        price_group: data.price_group,
        price_list: data.price_list,
        pricing_condition: data.pricing_condition,
        profile_centre_assignment: data.profile_centre_assignment,
        purchase_order: false,
        req_comments: data.req_comments,
        requsted_by: data.requsted_by,
        sales_office: data.sales_office,
        sales_org: data.sales_org,
        service_offer: "",
        shipping_conditions: data.shipping_conditions,
        shipto_legal_entity: data.shipto_legal_entity,
        shiptono: data.shiptono,
        shipto_bezeco: data.shipto_bezeco,
        shipto_bezvat: data.shipto_bezvat,
        shipto_careoff: data.shipto_careoff,
        shipto_city: data.shipto_city,
        shipto_country: data.shipto_country,
        shipto_district: data.shipto_district,
        shipto_dkzeco: data.shipto_dkzeco,
        shipto_dkzvat: data.shipto_dkzvat,
        shipto_fizeco: data.shipto_fizeco,
        shipto_fizvat: data.shipto_fizvat,
        shipto_frzeco: data.shipto_frzeco,
        shipto_frzvat: data.shipto_frzvat,
        shipto_gbzvat: data.shipto_gbzvat,
        shipto_iezvat: data.shipto_iezvat,
        shipto_itzcou: data.shipto_itzcou,
        shipto_itzmot: data.shipto_itzmot,
        shipto_itzvat: data.shipto_itzvat,
        shipto_nlzvat: data.shipto_nlzvat,
        shipto_nozeco: data.shipto_nozeco,
        shipto_nozvat: data.shipto_nozvat,
        shipto_postcode: data.shipto_postcode,
        shipto_sezvat: data.shipto_sezvat,
        shipto_street2: data.shipto_street2,
        shipto_street3: data.shipto_street3,
        shipto_Streetno: data.shipto_streetno,
        shipto_trzvat: data.shipto_trzvat,
        soldto_bezeco: data.soldto_bezeco,
        soldto_bezvat: data.soldto_bezvat,
        soldto_careoff: data.soldto_careoff,
        soldto_city: data.soldto_city,
        soldto_country: data.soldto_country,
        soldto_Creditapproveno: data.soldto_Creditapproveno,
        soldto_dkzeco: data.soldto_dkzeco,
        soldto_dkzvat: data.soldto_dkzvat,
        soldto_email: data.soldto_email,
        soldto_faxno: data.soldto_faxno,
        soldto_fizeco: data.soldto_fizeco,
        soldto_fizvat: data.soldto_fizvat,
        soldto_frzeco: data.soldto_frzeco,
        soldto_frzvat: data.soldto_frzvat,
        soldto_gbzvat: data.soldto_gbzvat,
        soldto_iezvat: data.soldto_iezvat,
        soldto_itzcou: data.soldto_itzcou,
        soldto_itzmot: data.soldto_itzmot,
        soldto_itzvat: data.soldto_itzvat,
        soldto_mobile: data.soldto_mobile,
        soldto_nlzvat: data.soldto_nlzvat,
        soldto_nozeco: data.soldto_nozeco,
        soldto_nozvat: data.soldto_nozvat,
        soldto_postcode: data.soldto_postcode,
        soldto_sezvat: data.soldto_sezvat,
        soldto_street2: data.soldto_street2,
        soldto_street3: data.soldto_street3,
        soldto_streetno: data.soldto_streetno,
        soldto_telno: data.soldto_telno,
        soldto_trzvat: data.soldto_trzvat,
        soldto_vat: data.soldto_vat,
        soldtono: data.soldtono,
        sub_sector: data.sub_sector,
        towncity: data.towncity,
        transport_zone: data.transport_zone,
        tse_owner: data.tsenameemail,
        typeofrequest: data.typeofrequest,

      };

      console.log("API Payload:", payload);
      const res = await SaveEnergyManualERPData(payload);
      console.log("API response:", res);

      console.log("Customer saved successfully");

      await handleSendSubmitEmail(res, attachments);

      setOpenModal(false);
      handlegetenergyerpdata();

    } catch (err) {
      console.error(err);
      alert("Error saving customer");
    }
  };


  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* ================= PAGE HEADER ================= */}

      <div className="row align-items-center mb-4">

        <div className="col-lg">
          <h2 className="fw-bold text-dark mb-1">
            Energy Customer Management
          </h2>
          <p className="text-muted mb-0">Create, manage and maintain Energy ERP customer records</p>
        </div>

        <div className="col-lg-auto d-flex flex-wrap gap-2 justify-content-lg-end">
                <LoadingButton className="btn btn-primary px-4 shadow-sm" asyncAction={async () => handleAdd()} loadingKey="erpform-open">
                  <i className="bi bi-plus-circle me-2"></i> ERP Form
                </LoadingButton>
          <button className="btn btn-success px-4 shadow-sm" onClick={handlegetenergyerpdata}>
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

      <div className="card border-0 shadow rounded-4">

        <div className="card-header bg-white border-0 py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="fw-bold mb-0">
              Energy ERP Customer List
            </h5>

            <span className="badge bg-primary rounded-pill px-3 py-2">
              {mappedData?.length || 0} Records
            </span>

          </div>

        </div>

        <div className="card-body">

          <EditableSortable_noaction
            columns={Marine_columns}
            rowData={mappedData}
            control={control}
            onDelete={handleDeleteRow}
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

        <div className="modal-dialog modal-dialog-scrollable modal-fullscreen-xl-down modal-xl">

          <div className="modal-content border-0 rounded-4 shadow-lg">

            {/* ===== MODAL HEADER ===== */}
            <div className="modal-header border-0 bg-primary text-white rounded-top-4">

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
                      name="energyERPcustType"
                      control={control}
                      label="Type Of Customer"
                      options={[{label:"Indirect",value:"indirect"},{label:"direct",value:"Direct"},{label:"JD Edwards",value:"jdedwards"},{label:"Industrial",value:"Industrial"}]}
                    />
                  </div>
                  <div className="col-md-3">
                    <FormSelect
                      name="energyERPsystem"
                      control={control}
                      label="ERP System"
                      options={[{label:"SAP",value:"SAP"},{label:"JDE",value:"JDE"}]}
                    />
                  </div>
                </div>
                {energyERPsystem === "JDE" && (
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
              {energyERPsystem === "JDE" && (
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

                  <div className="col-md-3">
                    <FormInput
                      
                      name="cust_name"
                      control={control}
                      label="Customer Name"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="requsted_by"
                      control={control}
                      label="Requested By"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="approved_by"
                      control={control}
                      label="Approved By"
                    />
                  </div>

                  <div className="col-md-3">
                    <Typography>Effective Date</Typography>

                    <FormInput
                      sx={{width:230}}
                      type="date"
                      name="effective_date"
                      control={control}
                      // label="Effective Date"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="doc_num"
                      control={control}
                      label="Document No"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
                      name="sales_org"
                      control={control}
                      label="Sales Organisation"
                      options={opt_sales_org}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
                      name="dist_channel"
                      control={control}
                      label="Distribution Channel"
                      options={opt_distribution_channel}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect
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
                      name="typeofrequest"
                      control={control}
                      label="Type Of Request"
                      options={opt_Typeofrequest}
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <FormSelect
                      name="energyERPaccounttype"
                      control={control}
                      label="Type Of Account"
                      options={opt_accounttype}
                    />
                  </div>
                  {/* {energyERPaccounttype === "newaccount" && (
                  <div className="col-md-3">
                    <FormSelect
                      name="erpnewaccounttype"
                      control={control}
                      label="New Account Type"
                      options={[
                        { label:"Local Entity",value:"localentity"},
                        {label:"BP Marine Ltd",value:"bpmarineltd"}
                        ]}
                    />

                  </div>

                )}
                <div className="col-md-3">
                  {erpnewaccounttype=== "localentity" && (
                  <Typography  className="mt-2"> 
                    Domestic sales organization  
                  </Typography>)}
                  {erpnewaccounttype=== "bpmarineltd" && (
                  <Typography  className="mt-2">
                    GB5X 
                  </Typography>)}
                </div>           */}
                </div>
                <div className="row g-3 mt-3">
                  <div className="col-md-3">
                    <Grid item xs={12} md={2}>
                      <FormInput name="tsenameemail" control={control} label="TSE Name/Email Address No :" sx={{ width: 300 }} />
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

                  <div className="col-lg-4 col-md-6">

                    <FormSelect
                      name="casetype"
                      control={control}
                      label="Case Type"
                      options={opt_casetypes}
                      onChange={(e)=>
                        handlecasetypechange(
                          e.target.value
                        )
                      }
                    />

                  </div>
                  {(casetype ===  "offerfornewvessel" || casetype === "offerforexistingcustomer") && (  
                  <div className="card border-0 shadow-sm rounded-5 overflow-hidden mb-4">
                    <div className="card-body p-4 bg-light">
                      <div className="row g-3 align-items-center">
                        <div className="col-md-8">
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
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                  


                  {casetype ===
                  "offerforexistingcustomer" && (

                    <div className="col-lg-6">

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


                  {/* {casetype ===  "offerfornewvessel" && (

                    <div className="col-lg-5">

                      <FormSelect
                        name="offerfornewvessel"
                        control={control}
                        label="Offer For New Vessel"
                        onChange={
                          handleDropdowncchange
                        }
                        options={[
                          {
                            label:
                            "Customer Level UOA Offer",
                            value:
                            "custleveluoaoffer"
                          },

                          {
                            label:
                            "Vessel Specific UOA Offer",
                            value:
                            "vesselleveluoaoffer"
                          }
                        ]}
                      />

                    </div>

                  )} */}


                  {casetype ===
                  "offerforexistingvessel" && (

                    <div className="col-lg-8">

                      <FormSelect
                        name="offerforexistingvessel"
                        control={control}
                        label="Offer For Existing Vessel"
                        options={opt_uoa_offer}
                        onChange={
                          handleDropdowncchange
                        }
                      />

                    </div>

                  )}


                  {casetype === "other" && (

                    <div className="col-12">

                      <FormInput
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
                      name="soldtono"
                      control={control}
                      label="SOLD TO No"
                    />
                  </div>
                )}

                  <div className="col-md-3">
                    <FormInput
                      name="legal_entity"
                      control={control}
                      label="Legal Entity"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_careoff"
                      control={control}
                      label="C/O"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_streetno"
                      control={control}
                      label="Street / House No"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_street2"
                      control={control}
                      label="Street 2"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_street3"
                      control={control}
                      label="Street 3"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_city"
                      control={control}
                      label="City"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_postcode"
                      control={control}
                      label="Postal Code"
                    />
                  </div>

                  <div className="col-md-6">

                    <FormSelectSmall
                      name="soldto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      name="soldto_telno"
                      control={control}
                      label="Telephone"
                    />

                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_faxno"
                      control={control}
                      label="Fax"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_mobile"
                      control={control}
                      label="Mobile"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_email"
                      control={control}
                      label="Email"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="soldto_vat"
                      control={control}
                      label="VAT Registration"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-3">

                  <div className="col-md-3">

                    <FormInput
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
                      name="shiptono"
                      control={control}
                      label="Ship TO No."
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      name="shipto_legal_entity"
                      control={control}
                      label="Ship to Name 1"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
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
                      name="shipto_streetno"
                      control={control}
                      label="Street / House No"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      name="shipto_street2"
                      control={control}
                      label="Street 2"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
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
                      name="shipto_city"
                      control={control}
                      label="City"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      name="shipto_postcode"
                      control={control}
                      label="Postal Code"
                    />

                  </div>

                  <div className="col-md-6">

                    <FormSelectSmall
                      name="shipto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
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
                      name="language_key"
                      control={control}
                      label="Language Key"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
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
                        name={f.name}
                        control={control}
                        label={f.label}
                      />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <FormSelectSmall
                      name="billto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />
                  </div>
                  <div className="col-md-3">
                    <FormInput
                      name="billto_district"
                      control={control}
                      label="District"
                    />
                  </div>
                  <div className="col-md-6">
                    <FormInput
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
                          name={f.name}
                          control={control}
                          label={f.label}
                          options={opt_country_with_soldtoRegion}
                        />

                      ) : (

                        <FormInput
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
                        name="account_manager"
                        control={control}
                        label="Account Manager (ZR)"
                      />

                    </div>

                    <div className="col-md-6">

                      <FormInput
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

                    {salesAreaFields.map(field => (

                      <div
                        className="col-md-3"
                        key={field.name}
                      >

                        <field.component
                          name={field.name}
                          control={control}
                          label={field.label}
                          options={field.options || []}
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
                        name="shipping_conditions"
                        control={control}
                        label="Shipping Conditions"
                        options={opt_Shipping}
                      />

                    </div>

                    <div className="col-md-4">

                      <FormSelect
                        name="delivering_plant"
                        control={control}
                        label="Delivering Plant"
                        options={opt_Delivering_plant}
                      />

                    </div>

                    <div className="col-md-4">

                      <FormSelect
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
                        name="invoicing_dates"
                        control={control}
                        label="Invoicing Dates"
                      />
                    </div>

                    <div className="col-md-4">
                      <FormSelect
                        name="inco_terms"
                        control={control}
                        label="Inco Terms"
                        options={opt_Incoterm}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormInput
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
                        name="profile_centre_assignment"
                        control={control}
                        label="Profile Centre Assignment"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                        name="invoice_brand"
                        control={control}
                        label="Invoice Brand"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                        name="sub_sector"
                        control={control}
                        label="Sub Sector"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
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
                        name="file_name"
                        control={control}
                        label="File Name"
                      />

                    </div>

                    <div className="col-md-6">

                      <FormInput
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

            {/* ===== FOOTER ===== */}

            <div className="modal-footer border-0 bg-white">

              <button
                className="btn btn-outline-danger px-4"
                onClick={handleClear}
              >
                Clear
              </button>
              {(
                (validationResult === "Validation Successful" && energyERPsystem === "JDE") ||
                energyERPsystem === "SAP"
              ) && (              
              <button
                className="btn btn-primary px-4 shadow-sm"
                onClick={handleSubmit(onSubmit)}
              >
                Submit
              </button>
            )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
});

export default EnergyErpForm;