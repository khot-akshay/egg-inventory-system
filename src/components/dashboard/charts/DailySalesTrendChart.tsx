import React from 'react'
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailySalesDataPoint {
  date: string
  amount: number
}

interface DailySalesTrendChartProps {
  data: DailySalesDataPoint[]
  loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
          boxShadow: 3,
        }}
      >
        <Typography variant='caption' color='text.secondary' display='block'>
          {label}
        </Typography>
        <Typography variant='body2' fontWeight={600} color='success.main'>
          ₹{Number(payload[0].value).toFixed(2)}
        </Typography>
      </Box>
    )
  }
  return null
}

export default function DailySalesTrendChart({ data, loading }: DailySalesTrendChartProps) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant='h6' fontWeight={600} sx={{ mb: 3 }}>
          Daily Sales Trend
        </Typography>

        {loading ? (
          <Skeleton variant='rectangular' height={280} sx={{ borderRadius: 2 }} />
        ) : data.length === 0 ? (
          <Box
            sx={{
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant='h4'>📊</Typography>
            <Typography variant='body2' color='text.secondary'>
              No sales data available for the selected range
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.08)' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.12)' }}
              />
              <YAxis
                tickFormatter={(v) => `₹${v}`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type='monotone'
                dataKey='amount'
                stroke='#4CAF50'
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#4CAF50' }}
                activeDot={{ r: 5, fill: '#4CAF50' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
