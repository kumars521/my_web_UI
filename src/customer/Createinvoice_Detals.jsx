import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from "react";
import { useLocation } from "react-router-dom";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import EditableSortableTable_OnlyEdit from "../components/form/EditableSortableTable_OnlyEdit";
import {opt_newaccount,opt_country,opt_region,opt_status,opt_vessel_Currency,opt_offer_list, opt_Currency} from "./Opt_library"

import { customerSchema } from "../validation/customerSchema";

import {
  FetchInvoiceDetail,
  FetchInvoiceDetailTestSuit,
  FetchInvoiceDetailServiceOffer
} from "../api/InvoiceApis";
import LoadingButton from "../components/LoadingButton";

const Createinvoice_Detals = forwardRef((props, ref) => {
  const { control, getValues, handleSubmit, reset, watch, setValue } = useForm({
    resolver: yupResolver(customerSchema),
    defaultValues: {}
  });

  const [rows, setRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [serviceOfferbanddata, setserviceOfferbanddata] = useState([]);
  const [Responddata, setResponddata] = useState([]);

  const { append, update } = useFieldArray({
    control,
    name: "tableData"
  });

  const location = useLocation();

  useImperativeHandle(ref, () => ({
    openAdd: handleAdd
  }));

  const initializeInvoiceDetails = async () => {
    const storedInvoiceDetails =
      JSON.parse(localStorage.getItem("invoiceDetails")) || [];
    const savedHeaderRow = Array.isArray(storedInvoiceDetails)
      ? storedInvoiceDetails[0]
      : storedInvoiceDetails;
    const routeStateHeader = location.state?.headerRow || null;
    const invoiceHeaderId =
      location.state?.invoiceHeaderId ||
      routeStateHeader?.invoiceHeaderId ||
      routeStateHeader?.invoiceHeaderID ||
      savedHeaderRow?.invoiceHeaderId ||
      savedHeaderRow?.invoiceHeaderID ||
      getValues("invoiceheaderid") ||
      "";

    const headerValues = {
      invoicecompany: routeStateHeader?.customer || savedHeaderRow?.customer || "",
      invoicesoldto: routeStateHeader?.soldTo || savedHeaderRow?.soldTo || "",
      invoiceasset: routeStateHeader?.assetName || savedHeaderRow?.assetName || "",
      invoicecaid: routeStateHeader?.caid || savedHeaderRow?.caid || "",
      imonumber: routeStateHeader?.imoNumber || savedHeaderRow?.imoNumber || "",
      erpnumber: routeStateHeader?.erpNumber || savedHeaderRow?.erpNumber || "",
      erpsystem: routeStateHeader?.erpSystem || savedHeaderRow?.erpSystem || "",
      invoiceheaderid: invoiceHeaderId
    };

    if (invoiceHeaderId) {
      reset(headerValues);
      setValue("invoiceheaderid", invoiceHeaderId);
      await handleFetchInvoiceDetailServiceOffer();
      await handleInvoiceDetails(invoiceHeaderId);
    } else {
      loadInvoiceDetails();
    }
  };

  useEffect(() => {
    initializeInvoiceDetails();
  }, []);

  /* ---------------- API ---------------- */

  const handleFetchInvoiceDetailServiceOffer = async () => {
    const payload = {
      InvoiceHeaderID: getValues("invoiceheaderid")
    };

    try {
      const res = await FetchInvoiceDetailServiceOffer(payload);
      setserviceOfferbanddata(res.data || []);
    } catch (err) {}
  };

  const handleFetchInvoiceDetailTestSuit = async (offerband) => {
    const details =
      JSON.parse(localStorage.getItem("invoiceDetails")) || [];

    const payload = {
      ServiceOfferBandID: offerband,
      CompanyName: details?.[0]?.customer
    };

    const res = await FetchInvoiceDetailTestSuit(payload);
    setResponddata(res.data || []);
  };

  const handleInvoiceDetails = async (InvoiceNumber) => {
    try {
      const res = await FetchInvoiceDetail(InvoiceNumber);

      setRows(
        res.data.map((item, index) => ({
          id: index + 1,
          ...item
        }))
      );
    } catch (err) {
      alert("Failed to load Invoice details");
    }
  };

  /* ---------------- Actions ---------------- */

  const handleAdd = () => {
    loadInvoiceDetails();
    setSelectedRowIndex(null);
    reset({});
    setOpenModal(true);
  };

  const handleEdit = (row) => {
    loadInvoiceDetails();
    handleFetchInvoiceDetailServiceOffer();
    console.log(row);
    // handleFetchInvoiceDetailTestSuit(row.serviceOfferBand),
    const formatDate = (date) => {
      const d = new Date(date);
      return date && !isNaN(d)
        ? d.toISOString().split("T")[0]
        : "";
    };
    reset({
      invoicecompany: row.invoiceHeaderId ?? "",
      machineusagecode: row.machineUsageCode ?? "",
      invoicelocation: row.location ?? "",
      datetested: formatDate(row.dateTested),

      serviceofferband: row.serviceOfferBand
        ? String(row.serviceOfferBand).toLowerCase()
        : "",

      servicebandselection: row.customer ?? "",

      testsuite: row.testSuite
        ? String(row.testSuite).toLowerCase()
        : "",

      batchno: row.batchNumber ?? "",
      sampleref: row.sampleReference ?? "",

      isfoc: row.isFOC
        ? String(row.isFOC).toLowerCase()
        : "",

      islocked: row.isLocked
        ? String(row.isLocked).toLowerCase()
        : "",

      invoiceprice: row.price ?? "",
    });

    setOpenModal(true);
  };

  const handleModalSave = (data) => {
    if (selectedRowIndex !== null) update(selectedRowIndex, data);
    else append(data);

    setOpenModal(false);
  };

  const loadInvoiceDetails = () => {
    const data = JSON.parse(localStorage.getItem("invoiceData")) || [];
    setRows(
      data.map((item, i) => ({
        id: i + 1,
        ...item
      }))
    );
  };

  const columns = [
      { field: "invoiceDetailID", headerName: "Invoice Detail ID" },
      { field: "machineUsageCode", headerName: "Machine Usage Code" },
      { field: "location", headerName: "Location" },
      { field: "testSuite", headerName: "Test Suite" },
      { field: "dateTested", headerName: "Date Tested" },
      { field: "sampleReference", headerName: "Sample Reference" },
      { field: "serviceOfferBand", headerName: "Service Offer Band" },
      { field: "mnemonic", headerName: "Mnemonic" },
      { field: "batchNumber", headerName: "Batch Number" },
      { field: "isFOC", headerName: "IsFOC" },
      { field: "isLocked", headerName: "IsLocked" },
      { field: "lockedBy", headerName: "Locked By" },
      { field: "remainingFOC", headerName: "Remaining FOC" },
      { field: "price", headerName: "Price" },
      { field: "currency", headerName: "Currency" },
      { field: "currencyID", headerName: "CurrencyID" },
      { field: "lvl", headerName: "lvl" },
      { field: "offerVersion", headerName: "OfferVersion" },
  ];

  /* ---------------- UI ---------------- */
const invoiceFields = [
  ["invoicecompany", "Company"],
  ["invoicesoldto", "Sold To"],
  ["invoiceasset", "Asset"],
  ["invoicecaid", "CAID"],
  ["imonumber", "IMO Number"],
  ["erpnumber", "ERP Number"],
  ["erpsystem", "ERP System"],
];
  return (
    <Box sx={{ background: "#eef2f7", minHeight: "100vh",pt:5, px: 5 }}>
      {/* <Box p={20}> */}
        <div className="container-fluid">
          <div className="card shadow-sm border-0 rounded-4">

            {/* HEADER CARD */}
            <div className="card shadow-sm ">
              <div className="card-body">

                <div className="d-flex flex-wrap gap-2 mb-3">

                  <LoadingButton className="btn btn-primary" asyncAction={async () => handleAdd()} loadingKey="invoice-create">
                    + Create Invoice
                  </LoadingButton>

                  <input
                    className="form-control w-auto"
                    placeholder="Invoice Header ID"
                    {...control.register("invoiceheaderid")}
                  />

                  <button
                    className="btn btn-success"
                    onClick={() =>
                      handleInvoiceDetails(getValues("invoiceheaderid"))
                    }
                  >
                    Download Invoice Details
                  </button>

                </div>

                {/* HEADER FIELDS */}
                <div className="row g-3">

                {invoiceFields.map(([name, label]) => (
                  <div className="col-sm-2" key={name}>
                    <FormInput
                      disabled
                      name={name}
                      control={control}
                      label={label}
                    />
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
          <hr className="my-2" />
          <div className="card shadow-sm border-0 rounded-4">
            {/* TABLE */}
            <div className="card shadow-sm">
              <div className="card-header fw-bold">
                Invoice Details Table
              </div>

              <div className="card-body">
                <EditableSortableTable_OnlyEdit
                  columns={columns}
                  rowData={rows}
                  control={control}
                  onEdit={handleEdit}
                  pagination
                />
              </div>
            </div>

            {/* BOOTSTRAP MODAL */}
            {openModal && (
              <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">

                    <div className="modal-header">
                      <h5 className="modal-title">
                        {selectedRowIndex !== null ? "Edit Invoice" : "Create Invoice"}
                      </h5>

                      <button className="btn-close" onClick={() => setOpenModal(false)} />
                    </div>

                    <div className="modal-body">

                      <div className="row g-3">

                        <div className="col-md-4">
                          <FormInput name="machineusagecode" control={control} label="Machine Code" />
                        </div>

                        <div className="col-md-4">
                          <FormInput name="invoicelocation" control={control} label="Location" />
                        </div>

                        <div className="col-md-4">
                          <FormInput type="date" name="datetested" control={control} />
                        </div>

                      </div>

                      <div className="row g-3 mt-2">

                        <div className="col-md-6">
                          <FormSelect
                            name="serviceofferband"
                            control={control}
                            label="Service Offer Band"
                            options={serviceOfferbanddata.map(i => ({
                              label: i.serviceOfferBand,
                              value: i.serviceOfferBandID
                            }))}
                            onChange={() =>
                              handleFetchInvoiceDetailTestSuit(getValues("serviceofferband"))
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <FormSelect
                            name="testsuite"
                            control={control}
                            label="Test Suite"
                            options={Responddata.map(i => ({
                              label: i.testSuit,
                              value: i.testSuit
                            }))}
                          />
                        </div>

                      </div>
                      <div className="row g-3 mt-2">

                      <div className="col-md-6">
                        <FormSelect
                          name="isfoc"
                          control={control}
                          label="Is FOC :"
                          options={opt_newaccount}
                        />
                      </div>

                      <div className="col-md-6">
                        <FormSelect
                          name="islocked"
                          control={control}
                          label="Is Locked :"
                          options={opt_newaccount}
                        />
                      </div>

                    </div>
                    <div className="row g-3 mt-2">

                        <div className="col-md-4">
                          <FormInput name="batchno" control={control} label="Batch No" />
                        </div>

                        <div className="col-md-4">
                          <FormInput name="sampleref" control={control} label="Sample Ref" />
                        </div>

                        <div className="col-md-4">
                          <FormInput name="invoiceprice" control={control} label="Price" />
                        </div>

                      </div>

                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => reset()}
                      >
                        Clear
                      </button>

                      <LoadingButton
                        className="btn btn-primary"
                        asyncAction={async () => await handleSubmit(handleModalSave)()}
                        loadingKey="invoice-save"
                      >
                        Save
                      </LoadingButton>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      {/* </Box> */}
    </Box>
  );
});

export default Createinvoice_Detals;