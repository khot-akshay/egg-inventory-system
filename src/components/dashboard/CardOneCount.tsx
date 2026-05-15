import { Box, Card, CardContent, IconButton, Typography, Grid } from '@mui/material'
import React from 'react'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { useRouter } from 'next/router'
import millify from 'millify'

interface Props {
    title: string
    value: string | number
    percentage?: number
    icon: string
    color?: string
    link?: string
}

const CardOneCount = ({
    title,
    value,
    percentage = 0,
    icon,
    color,
    link
}: Props) => {
    const router = useRouter()
    const isPositive = percentage >= 0

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: 2,
                transition: '0.2s',
                '&:hover': { boxShadow: 6 }
            }}
        >
            <CardContent>
                {/* Top row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box display='flex' alignItems='center' gap={2}>
                        <CustomAvatar skin='light' variant='rounded' color={color} sx={{ width: 44, height: 44 }}>
                            <Icon fontSize={20} icon={icon} />
                        </CustomAvatar>
                    </Box>
                    {link && (
                        <IconButton size='small' onClick={() => router.push(link)}>
                            <Icon icon='uim:arrow-up-right' />
                        </IconButton>
                    )}
                </Box>

                {/* Title */}
                <Typography variant='h6'>{title}</Typography>

                {/* Amount */}
                <Typography variant="h5" fontWeight={600} sx={{ mt: 1 }}>
                    {value}
                </Typography>

                {/* Percentage */}
                {/* <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
          <Icon
            icon={isPositive ? 'mdi:arrow-up' : 'mdi:arrow-down'}
            color={isPositive ? '#4caf50' : '#f44336'}
            fontSize={18}
          />
          <Typography
            variant="body2"
            sx={{
              color: isPositive ? '#4caf50' : '#f44336',
              fontWeight: 500
            }}
          >
            {Math.abs(percentage)}%
          </Typography>
        </Box> */}
            </CardContent>
        </Card>
    )
}

export default CardOneCount
