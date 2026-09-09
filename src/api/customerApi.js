import API from "./api";
//const token = localStorage.getItem("token");
const headers= { accept: "*/*",  "Content-Type": "application/json",
          Accept: "application/json", 
          // Authorization: `Bearer ${token}` 
        };

export const saveCustomer = async (data) => {
  // Implementation needed
};

// Update a single row/customer by ID
export const updateCustomer = async (id, data) => {
  try {
    const res = await API.put(`/api/customers/${id}`, data, { headers: { accept: "*/*", "Content-Type": "application/json" } });
    return res.data; // updated row from backend
  } catch (error) {
    console.error("Update API error:", error.response?.data || error.message);
    throw error; // let UI handle it
  }
};


export const SearchCompany = async (CompanySearch) => {
  console.log("API called with CompanySearch:", CompanySearch);
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/SearchCompany`,
      {
        params: { CompanySearch },
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("SearchCompany API error:", error.response?.data || error.message);
    throw error;
  }
};

export const FetchCustomerList = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchCustomerList`,
      {
        params:  data ,
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("FetchCustomerList API error:", error.response?.data || error.message);
    throw error;
  }
};

export const FetchAsset = async (data) => {
  console.log("API called with companyID:", data);
  try {
    if(data){
    const res = await API.get(
      "/api/InvoicingApplication/FetchAsset",
      {
        params:  data ,
        headers,
      }
    );
    return res.data || [];
  }else{
    const res = await API.get(
      "/api/InvoicingApplication/FetchAsset",
      {
        headers,
      }
    );
    return res.data || [];}
  } catch (error) {
    console.error("FetchAsset API error:", error.response?.data || error.message);
    return [];
  }
};

export const CheckUserAccess = async (AccessArea,UserAlias) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/CheckUserAccess`,
      {
        params: { CompanyID },
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

export const FetchPurchaseOrder = async () => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/FetchPurchaseOrder`,
      {
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("FetchPurchaseOrder API error:", error.response?.data || error.message);
    throw error;
  }
};

export const EditPurchaseOrder = async (POID) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/EditPurchaseOrder`,
      {
        params: { POID },
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("EditPurchaseOrder API error:", error.response?.data || error.message);
    throw error;
  }
};

export const DeletePurchaseOrder = async (POID) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.delete(
      `/api/InvoicingApplication/DeletePurchaseOrder`,
      {
        params: { POID },
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("DeletePurchaseOrder API error:", error.response?.data || error.message);
    throw error;
  }
};

export const DeleteQuarantine = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.delete(
      `/api/InvoicingApplication/DeleteQuarantine`,
      {
        params:  data ,
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("DeleteQuarantine API error:", error.response?.data || error.message);
    throw error;
  }
};

export const GenericLookups = async (data) => {
  try {
    //const token = localStorage.getItem("token");
    const res = await API.get(
      `/api/InvoicingApplication/GenericLookups`,
      {
        params: data,
        headers,
      }
    );
    return res.data;
  } catch (error) {
    console.error("GenericLookups API error:", error.response?.data || error.message);
    throw error;
  }
};

