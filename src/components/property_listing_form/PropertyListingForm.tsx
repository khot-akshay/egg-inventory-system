import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, Switch, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import React, { use, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import SearchInput from 'src/components/common/SearchInput'
import checkPermission from 'src/configs/CheckPermisstion'
import axiosInstance from 'src/services/axios'
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import MobileNumberModule from '../common/Links/MobileNumberModule'
import { Sms } from '@mui/icons-material'
import DateFormateComponent from '../common/dateFormat/DateFromatModule'
import Icon from 'src/@core/components/icon'
import EmailModule from '../common/Links/EmailLink'
import PropertyListingDeletePopup from './PropertyListingDeletePopup'
import PropertListingViewPopup from './PropertListingViewPopup'
const PropertyListingForm = () => {
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [openAdd, setOpenAdd] = useState(false)
    const [selectedItem, setSelectedItem] = useState("")
    const router = useRouter()
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [openView, setOpenView] = useState(false);
    const [selectedMsgDelete, setSelectedMsgDelete] = useState<any>({});
    const [openDelete, setOpenDelete] = useState(false);
    const [openReply, setOpenReply] = useState(false);
    const fetchGame = async (searchQuery?: string) => {
        setLoading(true)
        let params = '';
        if (searchQuery) {
            params = `&search=${searchQuery}`;
        }
        // let url = ''
        // if (selectedItem) {
        //     url = `/v1/admin/getAllContactUs`
        // } else {
        //     url = '/v1/admin/getContactUsById?id=${selectedItem.id}&pageNo=${page}&limit=${pageSize}${params}'
        // }
        try {
            const response = await axiosInstance.get(`/v1/admin/getAllVillaListing?&pageNo=${page}&limit=${pageSize}${params}`, {})
            // setRows(response.data.data.data?.Contact_us ?? [])
            // setTotalRows(response.data.data.count ?? 0)
            if (response.data?.data.data) {
                setRows(response.data?.data.data) // Fix here
                setTotalRows(response?.data?.data?.data.count ?? 0)

                // } else {
                setRows([])
                setTotalRows(0)
            }
        } catch (e) {
            setRows([]) // Ensure table doesn't break if an error occurs
            setTotalRows(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGame()
    }, [page, pageSize])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
    }
    const handleViewClick = (params: GridCellParams) => {
        setSelectedItem(params);
        setOpenView(true);
    };
    const handleDeleteClick = (params: GridCellParams) => {
        setSelectedMsgDelete(params.row.id);
        setOpenDelete(true);
    };
    const handleReplyClick = (params: GridCellParams) => {

        setSelectedItem(params.row);
        setOpenReply(true);
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Sr. No.',
            minWidth: 100,
            sortable: false,
            renderCell: index => {
                const rowIndex = index.api.getRowIndex(index.row.id)
                return page * pageSize + (rowIndex % pageSize) + 1
            },
            flex: 1,
            hideable: false
        },
        {
            field: 'full_name',
            headerName: 'Name',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => <p>{params.row?.full_name ? params.row?.full_name : 'NA'}</p>
        },
        {
            field: 'email',
            headerName: 'Email Id',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => <EmailModule email={params.row?.email} />
        },
        {
            field: 'cities',
            headerName: 'Location',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => <p>{params.row?.cities?.name ? params.row?.cities?.name : 'NA'}</p>
        }
        ,
        {
            field: 'mobile_no',
            headerName: 'Mobile Number',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) =>

                <MobileNumberModule countryCode={params.row?.country_code} mobileNo={params.row?.mobile_no} />
        },
        // {
        //     field: 'description',
        //     headerName: 'Message',
        //     flex: 1,
        //     minWidth: 250,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => <p>{params.row?.description ? params.row?.description : 'NA'}</p>
        // },
        {
            field: 'description',
            headerName: 'Message',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => (
              <Typography 
                variant="body2" 
                sx={{ 
                    whiteSpace: 'normal', // Allows text to wrap 
                    wordWrap: 'break-word', // Break long words if needed
                  }}
                title={params.row?.description} // Show full text on hover
              >
                {params.row?.description ? params.row.description : 'NA'}
              </Typography>
            )
          }
,          
        // {
        //     field: 'is_solved',
        //     headerName: 'Status',
        //     flex: 1,
        //     minWidth: 250,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => {
        //         const isResolved = Number(params.row?.is_solved) === 1; // Convert to number
        //         return (
        //             <p className={isResolved ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
        //                 {isResolved ? 'Resolved' : 'Unresolved'}
        //             </p>
        //         );
        //     },
        // },


        // {
        //     field: 'created_at',
        //     headerName: 'Created Date',
        //     flex: 1,
        //     minWidth: 250,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) =>

        //         // <DateFormateComponent date={params.row.created_at ?? ''} />
        //         const dateValue = params.row?.created_at
        //                             ? dayjs(params.row.created_at).utc().local().format('DD/MM/YYYY, hh:mm A')
        //                             : 'NA';

        //                         return <p>{dateValue}</p>;

        // }
        {
            field: 'created_at',
            headerName: 'Date',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridCellParams) => {
                const dateValue = params.row?.created_at
                    ? dayjs(params.row.created_at).utc().local().format('DD/MM/YYYY, hh:mm A')
                    : 'NA';

                return <p>{dateValue}</p>;
            }
        }
        ,
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 200,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('view-property-listing') && (

                        <Tooltip title='View Property Listing.' placement='bottom'>
                            <Button
                                style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleViewClick(params.row)}
                            >
                                <Icon icon={'hugeicons:view'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}
                
                    {checkPermission('delete-property-listing') && (

                        <Tooltip title='Delete Property Listing.' placement='bottom'>

                            <Button
                                style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleDeleteClick(params)}
                            >
                                <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />

                            </Button>
                        </Tooltip>
                    )}
                </>
            ),
        },



    ]

    return (
        <>
            <Card sx={{ p: 5 }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={4}>

                            <GoBack label={'Property Listing'} isBack={false} />
                        </Grid>
                        <Grid item xs={12} md={4} sm={4} sx={{mt:{md:0, xs:2}}}>
                            <SearchInput handleSearch={fetchGame} placeHolder={'Search Property Listing'} />
                        </Grid>
                    </Grid>

                </Box>
                <CommonDatagrid
                    totalRows={totalRows}
                    pageSize={pageSize}
                    currentPage={page}
                    handleChangePage={handlePageChange}
                    handleChangeRowsPerPage={handlePageSizeChange}
                    columns={columns}
                    rows={rows}
                    checkboxSelection={false}
                    loading={loading}
                />
            </Card>

            {openView && (
                <PropertListingViewPopup
                    setSelectedItem={selectedItem}
                    show={openView}
                    handleclose={() => setOpenView(false)}
                />
            )}
            {openDelete && (
                <PropertyListingDeletePopup
                    selctedMsgDelete={selectedMsgDelete}
                    show={openDelete}
                    handleclose={() => {
                        setOpenDelete(false);
                        fetchGame();
                    }}
                />
            )}
            {/* {openReply && (
                <CustomerReplyPopup
                    selectedItem={selectedItem}

                    show={openReply}
                    handleClose={() => {
                        setOpenReply(false);
                        fetchGame();
                    }}
                />
            )} */}
        </>
    )
}

export default PropertyListingForm;

// // Reply to user

// {checkPermission('resolve-property-listing') && Number(params.row?.is_solved) != 1 && (

//     <Tooltip title='Reply Property Listing.' placement='bottom'>
//         <Button
//             style={{ color: '#84919d', margin: '-10px' }}
//             onClick={() => handleReplyClick(params)}
//         >  <Sms sx={{ color: '#1976D2' }} fontSize="medium" />
//             {/* <Icon icon='bx-edit' /> */}
//             {/* <EditIcon fontSize="medium" /> */}

//         </Button>
//     </Tooltip>
// )}
// aa