import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface RHFDateRangePickerProps {
    control: any;
    name: string; // This will be the name for the range [startDate, endDate]
    label?: string;
    placeholder?: string;
    mandatory?: boolean;
}

const RHFDateRangePicker: React.FC<RHFDateRangePickerProps> = ({
    control,
    name,
    label,
    placeholder,
    mandatory,
}) => {
    return (
        <Box>
            {label && (
                <Typography className="input-label" sx={{ mb: 1 }}>
                    {label}
                    {mandatory && <span style={{ color: 'red' }}>*</span>}
                </Typography>
            )}
            <Controller
                name={name}
                control={control}
                defaultValue={[null, null]}
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                    const [startDate, endDate] = value || [null, null];

                    return (
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update: [Date | null, Date | null]) => {
                                onChange(update);
                            }}
                            isClearable={true}
                            placeholderText={placeholder || "Select Date Range"}
                            customInput={
                                <TextField
                                    fullWidth
                                    size="small"
                                    error={!!error}
                                    helperText={error?.message}
                                    autoComplete="off"
                                />
                            }
                            dateFormat="dd/MM/yyyy"
                        />
                    );
                }}
            />
        </Box>
    );
};

export default RHFDateRangePicker;
