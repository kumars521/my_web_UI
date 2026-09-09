import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller } from "react-hook-form";

const FormCheckbox = ({ name, control, label, disabled = false }) => (
<Controller
  name={name}
  control={control}
  defaultValue={false}   // ✅ extra safety
  render={({ field }) => (
    <FormControlLabel
      sx={{ width: "100%", margin: 0 }}
      control={
        <Checkbox
          checked={field.value ?? false}
          disabled={disabled}
          onChange={(e) => field.onChange(e.target.checked)}
        />
      }
      label={label}
    />
  )}
/>
);

export default FormCheckbox;