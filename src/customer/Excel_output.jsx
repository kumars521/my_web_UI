import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo
} from "react";

import {
  Box,
  Grid,
  Tabs, Tab,Typography ,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from "@mui/material";

import EditableSortableTable from "../components/form/EditableSortableTable"

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormTable from "../components/form/FormTable";
import { customerSchema } from "../validation/customerSchema";

import CloseIcon from "@mui/icons-material/Close";


import { FetchQuarantineResponse } from "../api/postApi";


const Excel_output = forwardRef((props,ref) => {
  const { control,getValues, handleSubmit, reset, watch,setValue } = useForm({
    resolver: yupResolver(customerSchema),
      defaultValues : {
      }
  });

  // Field Array (table data)
  const { fields, append, update } = useFieldArray({
    control,
    name: "tableData"
  });

  const [QuarantinemappedData,setQuarantinemappedData]=useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

    useEffect(() => {
      const savedData = JSON.parse(
        localStorage.getItem(
          "QuarantinemappedData"
        )
      ) || [];
  
      if (savedData.length) {
        setQuarantinemappedData(savedData);
      } 
      else {
        handleFetchQuarantineResponse("3575qa");
      }
  
    }, []);
  const columns =useMemo(() => [
    { field: "companyID", headerName: "Company ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "assetID", headerName: "Asset ID", flex: 1 },
    { field: "assetName", headerName: "Asset Name", flex: 1 },
    { field: "imoNumber", headerName: "IMO Number", flex: 1 },
    { field: "businessCode", headerName: "Business Code", flex: 1 },
    { field: "feedID", headerName: "Feed ID", flex: 1 },
    { field: "sampleID", headerName: "Sample ID", flex: 1 },
    { field: "takenDate", headerName: "Taken Date", flex: 1 },
    { field: "receivedDate", headerName: "Received Date", flex: 1 },
    { field: "analysedDate", headerName: "Analysed Date", flex: 1 },
    { field: "testSuite", headerName: "Test Suite", flex: 1 },
    { field: "batchNumber", headerName: "Batch Number", flex: 1 },
    { field: "errorMessage", headerName: "Error Message", flex: 2 },

  ], []);

  // Add
  const handleAdd = () => {
    setSelectedRowIndex(null);

    const emptyRow = columns.reduce(
      (acc, col) => ({ ...acc, [col.field]: "" }),
      {}
    );

    reset({ rowData: emptyRow });
    setOpenModal(true);
  };

  // Edit
  const handleEdit = (index) => {
    const row = fields[index];
    setSelectedRowIndex(index);
    reset({ rowData: row });
    setOpenModal(true);
  };

  const onSubmit = async (data) => {
    try {
      await saveCustomer(data);
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving customer");
    }
  };


  const handleFetchQuarantineResponse = async (useralias) => {
    try {
      setLoading(true);

      const response = await FetchQuarantineResponse(useralias);

      const tableData = Array.isArray(response)
        ? response
        : response?.data || [];

      setQuarantinemappedData(
        tableData.map((item, index) => ({
        id: index + 1,

        companyID: item.companyID || "",
        name: item.name || "",
        assetID: item.assetID || "",
        assetName: item.assetName || "",
        imoNumber: item.imoNumber || "",
        businessCode: item.businessCode || "",
        feedID: item.feedID || "",
        sampleID: item.sampleID || "",

        takenDate: item.takenDate,
        receivedDate: item.receivedDate,
        analysedDate: item.analysedDate,

        testSuite: item.testSuite || "",
        batchNumber: item.batchNumber || "",
        errorMessage: item.errorMessage || "",
            }))
      );

    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      {/* Add Button */}
      <Box p={2} >
        <Grid container spacing={4} >
          {/* <Button variant="contained" onClick={()=>handleFetchQuarantineResponse("3575qa")}>
            Download Quarantine List
          </Button> */}
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => handleFetchQuarantineResponse("3575qa")}
          >
            {loading ? "Loading..." : "Download Quarantine List"}
          </Button>
        </Grid>
      </Box>


      {/* Table Invoice Header*/}
      <Typography>Quarantine List  </Typography>
      <Box p={3}>
        <EditableSortableTable
          columns={columns}
          rowData={QuarantinemappedData}
          pagination
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>
    </Box>
  );
});

export default Excel_output;