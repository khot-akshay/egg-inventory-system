import React from 'react'
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ProductSalesDataPoint {
  name: string
  quantity: number
}

interface ProductWiseSalesChartProps {
  data: ProductSalesDataPoint[]
  loading?: boolean
}

const BAR_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']

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
        <Typography variant='body2' fontWeight={600}>
          Qty: {payload[0].value}
        </Typography>
      </Box>
    )
  }
  return null
}

export default function ProductWiseSalesChart({ data, loading }: ProductWiseSalesChartProps) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
      <CardContent>
        <Typography variant='h6' fontWeight={600} sx={{ mb: 3 }}>
          Product Wise Sales
        </Typography>

        {loading ? (
          <Skeleton variant='rectangular' height={260} sx={{ borderRadius: 2 }} />
        ) : data.length === 0 ? (
          <Box
            sx={{
              height: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant='h4'>📦</Typography>
            <Typography variant='body2' color='text.secondary'>
              No product data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width='100%' height={260}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.08)' vertical={false} />
              <XAxis
                dataKey='name'
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                angle={-30}
                textAnchor='end'
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey='quantity' radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
