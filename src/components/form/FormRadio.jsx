import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@mui/material";
import { Controller } from "react-hook-form";

const FormRadio = ({
  name,
  control,
  label,
  options,
  onChange
}) => (
  <FormControl
    fullWidth
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      flexWrap: "wrap",
      width: "100%"
    }}
  >
    <FormLabel
      sx={{
        mb: 0,
        minWidth: "150px",
        fontWeight: 600
      }}
    >
      {label}
    </FormLabel>

    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RadioGroup
          row
          value={field.value ?? ""}
          onChange={(e) => {
            field.onChange(e);
            onChange?.(e);
          }}
          sx={{
            gap: 2,
            flexWrap: "wrap"
          }}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio size="small" />}
              label={opt.label}
            />
          ))}
        </RadioGroup>
      )}
    />
  </FormControl>
);

export default FormRadio;