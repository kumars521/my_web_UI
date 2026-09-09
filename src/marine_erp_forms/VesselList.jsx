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
import FormInput from "../components/form/FormInput";
import { Box, Grid } from "@mui/material";
const VesselTable = ({ columns, rows, control, onDelete }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 mt-4">
      {/* <div className="card-header bg-light border-0 py-3">
        <h6 className="mb-0 fw-semibold">Vessel Details</h6>
      </div> */}

      <div className="card-body p-0">
        <div className="table-responsive">
          <table
            className="table table-hover align-middle mb-0"
            style={{
              minWidth: "1800px", // Increase as needed
            }}
          >
            <thead className="table-light sticky-top">
              <tr>
                {columns.map((col) => (
                  <th key={col.field}>{col.headerName}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.field}>
                      <FormInput
                        className="w-100"
                        name={`tableData.${index}.${col.field}`}
                        control={control}
                      />
                    </td>
                  ))}

                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VesselTable;