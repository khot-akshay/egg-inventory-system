import React, { useState } from 'react';
import { useController, Controller } from 'react-hook-form';
import { Select, MenuItem, Checkbox, ListItemText, OutlinedInput, FormControl, InputLabel } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface Option {
  id: number;
  name: string;
}

interface RHFSelectProps {
  name: string;
  control: any;
  options: Option[];
  multiple: boolean;
  onChange: (value: any) => void;
}

const RHFSelectName: React.FC<RHFSelectProps> = ({ name, control, options, multiple, onChange }) => {
  const {
    field: { onChange: onFieldChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]); // Assuming option ids are numbers

  const handleCheckboxChange = (optionId: number) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(optionId)
        ? prevSelected.filter((id) => id !== optionId)
        : [...prevSelected, optionId]
    );
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={multiple ? [] : ''}
        render={({ field }) => (
          <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel id={`${name}-label`}>Tag</InputLabel>
            <Select
              {...field}
              labelId={`${name}-label`}
              id={name}
              multiple={multiple}
            //   input={<OutlinedInput label="Tag" />}
              renderValue={(selected) => {
                if (multiple) {
                  return (selected as number[]).map((id) => {
                    const option = options.find((opt) => opt.id === id);
                    return option ? option.name : '';
                  }).join(', ');
                } else {
                  const option = options.find((opt) => opt.id === selected);
                  return option ? option.name : '';
                }
              }}
              MenuProps={MenuProps}
            >
              {options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleCheckboxChange(option.id)}
                  />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
      {invalid && <span style={{ fontSize: '0.75rem', color: '#d32f2f', marginRight: '14px', marginLeft: '14px', fontWeight: 400, marginTop: '3px' }}>{error?.message}</span>}
    </>
  );
};

export default RHFSelectName;
