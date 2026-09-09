import { TextField, InputAdornment } from "@mui/material";
import { Controller } from "react-hook-form";

const FormInput = ({ name, control, label, startAdornment, endAdornment, InputProps = {}, required = false, rules, ...props }) => {
  const mergedInputProps = {
    ...InputProps,
  };

  if (startAdornment) {
    mergedInputProps.startAdornment = (
      <InputAdornment position="start">
        {startAdornment}
      </InputAdornment>
    );
  }

  if (endAdornment) {
    mergedInputProps.endAdornment = (
      <InputAdornment position="end">
        {endAdornment}
      </InputAdornment>
    );
  }

  const validationRules = required
    ? { required: `${label || name} is required` }
    : undefined;
  const resolvedRules = validationRules || rules
    ? { ...(validationRules || {}), ...(rules || {}) }
    : undefined;

  return (
    <Controller
      name={name}
      control={control}
      rules={resolvedRules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          size="small"
          fullWidth
          required={required}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          value={field.value ?? ""}
          onChange={field.onChange}
          InputProps={mergedInputProps}
        />
      )}
    />
  );
};

export default FormInput;