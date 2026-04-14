import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { post } from 'src/services/apiCall';
import StatusBox from '../Sstatusbox';
import RejectDialog from '../common/rejectedDialog';
import ApproveDialog from '../approveDialog';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const ActionButtonBox = ({ newData, apiEndpoint, id, getAllData, quserystatus = false }) => {
  const [loading, setLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleDeleteOpen = (item) => {
    setSelectedItem(item?.id);
    setRejectDialog(true);
  };
  console.log(newData?.documents, "newData")

  const rejectedOrPendingCount =
    newData?.documents?.filter(
      (doc) => doc.document_status === 'rejected' || doc.document_status === 'pending'
    )?.length || 0;

  const handleApproveOpen = (item) => {
    setSelectedItem(item?.id);

    const hasUnapprovedDocs = item?.documents?.some(
      (doc) => doc.document_status === 'rejected' || doc.document_status === 'pending'
    );

    const isVendorWithPendingOrg =
      newData?.addresses?.addressable_type === 'App\\Models\\Vendor' &&
      newData?.organization?.status === 'pending';
    if (isVendorWithPendingOrg) {
      toast.error('Please approve the organisation before proceeding.');
      return;
    }

    if (hasUnapprovedDocs) {
      toast.error('Please approve all documents before proceeding.');
    } else {
      setApproveDialog(true);
    }
  };

  const handleRejectSubmit = async (data) => {
    setLoading(true);
    const payload = {
      status: 'rejected',
      reason: data.reason,
    };

    try {
      const response = await post(`${apiEndpoint}/${id || data?.id}`, payload);
      if (response.success) {
        toast.success(response?.message ?? 'Status Updated Successfully');
        getAllData();
        setRejectDialog(false);
      } else {
        toast.error(response?.message ?? 'Something went wrong');
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.message ?? 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmit = async (data) => {
    setLoading(true);
    const payload = {
      status: 'approved',
      reason: data.reason,
    };

    try {
      const response = await post(`${apiEndpoint}/${id || data?.id || newData?.id}`, payload);
      if (response.success) {
        toast.success(response?.message ?? 'Status Updated Successfully.');
        getAllData();
        setApproveDialog(false);
      } else {
        toast.error(response?.message ?? 'Something went wrong.');
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.message ?? 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };
  const handlestatus = async (status) => {
    const payload = {
      status: status,
    };

    try {
      const response = await post(`${apiEndpoint}/${id || data?.id || newData?.id}`, payload);
      if (response.success) {
        toast.success(response?.message ?? 'Status Updated Successfully.');
        getAllData();
        setApproveDialog(false);
      } else {
        toast.error(response?.message ?? 'Something went wrong.');
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.message ?? 'Error occurred.');
    } finally {
      setLoading(false);
    }
  }
  const statusLabels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    // resolved: 'Resolved',
    rejected: 'Rejected',
    closed: 'Closed',
    approved: 'Approved',
    pending: 'Pending',
  };




  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" >
        {/* Status Section */}
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>
            Status:
          </Typography>
          <StatusBox status={newData?.status} />
        </Box>

        {/* Action Dropdown */}
        {!quserystatus && newData?.status !== 'approved' && newData.status !== 'rejected' && (
          <Box>

            <Button
              variant="contained"
              color="primary"
              size="small"
              aria-haspopup="true"
              aria-controls="action-menu"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<Icon icon="mdi:chevron-down" />}
            >
              Actions
            </Button>

            <Menu
              id="action-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  handleApproveOpen(newData);
                  setAnchorEl(null);
                }}
              >
                <Icon icon="mdi:check-circle-outline" fontSize={18} style={{ marginRight: 8 }} />
                Approve
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDeleteOpen(newData);
                  setAnchorEl(null);
                }}
              >
                <Icon icon="mdi:close-circle-outline" fontSize={18} style={{ marginRight: 8 }} />
                Reject
              </MenuItem>
            </Menu>
          </Box>
        )}

        {quserystatus && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              aria-haspopup="true"
              aria-controls="action-menu"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<Icon icon="mdi:chevron-down" />}
            >
              Actions
            </Button>

            <Menu
              id="action-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {newData?.status !== 'open' && <MenuItem
                onClick={() => {
                  setSelectedStatus('open');
                  setAnchorEl(null);
                  setConfirmDialogOpen(true);
                }}
              >
                <Icon icon="mdi:check-circle-outline" fontSize={18} style={{ marginRight: 8 }} />
                Open
              </MenuItem>}

              {newData?.status !== 'in_progress' && <MenuItem
                onClick={() => {
                  setSelectedStatus('in_progress');
                  setAnchorEl(null);
                  setConfirmDialogOpen(true);
                }}
              >
                <Icon icon="mdi:progress-clock" fontSize={18} style={{ marginRight: 8 }} />
                In Progress
              </MenuItem>
              }

              {/* { newData?.status !== 'resolved' &&  <MenuItem
        onClick={() => {
          setSelectedStatus('resolved');
          setAnchorEl(null);
          setConfirmDialogOpen(true);
        }}
      >
        <Icon icon="mdi:check-decagram-outline" fontSize={18} style={{ marginRight: 8 }} />
        Resolved
      </MenuItem>} */}
              {newData?.status !== 'rejected' && <MenuItem
                onClick={() => {
                  setSelectedStatus('rejected');
                  setAnchorEl(null);
                  setConfirmDialogOpen(true);
                }}
              >
                <Icon icon="mdi:close-circle-outline" fontSize={18} style={{ marginRight: 8 }} />
                Rejected
              </MenuItem>}
              {newData?.status !== 'closed' && <MenuItem
                onClick={() => {
                  setSelectedStatus('closed');
                  setAnchorEl(null);
                  setConfirmDialogOpen(true);
                }}
              >
                <Icon icon="mdi:lock-outline" fontSize={18} style={{ marginRight: 8 }} />
                Closed
              </MenuItem>

              }
            </Menu>
          </Box>
        )}

      </Box>

      {/* Reason for Rejection */}
      {/* {newData?.status === 'rejected' && (
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Reason For Rejection
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {newData?.reason || 'No reason provided'}
          </Typography>
        </Grid>
      )} */}

      {/* Dialogs */}
      <RejectDialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        onSubmit={handleRejectSubmit}
        selectedItem={selectedItem}
      />
      <ApproveDialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        onSubmit={handleApproveSubmit}
      />
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 5, pt: 4 }}>
          <Typography variant='h6' fontWeight={700}>Confirmation</Typography>
          <IconButton onClick={() => setConfirmDialogOpen(false)}>
            <HighlightOffIcon sx={{ color: '#f52d2d' }} fontSize="medium" />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />
        <DialogContent>
          Are you sure you want to change the status to &nbsp;
          <strong>{statusLabels[selectedStatus?.toLowerCase()] || 'Pending'}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            No
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              setConfirmDialogOpen(false);
              setLoading(true);
              await handlestatus(selectedStatus);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default ActionButtonBox;
