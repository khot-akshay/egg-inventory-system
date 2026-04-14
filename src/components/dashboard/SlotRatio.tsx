import { Card, CardContent, CardHeader } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import React from 'react'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useTheme } from '@mui/material/styles'

import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const radialBarColors = {
  series1: '#fdd835',
  series2: '#29CCEF',
  series3: '#00d4bd',
  series4: '#7367f0',
  series5: '#FFA1A1'
}
interface SlotRatioProps {
  total: number
  morningCount: number
  afternoonCount: number
  eveningCount: number
  nightCount: number
}
function SlotRatio({ total, morningCount, afternoonCount, eveningCount, nightCount }: SlotRatioProps) {
  const theme = useTheme()
  const morningPercentage = total > 0 ? (morningCount / total) * 100 : 0
  const afternoonPercentage = total > 0 ? (afternoonCount / total) * 100 : 0
  const eveningPercentage = total > 0 ? (eveningCount / total) * 100 : 0
  const nightPercentage = total > 0 ? (nightCount / total) * 100 : 0
  const options: ApexOptions = {
    stroke: { lineCap: 'round' },
    labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: theme.palette.text.secondary
      },
      markers: {
        offsetX: -3
      },
      itemMargin: {
        vertical: 3,
        horizontal: 10
      }
    },
    // colors: [radialBarColors.series1, radialBarColors.series2, radialBarColors.series3, radialBarColors.series4],
    plotOptions: {
      radialBar: {
        hollow: { size: '30%' },
        track: {
          margin: 15,
          background: hexToRGBA(theme.palette.customColors.trackBg, 1)
        },
        dataLabels: {
          name: {
            fontSize: '2rem'
          },
          value: {
            fontSize: '1rem',
            color: theme.palette.text.secondary
          },
          total: {
            show: true,
            fontWeight: 400,
            label: 'Booking',

            fontSize: '1.125rem',
            color: theme.palette.text.primary,
            formatter: function (w) {
              return `${total}`
            }
          }
        }
      }
    },
    grid: {
      padding: {
        top: -35,
        bottom: -30
      }
    }
  }
  return (
    <Card sx={{pb:8}}>
      <CardHeader title='Slot Bookings' />

      <CardContent>
        {total && (
          <ReactApexcharts type='radialBar' height={420} options={options}
            series={[
              Number(morningPercentage?.toFixed(2) || 0),
              Number(afternoonPercentage?.toFixed(2) || 0),
              Number(eveningPercentage?.toFixed(2) || 0),
              Number(nightPercentage?.toFixed(2) || 0)
            ]}
          />
        )}

      </CardContent>
    </Card>
  )
}

export default SlotRatio
