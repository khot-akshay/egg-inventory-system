import { Box, Card, CardContent, IconButton, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { useRouter } from 'next/router'

interface ListItem {
  id: number | string
  label: string
  value: string | number
}

interface Props {
  title: string
  value: string | number
  percentage?: number
  icon: string
  color?: string
  link?: string
  items?: ListItem[]
}

const CardOneCount = ({
  title,
  value,
  percentage = 0,
  icon,
  color = 'primary',
  link,
  items = []
}: Props) => {
  const router = useRouter()

  const isPositive = percentage >= 0

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        transition: '0.2s',
        height: '100%',
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4
          }}
        >
          <CustomAvatar
            skin='light'
            variant='rounded'
            color={color}
            sx={{
              width: 44,
              height: 44
            }}
          >
            <Icon fontSize={20} icon={icon} />
          </CustomAvatar>

          {link && (
            <IconButton size='small' onClick={() => router.push(link)}>
              <Icon icon='uim:arrow-up-right' />
            </IconButton>
          )}
        </Box>

        {/* Title + Value */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Typography variant='h6'>{title}</Typography>

          <Typography variant='h5' fontWeight={600}>
            {typeof value === 'number'
              ? value.toLocaleString()
              : value}
          </Typography>
        </Box>

        {/* Percentage */}
        {percentage !== 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1
            }}
          >
            <Icon
              icon={
                isPositive
                  ? 'mdi:trending-up'
                  : 'mdi:trending-down'
              }
              color={isPositive ? 'green' : 'red'}
            />

            <Typography
              variant='body2'
              sx={{
                color: isPositive
                  ? 'success.main'
                  : 'error.main',
                fontWeight: 500
              }}
            >
              {percentage}%
            </Typography>
          </Box>
        )}

        {/* Dynamic Items */}
        {items.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {items.map(item => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 1,
                  borderBottom: theme =>
                    `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    textTransform: 'capitalize'
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600 }}
                >
                  {typeof item.value === 'number'
                    ? item.value.toLocaleString()
                    : item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CardOneCount