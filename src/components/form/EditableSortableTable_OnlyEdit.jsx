import React,{useState}from"react";
import{Table,TableHead,TableRow,TableCell,TableBody,TableSortLabel,Paper,TableContainer,TablePagination,TextField,InputAdornment,IconButton,Button,CircularProgress}from"@mui/material";
import EditIcon from"@mui/icons-material/Edit";
import Book from"@mui/icons-material/Book";
import ClearIcon from"@mui/icons-material/Clear";
import SwapHorizIcon from"@mui/icons-material/SwapHoriz";
import DeleteIcon from"@mui/icons-material/Delete";

const EditableSortableTable_OnlyEdit=({columns,rowData,onEdit,onDelete,onOwnership,pagename,onBookInOut,pagination=true,pageSizeOptions=[10,25,50],loading=false})=>{
  const[orderBy,setOrderBy]=useState("");
  const[order,setOrder]=useState("asc");
  const[page,setPage]=useState(0);
  const[rowsPerPage,setRowsPerPage]=useState(pageSizeOptions[0]);
  const[filters,setFilters]=useState({});

  const handleSort=(field)=>{
    const isAsc=orderBy===field&&order==="asc";
    setOrder(isAsc?"desc":"asc");
    setOrderBy(field);
  };

  const handleFilterChange=(field,value)=>{
    setFilters(p=>({...p,[field]:value}));
    setPage(0);
  };

  const handleClearFilter=(field)=>{
    setFilters(p=>{
      const next={...p};
      delete next[field];
      return next;
    });
    setPage(0);
  };

  const handleClearAllFilters=()=>{
    setFilters({});
    setPage(0);
  };

  const filteredRows=rowData.filter(row=>
    columns.every(col=>{
      const f=filters[col.field];
      return !f||String(row[col.field]||"").toLowerCase().includes(f.toLowerCase());
    })
  );

  const sortedRows=[...filteredRows].sort((a,b)=>{
    if(!orderBy)return 0;
    const A=a[orderBy]||"",B=b[orderBy]||"";
    return order==="asc"?A>B?1:-1:A<B?1:-1;
  });

  const paginatedRows=pagination
    ?sortedRows.slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage)
    :sortedRows;

  return(
    <div className="container-fluid mt-4">
      <div className="card border-0 shadow-lg rounded-4">
        {/* <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">Data Table</h5>
        </div> */}

        <div className="card-body p-1">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              {Object.keys(filters).length > 0 ? (
                <span>
                  Showing <strong>{sortedRows.length}</strong> of <strong>{rowData.length}</strong> records
                </span>
              ) : (
                <span>
                  Total: <strong>{rowData.length}</strong> records
                </span>
              )}
            </div>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={handleClearAllFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 4,
              maxHeight: "65vh",
              overflow: "auto"
            }}
          >
              <Table stickyHeader size="small"  sx={{ tableLayout: "auto"  }} >
              <TableHead>
                <TableRow>
                  {pagename==="Quarantine" || pagename==="invoiceheader" && (
                  <TableCell sx={{background:"#485e5a",color:"#fff",fontWeight:700,minWidth:120}}>
                    Actions
                  </TableCell>)}

                    {columns.map(col=>(
                      <TableCell
                        key={col.field}
                        sx={{
                          background:"#485e5a",
                          color:"#fff",
                          fontWeight:700,
                          whiteSpace:"nowrap",
                          px:10,
                          py:2
                        }}
                      >
                        <TableSortLabel
                          active={orderBy===col.field}
                          direction={orderBy===col.field?order:"asc"}
                          onClick={()=>handleSort(col.field)}
                          sx={{
                            color:"#ffffff",
                            "& .MuiTableSortLabel-icon":{
                              color:"#fff!important"
                            },
                            "&:hover":{
                              color:"#fff"
                            }
                          }}
                        >
                          {col.headerName}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    
                </TableRow>

                <TableRow>
                  
                  <TableCell/>
                  {/* <TableCell>Search</TableCell> */}
                  {columns.map(col=>(
                    
                    <TableCell key={col.field}>
                      <TextField
                        fullWidth size="small"
                        placeholder={`Search ${col.headerName}`}
                        value={filters[col.field]||""}
                        onChange={e=>handleFilterChange(col.field,e.target.value)}
                        InputProps={{
                          endAdornment: filters[col.field] ? (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                edge="end"
                                onClick={()=>handleClearFilter(col.field)}
                                aria-label={`Clear ${col.headerName} filter`}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ) : null
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} sx={{ py: 6 }}>
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <CircularProgress />
                        <div className="text-muted mt-2">Loading data, please wait...</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row,i)=>(
                    <TableRow key={row.id||i} hover sx={{
                      backgroundColor:i%2===0?"#c7e7e9" : "#e2eaeb",
                      "&:hover":{backgroundColor:"#e9f5ff"}
                    }}>
                      <TableCell>
                      <div className="d-flex align-items-center gap-1">
                          {pagename!=="Quarantine" && (
                          <button  className="btn btn-sm btn-primary p-1" onClick={()=>onEdit?.(row)}>
                            <EditIcon fontSize="small" />
                          </button>
                        )}
                        {pagename==="Quarantine" && (
                          <>
                            <button className="btn btn-sm btn-danger p-1" onClick={()=>onDelete?.(row)}>
                              <DeleteIcon fontSize="small" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>

                      {columns.map(col=>(
                        <TableCell key={col.field} sx={{whiteSpace:"nowrap"}}>
                          {col.renderCell ? col.renderCell(row) : row[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination && !loading && (
            <div className="mt-3">
              <TablePagination
                component="div"
                count={sortedRows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(e,p)=>setPage(p)}
                onRowsPerPageChange={e=>{
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
                rowsPerPageOptions={pageSizeOptions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableSortableTable_OnlyEdit;