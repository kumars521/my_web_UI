import React, { forwardRef, useImperativeHandle } from "react";
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

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import DeleteIcon from "@mui/icons-material/Delete";
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";

import { customerSchema } from "../validation/customerSchema";
import {
  opt_newaccount,
  opt_uoa_Currency,
  opt_uoa_invoicing_freq,
  opt_service_desc
} from "../customer/Opt_library";

// ---------- SECTION ----------
const Section = ({ title, children }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography fontWeight="bold">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

// ---------- MAIN ----------
const Uoa_Data = forwardRef((props, ref) => {
    const defaultValues = {
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

    // ================= COMMENTS =================
    sdacomments: "",
  };
  
  const { control, reset, handleSubmit, getValues } = useForm({
// defaultValues
  defaultValues : defaultValues,
    resolver: yupResolver(customerSchema)
  });

  // ---------- FIELD ARRAYS ----------
  const { fields: uoaFields, append: addUoa, remove: removeUoa } = useFieldArray({
    control,
    name: "uoaSamples"
  });

  const { fields: sdaFields, append: addSda, remove: removeSda } = useFieldArray({
    control,
    name: "sdaSamples"
  });

  // ---------- SUBMIT ----------
  const buildUoaPayload = (values) => ({
    uoa: {
      invoicingFrequency: values.uoainvoicingfrwequency,
      currency: values.uoacurrency,
      prepaidSampleBottlePack: values.prepaidsamlebottlepack,
      tseNameEmail: values.tsenameemail,
      technicalEmail: values.technicalemail,
      pricingPolicy: values.pricingpolicy,
      serviceDescription: values.servicedescription,
      focYear: values.focyear,
      chargeUnit: values.chargeunit,
      samples: values.uoaSamples || [],
    },
    sda: {
      offerInclude: values.sdaofferinclude,
      pricingPolicy: values.sdapricingpolicy,
      serviceDescription: values.sdaservicedescription,
      chargeUnit: values.sdachargeunit,
      samples: values.sdaSamples || [],
    },
    comments: values.sdacomments,
  });

  const onSubmit = (data) => {
    const payload = buildUoaPayload(data);
    console.log("UOA post payload:", payload);
    return payload;
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
    buildPayload: () => buildUoaPayload(getValues()),
  }));

  // ---------- UI ----------
  return (
    <Box p={3}>

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
          <Grid item xs={12} md={2} sx={{ mt: 1}}>
              <FormInput sx={ {width: 400} } fontWeight="bold" disabled name="servicedescription" control={control}  label="Sample Description : Basic Sample :" />        
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
          <Grid item xs={12} md={2} mt={1} sx={{minWidth: 180}}>
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
              <FormInput sx={ {width: 300} } fontWeight="bold" disabled name="sdaservicedescription" control={control}  label="Sample Description : Basic Sample :" />        

          </Grid>
          <Grid item xs={12} md={2} mt={1} sx={{minWidth: 210}}>
              <FormSelect name="sdapricingpolicy" control={control}  label="* Select * :"
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

    </Box>
  );
});

export default Uoa_Data;