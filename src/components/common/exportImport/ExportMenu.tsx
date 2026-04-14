import { Button, Menu, MenuItem } from '@mui/material'
import React from 'react'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { Icon } from '@iconify/react';

interface Props {
    handleSelectedExport: any
    handleExport: any
    handleExportView: any
}
export default function ExportMenu({ handleSelectedExport, handleExport, handleExportView }: Props) {
    const [openExportData, setExportData] = React.useState(null)
    const openExport = Boolean(openExportData);

    const handleClickOpenExportmenu = (event:any) => {
        setExportData(event.currentTarget);
    };

    const handleCloseExportMenu = () => {
        setExportData(null);
    };
    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                // fullWidth
                onClick={handleClickOpenExportmenu}
                endIcon={<Icon icon="material-symbols:upload" />}
            >
                Export
            </Button>
            <Menu
                id="demo-customized-menu"
                MenuListProps={{ 'aria-labelledby': 'demo-customized-button' }}
                anchorEl={openExportData}
                open={openExport}
                onClose={handleCloseExportMenu}
            >
                <MenuItem onClick={handleSelectedExport} disableRipple>
                    Export Selected
                </MenuItem>
                <MenuItem onClick={handleExport} disableRipple>
                    Export All
                </MenuItem>
                <MenuItem onClick={handleExportView} disableRipple>
                    Export View
                </MenuItem>
            </Menu>
        </>
    )
}
