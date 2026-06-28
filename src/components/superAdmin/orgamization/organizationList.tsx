import React, { useState, useEffect } from 'react';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import axiosInstance from 'src/services/axios';
import { Card, CardHeader } from "@mui/material";
import { Box } from "@mui/system";
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import OperatorDeleteDialog from 'src/components/operators/DeleteOperators';
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup';
import EmailModule from 'src/components/common/Links/EmailLink';
import MobileNumberModule from 'src/components/common/Links/MobileNumberModule';
import { encodeParams } from 'src/utils/encodeid';
// import OperatorDeleteDialog from './DeleteOperators';
// import UpdateOperatorPopup from './EditOperator';
import { useRouter } from 'next/router';
const OrganizationList = () => {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedCatagory, setSelectedCatagory] = useState({});
  const [selectedCatagoryForDelete, setSelectedCatagoryForDelete] = useState({});
  const router = useRouter()
  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get(`/admin/v1/auth/organization/get-all?pageNo=${page}&limit=${pageSize}`)
      .then((response) => {
        setRows(response.data.data.data || []);
        setTotalRows(response.data.data.count);
        setLoading(false);
      })
      .catch((error) => {
        setRows([]);
        setLoading(false);
      });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleEditClick = (params: GridCellParams) => {
    setSelectedCatagory(params.row);
    setOpenEdit(true);
  };

  const handleDeleteClick = (params: GridCellParams) => {
    setSelectedCatagoryForDelete(params.row.id);
    setOpenDelete(true);
  };

  const columns: GridColDef[] = [

    {
      field: 'id',
      headerName: 'Sr. No.',
      renderCell: (index) => {
        const rowIndex = index.api.getRowIndex(index.row.id);
        return (page * pageSize) + (rowIndex % pageSize) + 1;
      },
      hideable: false,
      minWidth: 100,
      flex: 0.5
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
    },
    {
      field: 'org_name',
      headerName: 'Organization Name',
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <p>{params.row?.org_admin?.name ?? 'NA'}</p>
      )
    },
    {
      field: 'org_email',
      headerName: 'Organization email',
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <EmailModule email={params.row?.org_admin?.email ?? ''} />
      )
    },

    {
      field: 'org_mobile',
      headerName: 'Organization mobile NO.',
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <MobileNumberModule mobileNo={params.row?.org_admin?.mobile_number} countryCode={params.row?.org_admin?.country_code} />
      )
    },



    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <>
          {/* <Button
            style={{ color: '#84919d', margin: '-10px' }} onClick={() => this.handleViewClick(params)}><Icon icon='bx-show' /></Button> */}
          <Button
            style={{ color: '#84919d', margin: '-10px' }}
            onClick={() => router.push(`/superAdmin/orgnization/view-organization/?id=${encodeParams(params.row.id)}`)}
          >
            <Icon icon='bx-show' />
          </Button>

          {/* <Button
            style={{ color: '#84919d', margin: '-10px' }}
            onClick={() => handleEditClick(params)}
          >
            <Icon icon='bx-edit' />
          </Button> */}

          <Button
            style={{ color: '#84919d', margin: '-10px' }}
            onClick={() => handleDeleteClick(params)}
          >
            <Icon icon='ic:baseline-delete' />
          </Button>
        </>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader title='Orgnization' />
      <Box sx={{ height: '70vh', width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          pagination
          pageSize={pageSize}
          rowCount={totalRows}
          page={page}
          paginationMode="server"
          onPageChange={handlePageChange}
          loading={loading}
          rowsPerPageOptions={[5, 10, 20]}
          onPageSizeChange={handlePageSizeChange}
        />
      </Box>
      {openDelete && <DeleteDialogPopup selectedItems={selectedCatagoryForDelete} show={openDelete} handleclose={() => setOpenDelete(false)} fetchData={fetchData} label={'You want to delete organization'} apiUrl={'admin/v1/auth/delete-org'} />}
      {/* {openEdit && <UpdateOperatorPopup selectedUser={selectedCatagory} show={openEdit} handleclose={() => setOpenEdit(false)} fetchData={fetchData} />} */}
    </Card>
  );
};

export default OrganizationList;
