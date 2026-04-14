// ** MUI Imports
import { Grid, FormControl, TextField, Button } from '@mui/material'
import { useState, useEffect } from 'react'
// ** Demo Component Imports
import CircularProgress from '@mui/material/CircularProgress';

import AnalyticsCongratulations from 'src/views/dashboards/analytics/AnalyticsCongratulations'

// import SalesCount from 'src/components/dashboard/salesCount'
import SalesCount from 'src/components/dashboard/SalesCount'
import ChartForSale from 'src/components/dashboard/Chart'
// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import ChartjsLineChart from 'src/views/charts/chartjs/ChartjsLineChart'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast';
import dayjs, { Dayjs } from "dayjs";
const AnalyticsDashboard = () => {
  const [startFrom, setStartFrom] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
  const [endOn, setEndOn] = useState(dayjs().format('YYYY-MM-DD'))
  const [dahboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    

  };

  useEffect(() => {
    fetchData()
  }, [])


  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={12} sx={{ order: -1 }}>
          <Grid item xs={12}>
            <Grid container spacing={5}>
             

            </Grid>


          </Grid>
        </Grid>
     

      </Grid>
    </ApexChartWrapper>
  )
}

export default AnalyticsDashboard
