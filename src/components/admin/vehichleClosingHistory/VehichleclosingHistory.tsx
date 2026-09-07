import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  Typography
} from '@mui/material'

import {
  GridCellParams,
  GridColDef
} from '@mui/x-data-grid'

import React, {
  useEffect,
  useState
} from 'react'

import { useForm } from 'react-hook-form'
import { useTheme } from '@mui/material/styles'

import CommonSkeleton from 'src/@core/components/common-skeleton/CommonSkeleton'
import CommonCard from 'src/@core/components/common-card/CommonCard'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton'
import axiosInstance from 'src/services/axios'

import Icon from 'src/@core/components/icon'

import { useRouter } from 'next/router'

import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'

import toast from 'react-hot-toast'


interface CategoryRow {
  id: number

  egg_vendor_purchase_id?: number
  purchase_no?: string

  user_id?: number | null
  driver_id?: number | null
  created_by?: number | null

  vendor_name?: string
  vehicle?: string
  status?: string

  expected_cash?: number
  total_cash?: number

  sourabh?: string

  total_eggs?: number
  remaining_eggs?: number

  loaded?: any[]
  shops?: any[]

  customer_sell?: {
    total_amount?: number
    categories?: any[]
  }

  expense_date?: string
  expense_amount?: number

  expenses?: any[]

  profit_loss?: {
    egg_vendor_purchase_id?: number
    expense_date?: string

    sales_revenue?: number
    sales_eggs?: number
    paid_collected?: number
    balance_due?: number

    purchase_cost?: number
    vendor_purchase_total?: number
    expense_amount?: number

    gross_profit?: number
    net_profit?: number

    status?: string

    categories?: any[]

    expense_allocated?: boolean
  }

  egg_sale_summary?: any[]

  payment_summary?: {
    cash?: number
    online?: number
    upi?: number
    card?: number
    credit?: number
    mixed?: number
    other?: number
    total?: number
    expense_amount?: number
    total_cash?: number
    cash_in_hand?: number
  }

  [key: string]: any
}


