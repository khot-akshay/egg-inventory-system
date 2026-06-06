import React from 'react'
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PaymentDataPoint {
  name: string
  value: number
}

interface PaymentDistributionChartProps {
  data: PaymentDataPoint[]
  loading?: boolean
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800']

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill='white' textAnchor='middle' dominantBaseline='central' fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0]?.payload?.total || 1
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
          {payload[0].name}
        </Typography>
        <Typography variant='body2' fontWeight={600}>
          ₹{Number(payload[0].value).toFixed(2)}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {((payload[0].value / total) * 100).toFixed(1)}% of total
        </Typography>
      </Box>
    )
  }
  return null
}

export default function PaymentDistributionChart({ data, loading }: PaymentDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const dataWithTotal = data.map(d => ({ ...d, total }))

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
      <CardContent>
        <Typography variant='h6' fontWeight={600} sx={{ mb: 3 }}>
          Payment Distribution
        </Typography>

        {loading ? (
          <Skeleton variant='circular' width={200} height={200} sx={{ mx: 'auto' }} />
        ) : data.length === 0 || total === 0 ? (
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
            <Typography variant='h4'>💳</Typography>
            <Typography variant='body2' color='text.secondary'>
              No payment data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width='100%' height={260}>
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx='50%'
                cy='45%'
                outerRadius={90}
                dataKey='value'
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {dataWithTotal.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType='circle'
                iconSize={10}
                formatter={(value) => (
                  <Typography component='span' variant='caption'>
                    {value}
                  </Typography>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
