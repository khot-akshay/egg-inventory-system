import React from 'react'
import { Card, CardProps, useTheme } from '@mui/material'

interface CommonCardProps extends CardProps {
  children: React.ReactNode
}

const CommonCard: React.FC<CommonCardProps> = ({ children, sx, ...rest }) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
          borderColor: theme.palette.primary.main,
        },
        ...sx
      }}
      {...rest}
    >
      {children}
    </Card>
  )
}

export default CommonCard
