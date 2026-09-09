import React, { useEffect,useState, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import FormSelectSmall from "../components/form/FormSelectSmall";

import { customerSchema } from "../validation/customerSchema";
import {
  opt_sales_org,
  opt_distribution_channel,
  opt_Typeofrequest,
  opt_casetypes,
  opt_be_zeco,
  opt_be_zvat,
  opt_it_zmot,
  opt_country,
  opt_uoa_offer,
  opt_formFields
} from "../customer/Opt_library";
// import { Button } from "bootstrap";

const SoldToAddressPage = forwardRef((props, ref) => {
  const { control, watch, setValue, reset } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
        // Organizational Data
      cust_name: "",
      requsted_by: "",
      approved_by: "",
      effective_date: "",
      doc_num: "",
      validationresult: "",
      sales_org: "",
      dist_channel: "",
      division: "02 (Lubricants)", // already has fixed option
      typeofrequest: "",
      energyERPaccounttype: "",
      erpnewaccounttype: "",
      casetype: "",
      amendmodifytechnicaloffer: "",
      offerfornewvessel: "",
      offerforexistingvessel: "",
      req_comments: "",

      // SOLD TO Address
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

      // VAT dynamic fields (from vatFields array)
      // Example (you must match your vatFields names)
      vat_type: "",
      vat_indicator: "",
      vat_classification: ""
    },
  });
  

  const casetype = watch("casetype");
  const business = watch("business");
  const energyERPaccounttype = watch("energyERPaccounttype");
  const erpnewaccounttype = watch("erpnewaccounttype"); 
  const copiedData = watch("cddcopieddata");
  const customerName = watch("cddcustname");
  const rating = watch("rating");
  const [validateresutl, setValidateResult] = useState("");


  const [validationResult, setValidationResult] = useState("");

  const validateCopiedData = () => {
    const copiedDataText =
      copiedData?.toLowerCase() || "";

    const hasCustomer =
      customerName &&
      copiedDataText.includes(
        customerName.toLowerCase()
      );

    const hasRating =
      rating &&
      copiedDataText.includes(
        rating.toLowerCase()
      );

    let result = "Validation Successful";

    if (!hasCustomer && !hasRating) {
      result =
        "Customer Name and Rating not found";
    } else if (!hasCustomer) {
      result =
        "Customer Name validation failed";
    } else if (!hasRating) {
      result =
        "Rating validation failed";
    }

    setValidationResult(result);

    return result === "Validation Successful"
      ? true
      : result;
  };
  // Field Array (for tables)
  const { fields, append, update } = useFieldArray({
    control,
    name: "tableData",
  });

  useEffect(() => {
    setValue("req_comments", "");
    setValue("po_required", business === "energy");
  }, [business, setValue]);

  // Ref for parent
  useImperativeHandle(ref, () => ({
    openAdd: () => {
      append({}); // example: append empty row
    },
    buildPayload: (data) => buildSoldToAddressPayload(data),
  }));

  // Build comprehensive payload for POST API
  const buildSoldToAddressPayload = (data) => {
    return {
      // CDD Clearance Section
      cdd: {
        customerType: data.energyERPcustType || "",
        erpSystem: data.energyERPsystem || "",
        customerName: data.cddcustname || "",
        rating: data.rating || "",
        copiedData: data.cddcopieddata || "",
      },
      // Customer Master Section
      customerMaster: {
        custName: data.cust_name || "",
        requestedBy: data.requsted_by || "",
        approvedBy: data.approved_by || "",
        effectiveDate: data.effective_date || "",
        docNum: data.doc_num || "",
        salesOrg: data.sales_org || "",
        distChannel: data.dist_channel || "",
        division: data.division || "",
        typeOfRequest: data.typeofrequest || "",
        accountType: data.energyERPaccounttype || "",
        newAccountType: data.erpnewaccounttype || "",
        tseNameEmail: data.tsenameemail || "",
      },
      // Case Information Section
      caseInfo: {
        caseType: data.casetype || "",
        amendModifyOffer: data.amendmodifytechnicaloffer || "",
        offerNewVessel: data.offerfornewvessel || "",
        offerExistingVessel: data.offerforexistingvessel || "",
        requestComments: data.req_comments || "",
      },
      // Sold To Address Section
      soldToAddress: {
        soldToNo: data.soldtono || "",
        legalEntity: data.legal_entity || "",
        careOf: data.soldto_careoff || "",
        streetNo: data.soldto_streetno || "",
        street2: data.soldto_street2 || "",
        street3: data.soldto_street3 || "",
        city: data.soldto_city || "",
        postalCode: data.soldto_postcode || "",
        country: data.soldto_country || "",
        telephoneNo: data.soldto_telno || "",
        faxNo: data.soldto_faxno || "",
        mobileNo: data.soldto_mobile || "",
        emailAddress: data.soldto_email || "",
        vatRegistration: data.soldto_vat || "",
        creditApprovalNo: data.soldto_Creditapproveno || "",
      },
      // VAT Fields by Country
      vatDetails: {
        be: {
          zeco: data.soldto_bezeco || "",
          zvat: data.soldto_bezvat || "",
        },
        dk: {
          zeco: data.soldto_dkzeco || "",
          zvat: data.soldto_dkzvat || "",
        },
        fi: {
          zeco: data.soldto_fizeco || "",
          zvat: data.soldto_fizvat || "",
        },
        fr: {
          zeco: data.soldto_frzeco || "",
          zvat: data.soldto_frzvat || "",
        },
        gb: {
          zvat: data.soldto_gbzvat || "",
        },
        ie: {
          zvat: data.soldto_iezvat || "",
        },
        it: {
          zcou: data.soldto_itzcou || "",
          zmot: data.soldto_itzmot || "",
          zvat: data.soldto_itzvat || "",
        },
        nl: {
          zvat: data.soldto_nlzvat || "",
        },
        no: {
          zvat: data.soldto_nozvat || "",
          zeco: data.soldto_nozeco || "",
        },
        se: {
          zvat: data.soldto_sezvat || "",
        },
        tr: {
          zvat: data.soldto_trzvat || "",
        },
      },
      // Metadata
      metadata: {
        timestamp: new Date().toISOString(),
        userAlias: "current_user",
        formType: "SoldToAddress",
      },
    };
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
  const handleDropdowncchange = (e) => {
    const value = e.target.value;
  };
  // Section component
  const Section = ({ title, children }) => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );

  // ZECO/VAT fields map
  const vatFields = [
    { name: "soldto_bezeco", label: "BE ZECO", options: opt_be_zeco },
    { name: "soldto_bezvat", label: "BE ZVAT", options: opt_be_zvat },
    { name: "soldto_dkzeco", label: "DK ZECO", options: opt_be_zeco },
    { name: "soldto_dkzvat", label: "DK ZVAT", options: opt_be_zvat },
    { name: "soldto_fizeco", label: "FI ZECO", options: opt_be_zeco },
    { name: "soldto_fizvat", label: "FI ZVAT", options: opt_be_zvat },
    { name: "soldto_frzeco", label: "FR ZECO", options: opt_be_zeco },
    { name: "soldto_frzvat", label: "FR ZVAT", options: opt_be_zvat },
    { name: "soldto_gbzvat", label: "GB ZVAT", options: opt_be_zvat },
    { name: "soldto_iezvat", label: "IE ZVAT", options: opt_be_zvat },
    { name: "soldto_itzcou", label: "IT ZCOU", options: opt_it_zmot },
    { name: "soldto_itzmot", label: "IT ZMOT", options: opt_it_zmot },
    { name: "soldto_itzvat", label: "IT ZVAT", options: opt_be_zvat },
    { name: "soldto_nlzvat", label: "NL ZVAT", options: opt_be_zvat },
    { name: "soldto_nozvat", label: "NO ZVAT", options: opt_be_zvat },
    { name: "soldto_nozeco", label: "NO ZECO", options: opt_be_zeco },
    { name: "soldto_sezvat", label: "SE ZVAT", options: opt_be_zvat },
    { name: "soldto_trzvat", label: "TR ZVAT", options: opt_be_zvat },
  ];

  const opt_accounttype=[
    {
      label:"New Account", value:"newaccount"
    },
    {
      label:"Existing Account",value:"existingaccount"
    }
  ]

  return (
    <div className="card shadow-sm rounded-4 mb-4">
      {/* <Section title="Organizational Data"> */}

      {/* <div className="container-fluid"> */}

        <div className="card shadow-sm border-0 rounded-4 mb-4">

          <div className="card-header  text-black fw-semibold py-3">
            CDD Clearence Form
          </div>
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
                  <Button variant="contained" color="primary" onClick={validateCopiedData}>
                    Validate Data
                  </Button>
                </div>
                {/* <div className="col-md-3">
                  <FormInput
                    name="validationresult"
                    control={control}
                    label="Validation Result"
                    // value={validateresutl}
                  />
                </div> */}
                <div className="col-md-3 text-success">
                  {validationResult ===
                    "Validation Successful" &&
                    validationResult}
                </div>
              </div>

              <div className="row g-3 mt-3">
                <div className="col-md-12">
                  <FormInput
                    sx={{ width: "100%" }}
                    multiline
                    rows={4}
                    name="cddcopieddata"
                    control={control}
                    label="Copied Data"
                    rules={{
                      validate: validateCopiedData
                    }}
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
              {energyERPaccounttype === "newaccount" && (
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
            </div>          
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


              {casetype ===
              "offerfornewvessel" && (

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

              )}


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

      {/* </div> */}

      {/* </Section> */}
    <div className="card shadow-sm border-0 rounded-4">
      <div className="card-header fw-bold">
        SOLD TO Address
      </div>

      <div className="card-body">

        <div className="row g-3">

          <div className="col-md-3">
            <FormInput
              name="soldtono"
              control={control}
              label="SOLD TO No"
            />
          </div>

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

          <div className="col-md-3">

            <FormSelectSmall
              name="soldto_country"
              control={control}
              label="Country"
              options={opt_country}
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
    </div>
  );
});

export default SoldToAddressPage;