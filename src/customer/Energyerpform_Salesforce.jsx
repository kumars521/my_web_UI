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

import ShipToAddressPage from "../energy_erp_forms/Ship_To_Address";
import SoldToAddressPage from "../energy_erp_forms/Sold_ToAddress";
import PricingBillingAddress from "../energy_erp_forms/PricingBillingAddress";
import EditableSortable_noaction from "../components/form/EditableSortable_noaction"
import {GetEnergyManualERPFormData} from "../api/energyformapis"
import {Energy_ERP_createCustomerRequest} from "../api/energyformapis"
import {UpdateEnergyManualERPData_FromUoaForm} from "../api/energyformapis"
import {SendSubmitEmail} from "../api/energyformapis"

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
  const defaultFormValues = {
    // Case Information
    casetype: "",
 
    // Sold To Address
    soldtono: "",

    // Ship To Address
    shiptono: "",

  };

  const { control, watch, reset, setValue,getValues , handleSubmit } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: defaultFormValues,energyERPfrequency: "QUARTERLY",
  });
  const { fields, append, update, remove } = useFieldArray({ control, name: "responseData" });

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
  const amendmodifytechnicaloffer = watch("amendmodifytechnicaloffer");
  const [Responddata,setResponddata]=useState([]);
  const [searchcompanyResponddata,setsearchcompanyResponddata]=useState([]);
  const offerforexistingvessel = watch("offerforexistingvessel");
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
          // companyIdKeys.forEach((key) => params.delete(key));
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
  const handlesearchcustomerID = async (CompanySearch) => {
    try {
      const payload = { CompanyID: CompanySearch };
      
      console.log("Searching for CompanyID:", payload);
      const resp = await GetEnergyManualERPFormData(payload);

      const responseData = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.data)
        ? resp.data
        : [];

      console.log("Customer Data Response:", responseData);

      if (!responseData || responseData.length === 0) {
        // alert("No data found for given input");
        setResponddata("No data found for given input");
      } else {
        setResponddata(responseData);
      }

      const customer = responseData[0] || {};

      // console.log("Customer Response:", customer);

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
      console.log("Parsed GME Country:",  parsedGmeCountry);
      console.log("Parsed GME Region:",  parsedGmeRegion);
      if (responseData.length > 0) {
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
          responseData: Array.isArray(customer.responseData) ? customer.responseData : defaultFormValues.responseData,
          
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

  const handleClear = () => {
    reset({ ...defaultFormValues });
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

  const handleSelectAssetChange = (selectedOption) => {
    const selectedAsset = Responddata?.find(
      item => item.companyAssetID === selectedOption
    );

    const selectedAssetName = selectedAsset?.asset_name || "";
    console.log(selectedOption);
    console.log(selectedAssetName);
    // setValue("assetname", selectedOption?.asset_name || "");
    setValue("selectedassetId", selectedOption || "");
    setValue("shipto_legal_entity", selectedAssetName || "");
    setValue("shiptono", selectedOption.asset_shipto_id || 0);
    
  };
  
  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      const payload = {
        companyID: data.SelectedCustomerID,
        companyAssetID: 0,
        soldtono: data.soldtono,
        asset_shipto_id: data.shiptono,
      };

      console.log("API Payload:", payload);
      const res = await UpdateEnergyManualERPData_FromUoaForm(payload);
      console.log("API response:", res);


      await handleSendSubmitEmail(data.SelectedCustomerID);

      setOpenModal(false);
      reset({ ...defaultFormValues });


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
          <button  onClick={handleAdd}>
            {/* <i className="bi bi-plus-circle me-2"></i> ERP Form */}
          </button>

        </div>

      </div>
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

              {/* <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setOpenModal(false)}
              ></button> */}

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
                    <FormSelect disabled
                      name="energyERPcustType"
                      control={control}
                      label="Type Of Customer"
                      options={[{label:"Indirect",value:"indirect"},{label:"direct",value:"Direct"},{label:"JD Edwards",value:"jdedwards"},{label:"Industrial",value:"Industrial"}]}
                    />
                  </div>
                  <div className="col-md-3">
                    <FormSelect disabled
                      name="energyERPsystem"
                      control={control}
                      label="ERP System"
                      options={[{label:"SAP",value:"SAP"},{label:"JDE",value:"JDE"}]}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      disabled
                      name="SelectedCustomerID"
                      control={control}
                      label="Customer ID from ERP"
                    />
                  </div>
                  <div className="col-md-3">
                    <FormInput
                      disabled
                      disabled
                      name="PricingPolicy"
                      control={control}
                      label="Pricing Policy"
                    />
                  </div>
                </div>
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
                      disabled
                      
                      name="cust_name"
                      control={control}
                      label="Customer Name"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="requsted_by"
                      control={control}
                      label="Requested By"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="approved_by"
                      control={control}
                      label="Approved By"
                    />
                  </div>

                  <div className="col-md-3">
                    {/* <Typography>Effective Date</Typography> */}

                    <FormInput
                      disabled
                      sx={{width:230}}
                      type="date"
                      name="effective_date"
                      control={control}
                      label="Effective Date"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="doc_num"
                      control={control}
                      label="Document No"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect disabled
                      name="sales_org"
                      control={control}
                      label="Sales Organisation"
                      options={opt_sales_org}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect disabled
                      name="dist_channel"
                      control={control}
                      label="Distribution Channel"
                      options={opt_distribution_channel}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormSelect disabled
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
                    <FormSelect disabled
                      name="typeofrequest"
                      control={control}
                      label="Type Of Request"
                      options={opt_Typeofrequest}
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <FormSelect disabled
                      name="energyERPaccounttype"
                      control={control}
                      label="Type Of Account"
                      options={opt_accounttype}
                    />
                  </div>
                  <div className="col-lg-3">
                    <FormSelect disabled
                      name="energyERPfrequency"
                      control={control}
                      label="Energy ERP Frequency"
                      options={[
                        { label: "1M", value: "MONTHLY" },
                        { label: "3M", value: "QUARTERLY",defaultValue:"3M" },
                        { label: "6M", value: "HALFYEARLY" },
                        { label: "12M", value: "YEARLY" }
                      ]}
                    />
                  </div>
                </div>
                <div className="row g-3 mt-3">
                  <div className="col-md-3">
                    <Grid item xs={12} md={2}  sx={{ minWidth: 300 }}>
                      {/* <FormInput name="tsenameemail" control={control} label="TSE Name/Email Address No :" sx={{ width: 300 }} /> */}
                      <FormSelect disabled name="tsenameemail" control={control}  label="TSE Name/Email Address No :"
                      options={opt_tse}/>
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
                    <div className="col-lg-8">

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
                      <div className="col-lg-4">
                        <FormInput
                      disabled name="selectedassetId" control={control} label="Selected Asset ID:" sx={{ width: 300 }} />
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
                        disabled
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
                      sx={{backgroundColor:"#eec3c3"}}
                    />
                  </div>
                )}

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="legal_entity"
                      control={control}
                      label="Legal Entity"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_careoff"
                      control={control}
                      label="C/O"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_streetno"
                      control={control}
                      label="Street / House No"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_street2"
                      control={control}
                      label="Street 2"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_street3"
                      control={control}
                      label="Street 3"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_city"
                      control={control}
                      label="City"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_postcode"
                      control={control}
                      label="Postal Code"
                    />
                  </div>

                  <div className="col-md-6">

                    <FormSelectSmall
                      disabled
                      name="soldto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled
                      name="soldto_telno"
                      control={control}
                      label="Telephone"
                    />

                  </div>

                </div>

                <div className="row g-3 mt-2">

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_faxno"
                      control={control}
                      label="Fax"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_mobile"
                      control={control}
                      label="Mobile"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_email"
                      control={control}
                      label="Email"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="soldto_vat"
                      control={control}
                      label="VAT Registration"
                    />
                  </div>

                </div>

                <div className="row g-3 mt-3">

                  <div className="col-md-3">

                    <FormInput
                      disabled
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
                      disabled
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
                      sx={{backgroundColor:"#eec3c3"}}
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="shipto_legal_entity"
                      control={control}
                      label="Ship to Name 1"
                    />
                  </div>

                  <div className="col-md-3">
                    <FormInput
                      disabled
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
                      disabled
                      name="shipto_streetno"
                      control={control}
                      label="Street / House No"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled
                      name="shipto_street2"
                      control={control}
                      label="Street 2"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled
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
                      disabled
                      name="shipto_city"
                      control={control}
                      label="City"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled
                      name="shipto_postcode"
                      control={control}
                      label="Postal Code"
                    />

                  </div>

                  <div className="col-md-6">

                    <FormSelectSmall
                      disabled
                      name="shipto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled
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
                      disabled
                      name="language_key"
                      control={control}
                      label="Language Key"
                    />

                  </div>

                  <div className="col-md-3">

                    <FormInput
                      disabled
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
                        disabled
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
                      disabled
                        name={f.name}
                        control={control}
                        label={f.label}
                      />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <FormSelectSmall
                      disabled
                      name="billto_country"
                      control={control}
                      label="Country"
                      options={opt_country_with_soldtoRegion}
                    />
                  </div>
                  <div className="col-md-3">
                    <FormInput
                      disabled
                      name="billto_district"
                      control={control}
                      label="District"
                    />
                  </div>
                  <div className="col-md-6">
                    <FormInput
                      disabled
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
                          disabled
                          name={f.name}
                          control={control}
                          label={f.label}
                          options={opt_country_with_soldtoRegion}
                        />

                      ) : (

                        <FormInput
                      disabled
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
                      disabled
                        name="account_manager"
                        control={control}
                        label="Account Manager (ZR)"
                      />

                    </div>

                    <div className="col-md-6">

                      <FormInput
                      disabled
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

                      <FormSelect disabled
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

                      <FormSelect disabled
                        name="shipping_conditions"
                        control={control}
                        label="Shipping Conditions"
                        options={opt_Shipping}
                      />

                    </div>

                    <div className="col-md-4">

                      <FormSelect disabled
                        name="delivering_plant"
                        control={control}
                        label="Delivering Plant"
                        options={opt_Delivering_plant}
                      />

                    </div>

                    <div className="col-md-4">

                      <FormSelect disabled
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
                      disabled
                        name="invoicing_dates"
                        control={control}
                        label="Invoicing Dates"
                      />
                    </div>

                    <div className="col-md-4">
                      <FormSelect disabled
                        name="inco_terms"
                        control={control}
                        label="Inco Terms"
                        options={opt_Incoterm}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormInput
                      disabled
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
                      disabled
                        name="profile_centre_assignment"
                        control={control}
                        label="Profile Centre Assignment"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                      disabled
                        name="invoice_brand"
                        control={control}
                        label="Invoice Brand"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                      disabled
                        name="sub_sector"
                        control={control}
                        label="Sub Sector"
                      />
                    </div>

                    <div className="col-md-3">
                      <FormInput
                      disabled
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
                      disabled
                        name="file_name"
                        control={control}
                        label="File Name"
                      />

                    </div>

                    <div className="col-md-6">

                      <FormInput
                      disabled
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
                                disabled
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
              {/* <div className="card border-0 shadow-sm rounded-4 mb-4">

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
                </div> */}

            </div>

            {/* ===== FOOTER ===== */}

            <div className="modal-footer border-0 bg-white">

              <button
                className="btn btn-outline-danger px-4"
                onClick={handleClear}
              >
                Clear
              </button>
              {( (validationResult === "Validation Successful" && energyERPsystem === "JDE") || energyERPsystem === "SAP") && (
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