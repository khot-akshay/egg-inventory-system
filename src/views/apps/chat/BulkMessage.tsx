// ** React Imports
import { useState } from 'react'


// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import List from '@mui/material/List'
import Avatar from '@mui/material/Avatar'
import ListItem from '@mui/material/ListItem'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'

import toast from 'react-hot-toast'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axiosInstance from "../../../services/axios";
import { InputAdornment, TextField } from '@mui/material'


export default function BulkMsgDialog({ show, handleclose, store, isTemplateMsg, handleSelectedOperators }) {
    const [checked, setChecked] = useState<number[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [inputVal, setInputVal] = useState("");

    const handleToggle = (value: number) => () => {
        const currentIndex = checked.indexOf(value)
        const newChecked = [...checked]

        if (currentIndex === -1) {
            newChecked.push(value)
        } else {
            newChecked.splice(currentIndex, 1)
        }

        setChecked(newChecked)

    }

    const handleSendBulkMessage = async () => {

        if (!message) {
            toast.error('Message can not be empty')
        } else if (!checked) {
            toast.error('Select operators')
        } else {
            try {
                setLoading(true)

                const response = await axiosInstance.post('/admin/v1/telegram/send-message', {
                    text: message,
                    customers: checked
                })
                handleclose()
                if (response.data.success) {
                    toast.success('Message sent')
                }
            } catch (e) {
                toast.error('Failed to send message')
            } finally {
                setLoading(false)
            }

        }
    }
    const handleTemplateMsg = () => {
        handleSelectedOperators(checked)
        handleclose()
    }
    return (
        <>
            <Dialog fullWidth open={show} onClose={handleclose} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}>
                <DialogContent sx={{ pb: 4 }}>
                    {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                       
                    </Box> */}

                    <TextField
                        fullWidth
                        size='small'
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder='Search for contact...'
                        sx={{ '& .MuiInputBase-root': { borderRadius: 5 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start' sx={{ color: 'text.secondary' }}>
                                    <Icon icon='bx:search' fontSize={20} />
                                </InputAdornment>
                            )
                        }}
                    />
                    {!isTemplateMsg ?(

                    <List>
                        {store
                            .filter((filteredValue) => filteredValue?.name && filteredValue?.name?.toLowerCase().includes(inputVal?.toLowerCase()))
                            .map((item) => (
                                 !!item.replied_on_telegram  && (
                                    <ListItem key={item.id} disablePadding>
                                        <ListItemButton onClick={handleToggle(item.id)}>
                                            <ListItemAvatar>
                                                <Avatar src={item.avatar} alt={item.name} sx={{ height: 32, width: 32 }} />
                                            </ListItemAvatar>
                                            <ListItemText id={`checkbox-list-label-${item.id}`} primary={item.name} />
                                            <ListItemSecondaryAction>
                                                <Checkbox
                                                    edge='end'
                                                    tabIndex={-1}
                                                    disableRipple
                                                    onChange={handleToggle(item.id)}
                                                    checked={checked.indexOf(item.id) !== -1}
                                                    inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItemButton>
                                    </ListItem>
                                )
                            ))}
                    </List>
                    ):(
                      
                    <List>
                    {store
                        .filter((filteredValue) => filteredValue?.name && filteredValue?.name?.toLowerCase().includes(inputVal?.toLowerCase()))
                        .map((item) => (
                            
                                <ListItem key={item.id} disablePadding>
                                    <ListItemButton onClick={handleToggle(item.id)}>
                                        <ListItemAvatar>
                                            <Avatar src={item.avatar} alt={item.name} sx={{ height: 32, width: 32 }} />
                                        </ListItemAvatar>
                                        <ListItemText id={`checkbox-list-label-${item.id}`} primary={item.name} />
                                        <ListItemSecondaryAction>
                                            <Checkbox
                                                edge='end'
                                                tabIndex={-1}
                                                disableRipple
                                                onChange={handleToggle(item.id)}
                                                checked={checked.indexOf(item.id) !== -1}
                                                inputProps={{ 'aria-labelledby': `checkbox-list-label-${item.id}` }}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItemButton>
                                </ListItem>
                            
                        ))}
                </List>  
                    )}
                    {!isTemplateMsg && (
                        <>



                            <TextField onChange={(e) => setMessage(e.target.value)} fullWidth label='Type Message...' multiline minRows={4} maxRows={4} />
                        </>
                    )

                    }
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', }}>
                    {isTemplateMsg ? (
                        <Button disabled={loading} onClick={handleTemplateMsg} variant='contained' sx={{ mr: 1.5 }}>
                            Select
                        </Button>
                    ) : (
                        <Button disabled={loading} onClick={handleSendBulkMessage} variant='contained' sx={{ mr: 1.5 }}>
                            Send
                        </Button>
                    )}

                    <Button variant='outlined' color='secondary' onClick={handleclose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
