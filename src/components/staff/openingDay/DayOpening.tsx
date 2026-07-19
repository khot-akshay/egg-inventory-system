import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  Collapse
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import CustomAvatar from 'src/@core/components/mui/avatar'
import dayjs from 'dayjs'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StockCategory {
  id: number
  category_id: number
  category_name: string
  remaining_count: number
  sale_count: number
  sold_count: number
  total_amount: number
  purchase_count?: number
  opening_count?: number
}

interface StockData {
  shop_id: number
  count: number
  categories: StockCategory[]
  totals: {
    remaining_count: number
    sale_count: number
    sold_count: number
    total_amount: number
    due_amount?: number
    expense_total?: number
    existing_cash?: number
    payment_amounts?: Record<string, number>
    opening_count?: number
    purchase_count?: number
    damaged_count?: number
  }
}

interface EggRow {
  id: number
  name: string
  icon: string
  openingStock: number
  notes?: string
}

// ─── Constants & Style Helpers ──────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  'Regular Size Eggs': { bg: 'warning.light', color: 'warning.main', icon: 'mdi:egg' },
  'Broken Eggs': { bg: 'error.light', color: 'error.main', icon: 'mdi:egg-off' },
  'Double Dhill Eggs': { bg: 'info.light', color: 'info.main', icon: 'mdi:egg-outline' },
  'Medium/Small Size Eggs': { bg: 'warning.light', color: 'warning.main', icon: 'mdi:egg-easter' },
  'Deshi Eggs': { bg: 'success.light', color: 'success.main', icon: 'mdi:food-drumstick' },
  default: { bg: 'primary.light', color: 'primary.main', icon: 'mdi:egg' }
}

const getCategoryStyle = (name: string, theme: any) => {
  const style = CATEGORY_STYLES[name] || CATEGORY_STYLES.default
  let bg = theme.palette.primary.light + '22'
  let color = theme.palette.primary.main

  if (style.bg.startsWith('warning')) {
    bg = theme.palette.warning.light + '22'
    color = theme.palette.warning.main
  } else if (style.bg.startsWith('error')) {
    bg = theme.palette.error.light + '22'
    color = theme.palette.error.main
  } else if (style.bg.startsWith('info')) {
    bg = theme.palette.info.light + '22'
    color = theme.palette.info.main
  } else if (style.bg.startsWith('success')) {
    bg = theme.palette.success.light + '22'
    color = theme.palette.success.main
  }

  return { bg, color, icon: style.icon }
}

