import API from "./api";
const token = localStorage.getItem("token");
// const headers = {
//   accept: "*/*",  Accept: "application/json",
//   "Content-Type": "application/json",
//   // Authorization: `Bearer ${token}`,
// };
const headers= { accept: "*/*",  "Content-Type": "application/json",
        //  Authorization: `Bearer ${token}`
         };
  const parseDateValue = (value) => {
    if (value === undefined || value === null || value === "") return null;
    if (value instanceof Date) return value;

    if (typeof value === "number") {
      return new Date(value);
    }

    if (typeof value === "string") {
      const m = value.match(/\/Date\((-?\d+)\)\//);
      if (m) {
        return new Date(Number(m[1]));
      }

      const dmY = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (dmY) {
        const [, day, month, year] = dmY;
        return new Date(Number(year), Number(month) - 1, Number(day));
      }

      const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (iso) {
        const [, year, month, day] = iso;
        return new Date(Number(year), Number(month) - 1, Number(day));
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
  const formatDateYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";
    const d = dateStr instanceof Date ? dateStr : parseDateValue(dateStr);
    if (!d || Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}${month}${day}`;
  };
  const toDateInputValue = (value) => {
    if (!value) return Marine_initialValues.effective_date;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? Marine_initialValues.effective_date
      : parsed.toISOString().split("T")[0];
  };

// POST API
export const Energy_ERP_createCustomerRequest = async (data) => {
    const payload = {
    a513: "False",
    a513_duplicate: "False",
    a520: "False",
    a560: "False",
    a626: "False",

    acc_assgmt_group: "ACC-GRP-001",
    account_manager: "David Johnson",
    approved_by: "Mr Cust",

    bill_name: "ABC Billing Pvt Ltd",
    billto_Streetno: "12A",
    billto_careoff: "Care of Finance Dept",
    billto_city: "The City",
    billto_country: "India",
    billto_disctrict: "Bangalore Urban",
    billto_postcode: "560001",
    billto_street2: "MG Road",
    billto_street3: "Near Metro Station",
    billtono: "BILL-1001",

    casetype: "New Customer",
    currency: "INR",

    cust_name: "Customer Name",
    customer_group: "Retail",

    delivering_plant: "Plant-01",
    delivery_priority: "High",

    dist_channel: "Online",
    division: "South Division",

    doc_num: 4567,
    effective_date: "20-01-2020",

    file_name: "customer_upload.pdf",

    inco_terms: "FOB",
    industry_key: "IND-TECH",

    invoice_brand: "BrandX",
    invoicing_dates: "25-01-2020",

    key_account_manager: "Michael Smith",
    language_key: "EN",

    legal_entity: "ABC Corporation Ltd",

    offerforexistingvessel: "No",
    offerfornewvessel: "Yes",

    payer_name: "XYZ Finance",
    payerno: "PAY-1001",

    payerto_Streetno: "45B",
    payerto_careoff: "Accounts Team",
    payerto_city: "Chennai",
    payerto_country: "India",
    payerto_disctrict: "Chennai District",
    payerto_postcode: "600001",
    payerto_street2: "Anna Salai",
    payerto_street3: "Opposite Mall",

    payment_method: "Bank Transfer",
    payment_term: "Net 30",

    price_group: "PG-01",
    price_list: "Standard Price List",
    pricing_condition: "Inclusive GST",

    profile_centre_assignment: "PCA-100",

    req_comments: "Customer onboarding request",

    requsted_by: "Mr Mathew",

    sales_office: "Bangalore Office",
    sales_org: "Sales Org India",

    shipping_conditions: "Express Delivery",

    shipto_Streetno: "78C",
    shipto_bezeco: "BEZ-001",
    shipto_bezvat: "VAT-BEZ-100",
    shipto_careoff: "Warehouse Team",
    shipto_city: "Hyderabad",
    shipto_country: "India",
    shipto_district: "Hyderabad District",
    shipto_dkzeco: "DKZ-001",
    shipto_dkzvat: "DKVAT-001",
    shipto_fizeco: "FIZ-001",
    shipto_fizvat: "FIZVAT-001",
    shipto_frzeco: "FRZ-001",
    shipto_frzvat: "FRZVAT-001",
    shipto_gbzvat: "GBVAT-001",
    shipto_iezvat: "IEVAT-001",
    shipto_itzcou: "ITZCOU-001",
    shipto_itzmot: "ITZMOT-001",
    shipto_itzvat: "ITZVAT-001",
    shipto_nlzvat: "NLZVAT-001",
    shipto_nozeco: "NOZECO-001",
    shipto_nozvat: "NOZVAT-001",
    shipto_postcode: "500001",
    shipto_sezvat: "SEZVAT-001",
    shipto_street2: "Airport Road",
    shipto_street3: "Near Cargo Hub",
    shipto_trzvat: "TRZVAT-001",

    soldto_Creditapproveno: "CR-1001",
    soldto_bezeco: "S-BEZ-001",
    soldto_bezvat: "SBEZVAT-001",
    soldto_careoff: "Sales Accounts",
    soldto_city: "Mumbai",
    soldto_country: "India",
    soldto_dkzeco: "SDKZ-001",
    soldto_dkzvat: "SDKZVAT-001",
    soldto_email: "sales@example.com",
    soldto_faxno: "+91-80-44556677",
    soldto_fizeco: "SFIZ-001",
    soldto_fizvat: "SFIZVAT-001",
    soldto_frzeco: "SFRZ-001",
    soldto_frzvat: "SFRZVAT-001",
    soldto_gbzvat: "SGBVAT-001",
    soldto_iezvat: "SIEVAT-001",
    soldto_itzcou: "SITZCOU-001",
    soldto_itzmot: "SITZMOT-001",
    soldto_itzvat: "SITZVAT-001",
    soldto_mobile: "+91-9876543210",
    soldto_nlzvat: "SNLZVAT-001",
    soldto_nozeco: "SNOZECO-001",
    soldto_nozvat: "SNOZVAT-001",
    soldto_postcode: "400001",
    soldto_sezvat: "SSEZVAT-001",
    soldto_street2: "Linking Road",
    soldto_street3: "Near Business Park",
    soldto_streetno: "21D",
    soldto_telno: "+91-22-22334455",
    soldto_trzvat: "STRZVAT-001",
    soldto_vat: "VAT-998877",
    soldtono: "SOLD-1001",

    sub_sector: "Technology",

    towncity: "Bangalore",

    transport_zone: "South Zone",

    typeofrequest: "Customer Creation"
    };

  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/api/InvoicingApplication/UpdateEnergyManualERPData",
      // no body because API uses [FromQuery]
      {
        params: {payload}, // send fields directly as query params
        headers
      }
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const SaveEnergyManualERPData = async (data) => {
    const invoicepointCountryParts = (data.soldto_country || "").split("||").map((item) => item.trim());
    const parsedGmeCountry = invoicepointCountryParts[0] || "";
    const parsedGmeRegion = invoicepointCountryParts[1]
      ? invoicepointCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
      : "";

    const registeredCountryParts = (data.soldto_country || "").split("||").map((item) => item.trim());
    const parsedSalesCountry = registeredCountryParts[0] || "";
    const parsedSalesRegion = registeredCountryParts[1]
      ? registeredCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
      : "";
    const payload = {
      a513: data.a513,
      a513_duplicate: data.a513_duplicate,
      a520: data.a520,
      a560: data.a560,
      a626: data.a626,
      ...(data.shipto_legal_entity && {
        asset_name: data.shipto_legal_entity,
      }),
      asset_shipto_id:data.shiptono || "0",
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
      effective_date: formatDateYYYYMMDD(data.effective_date),
      erp_system: data.energyERPsystem,
      file_name: data.file_name,
      Frequency: data.energyERPfrequency,
      gmE_Region: parsedGmeCountry,
      gmE_Country: parsedGmeCountry,
      inco_terms: data.inco_terms,
      industry_key: data.industry_key,
      invoice_brand: data.invoice_brand,
      invoicing_dates: data.invoicing_dates,
      // Invoicing_Type: "",
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
      sales_Region: parsedSalesRegion,
      sales_Country: parsedSalesCountry,
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
      PricingPolicy: data.PricingPolicy,
    };
  console.log("Payload for SaveEnergyManualERPData:", payload);
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/api/InvoicingApplication/SaveEnergyManualERPData",
       payload,
      {
        // params: {payload}, // send fields directly as query params
      headers: {
          accept: "*/*",  
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
      }}
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const UpdateEnergyManualERPData = async (Companyassetname, data) => {

    console.log("UpdateEnergyManualERPData called with data:", data);


    const invoicepointCountryParts = (data.soldto_country || "").split("||").map((item) => item.trim());
    const parsedGmeCountry = invoicepointCountryParts[0] || "";
    const parsedGmeRegion = invoicepointCountryParts[1]
      ? invoicepointCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
      : "";

    const registeredCountryParts = (data.soldto_country || "").split("||").map((item) => item.trim());
    const parsedSalesCountry = registeredCountryParts[0] || "";
    const parsedSalesRegion = registeredCountryParts[1]
      ? registeredCountryParts[1].replace(/^Region\s*:\s*/i, "").trim()
      : "";
    const normalizedErpSystem = String(data?.erp_system || "").trim().toUpperCase();
    const isJdeErpSystem = normalizedErpSystem === "JDE";

    const payload = {
      a513: data.a513,
      a513_duplicate: data.a513_duplicate,
      a520: data.a520,
      a560: data.a560,
      a626: data.a626,

      // asset_name:data.shipto_legal_entity || "",
      ...(data.shipto_legal_entity && {
        asset_name: data.shipto_legal_entity,
      }),
      asset_shipto_id:String(data.shiptono) || "0",
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
      CompanyID:data.SelectedCustomerID,
      companyAssetID: data.assetname,
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
      effective_date: formatDateYYYYMMDD(data.effective_date),
      erp_system: data.energyERPsystem,
      file_name: data.file_name,
      Frequency: data.energyERPfrequency,
      gmE_Region: parsedGmeRegion,
      gmE_Country: parsedGmeCountry,
      inco_terms: data.inco_terms,
      industry_key: data.industry_key,
      invoice_brand: data.invoice_brand,
      invoicing_dates: data.invoicing_dates,
      // Invoicing_Type: "",
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
      sales_Region: parsedSalesRegion,
      sales_Country: parsedSalesCountry,
      sales_office: data.sales_office,
      sales_org: data.sales_org,
      // service_offer: "",
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
      soldtono: isJdeErpSystem ? "0" : String(data.soldtono || "0"),
      sub_sector: data.sub_sector,
      towncity: data.towncity,
      transport_zone: data.transport_zone,
      tse_owner: data.tsenameemail,
      typeofrequest: data.typeofrequest,
      PricingPolicy: data.pricingpolicy,
    };

    console.log("Payload for UpdateEnergyManualERPData:", payload);
    try {
      const token = localStorage.getItem("token");
      const response = await API.post(
        "/api/InvoicingApplication/UpdateEnergyManualERPData",
        payload, // no body because API uses [FromQuery]
        {
          // params: payload, // send fields directly as query params
          headers
        }
      );

      console.log("API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Create Customer Error:",
        error.response?.data || error.message
      );

      throw error;
    }
};
export const UpdateEnergyManualERPData_FromUoaForm = async ( data) => {

    console.log("UpdateEnergyManualERPData called with data:", data);
    try {
      const token = localStorage.getItem("token");
      const response = await API.post(
        "/api/InvoicingApplication/UpdateEnergyManualERPData",
        data, // no body because API uses [FromQuery]
        {
          // params: payload, // send fields directly as query params
          headers
        }
      );

      console.log("API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Create Customer Error:",
        error.response?.data || error.message
      );

      throw error;
    }
};
export const GetEnergyManualERPFormData = async (doc_num) => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.get(
      "/api/InvoicingApplication/GetEnergyManualERPFormData",
      {
        params:  doc_num ,
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "API error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
export const GetMarineManualERPFormData = async (data) => {
  try {
    const res = await API.get(
      `/api/InvoicingApplication/GetMarineManualERPFormData`,
      {
        params: data , 
        headers
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};
export const SaveMarineManualERPData = async (data) => {
  
  console.log(data);
  try {
    const token = localStorage.getItem("token");

    const response = await API.post(
      "/api/InvoicingApplication/SaveMarineManualERPData",
      data,// send data as JSON body
      {
        // params:payload, // send data as query params
        headers
      }
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const UpdateMarineManualERPData = async (data) => {
  console.log("Data received in API function:", data);
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/api/InvoicingApplication/UpdateMarineManualERPData",
       data, // send data as JSON body

      {
        // params: data, // send fields directly as query params
        headers
      }
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
export const UpdateMarineManualERPData_FromUoaForm = async (data) => {
  console.log("Data received in API function:", data);
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/api/InvoicingApplication/UpdateMarineManualERPData",
       data, // send data as JSON body

      {
        // params: data, // send fields directly as query params
        headers
      }
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
// /api/InvoicingApplication/UpdateMarineERPDataPricingDetails

export const UpdateMarineERPDataPricingDetails = async (data) => {
  console.log("Data received in API function:", data);
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/api/InvoicingApplication/UpdateMarineERPDataPricingDetails",
       data, // send data as JSON body
      {
        // params: data, // send fields directly as query params
        headers
      }
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const UpdateContractStatus = async (data) => {
  console.log("Data received in API function:", data);
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/api/InvoicingApplication/UpdateContractStatus",
       data, // send data as JSON body

      {
        // params: data, // send fields directly as query params
        headers
      }
    );

    console.log("API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const SendSubmitEmail = async (data) => {
console.log(data);
  const token = localStorage.getItem("token");
  const isFormData = data instanceof FormData;

  return API.post(
    "/api/InvoicingApplication/SendSubmitEmail",
    isFormData ? data : null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
      },
      ...(isFormData ? {} : { params: data }),
    }
  );
};