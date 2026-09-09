
import React, { useState,useImperativeHandle } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormSelect from "../../components/form/FormSelect";
import { TextField, Select, MenuItem, FormControl, InputLabel,Box, Grid } from "@mui/material";
import { updateCustomer } from "../../api/customerApi";

import {opt_offer_list,opt_vessel_Currency} from "../../customer/Opt_library"

const EditableTable = ({ columns, defaultRows },ref) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { rows: defaultRows },
  });
  const { fields, append, remove,update  } = useFieldArray({
    control,
    name: "rows",
  });
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  // Open modal for edit
  const handleEdit = (index) => {
    const row = fields[index];
    setSelectedRowIndex(index);
    reset({ rowData: row });
    setOpenModal(true);
  };
  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setOpenModal(true); // expose the function correctly
    }
  }));
  // Open modal for add
  const handleAdd = () => {
    setSelectedRowIndex(null); // no selection
    reset({
      rowData: columns.reduce((acc, col) => ({ ...acc, [col.field]: "" }), {}),
    });
    setOpenModal(true);
  };
  const handleModalSave = (modalData) => {
    if (selectedRowIndex !== null) {
      // update existing row
      update(selectedRowIndex, modalData.rowData);
    } else {
      // add new row
      append(modalData.rowData);
    }

    // setValue("rowData", {});
    // setSelectedRowIndex(null);
    setOpenModal(false);
  };
  return (
    <>
            <Grid container spacing={4} >
            <Grid item xs={12} md={6} mt={2} sx={{minWidth:"300"}}>
              <FormSelect
                fullWidth
                name="currency :"
                control={control}
                label="Currency"
                options={[
                  { label: "DKK", value: "DKK" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" },
                  { label: "JPY", value: "JPY" },
                  { label: "NOK", value: "NOK" },
                  { label: "SEK", value: "SEK" },
                  { label: "USD", value: "USD" }
                ]}
                
              />
            </Grid>
            <Grid item xs={12} md={4} mt={2} sx={{minWidth:"300"}}>
              <FormSelect
                name="frequency :"
                control={control}
                label="Frequency"
                options={[
                  { label: "1M", value: "1M" },
                  { label: "3M", value: "3M" },
                  { label: "6M", value: "6M" },
                  { label: "12M", value: "12M" }
                ]} 
                
              />
            </Grid>
            <Grid item xs={12} md={3} mt={1}>
              <Button variant="contained" sx={{ mt: 1 }} 
              onClick={handleAdd}
              style={{ marginBottom: "1rem" }}
              >
                Add Service Band
              </Button>
            </Grid>
          </Grid>
      {/* <form onSubmit={handleSubmit((data) => console.log("Form Data:", data))}>
       */}
       <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <TableContainer component={Paper}  sx={{ overflowX: "auto", maxWidth: "100%" }}>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Actions</TableCell>
                
                {columns.map((col) => (
                  <TableCell key={col.field}>{col.headerName}</TableCell>
                ))}
                
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((row, rowIndex) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(rowIndex)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => remove(rowIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  {/* <TableCell>Red Port</TableCell> */}
                  {columns.map((col) => (
                    
                    <TableCell key={col.field}>
                      <Controller
                        name={`rows[${rowIndex}].${col.field}`}
                        control={control}
                        render={({ field }) => <TextField {...field} size="small" fullWidth />}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedRowIndex !== null ? "Edit Service Band" : "Add New Service"}
        </DialogTitle>
        <DialogContent>
          {columns.map((col) => (
            <Controller
              key={col.field}
              name={`rowData.${col.field}`}
              control={control}
              render={({ field }) => {
                if (col.type === "select") {
                  return (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>{col.headerName}</InputLabel>

                      <Select {...field} value={field.value || ""} label={col.headerName}>
                        {(col.field === "offer1"
                          ? opt_offer_list
                          : opt_vessel_Currency
                        ).map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }
                return (
                  <TextField
                    {...field}
                    label={col.headerName}
                    fullWidth
                    margin="normal"
                  />
                );
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit(handleModalSave)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default EditableTable;