const FALLBACK_CATEGORIES: EggRow[] = [
  { id: 1, name: 'Regular Size Eggs', icon: 'mdi:egg', openingStock: 0, notes: '' },
  { id: 2, name: 'Broken Eggs', icon: 'mdi:egg-off', openingStock: 0, notes: '' },
  { id: 3, name: 'Double Dhill Eggs', icon: 'mdi:egg-outline', openingStock: 0, notes: '' },
  { id: 4, name: 'Medium/Small Size Eggs', icon: 'mdi:egg-easter', openingStock: 0, notes: '' },
  { id: 5, name: 'Deshi Eggs', icon: 'mdi:food-drumstick', openingStock: 0, notes: '' }
]

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Reusable Section Title */
const SectionTitle = ({ icon, title, subtitle, iconColor = 'primary' }: { icon: string; title: string; subtitle?: string; iconColor?: 'primary' | 'success' | 'info' | 'warning' }) => {
  const theme = useTheme()
  return (
    <Stack direction='row' alignItems='center' spacing={1.5}>
      <CustomAvatar
        skin='light'
        variant='rounded'
        color={iconColor}
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0
        }}
      >
        <Icon icon={icon} fontSize={22} />
      </CustomAvatar>
      <Box>
        <Typography variant='h6' fontWeight={700} sx={{ color: theme.palette.text.primary, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

/** Verification Row */
const VerifyRow = ({
  label,
  value,
  highlight = false,
  colorKey
}: {
  label: string
  value: string | number
  highlight?: boolean
  colorKey?: 'success' | 'error' | 'warning' | 'info' | 'text'
}) => {
  const theme = useTheme()
  const resolvedColor =
    colorKey === 'success' ? theme.palette.success.main
      : colorKey === 'error' ? theme.palette.error.main
        : colorKey === 'warning' ? theme.palette.warning.main
          : colorKey === 'info' ? theme.palette.info.main
            : theme.palette.text.primary

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
        {label}
      </Typography>
      <Typography
        variant='body2'
        fontWeight={highlight ? 700 : 600}
        sx={{ color: highlight ? resolvedColor : theme.palette.text.primary }}
      >
        {value}
      </Typography>
    </Box>
  )
}

/** Mobile Egg Stock Card */
const EggMobileCard = ({
  row,
  onOpeningStockChange,
  onNotesChange
}: {
  row: EggRow
  onOpeningStockChange: (id: number, val: number) => void
  onNotesChange: (id: number, val: string) => void
}) => {
  const theme = useTheme()
  const style = getCategoryStyle(row.name, theme)

  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius * 0.5,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: theme.spacing(2) }}>
        <Stack direction='row' alignItems='center' spacing={1.5} mb={2}>
          <Grid item sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: style.bg,
            color: style.color,
            flexShrink: 0
          }}>
            <Icon icon={style.icon} fontSize={16} />
          </Grid>
          <Typography variant='subtitle2' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
            {row.name}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }} display='block' mb={0.75}>
              Opening Stock (Eggs) *
            </Typography>
            <TextField
              type='number'
              size='small'
              fullWidth
              disabled
              value={row.openingStock || 0}
              onChange={e => onOpeningStockChange(row.id, Number(e.target.value))}
              inputProps={{ min: 0, style: { fontWeight: 700 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.25 } }}
            />
          </Box>
          <Box>
            <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }} display='block' mb={0.75}>
              Notes (Optional)
            </Typography>
            <TextField
              size='small'
              fullWidth
              placeholder='Good condition'
              value={row.notes || ''}
              onChange={e => onNotesChange(row.id, e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.25 } }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

// ── Skeleton Loader Helpers ───────────────────────────────────────────────────
const CardSkeleton = () => {
  const theme = useTheme()
  return (
    <Card sx={{ borderRadius: theme.shape.borderRadius * 0.5, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: theme.spacing(3) }}>
        <Skeleton variant='rounded' width={44} height={44} sx={{ mb: 2 }} />
        <Skeleton variant='text' width='60%' height={34} />
        <Skeleton variant='text' width='80%' height={20} />
      </CardContent>
    </Card>
  )
}

