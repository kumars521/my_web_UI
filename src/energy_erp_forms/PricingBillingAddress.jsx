import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { Box, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelectSmall from "../components/form/FormSelectSmall";

import { customerSchema } from "../validation/customerSchema";
import { opt_country } from "../customer/Opt_library";

const PricingBillingAddress = forwardRef((props, ref) => {
  const { control, watch, setValue } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {
      // PAYER fields
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
    },
  });

  // Handle any dependent logic
  const business = watch("business");
  useEffect(() => {
    setValue("po_required", business === "energy");
  }, [business, setValue]);

  // Ref for parent
  useImperativeHandle(ref, () => ({
    openAdd: () => {
      // Placeholder if needed
    },
    buildPayload: (data) => buildPricingBillingPayload(data),
  }));

  // Build comprehensive payload for POST API
  const buildPricingBillingPayload = (data) => {
    return {
      // Payer Address Section
      payerAddress: {
        payerNo: data.payerno || "",
        name: data.payer_name || "",
        careOf: data.payerto_careoff || "",
        streetNo: data.payerto_streetno || "",
        street2: data.payerto_street2 || "",
        street3: data.payerto_street3 || "",
        city: data.payerto_city || "",
        postalCode: data.payerto_postcode || "",
        country: data.payerto_country || "",
        district: data.payerto_disctrict || "",
      },
      // Payment Configuration Section
      paymentConfig: {
        paymentTerms: data.payment_term || "",
        accountAssignmentGroup: data.acc_assgmt_group || "",
        paymentMethod: data.payment_method || "",
      },
      // Metadata
      metadata: {
        timestamp: new Date().toISOString(),
        userAlias: "current_user",
        formType: "PricingBillingAddress",
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

  // Map PAYER fields dynamically
  const payerFields = [
    { name: "payerno", label: "PAYER No.", width: 260 },
    { name: "payer_name", label: "Name", width: 330 },
    { name: "payerto_careoff", label: "C/O", width: 330 },
    { name: "payerto_streetno", label: "Street/House No", width: 260 },
    { name: "payerto_street2", label: "Street 2", width: 330 },
    { name: "payerto_street3", label: "Street 3", width: 330 },
    { name: "payerto_city", label: "City", width: 260 },
    { name: "payerto_postcode", label: "Postal Code", width: 200 },
    { name: "payerto_country", label: "Country", width: 180 },
    { name: "payerto_disctrict", label: "District (UK County)", width: 200 },
    { name: "payment_term", label: "Payment Terms", width: 260 },
    { name: "acc_assgmt_group", label: "Acct Assgmt Group", width: 330 },
    { name: "payment_method", label: "Payment Method", width: 330 },
  ];

  return (
    <div className="card shadow-sm rounded-4 mb-4">

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
                  options={opt_country}
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

    </div>
  );
});

export default PricingBillingAddress;