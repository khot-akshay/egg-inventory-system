import { Box, Card, CardContent, IconButton, Typography, Grid } from '@mui/material'
import React from 'react'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import millify from 'millify'
import { useRouter } from 'next/router'

interface Props {
  data: {
    total: number
    [key: string]: number
  }
  icon: string
  title: string
  color: string
  link?: string
  isshow?: boolean
}

function CountCard({ data, icon, title, color, link, isshow = true }: Props) {
  const router = useRouter()
  const { total, ...stats } = data

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3, transition: '0.2s', '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box display='flex' alignItems='center' gap={2}>
            <CustomAvatar skin='light' variant='rounded' color={color} sx={{ width: 44, height: 44 }}>
              <Icon fontSize={20} icon={icon} />
            </CustomAvatar>
            <Typography variant='h6'>{title}</Typography>
          </Box>
          {link && (
            <IconButton size='small' onClick={() => router.push(link)}>
              <Icon icon='uim:arrow-up-right' />
            </IconButton>
          )}
        </Box>

        <Grid container spacing={2}>

          {Object.entries(stats).map(([key, value]) => (
            <Grid item xs={6} sm={3} key={key}>
              {isshow && (
                <>
                  <Typography variant='h6' color='text.secondary' sx={{ textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant='h5'>{millify(value)}</Typography>
                </>
              )}
            </Grid>
          ))}

          <Grid item xs={6} sm={3} sx={{ ml: 'auto' }}>
            <Box
              sx={{
                backgroundColor: theme => theme.palette.primary.main,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                textAlign: 'center',
                color: '#fff'
              }}
            >
              <Typography variant='caption' sx={{ color: '#fff' }}>
                Total
              </Typography>
              <Typography variant='h6' sx={{ color: '#fff' }}>
                {millify(total)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CountCard
