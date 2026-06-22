import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
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
  useMediaQuery
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
  growth?: number
}

interface EggRow {
  id: number
  name: string
  icon: string
  openingStock: number
  purchaseToday: number
  soldToday: number
  closingSystem: number
  physicalCount: number
}

interface DamagedEgg {
  quantity: string
  reason: string
  remarks: string
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  'Regular Size Eggs': 'mdi:egg',
  'Broken Eggs': 'mdi:egg-off',
  'Double Dhill Eggs': 'mdi:egg-outline',
  'Medium/Small Size Eggs': 'mdi:egg-easter',
  // 'Deshi Eggs': 'mdi:food-drumstick',
  default: 'mdi:egg'
}

const DAMAGE_REASONS = [
  'Transportation Damage',
  'Storage Damage',
  'Broken During Handling',
  'Quality Rejection',
  'Other'
]

const FALLBACK_CATEGORIES: EggRow[] = [
  { id: 1, name: 'Regular Size Eggs', icon: 'mdi:egg', openingStock: 0, purchaseToday: 0, soldToday: 0, closingSystem: 0, physicalCount: 0 },
  { id: 2, name: 'Broken Eggs', icon: 'mdi:egg-off', openingStock: 0, purchaseToday: 0, soldToday: 0, closingSystem: 0, physicalCount: 0 },
  { id: 3, name: 'Double Dhill Eggs', icon: 'mdi:egg-outline', openingStock: 0, purchaseToday: 0, soldToday: 0, closingSystem: 0, physicalCount: 0 },
  { id: 4, name: 'Medium/Small Size Eggs', icon: 'mdi:egg-easter', openingStock: 0, purchaseToday: 0, soldToday: 0, closingSystem: 0, physicalCount: 0 },
  { id: 5, name: 'Deshi Eggs', icon: 'mdi:food-drumstick', openingStock: 0, purchaseToday: 0, soldToday: 0, closingSystem: 0, physicalCount: 0 }
]

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Reusable section title with optional icon */
const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => {
  const theme = useTheme()
  return (
    <Stack direction='row' alignItems='center' spacing={1.5} mb={subtitle ? 0.5 : 0}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: theme.shape.borderRadius / 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          flexShrink: 0
        }}
      >
        <Icon icon={icon} fontSize={20} />
      </Box>
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

/** Difference badge chip — no hardcoded colors */
const DiffBadge = ({ diff }: { diff: number }) => {
  if (diff === 0) return <Chip label='Matched' size='small' color='success' variant='outlined' sx={{ fontWeight: 600, width: '100%', textTransform: 'capitalize' }} />
  if (diff > 0) return <Chip label={`+${diff} Excess`} size='small' color='warning' variant='outlined' sx={{ fontWeight: 600, width: '100%', textTransform: 'capitalize' }} />
  return <Chip label={`${diff} Short`} size='small' color='error' variant='outlined' sx={{ fontWeight: 600, width: '100%', textTransform: 'capitalize' }} />
}

