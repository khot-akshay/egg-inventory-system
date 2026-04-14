import { useState, useEffect } from 'react'
// ** MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress';

// ** Third Party Imports

// ** Icon Import
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

import { Grid, Box, FormControl, TextField } from '@mui/material'
import format from 'date-fns/format'
import addDays from 'date-fns/addDays'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs, { Dayjs } from "dayjs";
// ** Types
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import axiosInstance from 'src/services/axios'
import millify from 'millify';


const SalesCount = ({ dahboardData }) => {
  const [startFrom, setStartFrom] = useState(null)
  const [endOn, setEndOn] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saleCount, setSaleCount] = useState([])


  return (
    <Box>
      <Grid container spacing={5}>


        <>

          <Grid item xs={12} md={2.4}>

            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'foundation:burst-sale'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Total sales</Typography>
                <Typography variant='h5'>{millify(dahboardData?.totalOrders ? dahboardData?.totalOrders : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'healthicons:money-bag'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Total Earning</Typography>
                <Typography variant='h5'>{millify(dahboardData?.totalEarnings ? dahboardData?.totalEarnings : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'mdi:new-box'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>New Orders</Typography>
                <Typography variant='h5'>{millify(dahboardData?.newOrders ? dahboardData?.newOrders : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'icon-park-solid:data-arrival'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Confirmed Orders</Typography>
                <Typography variant='h5'>{millify(dahboardData?.confirmedOrders ? dahboardData?.confirmedOrders : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'solar:delivery-bold'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Delivered Orders</Typography>
                <Typography variant='h5'>{millify(dahboardData?.deliveredOrders ? dahboardData?.deliveredOrders : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'ic:baseline-cancel'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel Orders</Typography>
                <Typography variant='h5'>{millify(dahboardData?.cancelledOrders ? dahboardData?.cancelledOrders : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent sx={{ p: theme => `${theme.spacing(3.5, 5, 4)} !important` }}>
                <Box sx={{ display: 'flex', mb: 4, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    // color={avatarColor}
                    // src={avatarSrc ?? ''}
                    sx={{ width: 42, height: 42 }}
                  >
                    <Icon fontSize={20} icon={'grommet-icons:deliver'} />
                  </CustomAvatar>

                </Box>
                <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Shipped Orders</Typography>
                <Typography variant='h5'>{millify(dahboardData?.shippedOrders ? dahboardData?.shippedOrders : 0)}</Typography>

              </CardContent>
            </Card>
          </Grid>
        </>



      </Grid>
    </Box>
  )
}

export default SalesCount
