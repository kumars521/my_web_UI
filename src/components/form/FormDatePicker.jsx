import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";

const FormDatePicker = ({ name, control, label }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <DatePicker
        label={label}
        value={field.value ?? null}     // ✅ FIX (use null, not "")
        onChange={field.onChange}
        slotProps={{
          textField: { size: "small", fullWidth: true }
        }}
      />
    )}
  />
);

export default FormDatePicker;