/** KPI Summary Card */
const KpiCard = ({
  icon,
  title,
  value,
  sub,
  color = 'primary'
}: {
  icon: string
  title: string
  value: string | number
  sub?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}) => {
  const theme = useTheme()
  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius * 0.5,
        boxShadow: theme.shadows[2],
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: theme.shadows[6] }
      }}
    >
      <CardContent sx={{ p: theme.spacing(2.5) }}>
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between' mb={2}>
          <CustomAvatar skin='light' variant='rounded' color={color} sx={{ width: 44, height: 44 }}>
            <Icon icon={icon} fontSize={22} />
          </CustomAvatar>
        </Stack>
        <Typography variant='h5' fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 0.25 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
          {title}
        </Typography>
        {sub && (
          <Typography variant='caption' sx={{ color: theme.palette.text.disabled }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

/** Verification row inside a card */
const VerifyRow = ({
  label,
  value,
  highlight = false,
  colorKey
}: {
  label: string
  value: string | number
  highlight?: boolean
  colorKey?: 'success' | 'error' | 'warning' | 'text'
}) => {
  const theme = useTheme()
  const resolvedColor =
    colorKey === 'success' ? theme.palette.success.main
      : colorKey === 'error' ? theme.palette.error.main
        : colorKey === 'warning' ? theme.palette.warning.main
          : theme.palette.text.primary

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.25,
        px: 1.5,
        borderRadius: theme.shape.borderRadius * 0.25,
        bgcolor: highlight ? (colorKey === 'success' ? theme.palette.success.light + '18' : colorKey === 'error' ? theme.palette.error.light + '18' : theme.palette.warning.light + '18') : 'transparent',
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

/** Mobile egg stock card */
const EggMobileCard = ({
  row,
  onPhysicalChange
}: {
  row: EggRow
  onPhysicalChange: (id: number, val: number) => void
}) => {
  const theme = useTheme()
  const diff = row.physicalCount - row.closingSystem

  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius * 0.5,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': { boxShadow: theme.shadows[4] },
        transition: 'box-shadow 0.2s'
      }}
    >
      <CardContent sx={{ p: theme.spacing(2.5) }}>
        <Stack direction='row' alignItems='center' spacing={1.5} mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: theme.shape.borderRadius * 0.33,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.primary.light + '22',
              color: theme.palette.primary.main
            }}
          >
            <Icon icon={row.icon} fontSize={20} />
          </Box>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
            {row.name}
          </Typography>
        </Stack>

        <Grid container spacing={1.5} mb={2}>
          {[
            { label: 'Opening', val: row.openingStock },
            { label: 'Purchase', val: row.purchaseToday },
            { label: 'Sold Today', val: row.soldToday },
            { label: 'System Stock', val: row.closingSystem }
          ].map(item => (
            <Grid item xs={6} key={item.label}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: theme.shape.borderRadius * 0.25,
                  bgcolor: theme.palette.action.hover,
                  textAlign: 'center'
                }}
              >
                <Typography variant='caption' sx={{ color: theme.palette.text.secondary }} display='block'>
                  {item.label}
                </Typography>
                <Typography variant='body2' fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                  {item.val.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box mb={1.5}>
          <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }} display='block' mb={0.75}>
            Physical Count
          </Typography>
          <TextField
            type='number'
            size='medium'
            fullWidth
            value={row.physicalCount}
            onChange={e => onPhysicalChange(row.id, Number(e.target.value))}
            InputProps={{ inputProps: { min: 0, style: { fontWeight: 700, fontSize: '1.05rem' } } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.33 } }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.25, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Difference
          </Typography>
          <DiffBadge diff={diff} />
        </Box>
      </CardContent>
    </Card>
  )
}

// ── Skeleton helpers ─────────────────────────────────────────────────────────
const KpiSkeleton = () => {
  const theme = useTheme()

  return (
    <Card sx={{ borderRadius: theme.shape.borderRadius * 0.5, boxShadow: theme.shadows[2], height: '100%' }}>
      <CardContent sx={{ p: theme.spacing(2.5) }}>
        <Skeleton variant='rounded' width={44} height={44} sx={{ mb: 2 }} />
        <Skeleton variant='text' width='60%' height={34} />
        <Skeleton variant='text' width='80%' height={20} />
      </CardContent>
    </Card>
  )
}

// ── Shared card wrapper ──────────────────────────────────────────────────────
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