const VehichleclosingHistory = () => {
  const [rows, setRows] = useState<CategoryRow[]>([])

  const [totalRows, setTotalRows] = useState(0)

  const [loading, setLoading] = useState(true)

  const [pageSize, setPageSize] = useState(10)

  const [page, setPage] = useState(0)

  const [searchQuery, setQuery] = useState('')

  const [viewMode, setViewMode] =
    useState<'list' | 'grid'>('list')

  const theme = useTheme()

  const router = useRouter()

  const {
    control,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      category_id: null,
      shop_id: null
    }
  })

  const selectedCategoryId =
    watch('category_id') as number | null

  const selectedShopId =
    watch('shop_id') as number | null

  const [shops, setShops] = useState<any[]>([])


  /*
  |--------------------------------------------------------------------------
  | Fetch Shops
  |--------------------------------------------------------------------------
  */

  const fetchShops = async () => {
    try {
      const response = await axiosInstance.get(
        '/api/v1/admin/getAllShops'
      )

      const data = response.data?.data

      if (Array.isArray(data)) {
        setShops(data)
      } else if (
        data &&
        Array.isArray(data.shops)
      ) {
        setShops(data.shops)
      } else {
        setShops([])
      }

    } catch (error) {
      console.error(
        'Failed to fetch shops',
        error
      )

      setShops([])
    }
  }


  useEffect(() => {
    fetchShops()
  }, [])


  /*
  |--------------------------------------------------------------------------
  | Fetch Vehicle Closing History
  |--------------------------------------------------------------------------
  */

  const fetchGame = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) {
        params.append(
          'global_search',
          searchQuery
        )
      }

      if (selectedCategoryId) {
        params.append(
          'category_id',
          String(selectedCategoryId)
        )
      }

      if (selectedShopId) {
        params.append(
          'shop_id',
          String(selectedShopId)
        )
      }

      const response =
        await axiosInstance.get(
          `/api/v1/admin/getVehicleClose?${params.toString()}&type=all`
        )

      const dataArray =
        Array.isArray(response.data?.data)
          ? response.data.data
          : []


      /*
      |--------------------------------------------------------------------------
      | Map API Response
      |--------------------------------------------------------------------------
      */

      const mappedRows: CategoryRow[] =
        dataArray.map(
          (item: any, index: number) => ({
            id:
              item.egg_vendor_purchase_id ??
              index + 1,

            egg_vendor_purchase_id:
              item.egg_vendor_purchase_id,

            purchase_no:
              item.purchase_no,

            user_id:
              item.user_id,

            driver_id:
              item.driver_id,

            created_by:
              item.created_by,

            vendor_name:
              item.vendor_name,

            vehicle:
              item.vehicle,

            status:
              item.status,

            expected_cash:
              Number(
                item.expected_cash ?? 0
              ),

            total_cash:
              Number(
                item.total_cash ?? 0
              ),

            sourabh:
              item.sourabh,

            total_eggs:
              Number(
                item.total_eggs ?? 0
              ),

            remaining_eggs:
              Number(
                item.remaining_eggs ?? 0
              ),

            loaded:
              Array.isArray(item.loaded)
                ? item.loaded
                : [],

            shops:
              Array.isArray(item.shops)
                ? item.shops
                : [],

            customer_sell:
              item.customer_sell ?? {
                total_amount: 0,
                categories: []
              },

            expense_date:
              item.expense_date,

            expense_amount:
              Number(
                item.expense_amount ?? 0
              ),

            expenses:
              Array.isArray(item.expenses)
                ? item.expenses
                : [],

            profit_loss:
              item.profit_loss ?? {},

            egg_sale_summary:
              Array.isArray(
                item.egg_sale_summary
              )
                ? item.egg_sale_summary
                : [],

            payment_summary:
              item.payment_summary ?? {
                cash: 0,
                online: 0,
                upi: 0,
                card: 0,
                credit: 0,
                mixed: 0,
                other: 0,
                total: 0,
                expense_amount: 0,
                total_cash: 0,
                cash_in_hand: 0
              }
          })
        )


      setRows(mappedRows)


      /*
      |--------------------------------------------------------------------------
      | Total Records
      |--------------------------------------------------------------------------
      */

      setTotalRows(
        Number(
          response.data?.count ??
          response.data?.total ??
          mappedRows.length
        )
      )

    } catch (error) {

      console.error(
        'Vehicle closing history error:',
        error
      )

      toast.error(
        'Failed to load vehicle closing history'
      )

    } finally {

      setLoading(false)

    }
  }


  /*
  |--------------------------------------------------------------------------
  | Reset Page When Filters Change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setPage(0)
  }, [
    selectedCategoryId,
    selectedShopId,
    searchQuery
  ])


  /*
  |--------------------------------------------------------------------------
  | Fetch Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchGame()
  }, [
    page,
    pageSize,
    selectedCategoryId,
    selectedShopId,
    searchQuery
  ])


  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const handlePageChange = (
    newPage: number
  ) => {
    setPage(newPage)
  }


  const handlePageSizeChange = (
    newPageSize: number
  ) => {
    setPageSize(newPageSize)
    setPage(0)
  }


  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearch = (
    query: string
  ) => {
    setPage(0)
    setQuery(query)
  }


  /*
  |--------------------------------------------------------------------------
  | View Details
  |--------------------------------------------------------------------------
  */

  const handleViewUser = (
    id: number
  ) => {
    router.push(
      `vehicle-closing/view/${id}`
    )
  }


  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const tableColumns: GridColDef[] = [

    /*
    |--------------------------------------------------------------------------
    | Sr No
    |--------------------------------------------------------------------------
    */

    {
      field: 'id',

      headerName: 'Sr. No.',

      flex: 0.5,

      minWidth: 80,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const rowIndex =
          params.api.getRowIndex(
            params.row.id
          )

        return (
          page * pageSize +
          rowIndex +
          1
        )
      },

      hideable: false
    },


    /*
    |--------------------------------------------------------------------------
    | Purchase No
    |--------------------------------------------------------------------------
    */

    {
      field: 'purchase_no',

      headerName: 'Purchase No',

      flex: 1,

      minWidth: 180,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600
          }}
        >
          {params.row?.purchase_no ||
            'NA'}
        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Vendor
    |--------------------------------------------------------------------------
    */

    {
      field: 'vendor_name',

      headerName: 'Vendor',

      flex: 1.5,

      minWidth: 250,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
        >
          {params.row?.vendor_name ||
            'NA'}
        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Vehicle
    |--------------------------------------------------------------------------
    */

    {
      field: 'vehicle',

      headerName: 'Vehicle',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Chip
          label={
            params.row?.vehicle ||
            'NA'
          }
          size="small"
        />

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Created By
    |--------------------------------------------------------------------------
    */

    {
      field: 'sourabh',

      headerName: 'Created By',

      flex: 1,

      minWidth: 150,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography variant="body2">
          {params.row?.sourabh ||
            'NA'}
        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    {
      field: 'status',

      headerName: 'Status',

      flex: 0.8,

      minWidth: 120,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const status =
          params.row?.status

        return (

          <Chip
            label={
              status || 'NA'
            }

            size="small"

            color={
              status === 'complete'
                ? 'success'
                : 'default'
            }

            sx={{
              textTransform:
                'capitalize'
            }}
          />

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Total Loaded Eggs
    |--------------------------------------------------------------------------
    */

    {
      field: 'total_eggs',

      headerName: 'Total Loaded',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600
          }}
        >
          {Number(
            params.row?.total_eggs ?? 0
          ).toLocaleString()}
        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Remaining Eggs
    |--------------------------------------------------------------------------
    */

    {
      field: 'remaining_eggs',

      headerName: 'Remaining Stock',

      flex: 1,

      minWidth: 160,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600
          }}
        >
          {Number(
            params.row?.remaining_eggs ?? 0
          ).toLocaleString()}
        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Loaded Stock
    |--------------------------------------------------------------------------
    */

    {
      field: 'loaded',

      headerName: 'Loaded Stock',

      flex: 2,

      minWidth: 300,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const loaded =
          params.row?.loaded || []

        if (!loaded.length) {

          return (
            <Typography
              variant="body2"
            >
              NA
            </Typography>
          )
        }

        return (

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              py: 1
            }}
          >

            {loaded.map(
              (item: any) => (

                <Typography
                  key={item.id}
                  variant="body2"
                  sx={{
                    fontSize:
                      '0.8rem',
                    whiteSpace:
                      'normal'
                  }}
                >

                  <strong>
                    {item.category}
                  </strong>

                  {': '}

                  {Number(
                    item.count ?? 0
                  ).toLocaleString()}

                  {' '}

                  <span
                    style={{
                      opacity: 0.7
                    }}
                  >
                    (
                    Remaining:{' '}
                    {Number(
                      item.remaining ??
                      0
                    ).toLocaleString()}
                    )
                  </span>

                </Typography>

              )
            )}

          </Box>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Shop Distribution
    |--------------------------------------------------------------------------
    */

    {
      field: 'shops',

      headerName:
        'Shop Distribution',

      flex: 2,

      minWidth: 320,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const shops =
          params.row?.shops || []

        if (!shops.length) {

          return (
            <Typography
              variant="body2"
            >
              NA
            </Typography>
          )
        }

        return (

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              py: 1
            }}
          >

            {shops.map(
              (
                shop: any,
                index: number
              ) => (

                <Box
                  key={index}
                >

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.3
                    }}
                  >
                    {shop.shop_name}
                  </Typography>


                  {Array.isArray(
                    shop.categories
                  ) &&
                    shop.categories.map(
                      (
                        category: any
                      ) => (

                        <Typography
                          key={
                            category.id
                          }
                          variant="caption"
                          display="block"
                        >

                          {category.category}

                          {': '}

                          {Number(
                            category.count ??
                            0
                          ).toLocaleString()}

                        </Typography>

                      )
                    )}

                </Box>

              )
            )}

          </Box>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Customer Sale
    |--------------------------------------------------------------------------
    */

    {
      field: 'customer_sell',

      headerName:
        'Customer Sale',

      flex: 1.5,

      minWidth: 240,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const sale =
          params.row?.customer_sell ||
          {}

        const categories =
          sale.categories || []

        return (

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.4,
              py: 1
            }}
          >

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600
              }}
            >

              Total: ₹
              {Number(
                sale.total_amount ??
                0
              ).toFixed(2)}

            </Typography>


            {categories.map(
              (item: any) => (

                <Typography
                  key={item.id}
                  variant="caption"
                >

                  {item.category}

                  {': '}

                  {Number(
                    item.count ?? 0
                  ).toLocaleString()}

                  {' eggs - ₹'}

                  {Number(
                    item.amount ?? 0
                  ).toFixed(2)}

                </Typography>

              )
            )}

          </Box>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Expenses
    |--------------------------------------------------------------------------
    */

    {
      field: 'expenses',

      headerName: 'Expenses',

      flex: 1.5,

      minWidth: 230,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const expenses =
          params.row?.expenses || []

        if (!expenses.length) {

          return (
            <Typography
              variant="body2"
            >
              ₹0.00
            </Typography>
          )
        }

        return (

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.3,
              py: 1
            }}
          >

            {expenses.map(
              (expense: any) => (

                <Typography
                  key={expense.id}
                  variant="body2"
                  sx={{
                    fontSize:
                      '0.8rem'
                  }}
                >

                  {expense.category}

                  {': ₹'}

                  {Number(
                    expense.amount ??
                    0
                  ).toFixed(2)}

                </Typography>

              )
            )}


            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                mt: 0.5
              }}
            >

              Total: ₹
              {Number(
                params.row?.expense_amount ??
                0
              ).toFixed(2)}

            </Typography>

          </Box>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Sales Revenue
    |--------------------------------------------------------------------------
    */

    {
      field: 'sales_revenue',

      headerName:
        'Sales Revenue',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600
          }}
        >

          ₹
          {Number(
            params.row?.profit_loss
              ?.sales_revenue ??
            0
          ).toFixed(2)}

        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Sales Eggs
    |--------------------------------------------------------------------------
    */

    {
      field: 'sales_eggs',

      headerName: 'Sales Eggs',

      flex: 1,

      minWidth: 120,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
        >
          {Number(
            params.row?.profit_loss
              ?.sales_eggs ??
            0
          ).toLocaleString()}
        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Purchase Cost
    |--------------------------------------------------------------------------
    */

    {
      field: 'purchase_cost',

      headerName:
        'Purchase Cost',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
        >

          ₹
          {Number(
            params.row?.profit_loss
              ?.purchase_cost ??
            0
          ).toFixed(2)}

        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Gross Profit
    |--------------------------------------------------------------------------
    */

    {
      field: 'gross_profit',

      headerName:
        'Gross Profit',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const value =
          Number(
            params.row?.profit_loss
              ?.gross_profit ??
            0
          )

        return (

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,

              color:
                value > 0
                  ? 'success.main'
                  : value < 0
                    ? 'error.main'
                    : 'text.primary'
            }}
          >

            ₹
            {value.toFixed(2)}

          </Typography>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Expense Amount
    |--------------------------------------------------------------------------
    */

    {
      field: 'profit_expense_amount',

      headerName:
        'Expense',

      flex: 1,

      minWidth: 120,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
        >

          ₹
          {Number(
            params.row?.profit_loss
              ?.expense_amount ??
            0
          ).toFixed(2)}

        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Net Profit / Loss
    |--------------------------------------------------------------------------
    */

    {
      field: 'net_profit',

      headerName:
        'Net Profit / Loss',

      flex: 1.4,

      minWidth: 180,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const value =
          Number(
            params.row?.profit_loss
              ?.net_profit ??
            0
          )

        const status =
          params.row?.profit_loss
            ?.status

        return (

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              height: '100%'
            }}
          >

            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,

                color:
                  value > 0
                    ? 'success.main'
                    : value < 0
                      ? 'error.main'
                      : 'text.primary'
              }}
            >

              ₹
              {value.toFixed(2)}

            </Typography>


            <Chip
              size="small"

              label={
                status || 'NA'
              }

              color={
                status === 'profit'
                  ? 'success'
                  : status === 'loss'
                    ? 'error'
                    : 'default'
              }

              sx={{
                textTransform:
                  'capitalize'
              }}
            />

          </Box>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Payment Summary
    |--------------------------------------------------------------------------
    */

    {
      field: 'payment_summary',

      headerName:
        'Payments',

      flex: 1.8,

      minWidth: 260,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const payment =
          params.row?.payment_summary ||
          {}

        return (

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              py: 1
            }}
          >

            <Typography variant="caption">
              Cash: ₹
              {Number(
                payment.cash ?? 0
              ).toFixed(2)}
            </Typography>


            <Typography variant="caption">
              UPI: ₹
              {Number(
                payment.upi ?? 0
              ).toFixed(2)}
            </Typography>


            <Typography variant="caption">
              Online: ₹
              {Number(
                payment.online ?? 0
              ).toFixed(2)}
            </Typography>


            <Typography variant="caption">
              Card: ₹
              {Number(
                payment.card ?? 0
              ).toFixed(2)}
            </Typography>


            <Typography variant="caption">
              Credit: ₹
              {Number(
                payment.credit ?? 0
              ).toFixed(2)}
            </Typography>


            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                mt: 0.5
              }}
            >

              Total: ₹
              {Number(
                payment.total ?? 0
              ).toFixed(2)}

            </Typography>

          </Box>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Cash In Hand
    |--------------------------------------------------------------------------
    */

    {
      field: 'cash_in_hand',

      headerName:
        'Cash In Hand',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700
          }}
        >

          ₹
          {Number(
            params.row?.payment_summary
              ?.cash_in_hand ??
            0
          ).toFixed(2)}

        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Paid Collected
    |--------------------------------------------------------------------------
    */

    {
      field: 'paid_collected',

      headerName:
        'Paid Collected',

      flex: 1,

      minWidth: 140,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography variant="body2">

          ₹
          {Number(
            params.row?.profit_loss
              ?.paid_collected ??
            0
          ).toFixed(2)}

        </Typography>

      )
    },


    /*
    |--------------------------------------------------------------------------
    | Balance Due
    |--------------------------------------------------------------------------
    */

    {
      field: 'balance_due',

      headerName:
        'Balance Due',

      flex: 1,

      minWidth: 130,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => {

        const value =
          Number(
            params.row?.profit_loss
              ?.balance_due ??
            0
          )

        return (

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,

              color:
                value > 0
                  ? 'error.main'
                  : 'success.main'
            }}
          >

            ₹
            {value.toFixed(2)}

          </Typography>

        )
      }
    },


    /*
    |--------------------------------------------------------------------------
    | Date
    |--------------------------------------------------------------------------
    */

    {
      field: 'expense_date',

      headerName: 'Date',

      flex: 1,

      minWidth: 130,

      sortable: false,

      renderCell: (
        params: GridCellParams
      ) => (

        <Typography variant="body2">

          {params.row?.expense_date ||
            'NA'}

        </Typography>

      )
    }

  ]


  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return (

    <>

      <Card sx={{ p: 3 }}>

        {/* Header */}

        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ mb: 3 }}
        >

          <Grid
            item
            xs={12}
            md={6}
          >

            <GoBack
              label="Vehicle Closing History"
              isBack={false}
            />

          </Grid>

        </Grid>


        {/* Data Table */}

        {viewMode === 'list' ? (

          <CommonDatagrid

            totalRows={
              totalRows
            }

            pageSize={
              pageSize
            }

            currentPage={
              page
            }

            handleChangePage={
              handlePageChange
            }

            handleChangeRowsPerPage={
              handlePageSizeChange
            }

            columns={
              tableColumns
            }

            rows={
              rows
            }

            checkboxSelection={
              false
            }

            loading={
              loading
            }

          />

        ) : (

          /*
          |--------------------------------------------------------------------------
          | Grid View
          |--------------------------------------------------------------------------
          */

          <Grid
            container
            spacing={3}
          >

            {loading ? (

              Array.from({
                length: 8
              }).map(
                (_, index) => (

                  <Grid
                    item
                    key={index}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                  >

                    <CommonCard>

                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                      >

                        <CommonSkeleton
                          variant="rectangular"
                          width={40}
                          height={40}
                          sx={{
                            borderRadius: 1
                          }}
                        />

                        <CommonSkeleton
                          variant="text"
                          width="60%"
                        />

                      </Box>


                      <CommonSkeleton
                        variant="text"
                        width="80%"
                      />


                      <Box sx={{ mt: 2 }}>

                        <CommonSkeleton
                          variant="text"
                          width="40%"
                        />

                        <CommonSkeleton
                          variant="text"
                          width="90%"
                        />

                      </Box>

                    </CommonCard>

                  </Grid>

                )
              )

            ) : rows.length > 0 ? (

              rows.map(
                (item) => (

                  <Grid
                    item
                    key={item.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                  >

                    <CardActionArea
                      onClick={() =>
                        handleViewUser(
                          item.id
                        )
                      }
                      sx={{
                        height: '100%'
                      }}
                    >

                      <CommonCard>

                        {/* Header */}

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              flex: 1,
                              minWidth: 0
                            }}
                          >

                            <Icon
                              icon="solar:bill-list-linear"
                              fontSize={24}
                              color={
                                theme.palette
                                  .primary
                                  .main
                              }
                            />


                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontSize:
                                  '16px',
                                fontWeight:
                                  600,
                                whiteSpace:
                                  'nowrap',
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis'
                              }}
                            >

                              {
                                item.purchase_no ||
                                'NA'
                              }

                            </Typography>

                          </Box>

                        </Box>


                        {/* Vehicle */}

                        <Box sx={{ mt: 2 }}>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >

                            Vendor:{' '}
                            {item.vendor_name ||
                              'NA'}

                          </Typography>


                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >

                            Vehicle:{' '}
                            {item.vehicle ||
                              'NA'}

                          </Typography>


                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >

                            Loaded:{' '}
                            {Number(
                              item.total_eggs ??
                              0
                            ).toLocaleString()}

                          </Typography>


                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >

                            Remaining:{' '}
                            {Number(
                              item.remaining_eggs ??
                              0
                            ).toLocaleString()}

                          </Typography>

                        </Box>


                        {/* Profit */}

                        <Box
                          sx={{
                            mt: 2
                          }}
                        >

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >

                            Sales: ₹
                            {Number(
                              item.profit_loss
                                ?.sales_revenue ??
                              0
                            ).toFixed(2)}

                          </Typography>


                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >

                            Expense: ₹
                            {Number(
                              item.profit_loss
                                ?.expense_amount ??
                              0
                            ).toFixed(2)}

                          </Typography>


                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              mt: 1,

                              color:
                                Number(
                                  item.profit_loss
                                    ?.net_profit ??
                                  0
                                ) >= 0
                                  ? 'success.main'
                                  : 'error.main'
                            }}
                          >

                            Net:{' '}

                            ₹
                            {Number(
                              item.profit_loss
                                ?.net_profit ??
                              0
                            ).toFixed(2)}

                          </Typography>

                        </Box>


                        {/* Footer */}

                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            alignItems:
                              'center'
                          }}
                        >

                          <Chip
                            size="small"
                            label={
                              item.status ||
                              'NA'
                            }
                            color={
                              item.status ===
                                'complete'
                                ? 'success'
                                : 'default'
                            }
                            sx={{
                              textTransform:
                                'capitalize'
                            }}
                          />


                          <Typography
                            variant="caption"
                            color="text.disabled"
                          >

                            {
                              item.expense_date ||
                              'NA'
                            }

                          </Typography>

                        </Box>

                      </CommonCard>

                    </CardActionArea>

                  </Grid>

                )
              )

            ) : (

              <Grid
                item
                xs={12}
              >

                <Box
                  sx={{
                    textAlign:
                      'center',
                    py: 5
                  }}
                >

                  <Typography
                    color="text.secondary"
                  >
                    No vehicle closing
                    history found
                  </Typography>

                </Box>

              </Grid>

            )}


            {/* Grid Pagination */}

            {totalRows >
              pageSize && (

                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'flex-end',
                    mt: 2
                  }}
                >

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 2
                    }}
                  >

                    <Typography
                      variant="body2"
                    >

                      Page{' '}
                      {page + 1}{' '}
                      of{' '}
                      {Math.ceil(
                        totalRows /
                        pageSize
                      )}

                    </Typography>


                    <IconButton
                      disabled={
                        page === 0
                      }
                      onClick={() =>
                        setPage(
                          page - 1
                        )
                      }
                    >

                      <Icon
                        icon="mdi:chevron-left"
                      />

                    </IconButton>


                    <IconButton
                      disabled={
                        (page + 1) *
                        pageSize >=
                        totalRows
                      }
                      onClick={() =>
                        setPage(
                          page + 1
                        )
                      }
                    >

                      <Icon
                        icon="mdi:chevron-right"
                      />

                    </IconButton>

                  </Box>

                </Grid>

              )}

          </Grid>

        )}

      </Card>

    </>

  )
}


export default VehichleclosingHistory