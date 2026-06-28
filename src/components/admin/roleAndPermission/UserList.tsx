import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import moment from 'moment'
import { useAuth } from 'src/hooks/useAuth';
import AddUserPopupDialog from '../user/AddUser';
import Icon from 'src/@core/components/icon';

import GoBack from 'src/components/commonComponent/GoBack';
import AddIcon from '@mui/icons-material/Add'

import axiosInstance from 'src/services/axios';



export default function UserList({ setIsUserUpdated, isUserUpdates }: any) {
  const [allUsers, setallUsers] = useState([])
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false)
  const [currentPackage, setCurrentPackage] = useState({})
  const [openAdd, setopenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedItem, setSelectedItem] = useState({})
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCatagoryForDelete, setSelectedCatagoryForDelete] = useState({});
  const [filterParams, setFilterParams] = useState('');

  const auth = useAuth()
  const fetchData = async (filter?: any) => {
    setIsLoading(true)
    try {
      const limit = `limit=${pageSize}`
      const pageNo = `pageNo=${page}`
      let queryParams = `${limit}&${pageNo}`;


      if (filterParams) {
        queryParams = `${queryParams}&${filterParams}`
      }

      const response = await axiosInstance.get(`/v1/${auth?.user?.role}/getAllUsers?${queryParams}`)
      if (auth.user?.role == 'admin') {

        setallUsers(response.data.data.data ?? [])
      } else {
        setallUsers(response.data.data?.data ? response.data.data?.data?.map(item => ({
          ...item.
            user,
          role: item.role,
          employee_id: item.id
        })) : [])

      }
      setTotalRows(response.data.data.count ?? 0);

    } catch (e) {
      } finally {
      setIsLoading(false)
    }

  }
  useEffect(() => {
    fetchData()
  }, [page, pageSize, filterParams, rowsPerPage])

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  useEffect(() => {
    setIsUserUpdated(!isUserUpdates)
  }, [openEdit, openDelete, openAdd])
  const filterColumn = [
    {
      field: auth.user?.role == 'admin' ? 'full_name' : 'user.full_name',
      headerName: 'User Name',
      filterType: 'text',
      operatorOptions: [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not Equals' },
        { value: 'LIKE', label: 'Contains' },
        { value: 'NOT LIKE', label: 'Does not contain' },
      ]
    },
    {
      field: auth.user?.role == 'admin' ? 'email' : 'user.email',
      headerName: 'Email ID',
      filterType: 'text',
      operatorOptions: [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not Equals' },
        { value: 'LIKE', label: 'Contains' },
        { value: 'NOT LIKE', label: 'Does not contain' },
      ]
    },

    {
      field: 'combinedPhoneNumber',
      headerName: 'Mobile Number',
      filterType: 'phone',
      subField: auth.user?.role !== 'admin' ? 'user.' : '',
      operatorOptions: [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not Equals' },
        { value: 'LIKE', label: 'Contains' },
        { value: 'NOT LIKE', label: 'Does not contain' },
      ],

    },
    {
      field: 'role.name',
      headerName: 'Role',
      filterType: 'text',
      operatorOptions: [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not Equals' },
        { value: 'LIKE', label: 'Contains' },
        { value: 'NOT LIKE', label: 'Does not contain' },
      ]
    },
    {
      field: auth.user?.role == 'admin' ? 'created_at' : 'user.created_at',
      headerName: 'Date',
      filterType: 'calendar',
      operatorOptions: [
        { value: 'BETWEEN', label: 'Between' },

      ],
    },
  ]

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 0.5,
      sortable: false,

      minWidth: 90,

      renderCell: (index) => {
        const rowIndex = index.api.getRowIndex(index.row.id);
        return (page * pageSize) + (rowIndex % pageSize) + 1;
      }, hideable: false
    },

    {
      field: 'full_name',
      headerName: 'User Name',
      flex: 1,
      minWidth: 300,
      sortable: false,

      renderCell: (params: GridCellParams) => (
        <p style={{ textTransform: 'capitalize' }}>{params.row?.full_name || 'NA'}</p>
      )
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 1,
      minWidth: 400,
      sortable: false,

      renderCell: (params: GridCellParams) => (

        <EmailModule email={params.row?.email ?? ''} />
      )
    },

    {
      field: 'country_code',
      headerName: 'Country',
      flex: 1,
      sortable: false,

      minWidth: 200,
      renderCell: (params: GridCellParams) => (
        <FlagComponent phoneCode={params.row?.user?.country_code || params.row?.country_code ?? ''} />
        // <p>+{params.row?.user?.country_code ?? 'NA'} {params.row?.user?.mobile_no ?? 'NA'}</p>
      )
    },
    {
      field: 'updated_at',
      headerName: 'Mobile Number',
      flex: 1,
      sortable: false,

      minWidth: 200,
      renderCell: (params: GridCellParams) => (
        <MobileNumberModule countryCode={params.row?.country_code ?? ''} mobileNo={params.row?.mobile_no ?? ''} />
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      sortable: false,

      minWidth: 150,
      renderCell: (params: GridCellParams) => (
        <p style={{ textTransform: 'capitalize' }}>{params.row?.role?.name || 'NA'}</p>
      )
    },
    {
      field: 'date ',
      headerName: 'Date and Time',
      flex: 1,
      minWidth: 180,
      sortable: false,

      renderCell: (params: GridCellParams) => {
        const { row } = params;
        return (
          <DateFormateComponent date={params.row?.created_at ?? ''} />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,

      minWidth: 150,
      renderCell: (params: GridCellParams) => (
        <>
          {checkPermission('update-user') && (

            <TooltipOnly title="Edit this User.">

              <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => {
                setSelectedItem(params.row);
                setOpenEdit(true);
              }}>
                <Icon icon={'circum:edit'} fontSize={24} />
              </Button>
            </TooltipOnly>
          )}
          <TooltipOnly title="Delete this User.">

            <Button
              style={{ color: '#84919d', margin: '-10px' }}
              onClick={() => {
                setSelectedCatagoryForDelete(auth.user?.role == 'admin' ? params.row?.id : params.row?.employee_id)
                setOpenDelete(true);
              }
              }
            >
              <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
            </Button>
          </TooltipOnly>
        </>
      )
    }
  ];

  return (
    <>

      <Card sx={{ mt: 5, mb: 5 }}>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={8} md={10}>

            <Typography variant='h6' style={{ color: '#3e66f3', marginLeft: '10px' }}>Users List</Typography>
          </Grid>
          {/* {checkPermission('add-user') && ( */}

            <Grid item xs={4} md={2}>

              <Tooltip title="Add a new User.">
                <Button variant="contained"
                  style={{ backgroundColor: '#3e66f3', color: '#fff' }}
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => setopenAdd(true)} >Add user </Button>
              </Tooltip>
            </Grid>
          {/* )} */}
          <Grid item xs={12} md={12}>
            {/* <DynamicFilter columns={filterColumn} setData={setFilterParams} /> */}

          </Grid>
          <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' } }}>

          </Grid>
          {/* <Box display="flex" justifyContent={'end'} alignItems="center" gap={5} sx={{ width: '100%' }}> */}
          {/* <Box > */}
          {/* <Grid item xs={12} md={11} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <CommonPagination totalItems={totalRows} currentPage={page} pageSize={pageSize} onPageChange={handleChangePage} onPageSizeChange={handleChangeRowsPerPage} />
          </Grid> */}
          {/* </Box> */}
          {/* </Box> */}
          <Box sx={{ height: '70vh', width: "100%", display: { xs: 'none', md: 'flex' } }}>
            <DataGrid
              columns={columns}
              disableColumnFilter
              disableColumnMenu
              rows={allUsers}
              loading={isLoading}
              getRowId={(row) => row.id}
              pagination
              pageSize={pageSize}
              rowCount={totalRows}
              page={page}
              hideFooter
              paginationMode="server"
              onPageChange={(pageNo) => handleChangePage(pageNo)}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageSizeChange={(sizePage) => handleChangeRowsPerPage(sizePage)}
              // components={{
              //   NoRowsOverlay: () => (<CustomRowOverLay />),
              // }}
            />
          </Box>

          <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' } }}></Grid>
          {/* <Grid item xs={12} md={11} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <CommonPagination totalItems={totalRows} currentPage={page} pageSize={pageSize} onPageChange={handleChangePage} onPageSizeChange={handleChangeRowsPerPage} />
          </Grid> */}
        </Grid>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Grid container spacing={2} padding={2}>
            {allUsers.map((row, index) => (
              <Grid item xs={12} key={row.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        Sr. No: {(page * rowsPerPage) + index + 1}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* <IconButton onClick={() => handleViewOrganization(row.id)}>
                                <Icon icon="ph:eye" fontSize={24} />
                              </IconButton> */}
                        <IconButton
                          style={{ color: '#84919d' }}
                          onClick={() => {
                            setSelectedItem(row);
                            setOpenEdit(true);
                          }}                                   >
                          <Icon icon="circum:edit" fontSize={24} />
                        </IconButton>
                        <Tooltip title="Delete this Organisation.">
                          <IconButton
                            onClick={() => {
                              setSelectedCatagoryForDelete(auth.user?.role == 'admin' ? row?.id : row?.employee_id)
                              setOpenDelete(true);
                            }
                            }                               >
                            <Icon icon="ic:outline-delete" fontSize={24} color="#FC4E4E" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* <Typography variant="h6" mt={1.5}>
                                                </Typography> */}

                    <Typography variant="body2" mt={1.5}>
                      User Name: <span style={{ textTransform: 'capitalize' }}>{row.full_name || 'NA'}</span>
                    </Typography>

                    <Typography variant="body2" mt={1.5}>


                      Email ID: <EmailLink email={row?.email ?? 'NA'} />

                    </Typography>




                    {/* <Typography variant="body2" mt={1.5}>

                      Mobile Number: <PhoneLink countryCode={row?.country_code} mobileNo={row?.mobile_no} />

                    </Typography> */}

                    <Typography variant="body2" mt={1.5}>
                      Role: <span style={{ textTransform: 'capitalize' }}>{row?.role?.name || 'NA'}</span>
                    </Typography>

                    <Typography variant="body2" mt={1.5}>
                      Date And Time: {row?.created_at ? moment(row.created_at).format('DD/MM/YY, h:mm:ss a').toUpperCase() : 'NA'}
                    </Typography>



                    {/* <Typography
                      variant="body2"
                      mt={1.5}
                      display="flex"
                      alignItems="center"
                    >
                      Country:  <FlagComponent phoneCode={row?.country_code ?? ''} />
                    </Typography> */}
                  </CardContent>

                </Card>
              </Grid>
            ))}
            <Box mt={2} mb={2} display="flex" justifyContent="center">
              {/* <CardPagination
                totalItems={totalRows} currentPage={page} pageSize={rowsPerPage} onPageChange={handleChangePage} onPageSizeChange={handleChangeRowsPerPage}
              /> */}
            </Box>
          </Grid>
        </Box>
        {openAdd && (
          <AddUserPopupDialog openDelete={openAdd} fetchData={fetchData} onClose={
            () => setopenAdd(false)
          } />
        )}
        {/* {openEdit && (
          <UpdateUserPopupDialog openDelete={openEdit} onClose={() => setOpenEdit(false)} fetchData={fetchData} selectedItem={selectedItem} />
        )} */}

        {/* {openDelete && <DeletePopupDialog openDelete={openDelete} onClose={() => setOpenDelete(false)} fetchData={fetchData} selectedId={selectedCatagoryForDelete} url={`v1/${auth?.user?.role}/deleteUser`} label='Are you sure, you want to delete?' />} */}

      </Card>
    </>

  )
}
