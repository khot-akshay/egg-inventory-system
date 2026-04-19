import { yupResolver } from '@hookform/resolvers/yup'
import {
  CardContent,
  Grid,
  Box,
  Typography,
  TableCell,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Button,
  Modal,
  TextField,
  TablePagination,
  Divider,
  Link,
  useTheme
} from '@mui/material'
import Card from '@mui/material/Card'
import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import * as yup from 'yup'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import FacebookIcon from '@mui/icons-material/Facebook'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import LanguageIcon from '@mui/icons-material/Language'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import InstagramIcon from '@mui/icons-material/Instagram'
import moment from 'moment'
import CallIcon from '@mui/icons-material/Call'
import { DataGrid } from '@mui/x-data-grid'
import { get } from 'src/services/apiCall'
import EmailModule from 'src/components/common/Links/EmailLink'
import MobileNumberModule from 'src/components/common/Links/MobileNumberModule'
import ActionButtonBox from 'src/components/actionButtonBox'
import AllDocuments from 'src/components/AllDocuments/allDocument'
import ImageModal from 'src/components/ImageModal'
import Plants from 'src/components/plant/Plants'
import UserPlants from 'src/components/userplant/UserPlants'
import { decodeParams } from 'src/utils/encodeid'
import ProductPlants from 'src/components/productplant/ProductPlants'
import UserProductPlants from 'src/components/userProductPlant/UserProductPlants'

const style1 = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  height: 500,
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  '@media (max-width: 600px)': {
    width: '95%',
    height: '500px'
  },
  '@media (max-width: 700px)': {
    width: '95%',
    height: '500px'
  }
}
const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  height: 200,
  boxShadow: 24,
  p: 4
}
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role='tabpanel' hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

