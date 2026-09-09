import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

const FormTextArea = ({ name, control, label, ...props }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        {...props}
        label={label}
        size="small"
         // or "150px"
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        value={field.value ?? ""}   // ✅ FIX: always controlled
        onChange={field.onChange}   // ✅ FIX
      />
    )}
  />
);

export default FormTextArea;