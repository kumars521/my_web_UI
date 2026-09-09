import { FormControl, FormHelperText, InputLabel, Select, MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";

const FormSelect = ({ name, control, label, options, onChange, disabled = false, sx, required = false, rules, ...props }) => {
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
        <FormControl fullWidth size="small" sx={{ width: "100%" }} error={!!fieldState.error}>
          <InputLabel required={required}>{label}</InputLabel>
          <Select
            label={label}
            {...field}
            {...props}
            value={field.value ?? ""}
            disabled={disabled}
            required={required}
            sx={sx}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          >
            {(options || []).map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error?.message && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default FormSelect;