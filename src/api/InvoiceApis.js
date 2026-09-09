import API from "./api";
//const token = localStorage.getItem("token");
const headers= { accept: "*/*",  "Content-Type": "application/json",
          Accept: "application/json", 
          // Authorization: `Bearer ${token}` 
        };


export const FetchInvoiceDetail = async (InvoiceNumber) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchInvoiceDetail`,
      {
        params:{InvoiceNumber},
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const FetchInvoiceHeader = async (CompanySearch) => {
  try {
    console.log(CompanySearch);
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchInvoiceHeader`,
      {
        params:  CompanySearch ,
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

export const FetchInvoicingDimensions = async (UserAlias) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchInvoicingDimensions`,
      {
        params: { UserAlias },
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const FetchEnergyInvoiceDetail = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchEnergyInvoiceDetail`,
      {
        params: data,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const CheckForInvoices = async (CompanyID) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/CheckForInvoices`,
      {
        params: {CompanyID} ,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const SplitInvoice = async (HeaderID,OfferVersion) => {
    const payload={
        UserAlias:"",
        InvoiceHeaderID:"",
        BandsToSplit:""
    }
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/SplitInvoice`,
      {
        params: payload,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const CreateUpdateInvoiceHeader = async (data) => {
  console.log(data);
  try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/CreateUpdateInvoiceHeader`,data,
      {
        // params: {data},
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

export const CreateUpdateInvoiceDetail = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/CreateUpdateInvoiceDetail`,
      {
        params: { CompanySearch },
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const EnergyCreateUpdateInvoiceDetail = async (UserAlias,InvoiceDetailID) => {
  const payload={
    UserAlias:"",
    InvoiceDetailID:""
  }
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/EnergyCreateUpdateInvoiceDetail`,
      {
        params: payload,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const EnergyInvoiceMarker = async (UserAlias,sString,FOCmarker) => {
  const payload={
    UserAlias:"",
    InvoiceDetailID:""
  }
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/EnergyInvoiceMarker`,
      {
        params: payload,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const UpdateCompanyAssetStatus = async (data) => {
  console.log(data);
    try {
    const res = await API.post(
      `/api/InvoicingApplication/UpdateCompanyAssetStatus`,
      data,
      {
        // params: payload,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};

export const FetchInvoiceDetailTestSuit = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchInvoiceDetailTestSuit`,
      {
        params:data,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};
export const FetchInvoiceDetailServiceOffer = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchInvoiceDetailServiceOffer`,
      {
        params: data,
        headers,
      }
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    throw error;
  }
};