// ── Shared Card Wrapper ──────────────────────────────────────────────────────
const SectionCard = ({ children, noPad, sx }: { children: React.ReactNode; noPad?: boolean; sx?: any }) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius * 0.5,
        boxShadow: theme.shadows[3],
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        ...sx
      }}
    >
      {noPad ? children : <CardContent sx={{ p: { xs: theme.spacing(2), sm: theme.spacing(3) } }}>{children}</CardContent>}
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const DayOpening = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { user } = useAuth()
  const shopId = user?.shop_id || user?.shop?.id

  // ── State ────────────────────────────────────────────────────────────────────
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [eggRows, setEggRows] = useState<EggRow[]>(FALLBACK_CATEGORIES)
  const [openingCash, setOpeningCash] = useState<number | string>('')
  const [sessionDate, setSessionDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [confirmed, setConfirmed] = useState(false)

  // Denominations state
  const [showDenominations, setShowDenominations] = useState(false)
  const [denominations, setDenominations] = useState<Record<string, number>>({
    '500': 0,
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '2': 0,
    '1': 0
  })

  // ── API ──────────────────────────────────────────────────────────────────────
  const fetchInventoryAndCategories = useCallback(async () => {
    if (!shopId) return
    setStockLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('shop_id', String(shopId))
      params.append('start_date', sessionDate)
      params.append('end_date', sessionDate)

      const url = `/api/v1/admin/getInventoryStockForDashboard?${params.toString()}`
      const response = await axiosInstance.get(url)

      if (response.data?.success) {
        const data = response.data.data
        setStockData(data)

        // Map categories from the dashboard stock API response to EggRows
        const dynamicRows = (data.categories || []).map((cat: any) => {
          const catName = cat.category_name || "Unknown Category"
          return {
            id: cat.category_id || cat.id,
            name: catName,
            icon: CATEGORY_STYLES[catName]?.icon ?? CATEGORY_STYLES.default.icon,
            openingStock: Number(cat.remaining_count ?? 0), // Pre-fill with the closing/remaining stock
            notes: ''
          }
        })
        setEggRows(dynamicRows)
      } else {
        setStockData(null)
        setEggRows(FALLBACK_CATEGORIES)
      }
    } catch (err) {
      toast.error('Failed to load stock data')
      setStockData(null)
      setEggRows(FALLBACK_CATEGORIES)
    } finally {
      setStockLoading(false)
    }
  }, [shopId, sessionDate])

  useEffect(() => {
    fetchInventoryAndCategories()
  }, [fetchInventoryAndCategories])

  // ── Derived values ──────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    return {
      opening: eggRows.reduce((s, r) => s + (Number(r.openingStock) || 0), 0)
    }
  }, [eggRows])

  // Yesterday Closing Balances derived from stockData
  const paymentAmounts = stockData?.totals?.payment_amounts ?? {}
  const pendingCredit = stockData?.totals?.due_amount ?? 0
  const onlinePayments = Number(paymentAmounts['upi'] ?? 0) + Number(paymentAmounts['online'] ?? 0)
  const otherReceivables = 0 // fallback or from custom api fields if any
  const totalReceivables = pendingCredit + onlinePayments + otherReceivables

  const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // ── Event Handlers ──────────────────────────────────────────────────────────
  const handleOpeningStockChange = (id: number, val: number) => {
    setEggRows(prev => prev.map(r => r.id === id ? { ...r, openingStock: val } : r))
  }

  const handleNotesChange = (id: number, val: string) => {
    setEggRows(prev => prev.map(r => r.id === id ? { ...r, notes: val } : r))
  }

  const handleDenominationChange = (note: string, val: string) => {
    const count = val === '' ? 0 : Number(val)
    const updated = { ...denominations, [note]: count }
    setDenominations(updated)

    // Sum denominations and auto-update openingCash
    const total = Object.entries(updated).reduce((acc, [k, v]) => acc + Number(k) * v, 0)
    setOpeningCash(total || '')
  }

  const handleOpeningCashChange = (val: string) => {
    setOpeningCash(val)
    // Clear denominations to prevent manual override conflicts
    setDenominations({
      '500': 0,
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0
    })
  }

  const handleSaveDraft = () => toast.success('Draft saved successfully!')

  const handleSubmit = async () => {
    if (!confirmed) {
      toast.error('Please confirm before submitting.')
      return
    }

    if (eggRows.length === 0) {
      toast.error('Cannot submit day opening: Egg categories list is empty.')
      return
    }

    setStockLoading(true)
    try {
      const payload = {
        session_date: sessionDate,
        opening_cash: Number(openingCash || 0),
        opening_eggs: eggRows.map(item => ({
          category_id: item.id,
          opening_count: Number(item.openingStock || 0)
        }))
      }

      // API post for Opening Day
      const response = await axiosInstance.post('/api/v1/shop/openDay', payload)
      if (response.data?.success) {
        toast.success(response.data?.message || 'Day Opening submitted successfully!');
        router.reload()

        // Reset states
        setOpeningCash('')
        setDenominations({
          '500': 0,
          '200': 0,
          '100': 0,
          '50': 0,
          '20': 0,
          '10': 0,
          '5': 0,
          '2': 0,
          '1': 0
        })
        setConfirmed(false)

        await fetchInventoryAndCategories()
      } else {
        toast.error(response.data?.message || 'Failed to submit Day Opening')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong during submission')
    } finally {
      setStockLoading(false)
    }
  }

  return (
    <Box sx={{ pb: isMobile ? theme.spacing(14) : theme.spacing(4) }}>
      <Stack spacing={3}>

        {/* ══════════════════════════════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════════════════════════════ */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: theme.shape.borderRadius * 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText
              }}
            >
              <Icon icon='mdi:weather-sunny' fontSize={24} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800} sx={{ color: theme.palette.text.primary }}>
                Day Opening
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                {dayjs(sessionDate).format('dddd, DD MMMM YYYY')}
              </Typography>
            </Box>
          </Stack>
          <TextField
            type='date'
            label='Session Date'
            size='small'
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.25 } }}
          />
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            LAYOUT COLUMNS
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container>

          <Grid item xs={12} lg={8} sx={{ pr: { md: 2 } }}>
            <SectionCard noPad>
              {/* Card Header */}
              <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <SectionTitle
                  icon='mdi:layers-triple'
                  title='Opening Stock Verification'
                  subtitle='Enter the opening stock for each egg category'
                  iconColor='primary'
                />
              </Box>

              {/* Card Content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {stockLoading ? (
                  isMobile ? (
                    <Stack spacing={2}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant='rounded' height={200} sx={{ borderRadius: theme.shape.borderRadius * 0.5 }} />)}</Stack>
                  ) : (
                    <Skeleton variant='rounded' height={280} sx={{ borderRadius: theme.shape.borderRadius * 0.25 }} />
                  )
                ) : isMobile ? (
                  <Stack spacing={2}>
                    {eggRows.map(row => (
                      <EggMobileCard
                        key={row.id}
                        row={row}
                        onOpeningStockChange={handleOpeningStockChange}
                        onNotesChange={handleNotesChange}
                      />
                    ))}
                  </Stack>
                ) : (
                  <TableContainer sx={{ borderRadius: theme.shape.borderRadius * 0.25, border: `1px solid ${theme.palette.divider}`, overflowX: 'hidden' }}>
                    <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          {[
                            { name: 'Category', width: '40%', align: 'left' },
                            { name: 'Opening Stock (Eggs) *', width: '25%', align: 'center' },
                            // { name: 'Notes (Optional)', width: '35%', align: 'left' }
                          ].map(col => (
                            <TableCell
                              key={col.name}
                              width={col.width}
                              align={col.align as any}
                              sx={{
                                bgcolor: theme.palette.background.default,
                                color: theme.palette.text.secondary,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                py: 1.5,
                                px: 3,
                                borderBottom: `2px solid ${theme.palette.divider}`
                              }}
                            >
                              {col.name}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eggRows.map((row, idx) => {
                          const style = getCategoryStyle(row.name, theme)
                          return (
                            <TableRow
                              key={row.id}
                              sx={{
                                bgcolor: idx % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover,
                                '&:hover': { bgcolor: theme.palette.action.selected },
                                '&:last-child td': { borderBottom: 0 },
                                transition: 'background-color 0.15s'
                              }}
                            >
                              {/* Category Name & Avatar */}
                              <TableCell width='40%' align='left' sx={{ py: 1.5, px: 3 }}>
                                <Grid container alignItems="center" spacing={2}>
                                  <Grid item sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: style.bg,
                                    color: style.color,
                                    flexShrink: 0
                                  }}>
                                    <Icon icon={style.icon} fontSize={16} />
                                  </Grid>
                                  <Grid item xs>
                                    <Typography
                                      variant='body2'
                                      fontWeight={600}
                                      sx={{
                                        color: theme.palette.text.primary,
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {row.name}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </TableCell>

                              {/* Opening Stock Input (Disabled) */}
                              <TableCell width='25%' align='center' sx={{ py: 1, px: 3 }}>
                                <TextField
                                  type='number'
                                  size='small'
                                  disabled
                                  value={row.openingStock || 0}
                                  onChange={e => handleOpeningStockChange(row.id, Number(e.target.value))}
                                  inputProps={{
                                    min: 0,
                                    style: {
                                      fontWeight: 700,
                                      textAlign: 'center',
                                      padding: '6px 8px'
                                    }
                                  }}
                                  sx={{
                                    width: 100,
                                    mx: 'auto',
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: theme.shape.borderRadius * 0.25
                                    }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Total Opening Stock Banner */}
                {!stockLoading && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: theme.shape.borderRadius * 0.25,
                      bgcolor: theme.palette.primary.light + '12',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography
                      variant='body2'
                      fontWeight={700}
                      sx={{ color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                      Total Opening Stock
                    </Typography>
                    <Typography variant='h6' fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                      {totals.opening.toLocaleString()} Eggs
                    </Typography>
                  </Box>
                )}
              </Box>
            </SectionCard>
          </Grid>

          {/* ── Right Column: Cash & Payment Verification ── */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>

              {/* 1. Cash Verification Card */}
              <SectionCard>
                <Box sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <SectionTitle
                    icon='mdi:wallet-outline'
                    title='Cash Verification'
                    subtitle='Verify your opening cash in hand'
                    iconColor='success'
                  />
                </Box>

                <Box sx={{ pt: 2.5 }}>
                  {stockLoading ? (
                    <Stack spacing={2}>
                      <Skeleton variant='text' width='100%' height={30} />
                      <Skeleton variant='rounded' width='100%' height={45} />
                    </Stack>
                  ) : (
                    <>
                      {/* Opening Cash Input Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant='body2' fontWeight={600} sx={{ color: theme.palette.text.primary }}>
                          Opening Cash In Hand <span style={{ color: theme.palette.error.main }}>*</span>
                        </Typography>
                        <TextField
                          type='number'
                          size='small'
                          value={openingCash}
                          onChange={e => handleOpeningCashChange(e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position='start'><Typography variant='body2' fontWeight={700}>₹</Typography></InputAdornment>,
                            inputProps: { min: 0, style: { fontWeight: 700, textAlign: 'right' } }
                          }}
                          sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.25 } }}
                        />
                      </Box>

                      {/* Denominations Toggle Header */}
                      <Box
                        onClick={() => setShowDenominations(p => !p)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1.5,
                          cursor: 'pointer',
                          borderTop: `1px solid ${theme.palette.divider}`,
                          borderBottom: showDenominations ? 'none' : `1px solid ${theme.palette.divider}`,
                          userSelect: 'none'
                        }}
                      >
                        <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                          Denominations (Optional)
                        </Typography>
                        <Icon icon={showDenominations ? 'mdi:chevron-up' : 'mdi:chevron-down'} fontSize={20} color={theme.palette.text.secondary} />
                      </Box>

                      {/* Denominations Collapsible Content */}
                      <Collapse in={showDenominations}>
                        <Stack spacing={1.5} sx={{ py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                          {Object.keys(denominations).map(note => (
                            <Box key={note} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant='body2' fontWeight={600} sx={{ width: 50, color: theme.palette.text.primary }}>
                                ₹ {note}
                              </Typography>
                              <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                                x
                              </Typography>
                              <TextField
                                type='number'
                                size='small'
                                placeholder='0'
                                value={denominations[note] || ''}
                                onChange={e => handleDenominationChange(note, e.target.value)}
                                inputProps={{ min: 0, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 600 } }}
                                sx={{ width: 75, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.25 } }}
                              />
                              <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                                =
                              </Typography>
                              <Typography variant='body2' fontWeight={700} sx={{ width: 80, textAlign: 'right', color: theme.palette.text.primary }}>
                                ₹ {(Number(note) * (denominations[note] || 0)).toLocaleString()}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Collapse>

                      {/* Green Total Cash Banner */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          borderRadius: theme.shape.borderRadius * 0.25,
                          bgcolor: theme.palette.success.light + '12',
                          border: `1px solid ${theme.palette.success.main + '22'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Icon icon='mdi:check-circle-outline' color={theme.palette.success.main} fontSize={20} />
                          <Typography variant='body2' fontWeight={700} sx={{ color: theme.palette.success.dark, textTransform: 'uppercase' }}>
                            Total Cash
                          </Typography>
                        </Stack>
                        <Typography variant='h6' fontWeight={800} sx={{ color: theme.palette.success.dark }}>
                          {fmt(Number(openingCash || 0))}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
                 {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
              width: '100%',
              mt: 6
            }}
          >
            {/* <FormControlLabel
              control={
                <Checkbox
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  color='primary'
                />
              }
              label={
                <Typography variant='body2' fontWeight={600} sx={{ color: theme.palette.text.secondary }}>
                  I confirm that all opening stock counts and cash in hand have been verified.
                </Typography>
              }
            /> */}
            <Button
              variant='contained'
              size='large'
              // disabled={!confirmed}
              startIcon={<Icon icon='mdi:check-all' />}
              onClick={handleSubmit}
              sx={{ borderRadius: theme.shape.borderRadius * 0.33, px: 4, fontWeight: 700 }}
            >
              Submit Day Opening
            </Button>
          </Box>
        )}
              </SectionCard>

              {/* 2. Payment Verification Card */}
              {/* <SectionCard>
                <Box sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <SectionTitle
                    icon='mdi:clipboard-check-outline'
                    title='Payment Verification'
                    subtitle='Verify yesterday closing balances (if any)'
                    iconColor='info'
                  />
                </Box>

                <Box sx={{ pt: 1 }}>
                  {stockLoading ? (
                    <Stack spacing={2} sx={{ pt: 1.5 }}>
                      <Skeleton variant='text' width='100%' height={25} />
                      <Skeleton variant='text' width='100%' height={25} />
                      <Skeleton variant='text' width='100%' height={25} />
                    </Stack>
                  ) : (
                    <>
                      <Stack>
                        <VerifyRow label='Pending Credit (Customers)' value={fmt(pendingCredit)} />
                        <VerifyRow label='Online Payments to be Received' value={fmt(onlinePayments)} />
                        <VerifyRow label='Other Receivables' value={fmt(otherReceivables)} />
                      </Stack>

                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          borderRadius: theme.shape.borderRadius * 0.25,
                          bgcolor: theme.palette.info.light + '12',
                          border: `1px solid ${theme.palette.info.main + '22'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant='body2' fontWeight={700} sx={{ color: theme.palette.info.dark, textTransform: 'uppercase' }}>
                          Total Receivables
                        </Typography>
                        <Typography variant='h6' fontWeight={800} sx={{ color: theme.palette.info.dark }}>
                          {fmt(totalReceivables)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </SectionCard> */}

            </Stack>
          </Grid>

        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            FOOTER ACTIONS (Desktop)
        ══════════════════════════════════════════════════════════════════ */}
       
      </Stack>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE STICKY FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            bgcolor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8],
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                color='primary'
              />
            }
            label={
              <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary }}>
                I confirm that all opening counts and cash are verified.
              </Typography>
            }
            sx={{ mb: 0.5 }}
          />
          <Stack direction='row' spacing={1.5} sx={{ width: '100%' }}>
            <Button
              variant='outlined'
              size='large'
              fullWidth
              startIcon={<Icon icon='mdi:content-save-outline' />}
              onClick={handleSaveDraft}
              sx={{ borderRadius: theme.shape.borderRadius * 0.33, fontWeight: 600 }}
            >
              Save Draft
            </Button>
            <Button
              variant='contained'
              size='large'
              fullWidth
              disabled={!confirmed}
              startIcon={<Icon icon='mdi:check-all' />}
              onClick={handleSubmit}
              sx={{ borderRadius: theme.shape.borderRadius * 0.33, fontWeight: 700 }}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}

export default DayOpening
