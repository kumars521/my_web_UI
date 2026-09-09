import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./Createinvoice";
import SecondPage from "./Createvessel";
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
function Invoice() {
  return (
    <BrowserRouter>
      <Routes>
          <Button variant="contained" onClick={<Route path="/" element={<HomePage />} />}>
            Create Invoice
          </Button>
          <Button mt={1} variant="contained" onClick={<Route path="/second" element={<SecondPage />} />}>
            Edit Invoice
          </Button>
      </Routes>
    </BrowserRouter>
  );
}

export default Invoice;