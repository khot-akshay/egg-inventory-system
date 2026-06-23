import React, { useState } from 'react'
import { Button, CircularProgress, Menu, MenuItem } from '@mui/material'
import axiosInstance from 'src/services/axios'
import { exportData } from 'src/utils/exportdata'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

interface ExportButtonProps {
    apiUrl?: string
    fileName: string
    label?: string
    params?: any
    data?: any[] // Optional local data override (current view)
    columns: any[] // Required for mapping
    selectedIds?: (string | number)[]
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    variant?: 'text' | 'outlined' | 'contained'
}

const ExportButton: React.FC<ExportButtonProps> = ({
    apiUrl,
    fileName,
    label = 'Export',
    params = {},
    data,
    columns,
    selectedIds = [],
    color = 'primary',
    variant = 'contained'
}) => {
    const [loading, setLoading] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const processAndExport = (dataToProcess: any[]) => {
        if (Array.isArray(dataToProcess) && dataToProcess.length > 0) {
            const transformedData = dataToProcess.map((row: any) => {
                const mappedRow: any = {}
                columns.forEach((col: any) => {
                    if (col.headerName && col.field !== 'actions') {
                        let value = 'NA'
                        if (typeof col.valueGetter === 'function') {
                            value = col.valueGetter({
                                row,
                                value: row[col.field],
                                field: col.field,
                                id: row.id,
                                api: {
                                    getAllRowIds: () => dataToProcess.map((r: any) => r.id)
                                }
                            })
                        } else if (col.field && row[col.field] !== undefined) {
                            value = row[col.field]
                        }

                        if (typeof value === 'object' && value !== null) {
                            const obj = value as any
                            value = obj.name ?? obj.label ?? obj.title ?? obj.order_number ?? obj.id ?? JSON.stringify(obj)
                        }
                        mappedRow[col.headerName] = value ?? 'NA'
                    }
                })
                return mappedRow
            })
            exportData(transformedData, fileName)
            toast.success(`${label} completed successfully.`)
        } else {
            toast.error('No data available to export.')
        }
    }

    const handleExportAction = async (type: 'all' | 'selected' | 'view') => {
        handleClose()
        setLoading(true)
        try {
            let dataToProcess = []

            if (type === 'view') {
                dataToProcess = data || []
            } else if (apiUrl) {
                let exportParams = { ...params }
                if (type === 'selected') {
                    if (selectedIds.length === 0) {
                        toast.error('Please select at least one row to export.')
                        setLoading(false)
                        return
                    }
                    exportParams.exportType = 'select'
                    exportParams.ids = selectedIds.join(',')
                } else if (type === 'all') {
                    delete exportParams.pageNo
                    delete exportParams.limit
                    exportParams.exportAll = true
                }

                const response = await axiosInstance.get(apiUrl, { params: exportParams })
                dataToProcess = response.data?.data?.data ?? response.data?.data ?? response.data
            }

            processAndExport(dataToProcess)
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Failed to export data.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Button
                variant={variant}
                color={color}
                onClick={handleClick}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Icon icon="mdi:file-export-outline" />}
                endIcon={<ArrowDropDownIcon />}
                sx={{ textTransform: 'none' }}
                fullWidth
            >
                {loading ? 'Exporting...' : label}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={() => handleExportAction('all')}>Export All</MenuItem>
                <MenuItem onClick={() => handleExportAction('selected')} disabled={selectedIds.length === 0}>
                    Export Selected
                </MenuItem>
                <MenuItem onClick={() => handleExportAction('view')}>Export View</MenuItem>
            </Menu>
        </div>
    )
}

export default ExportButton
