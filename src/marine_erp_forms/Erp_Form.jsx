
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import FormSelectSmall from "../components/form/FormSelectSmall";
import VesselList from "./VesselList";
// import VesselTable from "./VesselList"
import CloseIcon from "@mui/icons-material/Close";
import { customerSchema } from "../validation/customerSchema";
import EditableSortableTable from "../components/form/EditableSortableTable"

import UOA_Data from "./Uoa_Data";

import {
  opt_newaccount,
  opt_country,
  opt_marine_uoaoffer,opt_casetypes,opt_formFields,opt_uoa_offer,opt_countrysalesregionmapping 
} from "../customer/Opt_library";

import {opt_country_with_soldtoRegion} from "../customer/Erp_Option_Library";
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

const ErpForm = forwardRef(({ methods }, ref) => {

  // get methods from parent
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
  } = methods;

  // ---------------- HELPERS ----------------
  const createEmptyRow = () =>
    vesselColumns.reduce((acc, col) => {
      acc[col.field] = "";
      return acc;
    }, {});

    // ---------------- FORM ----------------
    // const {
    // control,
    // handleSubmit,
    // watch,
    // setValue,
    // reset,
    // getValues,
    // } = methods;
    // ({
    // resolver: yupResolver(customerSchema),
    //     defaultValues: {
    //     tableData: [],
    //     // Organizational Data
    //     purou: "",
    //     requsted_by: "",
    //     approved_by: "",
    //     effective_date: new Date()
    //   .toISOString()
    //   .split("T")[0],
    //     doc_num: "",
    //     newaccountsetup: "",
    //     newvesselsetup: "",
    //     includeuoaoffer: "",
    //     typeofcustomer: "",
    //     salesaccounttype: "",
    //     erpsystemtype: "",
    //     marineerpsystemtype: "",
    //     casetype: "",
    //     amendmodifytechnicaloffer: "",
    //     offerfornewvessel: "",
    //     offerforexistingvessel: "",
    //     req_comments: "",
    //     salesaccountdescription_newaccount: "",
    //     salesaccountdescription_existingaccount: "",
        
    //     // Approvals
    //     approvedby: "", // ⚠ reused later (conflict)
    //     approvalattachments: "",
    //     netcasenumber: "",
    //     investmentapprovedby: "",
    //     setuptype: "",
    //     priority: "",
    //     soldto_city: "",

    //     // Customer Details
    //     custdetailschanghe: "",
    //     soldtoname: "",
    //     cabmnmc_soldtoid: "",

    //     registered_streetno: "",
    //     registered_street2: "",
    //     registered_street3: "",
    //     registered_city: "",
    //     registered_postcode: "",
    //     registered_country: "",

    //     custaccountname: "",
    //     custometaccountmnmc: "",
    //     invoicepointname: "",
    //     invoicepointmnmc: "",

    //     name1: "",
    //     name2: "",
    //     name3: "",
    //     name4: "",

    //     invoicepoint_streetno: "",
    //     invoicepoint_street2: "",
    //     invoicepoint_street3: "",
    //     invoicepoint_street4: "",
    //     invoicepoint_city: "",
    //     invoicepoint_postcode: "",
    //     invoicepoint_country: "",
    //     vatregno: "",
    //     extrainvoiceaddress: "",

    //     // Invoice Printing & PDF
    //     billtoparty: "",
    //     printerlocation: "",
    //     printername: "",
    //     pdfinvoceemail: "",
    //     faxnumber: "",
    //     directtocustomer: "",
    //     otherroute: "",
    //     originaldrn: "",
    //     taxcontractsignoff: "",
    //     regionalmanager: "",

    //     creditapprovalchange: "",
    //     approvedcreditlimit: "",
    //     creditapprovalnumber: "",

    //     // Agreements
    //     agreementchange: "",
    //     localinternational: "", // ⚠ reused later (conflict with Currency section)
    //     domestic: "",
    //     iciscustomer: "",
    //     icisrate: "",
    //     remarks: "",
    //     effectivatedateratechange: "",
    //     paymentterm: "",
    //     daysfrom: "",
    //     otherpaymentterm: "",
    //     pricelisttoapply: "",
    //     chargemodel: "",

    //     international: "", // Currency section

    //     // Rebates / Investments
    //     rebatechange: "",
    //     rebaterequired: "",
    //     rebatedetails: "",
    //     investmentrequired: "",
    //     investmentdeatils: "",
    //     paymentmethod: "",
    //     creditreleasedate: "",

    //     accountname: "",
    //     bankname: "",
    //     banksortcode: "",
    //     beneficiary: "",

    //     bankaccntnumber: "",
    //     residencetownofbank: "",
    //     referencerequired: "",
    //     swiftcode: "",

    //     cabmnmc: "",
    //     custacctmnmc: "",
    //     documentpreparedby: "",

    //     rebateattachments: ""

    // },
    // });

    // ---------------- STATE ----------------
    const [openModal, setOpenModal] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const uoaRef = useRef(null);
    const casetype = watch("casetype");
    const salesAccountType = watch("salesaccounttype");
    const erpsystemtype = watch("erpsystemtype");
    const selectedCountry = watch("registered_country");
    // ---------------- FIELD ARRAY ----------------
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "tableData",
    });

    // const salesRegion =
    //     opt_countrysalesregionmapping[selectedCountry] || "";
    // ---------------- HANDLERS ----------------
    const handleAddRow = () => {
        append(createEmptyRow());
    };
    const handleDeleteRow = (index) => {
        remove(index);
    };
    const handleEdit = (index) => {
        setSelectedRowIndex(index);
        reset({ rowData: fields[index] });
        setOpenModal(true);
    };

    const handleDelete = (index) => {
        remove(index);
    };

    const handleClose = () => {
        setOpenModal(false);
        setSelectedRowIndex(null);
        reset({ rowData: createEmptyRow() });
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

    const buildPayload = (values = getValues()) => ({
      organizationalData: {
        purou: values.purou,
        requestedBy: values.requsted_by,
        approvedBy: values.approved_by,
        effectiveDate: values.effective_date,
        documentNumber: values.doc_num,
        newAccountSetup: values.newaccountsetup,
        newVesselSetup: values.newvesselsetup,
        includeUoaOffer: values.includeuoaoffer,
        typeOfCustomer: values.typeofcustomer,
        salesAccountType: values.salesaccounttype,
        erpSystemType: values.erpsystemtype,
        caseType: values.casetype,
        amendModifyTechnicalOffer: values.amendmodifytechnicaloffer,
        offerForNewVessel: values.offerfornewvessel,
        offerForExistingVessel: values.offerforexistingvessel,
        requestComments: values.req_comments,
        salesAccountDescriptionNewAccount: values.salesaccountdescription_newaccount,
        salesAccountDescriptionExistingAccount: values.salesaccountdescription_existingaccount,
      },
      approvals: {
        approvedBy: values.approvedby,
        approvalAttachments: values.approvalattachments,
        netCaseNumber: values.netcasenumber,
        investmentApprovedBy: values.investmentapprovedby,
        setupType: values.setuptype,
        priority: values.priority,
        detailsOfRequest: values.soldto_city,
      },
      customerDetails: {
        customerDetailsChange: values.custdetailschanghe,
        soldToName: values.soldtoname,
        cabMnmcSoldToId: values.cabmnmc_soldtoid,
        registeredAddress: {
          streetNo: values.registered_streetno,
          street2: values.registered_street2,
          street3: values.registered_street3,
          city: values.registered_city,
          postcode: values.registered_postcode,
          country: values.registered_country,
        },
        accountDetails: {
          customerAccountName: values.custaccountname,
          customerAccountMnmc: values.custometaccountmnmc,
          invoicePointName: values.invoicepointname,
          invoicePointMnmc: values.invoicepointmnmc,
        },
        invoicePointAddress: {
          name1: values.name1,
          name2: values.name2,
          name3: values.name3,
          name4: values.name4,
          streetNo: values.invoicepoint_streetno,
          street2: values.invoicepoint_street2,
          street3: values.invoicepoint_street3,
          street4: values.invoicepoint_street4,
          city: values.invoicepoint_city,
          postcode: values.invoicepoint_postcode,
          country: values.invoicepoint_country,
          vatRegNo: values.vatregno,
          extraInvoiceAddress: values.extrainvoiceaddress,
        },
      },
      invoicePrintingPdf: {
        billToParty: values.billtoparty,
        printerLocation: values.printerlocation,
        printerName: values.printername,
        pdfInvoiceEmail: values.pdfinvoceemail,
        faxNumber: values.faxnumber,
        directToCustomer: values.directtocustomer,
        otherRoute: values.otherroute,
        originalDrn: values.originaldrn,
        taxContractSignOff: values.taxcontractsignoff,
        regionalManager: values.regionalmanager,
        creditApprovalChange: values.creditapprovalchange,
        approvedCreditLimit: values.approvedcreditlimit,
        creditApprovalNumber: values.creditapprovalnumber,
      },
      agreements: {
        agreementChange: values.agreementchange,
        localInternational: values.localinternational,
        domestic: values.domestic,
        icisCustomer: values.iciscustomer,
        icisRate: values.icisrate,
        remarks: values.remarks,
        effectiveDateRateChange: values.effectivatedateratechange,
        paymentTerm: values.paymentterm,
        daysFrom: values.daysfrom,
        otherPaymentTerm: values.otherpaymentterm,
        priceListToApply: values.pricelisttoapply,
        chargeModel: values.chargemodel,
        international: values.international,
      },
      rebatesInvestments: {
        rebateChange: values.rebatechange,
        rebateRequired: values.rebaterequired,
        rebateDetails: values.rebatedetails,
        investmentRequired: values.investmentrequired,
        investmentDetails: values.investmentdeatils,
        paymentMethod: values.paymentmethod,
        creditReleaseDate: values.creditreleasedate,
        accountName: values.accountname,
        bankName: values.bankname,
        bankSortCode: values.banksortcode,
        beneficiary: values.beneficiary,
        bankAccountNumber: values.bankaccntnumber,
        residenceTownOfBank: values.residencetownofbank,
        referenceRequired: values.referencerequired,
        swiftCode: values.swiftcode,
        cabMnmc: values.cabmnmc,
        custAcctMnmc: values.custacctmnmc,
        documentPreparedBy: values.documentpreparedby,
        rebateAttachments: values.rebateattachments,
      },
      vesselList: values.tableData || [],
      uoaData: uoaRef.current?.buildPayload?.() || null,
    });

    useImperativeHandle(ref, () => ({
      buildPayload,
    }));

    const onSubmit = (data) => {
        if (selectedRowIndex === null) {
            append(data.rowData);
        } else {
            update(selectedRowIndex, data.rowData);
        }

        handleClose();
    };
  // ---------------- UI ----------------
  return (
    <Box p={3}>

        {/* Organizational Data */}
        <Section title="Organizational Data">

        <div className="card border-0 shadow-sm rounded-4 mb-4">
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

            </div>

            {/* Requested / Approved */}
            <div className="row g-4 mb-4">

                <div className="col-lg-3 col-md-6">
                <FormInput
                    className="w-100"
                    name="requsted_by"
                    control={control}
                    label="Requested By"
                />
                </div>

                <div className="col-lg-3 col-md-6">
                <FormInput
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
                    label="Effective Date"
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
            <div className="row g-4 mb-4">

                <div className="col-lg-4 col-md-6">
                <FormSelect
                    name="casetype"
                    control={control}
                    label="Case Type"
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
                    label="Amend / Modify Existing Technical Offer"
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

                {casetype ===
                "offerforexistingvessel" && (
                <div className="col-lg-6 col-md-12">
                    <FormSelect
                    name="offerforexistingvessel"
                    control={control}
                    label="Offer for Existing Vessel"
                    onChange={handleDropdowncchange}
                    options={opt_uoa_offer}
                    />
                </div>
                )}

            </div>

            {/* Comments */}
            {casetype === "other" && (
                <div className="row g-4 mb-4">

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
            <div className="row g-4">

                <div className="col-lg-4 col-md-6">
                <FormSelect
                    name="marineerpsystemtype"
                    control={control}
                    label="ERP System Type"
                    options={[
                    {
                        label: "SDA",
                        value: "SDA",
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

        {/* Setup Details */}
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">

            <div className="row g-4 mb-4">

                <div className="col-lg-3 col-md-6">
                <FormSelect
                    name="newaccountsetup"
                    control={control}
                    label="New Account Setup"
                    options={opt_newaccount}
                />
                </div>

                <div className="col-lg-3 col-md-6">
                <FormSelect
                    name="newvesselsetup"
                    control={control}
                    label="New Vessel Setup"
                    options={opt_newaccount}
                />
                </div>

                <div className="col-lg-3 col-md-6">
                <FormSelect
                    name="includeuoaoffer"
                    control={control}
                    label="Include UOA Offer"
                    options={opt_marine_uoaoffer}
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

                <p className="mb-2 small">
                If "New Account setup" and
                "New Vessel setup" are marked as
                "Y", ensure completion of
                Technical email address for SDS
                in the UOA system data section.
                </p>

                <p className="mb-0 small">
                Where any "Y" is entered above,
                ensure a copy of the ERP form
                is emailed to the UOA team
                including the customer account number.
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
                    options={opt_newaccount}
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
                    name="approvedby"
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
                    options={opt_newaccount}
                />
                </div>

                <div className="col-lg-3 col-md-6">
                <FormSelectSmall
                    name="domestic"
                    control={control}
                    label="Domestic"
                    options={opt_newaccount}
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
                    options={opt_newaccount}
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
                        label: "*Select*",
                        value: "select",
                    },
                    {
                        label: "Delivery Date",
                        value: "deliverydate",
                    },
                    {
                        label: "Invoicing Date",
                        value: "invoicingdate",
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
                    name="localinternational"
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
                <FormInput
                    className="w-100"
                    name="rebaterequired"
                    control={control}
                    label="Rebate Required"
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
                <FormInput
                    className="w-100"
                    name="investmentrequired"
                    control={control}
                    label="Investment Required"
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
            <section>
                <Box>
                    <UOA_Data ref={uoaRef} />
                </Box>
                
            </section>
        )}

    </Box>
  );
});
export default ErpForm;
