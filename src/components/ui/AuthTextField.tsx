import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";
import type { SxProps, Theme } from "@mui/material/styles";

const AUTH_TEXT_FIELD_SX: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": { borderRadius: 3 },
};

export default function AuthTextField(props: TextFieldProps) {
  const { sx, required, size, ...rest } = props;

  return (
    <TextField
      {...rest}
      required={required ?? true}
      size={size ?? "medium"}
      sx={[AUTH_TEXT_FIELD_SX, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
