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
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormSelect from "../components/form/FormSelect";
import { Box, Grid } from "@mui/material";
import { updateCustomer } from "../api/customerApi";

const MarineDataTable = ({ columns, defaultRows },ref) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { rows: defaultRows },
  });

  const { fields, append, remove } = useFieldArray({
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

  // Save modal data
  const handleModalSave = (modalData) => {
    if (selectedRowIndex !== null) {
      // Edit existing row
      fields[selectedRowIndex] = { ...fields[selectedRowIndex], ...modalData.rowData };
    } else {
      // Add new row
      append(modalData.rowData);
    }
    setOpenModal(false);
  };

//   const handleModalSave = async (modalData) => {
//   try {
//     const rowId = fields[selectedRowIndex].id; // or your unique row identifier
//     const updatedRow = await updateCustomer(rowId, modalData.rowData);

//     // Update local state after API success
//     fields[selectedRowIndex] = { ...fields[selectedRowIndex], ...updatedRow };

//     setOpenModal(false);
//   } catch (err) {
//     alert("Failed to update row: " + err.message);
//   }
//  };

  return (
    <>
      <form onSubmit={handleSubmit((data) => console.log("Form Data:", data))}>
        <TableContainer component={Paper} sx={{
          maxHeight: { xs: "calc(100vh - 200px)", md: "calc(100vh - 300px)" },
          maxWidth: { xs: "95vw", md: "85vw" },
          overflow: "auto",
        }}> 
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
      </form>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedRowIndex !== null ? "Edit Service Band" : "Add New Service"}</DialogTitle>
        <DialogContent>
          {columns.map((col) => (
            <Controller
              key={col.field}
              name={`rowData.${col.field}`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={col.headerName}
                  fullWidth
                  margin="normal"
                />
              )}
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

export default MarineDataTable;