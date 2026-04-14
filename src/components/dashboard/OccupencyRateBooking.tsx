import { Card, CardContent, CardHeader, useTheme } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import React from 'react'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { convertCurrency } from 'src/utils/commonFunctions'
const donutColors = {
    series1: '#fdd835',
    series2: '#00d4bd',
    series3: '#826bf8',
    series4: '#29CCEF',
    series5: '#ffa1a1'
  }
  interface props {
    total: number
    expenseCount:number
    earningsCount:number
    dueCount:number
  }

function OccupencyRateBooking({total, expenseCount, earningsCount, dueCount}:props) {

    const theme = useTheme()
    
      const options: ApexOptions = {
        stroke: { width: 0 },
        labels: ['Expense', 'Earning', 'Due'],
        colors: [donutColors.series1, donutColors.series5, donutColors.series3, donutColors.series2],
        dataLabels: {
          enabled: true,
          formatter: (val: string) => `${parseInt(val, 10)}%`
        },
        legend: {
          position: 'bottom',
          markers: { offsetX: -3 },
          labels: { colors: theme.palette.text.secondary },
          itemMargin: {
            vertical: 3,
            horizontal: 10
          }
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  fontSize: '1.2rem'
                },
                value: {
                  fontSize: '1.2rem',
                  color: theme.palette.text.secondary,
                  formatter: (val: string) => `${convertCurrency(parseInt(val,10))}`
                },
                total: {
                  show: true,
                  fontSize: '1.2rem',
                  label: 'Booking',
                  formatter: () => `${convertCurrency(dueCount+expenseCount+earningsCount)}`,
                  color: theme.palette.text.primary
                }
              }
            }
          }
        },
        responsive: [
          {
            breakpoint: 992,
            options: {
              chart: {
                height: 380
              },
              legend: {
                position: 'bottom'
              }
            }
          },
          {
            breakpoint: 576,
            options: {
              chart: {
                height: 320
                
              },
              plotOptions: {
                pie: {
                  donut: {
                    labels: {
                      show: true,
                      name: {
                        fontSize: '1rem'
                      },
                      value: {
                        fontSize: '1rem'
                      },
                      total: {
                        fontSize: '1rem'
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
  return (
    <Card>
      <CardHeader title='Revenue Distribution' />
      
      <CardContent>
           <CardContent>
            {total && (
           <ReactApexcharts type='donut' height={400} options={options} series={[expenseCount, earningsCount, dueCount]} />
            )}
         </CardContent>
        
      </CardContent>
    </Card>
  )
}

export default OccupencyRateBooking