const DayClosing = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { user } = useAuth()
  const shopId = user?.shop_id || user?.shop?.id

  // ── State ────────────────────────────────────────────────────────────────────
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [eggRows, setEggRows] = useState<EggRow[]>(FALLBACK_CATEGORIES)

  // Payments verification controlled state
  const [payments, setPayments] = useState({
    cash: 0,
    upi: 0,
    online: 0,
    card: 0,
    credit: 0
  })

  // Closing cash state
  const [closingCash, setClosingCash] = useState<number | string>('')

  // Session date (defaults to today)
  const [sessionDate, setSessionDate] = useState(dayjs().format('YYYY-MM-DD'))

  // Damaged eggs
  const [damaged, setDamaged] = useState<DamagedEgg>({ quantity: '', reason: '', remarks: '' })

  // Remarks
  const [remarks, setRemarks] = useState('')
  const MAX_REMARKS = 500

  // Confirmation
  const [confirmed, setConfirmed] = useState(false)

  // ── API ──────────────────────────────────────────────────────────────────────
  const fetchInventoryAndCategories = useCallback(async () => {
    if (!shopId) return
    setStockLoading(true)
    try {
      // 1. Fetch categories
      const catResponse = await axiosInstance.get('/api/v1/shop/getAllCategories')
      const categories = catResponse.data?.data?.categories || catResponse.data?.categories || []

      // 2. Fetch inventory stock
      const stockResponse = await axiosInstance.get(`/api/v1/shop/getInventoryStock?shop_id=${shopId}`)
      let stockCategories: any[] = []
      if (stockResponse.data?.success) {
        const data: StockData = stockResponse.data.data
        setStockData(data)
        stockCategories = data.categories || []
      }

      // 3. Map categories to EggRows with initial stock quantities
      const dynamicRows = categories.map((cat: any) => {
        const matchedStock = stockCategories.find(sc => sc.category_id === cat.id)
        const opening = matchedStock?.opening_count ?? 0
        const purchase = matchedStock?.purchase_count ?? 0
        const sold = matchedStock?.sold_count ?? 0
        const closing = matchedStock?.remaining_count ?? 0
        return {
          id: cat.id,
          name: cat.name || "Unknown Category",
          icon: CATEGORY_ICONS[cat.name] ?? CATEGORY_ICONS.default,
          openingStock: opening,
          purchaseToday: purchase,
          soldToday: sold,
          closingSystem: closing,
          physicalCount: closing
        }
      })
      setEggRows(dynamicRows)
    } catch (err) {
      console.error('Failed to fetch stock/category data:', err)
      toast.error('Failed to load stock data')
    } finally {
      setStockLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    fetchInventoryAndCategories()
  }, [fetchInventoryAndCategories])

  // ── Derived values ──────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    return {
      opening: eggRows.reduce((s, r) => s + r.openingStock, 0),
      purchase: eggRows.reduce((s, r) => s + r.purchaseToday, 0),
      sold: eggRows.reduce((s, r) => s + r.soldToday, 0),
      system: eggRows.reduce((s, r) => s + r.closingSystem, 0),
      physical: eggRows.reduce((s, r) => s + r.physicalCount, 0),
      diff: eggRows.reduce((s, r) => s + (r.physicalCount - r.closingSystem), 0)
    }
  }, [eggRows])

  const paymentAmounts = stockData?.totals?.payment_amounts ?? {}
  const cashSales = Number(paymentAmounts['cash'] ?? 0)
  const onlineSales = Number(paymentAmounts['upi'] ?? 0)
  const creditSales = Number(paymentAmounts['credit'] ?? 0)
  const totalSales = Number(stockData?.totals?.total_amount ?? 0)
  const totalExpense = Number(stockData?.totals?.expense_total ?? 0)
  const existingCash = Number(stockData?.totals?.existing_cash ?? 0)
  const dueAmount = Number(stockData?.totals?.due_amount ?? 0)
  const damagedCount = Number(stockData?.totals?.damaged_count ?? 0)

  const expectedCash = cashSales - totalExpense + existingCash
  const cashDiff = Number(closingCash || 0) - expectedCash
  const onlineDiff = (Number(payments.upi || 0) + Number(payments.online || 0) + Number(payments.card || 0)) - onlineSales
  const creditDiff = Number(payments.credit || 0) - dueAmount

  const cashColorKey = cashDiff === 0 ? 'success' : cashDiff > 0 ? 'warning' : 'error'
  const onlineColorKey = onlineDiff === 0 ? 'success' : onlineDiff > 0 ? 'warning' : 'error'
  const creditColorKey = creditDiff === 0 ? 'success' : creditDiff > 0 ? 'warning' : 'error'

  const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handlePhysicalChange = (id: number, val: number) => {
    setEggRows(prev => prev.map(r => r.id === id ? { ...r, physicalCount: val } : r))
  }

  const handleSaveDraft = () => toast.success('Draft saved successfully!')

  const handleSubmit = async () => {
    if (!confirmed) {
      toast.error('Please confirm before submitting.')
      return
    }

    if (eggRows.length === 0) {
      toast.error('Cannot submit day closing: Egg categories list is empty.')
      return
    }

    setStockLoading(true)
    try {
      const payload = {
        session_date: sessionDate,
        closing_cash: Number(closingCash || 0),
        categories: eggRows.map(item => ({
          category_id: item.id,
          physical_count: Number(item.physicalCount)
        })),
        payments: {
          cash: Number(payments.cash),
          upi: Number(payments.upi),
          online: Number(payments.online),
          card: Number(payments.card),
          credit: Number(payments.credit)
        }
      }

      const response = await axiosInstance.post('/api/v1/shop/closingDay', payload)
      if (response.data?.success) {
        toast.success(response.data?.message || 'Day Closing submitted successfully!')

        // Reset form states
        setClosingCash('')
        setPayments({
          cash: 0,
          upi: 0,
          online: 0,
          card: 0,
          credit: 0
        })
        setConfirmed(false)
        setRemarks('')

        // Refetch category data/stocks
        await fetchInventoryAndCategories()
      } else {
        toast.error(response.data?.message || 'Failed to submit Day Closing')
      }
    } catch (err: any) {
      console.error('Failed to submit Day Closing:', err)
      toast.error(err?.response?.data?.message || 'Something went wrong during submission')
    } finally {
      setStockLoading(false)
    }
  }


  // ────────────────────────────────────────────────────────────────────────────
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
              <Icon icon='mdi:calendar-check-outline' fontSize={24} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800} sx={{ color: theme.palette.text.primary }}>
                Day Closing
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
            SECTION 1 — KPI SUMMARY CARDS
        ══════════════════════════════════════════════════════════════════ */}
        {/* <Grid container spacing={2}>
          {stockLoading
            ? Array.from({ length: 5 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={12 / 5} key={i}>
                <KpiSkeleton />
              </Grid>
            ))
            : [
              { icon: 'mdi:cash-register', title: 'Total Sales', value: fmt(totalSales), color: 'primary' as const, sub: `Cash: ${fmt(cashSales)}` },
              { icon: 'mdi:receipt-text-outline', title: 'Total Expense', value: fmt(totalExpense), color: 'error' as const, sub: 'Today\'s expenses' },
              { icon: 'mdi:cash-clock', title: 'Expected Cash', value: fmt(expectedCash), color: 'info' as const, sub: 'Sales - Expenses' },
              { icon: 'mdi:safe', title: 'Actual Cash', value: actualCash ? fmt(Number(actualCash)) : '—', color: cashDiff === 0 && actualCash ? 'success' : 'warning' as const, sub: actualCash ? (cashDiff === 0 ? 'Matched' : cashDiff > 0 ? `+${fmt(cashDiff)} excess` : `${fmt(cashDiff)} short`) : 'Not entered' },
              { icon: 'mdi:egg-off-outline', title: 'Damaged Eggs', value: damaged.quantity ? Number(damaged.quantity).toLocaleString() : (damagedCount || '—'), color: 'error' as const, sub: damaged.reason || 'No reason provided' }
            ].map(card => (
              <Grid item xs={12} sm={6} md={4} lg={12 / 5} key={card.title}>
                <KpiCard {...card} />
              </Grid>
            ))}
        </Grid> */}

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 & 3 — EGG STOCK SUMMARY & VERIFICATION
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container>
          <Grid item xs={12} lg={9} >
            <SectionCard noPad>
              {/* Header */}
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <SectionTitle icon='mdi:egg-multiple' title='Egg Stock Summary' />
                <Stack direction='row' spacing={1}>
                  <Chip
                    size='small'
                    label={`${eggRows.filter(r => r.physicalCount === r.closingSystem).length} Matched`}
                    sx={{ fontWeight: 600, bgcolor: theme.palette.success.light + '33', color: theme.palette.success.dark, border: `1px solid ${theme.palette.success.light}` }}
                  />
                  <Chip
                    size='small'
                    label={`${eggRows.filter(r => r.physicalCount !== r.closingSystem).length} Differ`}
                    sx={{ fontWeight: 600, bgcolor: theme.palette.warning.light + '33', color: theme.palette.warning.dark, border: `1px solid ${theme.palette.warning.light}` }}
                  />
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {stockLoading ? (
                  isMobile ? (
                    <Stack spacing={2}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant='rounded' height={230} sx={{ borderRadius: theme.shape.borderRadius * 0.5 }} />)}</Stack>
                  ) : (
                    <Skeleton variant='rounded' height={280} sx={{ borderRadius: theme.shape.borderRadius * 0.25 }} />
                  )
                ) : isMobile ? (
                  /* Mobile Cards */
                  <Stack spacing={2}>
                    {eggRows.map(row => (
                      <EggMobileCard key={row.id} row={row} onPhysicalChange={handlePhysicalChange} />
                    ))}
                  </Stack>
                ) : (
                  /* Desktop Table */
                  <TableContainer sx={{ borderRadius: theme.shape.borderRadius * 0.25, border: `1px solid ${theme.palette.divider}`, overflowX: 'hidden' }}>
                    <Table stickyHeader size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          {[
                            { name: 'Category', width: '30%', align: 'left' },
                            { name: 'Opening Stock', width: '10%', align: 'left' },
                            { name: 'Purchase Stock', width: '10%', align: 'left' },
                            { name: 'Sale Stock', width: '10%', align: 'left' },
                            { name: 'Closing Stock', width: '10%', align: 'left' },
                            { name: 'Physical Count', width: '15%', align: 'center' },
                            { name: 'Difference', width: '15%', align: 'center' }
                          ].map(col => (
                            <TableCell
                              key={col.name}
                              width={col.width}
                              align={col.align as any}
                              sx={{
                                bgcolor: theme.palette.customColors?.tableHeaderBg ?? theme.palette.background.default,
                                color: theme.palette.text.secondary,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                py: 1.5,
                                px: 2,
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
                          const diff = row.physicalCount - row.closingSystem
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
                              <TableCell width="30%" align="left" sx={{ py: 1, px: 2 }}>
                                <Stack direction='row' alignItems='center' spacing={1}>
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: theme.shape.borderRadius * 0.25,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: theme.palette.primary.light + '22',
                                      color: theme.palette.primary.main,
                                      flexShrink: 0
                                    }}
                                  >
                                    <Icon icon={row.icon} fontSize={14} />
                                  </Box>
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
                                </Stack>
                              </TableCell>
                              <TableCell width="10%" align="left" sx={{ py: 1, px: 2 }}><Typography variant='body2' fontWeight={500}>{row.openingStock.toLocaleString()}</Typography></TableCell>
                              <TableCell width="10%" align="left" sx={{ py: 1, px: 2 }}><Typography variant='body2' fontWeight={500}>{row.purchaseToday.toLocaleString()}</Typography></TableCell>
                              <TableCell width="10%" align="left" sx={{ py: 1, px: 2 }}><Typography variant='body2' fontWeight={500}>{row.soldToday.toLocaleString()}</Typography></TableCell>
                              <TableCell width="10%" align="left" sx={{ py: 1, px: 2 }}>
                                <Typography variant='body2' fontWeight={700} sx={{ color: theme.palette.primary.main }}>
                                  {row.closingSystem.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell width="15%" align="center" sx={{ py: 0.75, px: 2 }}>
                                <TextField
                                  type='number'
                                  size='small'
                                  fullWidth
                                  value={row.physicalCount}
                                  onChange={e => handlePhysicalChange(row.id, Number(e.target.value))}
                                  inputProps={{
                                    min: 0,
                                    style: {
                                      fontWeight: 700,
                                      textAlign: 'center',
                                      padding: '6px 8px'
                                    }
                                  }}
                                  sx={{
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: theme.shape.borderRadius * 0.25
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell width="15%" align="center" sx={{ py: 1, px: 2 }}>
                                <DiffBadge diff={diff} />
                              </TableCell>
                            </TableRow>
                          )
                        })}

                        {/* Totals Row */}
                        <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
                          <TableCell width="30%" align="left" sx={{ py: 1.5, px: 2 }}>
                            <Typography variant='body2' fontWeight={800} sx={{ color: theme.palette.text.primary }}>
                              TOTAL
                            </Typography>
                          </TableCell>
                          <TableCell width="10%" align="left" sx={{ py: 1.5, px: 2 }}><Typography variant='body2' fontWeight={700}>{totals.opening.toLocaleString()}</Typography></TableCell>
                          <TableCell width="10%" align="left" sx={{ py: 1.5, px: 2 }}><Typography variant='body2' fontWeight={700}>{totals.purchase.toLocaleString()}</Typography></TableCell>
                          <TableCell width="10%" align="left" sx={{ py: 1.5, px: 2 }}><Typography variant='body2' fontWeight={700}>{totals.sold.toLocaleString()}</Typography></TableCell>
                          <TableCell width="10%" align="left" sx={{ py: 1.5, px: 2 }}><Typography variant='body2' fontWeight={700} sx={{ color: theme.palette.primary.main }}>{totals.system.toLocaleString()}</Typography></TableCell>
                          <TableCell width="15%" align="center" sx={{ py: 1.5, px: 2 }}><Typography variant='body2' fontWeight={700}>{totals.physical.toLocaleString()}</Typography></TableCell>
                          <TableCell width="15%" align="center" sx={{ py: 1.5, px: 2 }}><DiffBadge diff={totals.diff} /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={3}>
            <SectionCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <SectionTitle icon='mdi:clipboard-check-outline' title='Stock Verification Summary' />
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'space-between' }}>
                {/* Category-wise Differences */}
                <Stack spacing={0.5}>
                  {/* <Typography variant='caption' fontWeight={700} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }} display='block'>
                    Category Differences
                  </Typography> */}
                  {eggRows.map(row => {
                    const diff = row.physicalCount - row.closingSystem
                    const diffText = diff === 0 ? 'Matched' : `${diff > 0 ? '+' : ''}${diff}`
                    const color = diff === 0 ? 'success' : diff > 0 ? 'warning' : 'error'
                    return (
                      <VerifyRow
                        key={row.id}
                        label={row.name}
                        value={diffText}
                        highlight={diff !== 0}
                        colorKey={color}
                      />
                    )
                  })}
                </Stack>

                {/* Overall Verification Status */}
                <Box>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5} mb={2}>
                    <VerifyRow label='Total System Stock' value={totals.system.toLocaleString()} />
                    <VerifyRow label='Total Physical Stock' value={totals.physical.toLocaleString()} />
                    <VerifyRow
                      label='Total Difference'
                      value={totals.diff === 0 ? '0 (Matched)' : `${totals.diff > 0 ? '+' : ''}${totals.diff} units`}
                      highlight
                      colorKey={totals.diff === 0 ? 'success' : totals.diff > 0 ? 'warning' : 'error'}
                    />
                  </Stack>

                  <Box
                    sx={{
                      borderRadius: theme.shape.borderRadius * 0.5,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      bgcolor: totals.diff === 0 ? theme.palette.success.light + '15' : theme.palette.error.light + '15',
                      border: `1px solid ${totals.diff === 0 ? theme.palette.success.main : theme.palette.error.main}`,
                      p: 1.5,
                      gap: 1.5
                    }}
                  >
                    <Icon
                      icon={totals.diff === 0 ? 'mdi:check-circle' : 'mdi:alert-circle'}
                      fontSize={24}
                      color={totals.diff === 0 ? theme.palette.success.main : theme.palette.error.main}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant='body2'
                        fontWeight={700}
                        sx={{ color: totals.diff === 0 ? theme.palette.success.dark : theme.palette.error.dark }}
                      >
                        {totals.diff === 0 ? 'Stock Matched' : 'Difference Found'}
                      </Typography>
                      {totals.diff !== 0 && (
                        <Typography variant='caption' display='block' sx={{ color: theme.palette.text.secondary }}>
                          {Math.abs(totals.diff)} units {totals.diff > 0 ? 'surplus' : 'shortage'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>

        {/* ══════════════════════════════════════════════════════════════════
            SECTIONS 4, 5, 6 — PAYMENT VERIFICATION CARDS
        ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={3}>

          {/* ── Cash Verification ── */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <SectionTitle icon='mdi:cash' title='Cash Verification' />
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.5} mb={2}>
                <VerifyRow label='Cash Sales' value={fmt(cashSales)} />
                <VerifyRow label='Expenses (Cash)' value={fmt(totalExpense)} />
                <VerifyRow label='Cash in Counter' value={fmt(existingCash)} />
                {/* <VerifyRow label='Expected Cash' value={fmt(expectedCash)} /> */}
              </Stack>

              <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }} display='block' mb={0.75}>
                Actual Cash Count
              </Typography>
              <TextField
                type='number'
                size='small'
                fullWidth
                placeholder='Enter counted cash amount'
                value={closingCash}
                onChange={e => setClosingCash(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Typography variant='body1' fontWeight={700}>₹</Typography></InputAdornment>,
                  inputProps: { min: 0, style: { fontWeight: 700 } }
                }}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.33 } }}
              />



              {closingCash && (
                <VerifyRow
                  label='Difference'
                  value={cashDiff === 0 ? '✓ Matched' : `${cashDiff > 0 ? '+' : ''}${fmt(cashDiff)}`}
                  highlight
                  colorKey={cashColorKey}
                />
              )}
            </SectionCard>
          </Grid>

          {/* ── Online Payment Verification ── */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <SectionTitle icon='mdi:bank-transfer' title='Online Payment' />
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.5} mb={2}>
                <VerifyRow label='Online / UPI Sales' value={fmt(onlineSales)} />
                <VerifyRow label='Online Refunds' value={fmt(0)} />
                <VerifyRow label='Expected Online Amt' value={fmt(onlineSales)} />
              </Stack>

              <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }} display='block' mb={0.75}>
                UPI Received
              </Typography>
              <TextField
                type='number'
                size='small'
                fullWidth
                placeholder='Enter received UPI amount'
                value={payments.upi || ''}
                onChange={e => setPayments(prev => ({ ...prev, upi: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Typography variant='body1' fontWeight={700}>₹</Typography></InputAdornment>,
                  inputProps: { min: 0 }
                }}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.33 } }}
              />


              {(payments.upi > 0 || payments.online > 0 || payments.card > 0) && (
                <VerifyRow
                  label='Difference'
                  value={onlineDiff === 0 ? '✓ Matched' : `${onlineDiff > 0 ? '+' : ''}${fmt(onlineDiff)}`}
                  highlight
                  colorKey={onlineColorKey}
                />
              )}
            </SectionCard>
          </Grid>

          {/* ── Credit Payment Verification ── */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <SectionTitle icon='mdi:credit-card-clock-outline' title='Credit Verification' />
              <Divider sx={{ my: 2 }} />
              <Stack spacing={0.5} mb={2}>
                <VerifyRow label='Credit Sales' value={fmt(creditSales)} />
                <VerifyRow label='Receipts Against Credit' value={fmt(0)} />
                <VerifyRow label='Pending Credit (Due)' value={fmt(dueAmount)} />
              </Stack>
              <Typography variant='caption' fontWeight={600} sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }} display='block' mb={0.75}>
                Credit Received
              </Typography>
              <TextField
                type='number'
                size='small'
                fullWidth
                placeholder='Enter credit payments received'
                value={payments.credit || ''}
                onChange={e => setPayments(prev => ({ ...prev, credit: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Typography variant='body1' fontWeight={700}>₹</Typography></InputAdornment>,
                  inputProps: { min: 0 }
                }}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 0.33 } }}
              />
              {payments.credit > 0 && (
                <VerifyRow
                  label='Difference'
                  value={creditDiff === 0 ? '✓ Matched' : `${creditDiff > 0 ? '+' : ''}${fmt(creditDiff)}`}
                  highlight
                  colorKey={creditColorKey}
                />
              )}
            </SectionCard>
          </Grid>
        </Grid>





        {/* ══════════════════════════════════════════════════════════════════
            SECTION 10 — FOOTER ACTIONS (non-sticky for desktop)
        ══════════════════════════════════════════════════════════════════ */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
              width: '100%',
              mt: 2
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
                <Typography variant='body2' fontWeight={600} sx={{ color: theme.palette.text.secondary }}>
                  I confirm that all physical stock counts and payment amounts have been verified.
                </Typography>
              }
            />
            <Button
              variant='contained'
              size='large'
              disabled={!confirmed}
              startIcon={<Icon icon='mdi:check-all' />}
              onClick={handleSubmit}
              sx={{ borderRadius: theme.shape.borderRadius * 0.33, px: 4, fontWeight: 700 }}
            >
              Submit Day Closing
            </Button>
          </Box>
        )}
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
                I confirm that all stock counts and payment amounts are verified.
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

export default DayClosing
