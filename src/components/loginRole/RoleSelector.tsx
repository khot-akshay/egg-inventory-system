import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const RoleCard = styled(Box)(({ theme, active }: { theme: any; active: boolean }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3, 1),
  cursor: 'pointer',
  borderRadius: '16px',
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  width: '100%',
  minHeight: '110px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.05),
    transform: 'translateY(-2px)',
    boxShadow: active ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
  },
}));

const roles = [
  { id: 'admin', label: 'Admin', icon: 'mdi:shield-outline' },
  { id: 'staff', label: 'Staff', icon: 'mdi:account-outline' },
  { id: 'distributor', label: 'Distributor', icon: 'mdi:truck-outline' },
  { id: 'poultry', label: 'Poultry', icon: 'mdi:wheat' }, // Grain logo
];

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ mb: 6 }}>
      {roles.map((role) => {
        const isActive = selectedRole === role.id;
        return (
          <Grid item xs={6} sm={3} key={role.id}>
            <RoleCard
              active={isActive}
              onClick={() => onRoleChange(role.id)}
            >
              <Box
                sx={{
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? theme.palette.primary.contrastText : '#757575',
                }}
              >
                <Icon icon={role.icon} fontSize={40} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: isActive ? theme.palette.primary.contrastText : '#212121',
                  textAlign: 'center',
                }}
              >
                {role.label}
              </Typography>
            </RoleCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default RoleSelector;
