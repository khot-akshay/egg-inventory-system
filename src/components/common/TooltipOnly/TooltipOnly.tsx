import React, { ReactNode } from 'react';
import { Tooltip, Box } from '@mui/material';

interface TooltipOnlyProps {
  title: string;
  children: ReactNode;
  placement?: 'right' | 'top' | 'left' | 'bottom';
  disabled?: boolean; // New prop to disable the tooltip
}

const TooltipOnly: React.FC<TooltipOnlyProps> = ({ title, children, placement = 'bottom', disabled = false }) => {
  return disabled ? (
    <Box sx={{ cursor: 'not-allowed' }}>{children}</Box>
  ) : (
    <Tooltip title={title} placement={placement} arrow>
      <Box sx={{ cursor: 'pointer' }}>{children}</Box>
    </Tooltip>
  );
};

export default TooltipOnly;
