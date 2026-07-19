import { Box, Card, Grid } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import axiosInstance from 'src/services/axios'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule'
import AddProducts from './AddQuickBill'
import { useAuth } from 'src/hooks/useAuth'

interface CategoryRow {
  id: number
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  is_active?: boolean
  created_at?: string | null
  [key: string]: any
}

const QuickBill = () => {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState('')

  const { user } = useAuth()
  const currentShopId = user?.shop_id || user?.shop?.id

  const fetchGame = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize),
        shop_id: String(currentShopId)
      })
      if (searchQuery) params.append('global_search', searchQuery)

      const response = await axiosInstance.get(`/api/v1/shop/getAllQuickbills?${params.toString()}`)
      setRows(response.data.data?.quickbills ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
    } finally {
      setLoading(false)
    }

  }


  useEffect(() => {
    setPage(0)
  }, [searchQuery])

  useEffect(() => {
    fetchGame()
  }, [page, pageSize, searchQuery])

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newPageSize: number) => setPageSize(newPageSize)

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      hideable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      }
    },
    {
      field: 'customer_name',
      headerName: 'Customer Name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.customer?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'shop',
      headerName: 'Product & Quantity',
      flex: 1.5,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || []
        if (!items.length)
          return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>NA</div>
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                {item.category?.name || 'Unknown'} : {Number(item.quantity)}
              </div>
            ))}
          </Box>
        )
      }
    },
    {
      field: 'quantity',
      headerName: 'Product Rate',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || []
        if (!items.length)
          return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>0</div>
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                ₹{Number(item.unit_cost || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        )
      }
    },
    {
      field: 'unit_cost',
      headerName: 'Product Price',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || []
        if (!items.length)
          return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>0</div>
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                ₹{Number(item.line_total || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        )
      }
    },
    {
      field: 'total_due',
      headerName: 'Total Due',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          ₹{params.row?.balance_due || '0'}
        </div>
      )
    },
    {
      field: 'status',
      headerName: 'Payment',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const payments = params.row?.meta?.payments || []
        if (!payments.length) {
          return (
            <div style={{ textTransform: 'capitalize' }}>
              {params.row?.status || 'NA'}
            </div>
          )
        }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%', justifyContent: 'center' }}>
            {payments.map((p: any, i: number) => (
              <div key={i} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, textTransform: 'capitalize' }}>
                {p.payment_type} : ₹{p.amount}
              </div>
            ))}
          </Box>
        )
      }
    },
    {
      field: 'total',
      headerName: 'Total Bill',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          ₹{params.row?.total || '0'}
        </div>
      )
    },
    {
      field: 'created_at',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <DateFormateComponent date={params.row?.created_at ?? ''} />
      )
    }
  ]

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <GoBack label="Quick Bill List" isBack={true} />
          </Grid>
        </Grid>

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


    </>
  )
}

export default QuickBill
