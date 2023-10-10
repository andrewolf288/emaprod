import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function TypeEntrada({ inputs, onChangeTipoEntrada }) {
  return (
    <Box sx={{ width: 150 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Tipo E.</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={inputs.tipoEntrada}
          label="Tipo E."
          size="small"
          onChange={onChangeTipoEntrada}
        >
          <MenuItem value={"TODO"}>TODO</MenuItem>
          <MenuItem value={"COMPRAS"}>COMPRAS</MenuItem>
          <MenuItem value={"PRODT. FINAL"}>PRODT. FINAL</MenuItem>
          <MenuItem value={"DEVOLUCIONES"}>DEVOLUCIONES</MenuItem>
          <MenuItem value={"PRODT. SELECCION"}>PRODT. SELECCION</MenuItem>
          <MenuItem value={"PRODT. MOLIENDA"}>PRODT. MOLIENDA</MenuItem>
          <MenuItem value={"PRODT. FRESCOS"}>PRODT. FRESCOS</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
