import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import CustomRowOverLay from "./CustomRowOverLay";
import { Box } from "@mui/material";
import CommonPagination from "../CommonPagination";

interface Props {
  totalRows: number;
  pageSize: number;
  currentPage: number;
  handleChangePage: any;
  handleChangeRowsPerPage: any;
  columns: any;
  rows: any;
  checkboxSelection: boolean;
  loading: boolean;
  handleRowSelectionChange?: (selection: any, ids: any) => void;
}
function CommonDatagrid({
  totalRows,
  pageSize,
  currentPage,
  handleChangePage,
  handleChangeRowsPerPage,
  columns,
  rows,
  checkboxSelection,
  loading,
  handleRowSelectionChange,
}: Props) {
  return (
    <>

      <Box sx={{ height: "65vh", width: "100%", mt: 5 }}>
        <DataGrid
          checkboxSelection={checkboxSelection}
          columns={columns}
          disableSelectionOnClick
          rows={rows}
          disableColumnFilter
          disableColumnMenu
          loading={loading}
          getRowId={(row) => row.id ?? row.order_id}
          pagination
          pageSize={pageSize}
          rowCount={totalRows}
          page={currentPage}
          hideFooter
          paginationMode="server"
          onPageChange={(pageNo) => handleChangePage(pageNo)}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onSelectionModelChange={handleRowSelectionChange}
          onPageSizeChange={(sizePage) => handleChangeRowsPerPage(sizePage)}
          getRowHeight={() => "auto"}
          components={{
            NoRowsOverlay: () => <CustomRowOverLay />,
          }}
        />
      </Box>
      {/* {totalRows > 5 && ( */}
        <CommonPagination
          totalItems={totalRows}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handleChangePage}
          onPageSizeChange={handleChangeRowsPerPage}
        />
      {/* )}{" "} */}
    </>
  );
}

export default CommonDatagrid;
