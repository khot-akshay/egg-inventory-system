import * as React from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel, FormHelperText, Checkbox, Grid } from '@mui/material';
import { useController } from 'react-hook-form';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { checkboxClasses } from "@mui/material/Checkbox";

interface RHFCheckboxGroupProps {
  control: any; // React Hook Form control object (you might want to define a specific type for this)
  name: string; // Name of the checkbox group
  options: { label: string; id?: any }[]; // Array of options for the checkbox group
  grid?: boolean; // Optional prop indicating whether to use a grid layout for checkboxes
  // Any other additional props
}

const RHFCheckboxGroup: React.FC<RHFCheckboxGroupProps> = ({ control, name, options, grid, ...rest }) => {
  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const handlecheckbox = (optionValue: any) => {
    let newValue;
    if (value.includes(optionValue)) {
      newValue = value.filter((name: any) => name !== optionValue);
    } else {
      newValue = [...value, optionValue];
    }
  
    onFieldChange(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <FormControl required error={invalid} component="fieldset" variant="standard" {...rest}>
      <FormGroup>
        <Grid container>
          {options.map((option, index) => (
            <Grid item xs={12}  key={index}>
              <FormControlLabel
                control={
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon sx={{ borderRadius: 20, fontWeight: 500 }} />}
                    name={option.id}
                    checked={value.includes(option.id)}
                    onChange={() => handlecheckbox(option.id)}
                  />
                }
                label={option.label}
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>
      <FormHelperText>{error ? error.message : ''}</FormHelperText>
    </FormControl>
  );
};

export default RHFCheckboxGroup;
