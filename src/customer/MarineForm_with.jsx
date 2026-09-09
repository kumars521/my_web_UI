import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,useRef
} from "react";

import {
  Box,
  Grid,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SaveMarineManualERPData } from "../api/energyformapis";
import {
  useForm,
  useFieldArray,
} from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import DeleteIcon from "@mui/icons-material/Delete";
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import EditableSortableTable from "../components/form/EditableSortableTable";
import FormSelectSmall from "../components/form/FormSelectSmall";
import Erp_Form from "../marine_erp_forms/Erp_Form";
import VesselList from "../marine_erp_forms/VesselList";
import { customerSchema } from "../validation/customerSchema";

import { GetMarineManualERPFormData } from "../api/energyformapis";

import {
  opt_newaccount,
  opt_country,
  opt_marine_uoaoffer,
  opt_casetypes,
  opt_formFields,
  opt_uoa_offer,
  opt_countrysalesregionmapping,
  opt_uoa_Currency,
  opt_uoa_invoicing_freq,
  opt_service_desc,
} from "../customer/Opt_library";

import { opt_country_with_soldtoRegion } from "../customer/Settings_Library";
import "./MarineForm.css";

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
  { field: "oldvesselname", headerName: "Old Vessel Name" },
  { field: "addchangedelete", headerName: "Add/Change/Delete" },
  { field: "imolrnno", headerName: "IMO/LRN No" },
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
    setValue,reset,
    } = useForm({
    resolver: yupResolver(customerSchema),
        defaultValues: {
        effective_date: new Date()
      .toISOString()
      .split("T")[0],
        tableData: [],
        technicalemail: "",
        pricingpolicy: "",
        servicedescription: "Basic Sample",
        uoafocyear: "",
        uoachargeunit: "",

        uoaSamples: [
          {
            sample_uoa: "",
            focyear_uoa: "",
            chargeunit_uoa: "",
          },
        ],

        // ================= SDA =================
        sdaofferinclude: "",
        sdapricingpolicy: "",
        sdaservicedescription: "SDA basic (Fuel & System)",
        sdachargeunit: "",

        sdaSamples: [
          {
            sample_sda: "",
            focyear_sda: "",
            chargeunit_sda: "",
          },
        ],
    },
    });
  // ---------------- STATE ----------------
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const uoaRef = useRef(null);
  const casetype = watch("casetype");
  const salesAccountType = watch("salesaccounttype");
  const erpsystemtype = watch("erpsystemtype");
  const selectedCountry = watch("registered_country");
  const [tab, setTab] = useState(0);
  const [mappedData, setMappedData] = useState([]);
  // const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  // const erpFormRef = useRef(null);
    // ---------- FIELD ARRAYS ----------
  const {
    fields: uoaFields,
    append: addUoa,
    remove: removeUoa,
  } = useFieldArray({
    control,
    name: "uoaSamples",
  });

  const {
    fields: sdaFields,
    append: addSda,
    remove: removeSda,
  } = useFieldArray({
    control,
    name: "sdaSamples",
  });
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
  // Field Array (table data)
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "tableData",
  });
    // ---------------- HELPERS ----------------
  const createEmptyRow = () =>
    vesselColumns.reduce((acc, col) => {
      acc[col.field] = "";
      return acc;
    }, {});
  const formatDate = (value) => {
    if (!value) return "";

    // Excel serial date support
    if (!isNaN(value)) {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toLocaleDateString();
    }

    return new Date(value).toLocaleDateString();
  };

  // ---------------- HANDLERS ----------------
  const handleAdd = () => {
    setSelectedRowIndex(null);
    setOpenModal(true);
  };
  const handleAddRow = () => {
      append(createEmptyRow());
  };
  const currencyBadge = (value) => (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        background: "#1976d2",
        color: "#fff",
        fontSize: 12,
      }}
    >
      {value}
    </span>
  );
  const booleanBadge = (value) => {
    const isTrue =
      value === true ||
      value === "TRUE" ||
      value === "Yes" ||
      value === "yes";

    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 6,
          background: isTrue ? "#2e7d32" : "#d32f2f",
          color: "#fff",
          fontSize: 12,
        }}
      >
        {isTrue ? "Yes" : "No"}
      </span>
    );
  };
  const Marine_columns = [
    { field: "companyID", headerName: "Company ID" },
    { field: "cust_name", headerName: "Customer Name" },
    { field: "erp_system", headerName: "ERP System" },
    { field: "vessel_name", headerName: "Vessel Name" },
    { field: "vessel_sap_id", headerName: "Vessel SAP ID" },
    { field: "imo_number", headerName: "IMO Number" },
    { field: "tse_owner", headerName: "TSE Owner" },
    { field: "contract_status", headerName: "Contract Status" },
    { field: "contracted_date", headerName: "Contracted Date" },
    { field: "gmE_Region", headerName: "GME Region" },
    { field: "gmE_Country", headerName: "GME Country" },
    { field: "sales_Region", headerName: "Sales Region" },
    { field: "sales_Country", headerName: "Sales Country" },
    { field: "currency", headerName: "Currency" },
    { field: "business", headerName: "Business" },
    { field: "invoicing_Type", headerName: "Invoicing Type" },
    { field: "offer_at_vessel_level", headerName: "Offer At Vessel Level" },
    { field: "Frequency", headerName: "Frequency" },
    { field: "offer_band", headerName: "Offer Band" },
    { field: "foc", headerName: "FOC" },
    { field: "price", headerName: "Price" }
  ];
  const defaultRows_Cust= [
      { customerid: "2701",
        name: "SEROS SHIPPING PVT LTD",
        gstname: "",
        sourceerpsystem: "SAP",
        business: "Marine",
        soldto: "12453597",
        customertseowner: "",
        caid: "",
        basicuoaoverride: "",
        accountneumonic: "",
        currency: "USD",
        frequency: "12M",
        validpo: "n/a",
        porequired: "FALSE",
        status: "Contracted",
        contracteddate: "44530",
        enddate: "",
        bookedout: "manish.upadhyay1@bp.com",
        automaticinvoicing: "No",
        notes: "",
        openinvoices: "0",
        annualsda: "FALSE",
        offerversion: "Pre-2022",
        serviceofferbandbasic: "FALSE",
        serviceofferbandbasicauto: "FALSE",
        serviceofferbandbasicvalue: "FALSE",
        serviceofferbandsda: "",
        serviceofferbandspecialist: "",
        prorata: "TRUE"
  
      }
      // { band: "2", foc: "Bob", price: "30", currency: "$150" }
    ];
  const handleClose = () => {
    setOpenModal(false);
  };
  const handlegetmarinedata = async () => {
    try {
      console.log("Fetching marine data for:", );

      const res = await GetMarineManualERPFormData();

      console.log("API response:", res);
      const tableData = Array.isArray(res)
        ? res
        : res?.data || [];

      console.log("response Data",res);
      const updatedMappedData = tableData.map((data) => ({
        companyID: data.companyID || "",
        cust_name: data.cust_name || "",
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
        offer_band: data.offer_band || "",
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
    // TODO: connect with react-hook-form reset
    console.log("Clear form");
  };
  const handleSubmitForm = async (data) => {
    // const data = await erpFormRef.current.submitForm();
    console.log("FORM DATA =", data);
    const payload = {
      accountname: "",
      agreementchange: data.agreementchange,
      approvalattachments: data.approvalattachments,
      approved_by: data.approved_by,
      approvedby_secondary: data.approvedby_secondary,
      approvedcreditlimit: data.approvedcreditlimit,
      bankaccntnumber: data.bankaccntnumber,
      bankname: data.bankingname,
      banksortcode: data.banksortcode,
      beneficiary: data.beneficiary,
      billtoparty: data.billtoparty,
      business: "Marine",
      cabmnmc: data.cabmnmc,
      cabmnmc_soldtoid: data.cabmnmc_soldtoid,
      chargemodel: data.chargemodel,
      CompanyID: 0,
      CompanyAssetID:0,
      contract_status: "",
      contracted_date: data.effective_date ||"",
      creditapprovalchange: data.creditapprovalchange ,
      creditapprovalnumber: data.creditapprovalnumber,
      creditreleasedate: data.creditreleasedate,
      currency: data.uoacurrency || "",
      cust_name: data.soldtoname,
      custaccountname: data.Custaccountname,
      custacctmnmc: data.custacctmnmc,
      custdetailschanghe: data.custdetailschange,
      custometaccountmnmc: data.custometaccountmnmc,
      data_source: "",
      daysfrom: data.daysfrom,
      directtocustomer: data.directtocustomer,
      // directtocustomer: data.directtocustomer,
      Discount: "",
      doc_num: data.doc_num ||"0",
      documentpreparedby: data.documentpreparedby,
      domestic: data.domestic,
      effectivatedateratechange: data.effectivatedateratechange,
      effective_date: data.effective_date,
      erp_system: data.marineerpsystemtype,
      extrainvoiceaddress: data.extrainvoiceaddress,
      faxnumber: data.faxnumber,
      FOC: data.uoafocyear,
      Frequency: data.uoainvoicingfrwequency,
      GME_Country: "",
      GME_Region: "",
      iciscustomer: data.iciscustomer,
      icisrate: data.icisrate,
      imo_number: "",
      includeuoaoffer: data.includeuoaoffer,
      international: data.international === "Yes" ? true : false,
      investmentapprovedby: data.investmentapprovedby,
      investmentdeatils: data.investmentdeatils,
      investmentrequired: data.investmentrequired,
      invoicepoint_city: data.invoicepoint_city,
      invoicepoint_country: data.invoicepoint_country,
      invoicepoint_postcode: data.invoicepoint_postcode,
      invoicepoint_street2: data.invoicepoint_street2,
      invoicepoint_street3: data.invoicepoint_street3,
      invoicepoint_street4: data.invoicepoint_street4,
      invoicepoint_streetno: data.invoicepoint_streetno,
      invoicepointmnmc: data.invoicepointmnmc,
      invoicepointname: data.invoicepointname,
      invoicing_Type: "",
      localinternational: data.localinternational,
      name1: data.name1,
      name2: data.name2,
      name3: data.name3,
      name4: data.name4,
      netcasenumber: data.netcasenumber,
      Nettool_doc_number: "",
      newaccountsetup: data.newaccountsetup,
      newvesselsetup: data.newvesselsetup,
      offer_at_vessel_level: data.offerfornewvessel,
      offer_at_vessel_level:false,
      offer_band: data.servicedescription,
      originaldrn: data.originaldrn,
      otherpaymentterm: data.otherpaymentterm,
      otherroute: data.otherroute,
      paymentmethod: data.paymentmethod,
      paymentterm: data.paymentterm,
      pdfinvoceemail: data.pdfinvoceemail,
      Price: data.prepaidsamlebottlepack,
      pricelisttoapply: data.pricelisttoapply,
      printerlocation: data.printerlocation,
      printername: data.printername,
      priority: data.priority,
      purou: data.purou,
      rebateattachments: data.rebateattachments,
      rebatechange: data.rebatechange,
      rebatedetails: data.rebatedetails,
      rebaterequired: data.rebaterequired,
      referencerequired: data.referencerequired,
      regionalmanager: data.regionalmanager,
      registered_city: data.registered_city,
      registered_country: data.registered_country,
      registered_postcode: data.registered_postcode,
      registered_street2: data.registered_street2,
      registered_street3: data.registered_street3,
      registered_streetno: data.registered_streetno,
      remarks: data.remarks,
      requsted_by: data.requsted_by,
      residencetownofbank: data.residencetownofbank,
      sales_Country: "",
      sales_Region: data.sales_Region || "",
      service_band_currency: data.service_band_currency || "",
      service_offer_Band: data.sdaservicedescription || "",
      setuptype: data.setuptype,
      soldto_city: data.soldto_city,
      soldtoname: data.soldtoname,
      swiftcode: data.swiftcode,
      taxcontractsignoff: data.taxcontractsignoff,
      tse_owner: data.tsenameemail,
      vatregno: data.vatregno,
      vessel_name: "",
      vessel_sap_id: "",
      // : data.amendmodifytechnicaloffer,
      // : data.casetype,
      // : data.Pricingdetailsapprovedby,
      // : data.pricingpolicy,
      // : data.req_comments,
      // : data.salesaccountdescription_existingaccount,
      // : data.salesaccountdescription_newaccount,
      // : data.salesaccounttype,
      // : data.sdachargeunit,
      // : data.sdacomments,
      // : data.sdaofferinclude,
      // : data.sdapricingpolicy,
      // : data.sdaSamples,
      // : data.sdaservicedescription,
      // : data.servicedescription,
      // : data.soldto_city,
      // : data.technicalemail,
      // : data.typeofcustomer,
      // : data.uoachargeunit,
      // : data.uoacurrency,
      // : data.uoafocyear,
      // : data.uoaSamples,

      // vesselList: data.tableData || [],
  
      // sdaSamples: (data.sdaSamples || []).map((item) => ({
      //   sample: item.sample_sda,
      //   focYear: item.focyear_sda,
      //   chargeUnit: item.chargeunit_sda,
      // })),
      // uoaSamples: (data.uoaSamples || []).map((item) => ({
      //   sample: item.sample_uoa,
      //   focYear: item.focyear_uoa,
      //   chargeUnit: item.chargeunit_uoa,
      // })),
      // comments: data.sdacomments,

    };

    console.log("Submit payload:", payload);
    const response = await SaveMarineManualERPData(payload);
    // TODO: call API with payload or dispatch event
     setOpenModal(false);
     handlegetmarinedata();
  };
  const handleDeleteRow = (index) => {
      remove(index);
  };
  // ---------------- TAB CONTENT ----------------
  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return (
            <Box p={3} border="1px solid #ccc">
              <Grid container spacing={4}>
                <Erp_Form  />
              </Grid>
            </Box>
        );
      case 1:
        return (
            <Box p={3} >
              {/* <UOAPage  /> */}
            </Box>
        );

      default:
        return null;
    }
  };
  const handleDropdowncchange = (e) => {
      const value = e.target.value;
  };
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
// ---------------- UI ----------------
  return (
    <div className="container-fluid py-4">

      {/* ================= PAGE HEADER ================= */}

      <div className="row align-items-center mb-4">

        <div className="col-lg">
          <h1 className="fw-bold text-dark" style={{ fontSize: "2rem" }}>🚢 Marine Customer Management</h1>
          <p className="text-muted mb-0">Manage and maintain customer records efficiently</p>
        </div>

        <div className="col-lg-auto d-flex flex-wrap gap-2 justify-content-lg-end">
          <button className="btn btn-primary px-4 shadow-sm" onClick={handleAdd}>
            <i className="bi bi-plus-circle me-2"></i> ERP Form
          </button>
          <button className="btn btn-success px-4 shadow-sm" onClick={() => handlegetmarinedata()}>
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

                  <p className="text-muted mb-1">Total Customers</p>

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

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-header bg-white border-0 pt-4 pb-0">
          <h5 className="fw-semibold text-dark">
            Customer Records
          </h5>
        </div>

        <div className="card-body">
          <EditableSortableTable
            columns={Marine_columns}
            rowData={mappedData}
            control={control}
            onDelete={handleDeleteRow}
          />
        </div>

      </div>

      {/* Modal */}
      <div
        className={`modal fade ${openModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(5px)"
        }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ marginTop: "1rem" }}>
          
          <div className="modal-content border-0 rounded-4 shadow-lg" style={{ borderRadius: "1.5rem", overflow: "hidden" }}>

            {/* Modal Header */}
            <div className="modal-header border-0 pb-4 pt-4" style={{ backgroundColor: "#f8f9fa", borderRadius: "1.5rem 1.5rem 0 0" }}>
              
              <div className="flex-grow-1">
                <h4 className="modal-title fw-bold mb-1" style={{ fontSize: "1.5rem", color: "#2c3e50" }}>
                  ⚓ Marine ERP Form
                </h4>
                <p className="text-muted small mb-0" style={{ fontSize: "0.9rem" }}>
                  Complete customer details and UOA information for marine operations
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                style={{ filter: "opacity(0.5)" }}
              ></button>

            </div>

            {/* Tabs */}
            {/* <div className="px-4 pt-3">

              <ul className="nav nav-pills nav-fill bg-light rounded-3 p-2">

                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 ${
                      tab === 0 ? "active" : "text-dark"
                    }`}
                    onClick={() => setTab(0)}
                  >
                    ERP Form
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 ${
                      tab === 1 ? "active" : "text-dark"
                    }`}
                    onClick={() => setTab(1)}
                  >
                    UOA Details
                  </button>
                </li>

              </ul>

            </div> */}

            {/* Modal Body */}
            {/* <div className="modal-body px-4 py-4">
              <Erp_Form ref={erpFormRef} />
            </div> */}
              <div className="modal-body px-5 py-4" style={{ backgroundColor: "#fafbfc", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
              {/* Organizational Data */}
              <Section title="📋 Organizational Data">

              <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ backgroundColor: "#fff" }}>
                  <div className="card-body p-5">

                  {/* Header */}
                  <div className="row align-items-center g-4 mb-4 pb-3 border-bottom">

                      <div className="col-lg-3 col-md-4">
                      <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                          📄 ERP System Update Document
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

                  </div>

                  {/* Requested / Approved */}
                  <div className="row g-4 mb-4 pb-4 border-bottom">

                      <div className="col-lg-3 col-md-6">
                      <FormInput
                          className="w-100"
                          name="requsted_by"
                          control={control}
                          label="👤 Requested By"
                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormInput
                          className="w-100"
                          name="approved_by"
                          control={control}
                          label="✅ Approved By"
                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormInput
                          className="w-100"
                          type="date"
                          name="effective_date"
                          control={control}
                          label="📅 Effective Date"
                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormInput
                          className="w-100"
                          name="doc_num"
                          control={control}
                          label="📋 Document No"
                      />
                      </div>

                  </div>

                  {/* Case Type */}
                  <div className="row g-4 mb-0">

                      <div className="col-lg-4 col-md-6">
                      <FormSelect
                          name="casetype"
                          control={control}
                          label="🏷️ Case Type"
                          onChange={(e) =>
                          handlecasetypechange(e.target.value)
                          }
                          options={opt_casetypes}
                      />
                      </div>

                      {casetype ===
                      "offerforexistingcustomer" && (
                      <div className="col-lg-4 col-md-6">
                          <FormSelect
                          name="amendmodifytechnicaloffer"
                          control={control}
                          label="✏️ Amend / Modify Existing Offer"
                          onChange={handleDropdowncchange}
                          options={opt_formFields}
                          />
                      </div>
                      )}

                      {casetype ===
                      "offerfornewvessel" && (
                      <div className="col-lg-4 col-md-6">
                          <FormSelect
                          name="offerfornewvessel"
                          control={control}
                          label="🆕 Offer for New Vessel"
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

                      {casetype ===
                      "offerforexistingvessel" && (
                      <div className="col-lg-6 col-md-12">
                          <FormSelect
                          name="offerforexistingvessel"
                          control={control}
                          label="⛵ Offer for Existing Vessel"
                          onChange={handleDropdowncchange}
                          options={opt_uoa_offer}
                          />
                      </div>
                      )}

                  </div>

                  {/* Comments */}
                  {casetype === "other" && (
                      <div className="row g-4 mb-0 mt-4">

                      <div className="col-12">
                          <FormInput
                          className="w-100"
                          multiline
                          rows={3}
                          name="req_comments"
                          control={control}
                          label="💬 Request Comments"
                          />
                      </div>

                      </div>
                  )}

                  {/* ERP Type */}
                  <div className="row g-4 mt-3">

                      <div className="col-lg-4 col-md-6">
                      <FormSelect
                          name="marineerpsystemtype"
                          control={control}
                          label="🔧 ERP System Type"
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

                      <div className="col-lg-4 col-md-6">
                          <FormSelect
                              name="salesaccounttype"
                              control={control}
                              label="💼 Sales Account Type"
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
                          label="🏢 Sales Organization"
                      />
                      </div>)}
                      {salesAccountType === "existingaccount" && (
                      <div className="col-lg-4 col-md-6">
                      <FormInput
                          className="w-100"
                          disabled
                          name="salesaccountdescription_existingaccount"
                          control={control}
                          label="🏢 Account Code"
                      />
                      </div>)}
                  </div>

                  </div>
              </div>

              {/* Setup Details */}
              <div className="card border-0 shadow-sm rounded-4" style={{ backgroundColor: "#fff" }}>
                  <div className="card-body p-5">

                  <h6 className="fw-bold text-dark mb-4" style={{ fontSize: "1rem" }}>⚙️ Setup Configuration</h6>

                  <div className="row g-4 mb-4 pb-4 border-bottom">

                      <div className="col-lg-3 col-md-6">
                      <FormSelect
                          name="newaccountsetup"
                          control={control}
                          label="🆕 New Account Setup"
                          options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormSelect
                          name="newvesselsetup"
                          control={control}
                          label="⛵ New Vessel Setup"
                          options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}

                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormSelect
                          name="includeuoaoffer"
                          control={control}
                          label="📊 Include UOA Offer"
                          options={opt_marine_uoaoffer}
                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormSelect
                          name="typeofcustomer"
                          control={control}
                          label="👥 Type Of Customer"
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
                  <div className="alert alert-warning border-0 rounded-4" style={{ backgroundColor: "#fff3cd", borderLeft: "4px solid #ffc107" }}>

                      <h6 className="fw-bold text-warning mb-2" style={{ fontSize: "0.9rem" }}>⚠️ Important Notes</h6>

                      <p className="mb-2 small" style={{ lineHeight: "1.6" }}>
                      <i className="bi bi-info-circle me-2"></i>If "New Account setup" and "New Vessel setup" are marked as "Yes", ensure completion of Technical email address for SDS in the UOA system data section.
                      </p>

                      <p className="mb-0 small" style={{ lineHeight: "1.6" }}>
                      <i className="bi bi-info-circle me-2"></i>Where any "Yes" is entered above, ensure a copy of the ERP form is emailed to the UOA team including the customer account number.
                      </p>

                  </div>

                  </div>
              </div>

              </Section>
              {/* Approvals */}
              <Section title="Approvals">

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">

                  {/* First Row */}
                  <div className="row g-4 mb-4">

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
                  <div className="row g-4 mb-4">

                      <div className="col-lg-6 col-md-12">
                      <FormSelectSmall
                          name="setuptype"
                          control={control}
                          label="Setup Type"
                          options={opt_newaccount}
                      />
                      </div>

                      <div className="col-lg-3 col-md-6">
                      <FormSelectSmall
                          name="priority"
                          control={control}
                          label="Priority (Optional)"
                          options={opt_newaccount}
                      />
                      </div>

                  </div>

                  {/* Details */}
                  <div className="row">

                      <div className="col-12">
                      <FormInput
                          className="w-100"
                          multiline
                          rows={6}
                          name="soldto_city"
                          control={control}
                          label="Details of Request (Please provide a brief description of the amendments required)"
                      />
                      </div>

                  </div>

                  </div>
              </div>

              </Section>
              {/* /Customer Details :/ */}
              {/* Customer Details */}
              <Section title="Customer Details">

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">

                  {/* Customer Header */}
                  <div className="row g-4 mb-4">

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
                          className="w-100"
                          name="soldtoname"
                          control={control}
                          label="Cab / Sold-to Name"
                      />
                      </div>

                      <div className="col-lg-4 col-md-6">
                      <FormInput
                          className="w-100"
                          name="cabmnmc_soldtoid"
                          control={control}
                          label="Cab MNMC / Sold-to ID"
                      />
                      </div>

                  </div>

                  {/* Registered Address */}
                  <div className="mb-3">
                      <h6 className="fw-semibold text-danger">
                      Registered Address
                      </h6>
                  </div>

                  <div className="row g-4 mb-4">

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

                  <div className="row g-4 mb-4">

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
                      {/* <div className="row g-4"> */}

                      <div className="col-lg-6 col-md-6">
                          <FormSelectSmall
                          name="registered_country"
                          control={control}
                          label="Country"
                          options={opt_country_with_soldtoRegion}
                          />
                      </div>

                      {/* <div className="col-lg-3 col-md-6">
                          <FormInput
                          className="w-100"
                          disabled
                          name="soldtoregion"
                          control={control}
                          label="Sold To Region"
                          value={
                              opt_countrysalesregionmapping[selectedCountry] || ""
                          }
                          />
                      </div> */}

                      {/* </div> */}

                  </div>

                  {/* Account Details */}
                  <div className="row g-4 mb-4">

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

                  </div>

                  {/* Invoice Point Address */}
                  <div className="mb-3">
                      <h6 className="fw-semibold text-danger">
                      Invoice Point Address
                      </h6>
                  </div>

                  <div className="row g-4 mb-4">

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

                  <div className="row g-4 mb-4">

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

                  <div className="row g-4 mb-4">

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

              </Section>
              {/* Invoice Printing and PDF Invoicing Details */}
              <Section title="Invoice Printing and PDF Invoicing Details">

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">

                  {/* First Row */}
                  <div className="row g-4 mb-4">

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
                  <div className="row g-4 mb-4">

                      <div className="col-lg-3 col-md-6">
                      <FormInput
                          className="w-100"
                          name="faxnumber"
                          control={control}
                          label="Fax Number"
                      />
                      </div>

                      <div className="col-lg-5 col-md-6">

                      <h6 className="fw-semibold text-danger mb-2">
                          Route
                      </h6>

                      <FormSelectSmall
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
                  <div className="row g-4 mb-4">

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
                      <h6 className="fw-semibold text-danger">
                      Credit Approvals
                      </h6>
                  </div>

                  <div className="row g-4">

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

              </Section>
              {/* /Vessel List :/ */}
              {/* Vessel List */}
              <Section title="Vessel List">

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                  
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center p-4">
                  <button
                      type="button"
                      className="btn btn-primary rounded-3 px-4"
                      onClick={handleAddRow}
                  >
                      + Add Vessel
                  </button>

                  </div>

                  <div className="card-body p-4">

                  <div className="table-responsive">
                      <VesselList
                      columns={vesselColumns}
                      rows={fields}
                      control={control}
                      onDelete={handleDeleteRow}
                      />
                  </div>

                  </div>

              </div>

              </Section>
              {/* Agreements */}
              <Section title="Agreements">

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">

                  {/* Agreement Type */}
                  <div className="row g-4 mb-4">

                      <div className="col-lg-4 col-md-6">
                      <FormSelectSmall
                          name="agreementchange"
                          control={control}
                          label="Customer Details Change"
                          options={opt_newaccount}
                      />
                      </div>

                      <div className="col-lg-2 col-md-6 d-flex align-items-center">
                      <h6 className="fw-semibold text-danger mb-0">
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
                  <div className="row g-4 mb-4">

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
                  <div className="row g-4 mb-4">

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
                  <div className="row g-4 mb-4">

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
                      <h6 className="fw-semibold text-danger">
                      Currency
                      </h6>
                  </div>

                  <div className="row g-4">

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

              </Section>
              {/* Rebates / Investments */}
              <Section title="Rebates / Investments">

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">

                  {/* Rebate Details */}
                  <div className="row g-4 mb-4">

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
                      <h6 className="fw-semibold text-danger">
                      Investment (Credit note upfront for full amount of investment)
                      </h6>
                  </div>

                  <div className="row g-4 mb-4">

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
                      <h6 className="fw-semibold text-primary">
                      Customer Bank Details
                      </h6>
                  </div>

                  <div className="row g-4 mb-4">

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
                      <h6 className="fw-semibold text-primary">
                      Payment to Customer Details
                      </h6>

                      <p className="text-muted small mb-0">
                      (Applicable if payment method is payment to customer)
                      </p>
                  </div>

                  <div className="row g-4 mb-4">

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
                      <h6 className="fw-semibold text-danger">
                      Invoicing Information (To be completed by ERP Team)
                      </h6>
                  </div>

                  <div className="row g-4">

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
              </Section>
              {casetype==="Oldofferfornewcustomer" &&(
                <>
              {/* UOA */}
              <Section title="UOA System Data">
                <Grid container spacing={2}>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="uoainvoicingfrwequency" control={control}
                      label="UOA Invoicing Frequency :"
                      options={opt_uoa_invoicing_freq}
                    />
                  </Grid>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="uoacurrency" control={control}
                      label="Currency :"
                      options={opt_uoa_Currency}
                    />
                  </Grid>

                  <Grid item xs={12} md={4} sx={{minWidth:300}}>
                    <FormSelect name="prepaidsamlebottlepack" control={control}
                      label="Prepaid Sample Bottle Pack :"
                      options={opt_newaccount}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      <FormInput sx={ {width: 300}} name="tsenameemail" control={control}  label="TSE name/E-mail address :" />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      <FormInput sx={ {width: 350}} name="technicalemail" control={control}  label="Technical E-mail Address for SDS :" />
                  </Grid>
                  <Grid item xs={12} md={2} mt={1} sx={{minWidth: 250}}>
                      <FormSelect name="pricingpolicy" control={control}  label="Pricing Policy :"
                      options={[
                        {label:"Vessel level",value:"vessellevel"},
                        {label:"Customer level",value:"customerlevel"}
                        ]}/>
                  </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                  <Grid item xs={12} md={2} sx={{ mt: 1,minWidth: 400}}>
                      {/* <FormInput sx={ {width: 400} } fontWeight="bold" disabled name="servicedescription" control={control}  label="Service Description :" />         */}
                        <FormSelect name="servicedescription" control={control}  label="Service Description :" options={opt_service_desc} />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      <FormInput sx={ {width: 150} } name="uoafocyear" control={control}  label="FOC/Year :" />
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      <FormInput sx={{width: 150}} name="uoachargeunit" control={control}  label="Charge/Unit :" />
                  </Grid>
                  {/* Dynamic rows */}
                  {uoaFields.map((item, index) => (
                    <Grid container spacing={2} key={item.id} mt={1} >
                      <Grid item xs={4} sx={{minWidth: 400}}>
                        <FormSelect 
                          name={`uoaSamples.${index}.sample_uoa`}
                          control={control}
                          options={opt_service_desc}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <FormInput sx={{width: 150}} 
                          name={`uoaSamples.${index}.focyear_uoa`}
                          control={control}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <FormInput sx={{width: 150}} 
                          name={`uoaSamples.${index}.chargeunit_uoa`}
                          control={control}
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
                    <Button onClick={() => addUoa({ sample: "", focyear: "", chargeunit: "" })}>
                      + Add Row
                    </Button>

                    <Button
                      sx={{ ml: 2 }}
                      color="secondary"
                      onClick={() => reset()}
                    >
                      Clear UOA
                    </Button>
                  </Grid>

                </Grid>
              </Section>

              {/* SDA */}
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
                        {label:"Vessel level",value:"Vessellevel"},
                        {label:"Customer level",value:"Customerlevel"}
                        ]}/>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      {/* <FormInput sx={ {width: 300} }  name="sdaservicedescription" control={control} defaultValues="SDA basic (Fuel & System)" label="Service Description :" /> */}
                      <FormInput sx={ {width: 300} } fontWeight="bold"  name="sdaservicedescription" control={control}  label="Service Description :" />        

                  </Grid>
                  <Grid item xs={12} md={2} mt={1} sx={{minWidth: 210}}>
                      <FormSelect name="sdaFocType" control={control}  label="* Select * :"
                      options={[
                        {label:"*select*",value:"*select*"},
                        {label:"Annual FOC",value:"AnnualFOC"},
                        {label:"One Off FOC",value:"OneOffFOC"}
                        ]}/>
                  </Grid>
                  <Grid item xs={12} md={2} sx={{ mt: 1 }}>
                      <FormInput sx={ {width: 180} } name="sdachargeunit" control={control}  label="Charge/Unit :" />
                  </Grid>

                  {sdaFields.map((item, index) => (
                    <Grid container spacing={2} key={item.id} mt={1}>
                      <Grid item xs={4} sx={{minWidth: 300}}>
                        <FormSelect
                          name={`sdaSamples.${index}.sample_sda`}
                          control={control}
                          options={[
                            { label: "SDA Cylinders", value: "SDACylinders" },
                            { label: "SDA Troubleshooting", value: "SDATroubleshooting" }
                          ]}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <FormInput name={`sdaSamples.${index}.focyear_sda`} control={control} />
                      </Grid>
                      <Grid item xs={3}>
                        <FormInput name={`sdaSamples.${index}.chargeunit_sda`} control={control} />
                      </Grid>
                      <Grid item xs={2}>
                        <Button color="inherit" onClick={() => removeSda(index)}>
                          <DeleteIcon />
                        </Button>
                      </Grid>
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Button onClick={() => addSda({ sample: "", focyear: "", chargeunit: "" })}>
                      + Add SDA Row
                    </Button>

                    <Button
                      sx={{ ml: 2 }}
                      color="secondary"
                      onClick={() => reset()}
                    >
                      Clear SDA
                    </Button>
                  </Grid>

                </Grid>
              </Section>

              {/* COMMENTS */}
              <Section title="Comments">
                <FormInput sx={{width:980}}
                  name="sdacomments"
                  control={control}
                  multiline
                  rows={4}
                />
              </Section> 
              </>
            )}

          </div>


            {/* Modal Footer */}
            <div className="modal-footer border-0 pt-0">

              <button
                className="btn btn-outline-danger px-4"
                onClick={handleClear}
              >
                Clear
              </button>

              <button
                className="btn btn-primary px-4 shadow-sm"
                onClick={handleSubmit(handleSubmitForm)}
              >
                Submit
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

export default MarineErpForm;