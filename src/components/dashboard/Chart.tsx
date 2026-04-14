// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { Line } from 'react-chartjs-2'
import { ChartData, ChartOptions, CategoryScale } from 'chart.js'
import Chart from 'chart.js/auto';
Chart.register(CategoryScale);



interface LineProps {
  white: string
  warning: string
  primary: string
  success: string
  labelColor: string
  borderColor: string
  legendColor: string
  dahboardData: []
}

const ChartForSale = (props: LineProps) => {
  // ** Props
  const { white, primary, success, warning, labelColor, borderColor, legendColor, dahboardData } = props

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: labelColor },
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor
        }
      },
      y: {
        min: 0,
        max: dahboardData?.graphUpperLimit,
        ticks: {
          stepSize: dahboardData?.stepSize,
          color: labelColor
        },
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor
        }
      }
    },
    plugins: {
      legend: {
        align: 'end',
        position: 'top',
        labels: {
          padding: 25,
          boxWidth: 10,
          color: legendColor,
          usePointStyle: true
        }
      }
    }
  }
  // console.log(dashboardData.graphData.map((item) => (item.week)))

  const data: ChartData<'line'> = {
    labels: dahboardData?.graphData.map((item) => item.week),
    datasets: [
      {
        fill: false,
        tension: 0.5,
        pointRadius: 1,
        label: 'Total Orders',
        pointHoverRadius: 5,
        pointStyle: 'circle',
        borderColor: primary,
        backgroundColor: primary,
        pointHoverBorderWidth: 5,
        pointHoverBorderColor: white,
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: primary,
        data: dahboardData?.graphData.map((item) => item.all_orders)
      },
      {
        fill: false,
        tension: 0.5,
        label: 'New Orders',
        pointRadius: 1,
        pointHoverRadius: 5,
        pointStyle: 'circle',
        borderColor: warning,
        backgroundColor: warning,
        pointHoverBorderWidth: 5,
        pointHoverBorderColor: white,
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: warning,
        data: dahboardData?.graphData.map((item) => item.new_orders)
      },
      {
        fill: false,
        tension: 0.5,
        pointRadius: 1,
        label: 'Delivered Orders',
        pointHoverRadius: 5,
        pointStyle: 'circle',
        borderColor: success,
        backgroundColor: success,
        pointHoverBorderWidth: 5,
        pointHoverBorderColor: white,
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: success,
        data: dahboardData?.graphData.map((item) => item.delivered_orders)
      }
    ]
  }

  return (
    <Card>
      <CardHeader title='Sales Data' subheader='' />
      <CardContent>
        <Line data={data} height={400} options={options} />
      </CardContent>
    </Card>
  )
}

export default ChartForSale
