import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelectSmall from "../components/form/FormSelectSmall";

import { customerSchema } from "../validation/customerSchema";
import { opt_be_zeco, opt_be_zvat, opt_it_zmot, opt_country }  from "../customer/Opt_library";

const ShipToAddressPage = forwardRef((props, ref) => {
  const { control, watch, setValue } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
    // SHIP TO Address
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

      // dynamic VAT fields (shiptoVatFields)
      // make sure these names match your array
      shipto_vat_type: "",
      shipto_vat_indicator: "",
      shipto_vat_classification: "",

      // BILL TO Address (dynamic fields from billToFields)
      // examples — replace with actual names from your array
      billto_name: "",
      billto_legal_entity: "",
      billto_careoff: "",
      billto_streetno: "",
      billto_street2: "",
      billto_street3: "",
      billto_city: "",
      billto_postcode: "",

      billto_country: "",
      billto_district: "",
      billingemail: ""
    },
  });

  const business = watch("business");

  useEffect(() => {
    setValue("po_required", business === "energy");
  }, [business, setValue]);

  // Ref for parent
  useImperativeHandle(ref, () => ({
    openAdd: () => {
      // placeholder
    },
    buildPayload: (data) => buildShipToAddressPayload(data),
  }));

  // Build comprehensive payload for POST API
  const buildShipToAddressPayload = (data) => {
    return {
      // Ship To Address Section
      shipToAddress: {
        shipToNo: data.shiptono || "",
        legalEntity: data.shipto_legal_entity || "",
        careOf: data.shipto_careoff || "",
        streetNo: data.shipto_streetno || "",
        street2: data.shipto_street2 || "",
        street3: data.shipto_street3 || "",
        city: data.shipto_city || "",
        postalCode: data.shipto_postcode || "",
        country: data.shipto_country || "",
        transportationZone: data.transport_zone || "",
        languageKey: data.language_key || "",
        district: data.shipto_district || "",
      },
      // VAT Details for Ship To Address by Country
      shipToVatDetails: {
        be: {
          zeco: data.shipto_bezeco || "",
          zvat: data.shipto_bezvat || "",
        },
        dk: {
          zeco: data.shipto_dkzeco || "",
          zvat: data.shipto_dkzvat || "",
        },
        fi: {
          zeco: data.shipto_fizeco || "",
          zvat: data.shipto_fizvat || "",
        },
        fr: {
          zeco: data.shipto_frzeco || "",
          zvat: data.shipto_frzvat || "",
        },
        gb: {
          zvat: data.shipto_gbzvat || "",
        },
        ie: {
          zvat: data.shipto_iezvat || "",
        },
        it: {
          zcou: data.shipto_itzcou || "",
          zmot: data.shipto_itzmot || "",
          zvat: data.shipto_itzvat || "",
        },
        nl: {
          zvat: data.shipto_nlzvat || "",
        },
        no: {
          zvat: data.shipto_nozvat || "",
          zeco: data.shipto_nozeco || "",
        },
        se: {
          zvat: data.shipto_sezvat || "",
        },
        tr: {
          zvat: data.shipto_trzvat || "",
        },
      },
      // Bill To Address Section
      billToAddress: {
        billToNo: data.billtono || "",
        name: data.bill_name || "",
        careOf: data.billto_careoff || "",
        streetNo: data.billto_streetno || "",
        street2: data.billto_street2 || "",
        street3: data.billto_street3 || "",
        city: data.billto_city || "",
        postalCode: data.billto_postcode || "",
        country: data.billto_country || "",
        district: data.billto_district || "",
        billingEmail: data.billingemail || "",
      },
      // Metadata
      metadata: {
        timestamp: new Date().toISOString(),
        userAlias: "current_user",
        formType: "ShipToAndBillToAddress",
      },
    };
  };

  const Section = ({ title, children }) => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );

  // Map ZECO/VAT fields for ShipTo dynamically
  const shiptoVatFields = [
    { name: "shipto_bezeco", label: "BE ZECO", options: opt_be_zeco,width:200 },
    { name: "shipto_bezvat", label: "BE ZVAT", options: opt_be_zvat },
    { name: "shipto_dkzeco", label: "DK ZECO", options: opt_be_zeco },
    { name: "shipto_dkzvat", label: "DK ZVAT", options: opt_be_zvat },
    { name: "shipto_fizeco", label: "FI ZECO", options: opt_be_zeco },
    { name: "shipto_fizvat", label: "FI ZVAT", options: opt_be_zvat },
    { name: "shipto_frzeco", label: "FR ZECO", options: opt_be_zeco },
    { name: "shipto_frzvat", label: "FR ZVAT", options: opt_be_zvat },
    { name: "shipto_gbzvat", label: "GB ZVAT", options: opt_be_zvat },
    { name: "shipto_iezvat", label: "IE ZVAT", options: opt_be_zvat },
    { name: "shipto_itzcou", label: "IT ZCOU", options: opt_it_zmot },
    { name: "shipto_itzmot", label: "IT ZMOT", options: opt_it_zmot },
    { name: "shipto_itzvat", label: "IT ZVAT", options: opt_be_zvat },
    { name: "shipto_nlzvat", label: "NL ZVAT", options: opt_be_zvat },
    { name: "shipto_nozvat", label: "NO ZVAT", options: opt_be_zvat },
    { name: "shipto_nozeco", label: "NO ZECO", options: opt_be_zeco },
    { name: "shipto_sezvat", label: "SE ZVAT", options: opt_be_zvat },
    { name: "shipto_trzvat", label: "TR ZVAT", options: opt_be_zvat },
  ];

  // Map BILL TO fields for consistency
  const billToFields = [
    { name: "billtono", label: "BILL TO No.", width: 260 },
    { name: "bill_name", label: "Name", width: 350 },
    { name: "billto_careoff", label: "C/O", width: 350 },
    { name: "billto_streetno", label: "Street/House No", width: 260 },
    { name: "billto_street2", label: "Street 2", width: 350 },
    { name: "billto_street3", label: "Street 3", width: 350 },
    { name: "billto_city", label: "City", width: 260 },
    { name: "billto_postcode", label: "Postal Code", width: 200 },
  ];

  return (
    <div>

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
                label="Legal Entity"
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

            <div className="col-md-3">

              <FormSelectSmall
                name="shipto_country"
                control={control}
                label="Country"
                options={opt_country}
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
            <div className="col-md-3">
              <FormSelectSmall
                name="billto_country"
                control={control}
                label="Country"
                options={opt_country}
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

    </div>
  );
});

export default ShipToAddressPage;