export default function ViewUserDetails() {
  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedData, setSelectedData] = useState<Record<string, any>>({})
  const [newData, setNewData] = useState<Record<string, any>>({})
  const [open, setOpen] = React.useState(false)
  const handleClose = () => setOpen(false)
  const handleOpen = (data: any) => {
    setSelectedData(data)
    setOpen(true)
  }
  const { back } = useRouter()
  const BASE_URL = `${process.env.NEXT_PUBLIC_BASEURL}`

  const methods = useForm()

  const router = useRouter()
  const { id, viewid } = router.query
  const [resolvedUserId, setResolvedUserId] = useState<number | undefined>(undefined)
  const [resolvedPlantId, setResolvedPlantId] = useState<number | undefined>(undefined)
  const colorMap = {
    approved: {
      text: '#2e7d32',
      background: 'rgba(46, 125, 50, 0.1)'
    },
    rejected: {
      text: '#d32f2f',
      background: 'rgba(211, 47, 47, 0.1)'
    },
    pending: {
      text: '#ed6c02',
      background: 'rgba(237, 108, 2, 0.1)'
    }
  }

  const statusKey: keyof typeof colorMap =
    typeof newData?.status === 'string' && newData.status in colorMap ? (newData.status as keyof typeof colorMap) : 'pending'
  const { text, background } = colorMap[statusKey] || colorMap.pending

  const [open1, setOpen1] = useState(false)
  const handleClose1 = () => setOpen1(false)
  const dispatch = useDispatch<AppDispatch>()
  const handleButtonClick = (data: any) => {
    setOpen1(true)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const defaultValues = {
    id: '',
    accepted: '',
    reason: ''
  }
  const schema = yup.object().shape({
    accepted: yup.boolean(),
    reason: yup.string()
  })
  const handleClickOpen = (file: string) => {
    window.open(`${file}`, '_blank')
  }
  const handleClick = (link: string) => {
    window.open(`${link}`, `_blank`)
  }

  const resolveId = (raw: string | string[] | number | undefined): number | undefined => {
    if (!raw) {
      return undefined
    }

    const value = Array.isArray(raw) ? raw[0] : raw
    if (typeof value === 'number') {
      return value
    }
    try {
      const decoded = decodeParams(value)
      if (typeof decoded === 'number' && !Number.isNaN(decoded)) {
        return decoded
      }
      if (decoded && typeof decoded === 'object' && 'id' in decoded) {
        const numericId = Number(decoded.id)
        if (!Number.isNaN(numericId)) {
          return numericId
        }
      }
      const fallback = Number(decoded ?? value)
      if (!Number.isNaN(fallback)) {
        return fallback
      }
    } catch (error) {
      const fallback = Number(value)
      if (!Number.isNaN(fallback)) {
        return fallback
      }
    }

    return undefined
  }

  useEffect(() => {
    const userIdValue = resolveId(id)
    const plantIdValue = resolveId(viewid)
    setResolvedUserId(userIdValue)
    setResolvedPlantId(plantIdValue)
  }, [id, viewid])

  console.log({ resolvedUserId, resolvedPlantId, id, viewid }, 'organizationID')
  const getAllData = async () => {
    if (!resolvedPlantId) {
      return
    }
    try {
      setIsLoading(true)
      const url = `/api/v1/admin/plant/getPlantsById/${resolvedPlantId}`
      const response = await get(url, '')
      if (response?.success) {
        const plantPayload = response?.data?.value ?? response?.data ?? {}
        setNewData(plantPayload)
        if (plantPayload?.appuser_id) {
          setResolvedUserId(prev => prev ?? Number(plantPayload.appuser_id))
        }
      }
    } catch (error) {
      console.error('Error fetching plant:', error)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    if (resolvedUserId) {
      getAllData()
    }
  }, [resolvedUserId])

  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema), defaultValues })

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' })
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = name || 'document.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <>
 <Grid
        container
        spacing={2}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row'
        }}
      >
        <Grid item xs={12} md={12}>
           <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={back}
              sx={{
                marginBottom: "15px",
                boxShadow: "none!important",
                color: "#3598DB",
              }}
              aria-label="back"
            >
              <ArrowBackIcon sx={{ color: "#3598DB" }} />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 20,
                ml: 2,
                color: "#3598DB",
                mb: "15px",
              }}
            >
             User Plant Details
            </Typography>
          </Box>
          <Card sx={{ height: 'auto', p: 4, ml: 1 }} className='bg-gray-50'>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>Plant Details</Typography>
            <Grid container spacing={2}>
              {/* <Grid
                item
                xs={12}
                md={3}
                sx={{
                  mb: 2
                }}
              >
                <Typography variant='body1' sx={{ mb: 2 }}>
                  Profile Photo
                </Typography>

                <ImageModal imageUrl={`${newData?.profile_picture}` || '/images/demopic.jpg'} altText='Light Logo' />
              </Grid> */}

              <Grid item xs={12} md={12} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant='body1'>Plant Name</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.plant_name || 'NA'}
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant='body1'>Organization Name</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.organization_name || 'NA'}
                    </Typography>
                  </Grid> */}
                  <Grid item xs={12} md={4}>
                    <Typography variant='body1'>Daily Capacity</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.daily_capacity ?? 'NA'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant='body1'>Categories</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {Array.isArray(newData?.categories) && newData.categories.length
                        ? newData.categories.map((cat: any) => cat?.name).join(', ')
                        : 'NA'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='body1'>Address</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.address || 'NA'}  {newData?.city || 'NA'} {newData?.state || 'NA'}, {newData?.pincode || 'NA'}
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={12} md={4}>
                    <Typography variant='body1'>City</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.city || 'NA'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='body1'>State</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.state || 'NA'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='body1'>Pincode</Typography>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      {newData?.pincode || 'NA'}
                    </Typography>
                  </Grid> */}
                 
                  
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>

    
    



      <Grid container spacing={2} padding={2}>
        <Grid item xs={12} md={12}>
          {/* {resolvedUserId && <UserPlants userId={resolvedUserId} />} */}
          <UserProductPlants customerId={resolvedPlantId} userId={resolvedUserId} />
        </Grid>
      </Grid>
  </Grid > 

     
    </>
  )
}
