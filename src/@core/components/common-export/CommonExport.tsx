import React from 'react'
import { IconButton, IconButtonProps, useTheme, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

import { GridColDef } from '@mui/x-data-grid'

interface CommonExportProps extends Partial<IconButtonProps> {
  data: any[]
  columns?: GridColDef[]
  headers?: string[]
  transform?: (item: any, index: number) => (string | number)[]
  fileName?: string
  tooltipTitle?: string
}

const CommonExport: React.FC<CommonExportProps> = ({
  data,
  columns,
  headers,
  transform,
  fileName = 'export',
  tooltipTitle = 'Download',
  sx,
  ...rest
}) => {
  const theme = useTheme()

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      const exportColumns = columns ? columns.filter(col => col.field !== 'actions') : []
      const finalHeaders = headers || exportColumns.map(col => col.headerName || col.field)
      
      let csvRows = [finalHeaders.join(',')]

      data.forEach((item, index) => {
        let rowData: (string | number)[] = []
        if (transform) {
          rowData = transform(item, index)
        } else if (columns) {
          rowData = exportColumns.map(col => {
            // Try to get value by field name
            const val = item[col.field]
            const str = String(val ?? '')
            return `"${str.replace(/"/g, '""')}"`
          })
        } else {
          // Fallback: try to match values
          rowData = Object.values(item).map(val => {
            const str = String(val ?? '')
            return `"${str.replace(/"/g, '""')}"`
          })
        }
        csvRows.push(rowData.join(','))
      })

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        sx={{
          width: 32,
          height: 32,
          borderRadius: "6px",
          border: "1px solid #D1D5DB",
          bgcolor: "transparent",
          color: "text.primary",
          transition: "all 0.25s ease",
          "&:hover": {
            bgcolor: theme.palette.primary.main,
            color: "#FFFFFF",
            border: "none",
          },
          ...sx
        }}
        onClick={handleExport}
        {...rest}
      >
        <Icon icon="material-symbols:download" width={20} />
      </IconButton>
    </Tooltip>
  )
}

export default CommonExport
