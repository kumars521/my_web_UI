import API from "./api";

//const token = localStorage.getItem("token");
const headers= { accept: "*/*",  "Content-Type": "application/json",
        //  Authorization: `Bearer ${token}`
         };


export const UpdateOfferVersion = async (HeaderID,OfferVersion) => {
  try {
    
    const res = await API.get(
      `/api/InvoicingApplication/UpdateOfferVersion`,
      {
        params: { SoldToSearch },
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

export const EnergyCreateSemaphore = async (data) => {
  const payload={
    UserAlias:"",
    InvoiceDetailID:""
  }
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/EnergyCreateSemaphore`,
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

export const CreateUpdateCompany = async (data) => {
  console.log(data);
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/CreateUpdateCompany`,
      data,
      {
        // params: data,
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

export const UpdateServiceOfferStart = async (data) => {
  const payload={
    UserAlias:"",
    InvoiceDetailID:""
  }
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/UpdateServiceOfferStart`,
      {
        params: {data},
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

export const UpdateServiceOfferEnd = async (data) => {
  const payload={
    UserAlias:"",
    InvoiceDetailID:""
  }
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/UpdateServiceOfferEnd`,
      {
        params: {data},
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

export const BookInOutPreCheck = async (data) => {

    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/BookInOutPreCheck`,
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

export const BookInOut = async (data) => {
  console.log("BookInOut called with data:", data);
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/BookInOut`,
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

export const CreateUpdatePurchaseOrder = async (data) => {
  console.log(data);
  try {
    //const token = localStorage.getItem("token");

    const res = await API.post(
      "/api/InvoicingApplication/CreateUpdatePurchaseOrder", data,
      { headers }
    );

    console.log(res);

    return res.data;

  } catch (error) {
    console.error(
      "API error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const FetchQuarantineResponse = async (UserAlias) => {
  console.log(UserAlias);
    try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchQuarantine`,
      {
        // params: {UserAlias},
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

export const ProcessQuarantine = async (data) => {
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/ProcessQuarantine`,data,
      {
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

export const OwnershipChange_API= async (data) => {
  console.log(data);
    try {
    //const token = localStorage.getItem("token");
    const res = await API.post(
      `/api/InvoicingApplication/OwnershipChange`,
      data,
      {
        // params: data,
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

// Update GST Name for a customer
export const UpdateGSTName = async (data) => {
  console.log("API called with data:", data);
  try {
    const res = await API.post(
      "/api/InvoicingApplication/UpdateGSTName",
      data,
      { headers }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Update API error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      try {
        const fallbackPayload = {
          ...data,
          companyID: data.CompanyID || data.companyID || data.companyId || "",
          companyAssetID: data.CompanyAssetID || data.companyAssetID || data.assetId || data.AssetID || "",
          GSTName: data.GSTName || data.gstName || "",
          IMONumber: data.IMONumber || data.imoNumber || "",
        };

        const fallbackRes = await API.post(
          "/api/InvoicingApplication/CreateUpdateCompany",
          fallbackPayload,
          { headers }
        );

        return { success: true, data: fallbackRes.data, fallback: true };
      } catch (fallbackError) {
        console.error("GST fallback API error:", fallbackError.response?.data || fallbackError.message);
        throw fallbackError;
      }
    }

    throw error;
  }
};