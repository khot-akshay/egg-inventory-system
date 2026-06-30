// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import Autocomplete from 'src/layouts/components/Autocomplete'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown'
import NotificationDropdown, {
  NotificationsType
} from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import ShortcutsDropdown, { ShortcutsType } from 'src/@core/layouts/components/shared-components/ShortcutsDropdown'
import { Button, Typography } from '@mui/material'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import React from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import EggAltIcon from "@mui/icons-material/EggAlt";
import LoginIcon from "@mui/icons-material/Login";
import { useTheme } from "@mui/material/styles";

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const notifications: NotificationsType[] = [
  {
    meta: 'Today',
    avatarAlt: 'Flora',
    title: 'Congratulation Flora! 🎉',
    avatarImg: '/images/avatars/4.png',
    subtitle: 'Won the monthly best seller badge'
  },
  {
    meta: 'Yesterday',
    avatarColor: 'primary',
    subtitle: '5 hours ago',
    avatarText: 'Robert Austin',
    title: 'New user registered.'
  },
  {
    meta: '11 Aug',
    avatarAlt: 'message',
    title: 'New message received 👋🏻',
    avatarImg: '/images/avatars/5.png',
    subtitle: 'You have 10 unread messages'
  },
  {
    meta: '25 May',
    title: 'Paypal',
    avatarAlt: 'paypal',
    subtitle: 'Received Payment',
    avatarImg: '/images/misc/paypal.png'
  },
  {
    meta: '19 Mar',
    avatarAlt: 'order',
    title: 'Received Order 📦',
    avatarImg: '/images/avatars/3.png',
    subtitle: 'New order received from John'
  },
  {
    meta: '27 Dec',
    avatarAlt: 'chart',
    subtitle: '25 hrs ago',
    avatarImg: '/images/misc/chart.png',
    title: 'Finance report has been generated'
  }
]

const shortcuts: ShortcutsType[] = [
  {
    title: 'Calendar',
    icon: 'bx:calendar',
    url: '/apps/calendar',
    subtitle: 'Appointments'
  },
  {
    icon: 'bx:book',
    title: 'Invoice App',
    url: '/apps/invoice/list',
    subtitle: 'Manage Accounts'
  },
  {
    title: 'Users',
    icon: 'bx:user',
    url: '/apps/user/list',
    subtitle: 'Manage Users'
  },
  {
    url: '/apps/roles',
    icon: 'bx:check-shield',
    title: 'Role Management',
    subtitle: 'Permissions'
  },
  {
    url: '/',
    title: 'Dashboard',
    subtitle: 'User Dashboard',
    icon: 'bx:pie-chart-alt-2'
  },
  {
    icon: 'bx:cog',
    title: 'Settings',
    subtitle: 'Account Settings',
    url: '/pages/account-settings/account'
  },
  {
    title: 'Help Center',
    icon: 'bx:help-circle',
    url: '/pages/help-center',
    subtitle: 'FAQs & Articles'
  },
  {
    title: 'Dialogs',
    icon: 'bx:window-open',
    subtitle: 'Useful Dialogs',
    url: '/pages/dialog-examples'
  }
]

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const { user } = useAuth()
  const router = useRouter()
  const [openDialog, setOpenDialog] = React.useState(false)

  // Show dialog when day opening flag is false and not on the openingDay page
  React.useEffect(() => {
    if (user && user.day_session && user.day_session.opening_flag === false) {
      if (router.pathname !== '/openingDay') {
        setOpenDialog(true)
      }
    } else {
      setOpenDialog(false)
    }
  }, [user, router.pathname])

  const handleGoToOpening = () => {
    setOpenDialog(false)
    router.push('/openingDay')
  }

  
  const handleFlushData = () => {
    try {
      axiosInstance.post('/admin/v1/staticPages/cache/flush').then((response) => {
        toast.success(response.data.message)
      })
    } catch (e) {
      toast.error('Failed to flush data')
    }
  }
  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon icon='bx:menu' />
          </IconButton>
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 4 }, ml: 2 }}>
          {(['administrator', 'admin', 'distributor'].includes(user?.role?.toLowerCase() ?? '')) ? (
            <Typography variant='subtitle1' sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
              Role: {user?.roles?.[0]?.name || user?.role}
            </Typography>
          ) : (
            <Typography variant='subtitle1' sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
              Shop Name: {user?.shop?.name}
            </Typography>
          )}
          <Typography variant='subtitle1' sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
            User Name: {user?.name || user?.fullName || 'Admin'}
          </Typography>
        </Box>
      </Box>
      {/* Actions Right */}
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        <UserDropdown settings={settings} />
      </Box>

      {/* Blocking Dialog for Day Opening */}
     <Dialog
  open={openDialog}
  onClose={() => {}}
  disableEscapeKeyDown
  PaperProps={{
    sx: {
      borderRadius: 4,
      width: 560,
      maxWidth: "90%",
      p: 5,
      overflow: "hidden",
      position: "relative",
      textAlign: "center",
      bgcolor: "background.paper",
    },
  }}
>
  {/* Background Glow */}
  <Box
    sx={{
      position: "absolute",
      width: 350,
      height: 350,
      borderRadius: "50%",
      bgcolor: "primary.main",
      opacity: 0.08,
      top: -120,
      left: "50%",
      transform: "translateX(-50%)",
      filter: "blur(80px)",
    }}
  />

  {/* Icon */}
  <Box
    sx={{
      width: 110,
      height: 110,
      borderRadius: "50%",
      bgcolor: "primary.lighter", // or theme.palette.primary.lighter
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mx: "auto",
      mb: 3,
      position: "relative",
      zIndex: 1,
    }}
  >
    <EggAltIcon
      sx={{
        fontSize: 55,
        color: "primary.main",
      }}
    />
  </Box>

  {/* Title */}
  <Typography
    variant="h4"
    fontWeight={700}
    color="text.primary"
    mb={1}
  >
    Day Opening Required
  </Typography>

  {/* Divider */}
  <Box
    sx={{
      width: 45,
      height: 4,
      borderRadius: 10,
      bgcolor: "primary.main",
      mx: "auto",
      mb: 3,
    }}
  />

  {/* Description */}
  <Typography
    variant="body1"
    color="text.secondary"
    sx={{
      maxWidth: 360,
      mx: "auto",
      lineHeight: 1.8,
      mb: 5,
    }}
  >
    Please complete Day Opening first
    <br />
    to continue using the application.
  </Typography>

  {/* Button */}
  <Button
    variant="contained"
    size="large"
    startIcon={<LoginIcon />}
    onClick={handleGoToOpening}
    sx={{
      px: 4,
      py: 1.5,
      borderRadius: 2,
      textTransform: "none",
      fontWeight: 600,
      // boxShadow: theme.shadows[4],
    }}
  >
    Go to Day Opening
  </Button>

  {/* Bottom Decorations */}
  <Box
    sx={{
      position: "absolute",
      bottom: -70,
      left: -70,
      width: 180,
      height: 180,
      borderRadius: "50%",
      bgcolor: "primary.main",
      opacity: 0.05,
    }}
  />

  <Box
    sx={{
      position: "absolute",
      bottom: -70,
      right: -70,
      width: 180,
      height: 180,
      borderRadius: "50%",
      bgcolor: "primary.main",
      opacity: 0.05,
    }}
  />
</Dialog>
    </Box>
  )
}

export default AppBarContent
