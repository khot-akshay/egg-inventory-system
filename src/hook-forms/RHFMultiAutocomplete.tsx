import * as React from 'react';
import { Autocomplete, TextField, Button, Box, InputLabel } from '@mui/material';
import { useController } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useState } from 'react';

interface RHFMultiAutoCompleteProps {
    control: any; // You should replace `any` with the appropriate type for the control prop
    name: string;
    options: any[]; // You should replace `string[]` with the appropriate type for the options prop
    placeholder?: string;
    resetApiFunction?: () => void;
    label?: string
    button_label?: string
    addbtn?: boolean
    mandatory?: boolean
    label_header?: string
    onClick?: () => void
    defaultValue: any
    setCurrentPage: any
    loadMore: any
    setSearchParams: any
    hasMore: boolean
    isLoading: boolean
    multiple?: boolean

    // Add any additional props you want to accept
}

const RHFMultiAutoComplete: React.FC<RHFMultiAutoCompleteProps> = ({ control, name, options, placeholder, resetApiFunction,
    label, button_label, mandatory, label_header, addbtn, onClick, defaultValue, setCurrentPage, loadMore, setSearchParams, hasMore, isLoading, multiple, ...rest
}) => {
    const {
        field: { value, onChange },
        fieldState: { invalid, error },
    } = useController({
        name,
        control,
        // defaultValue: defaultValue,
    });
    const [loading, setLoading] = useState(false);
    const [allOptions, setAllOptions] = useState(options);
    const [selectedValue, setSelectedValue] = React.useState<[] | null>(multiple ? [] : null)
    React.useEffect(() => {
        if (defaultValue) {
            if(!multiple){

                const defaultSelected = options.find((item) => item.id === +defaultValue.id);
                setSelectedValue(defaultSelected || null);
            }else{
                const defaultSelected = options.filter((item) => defaultValue.some((val) => val.id === item.id));
        setSelectedValue(defaultSelected.length > 0 ? defaultSelected : []);
            }
            // onChange(defaultSelected); 
        }
    }, [defaultValue, options]);
    const handleScroll = (event) => {
        const listboxNode = event.target;
        if (
            !isLoading &&
            hasMore &&
            listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight
        ) {
            setCurrentPage((prev) => prev + 1)
        }
    }
    return (
        <>
            <Box >
                <label style={{ marginTop: '12px' }}>
                    {label} {mandatory && <span style={{ color: 'red' }}>*</span>}
                </label>
                <label style={{ marginLeft: '2px', paddingTop: '6px', fontWeight: 100, color: 'grey', fontSize: '14px' }}>
                    {label_header}
                </label>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            limitTags={2}
                            {...rest}
                            size='small'
                            multiple={multiple}
                            ListboxProps={{
                                onScroll: handleScroll,
                                style: { maxHeight: 300, overflow: 'auto' },
                            }}
                            options={options}
                            getOptionLabel={(option) => option?.label}
                            // value={value}
                            value={selectedValue}
                            onInputChange={(event, newValue) => {

                                // if (newValue) {

                                //   setSearchParams(newValue)
                                // } else {
                                //   setSearchParams('')
                                // }
                            }}
                            style={{ borderRadius: '8px', textransform: 'capitalize', }} // Apply border radius here
                            onChange={(event, newValue) => {

                                field.onChange(newValue ? newValue : {});
                                setSelectedValue(newValue);

                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size='small'
                                    placeholder={placeholder}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    sx={{
                                        fieldset: {
                                            borderRadius: '8px',
                                        },
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option?.value || option?.id}>
                                    {option?.label}
                                </li>
                            )}
                            loading={isLoading}
                            loadingText="Loading options..."
                            noOptionsText="No options available"
                        />
                    )}
                />
                {addbtn && (<Button onClick={onClick} sx={{ textTransform: 'none !important', pl: 0 }}><ControlPointIcon style={{ marginRight: '3px' }} />{button_label}</Button>)}
            </Box>
        </>
    );
};

export default RHFMultiAutoComplete;
