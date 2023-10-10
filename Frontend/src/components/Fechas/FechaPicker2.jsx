import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormatDateTimeMYSQL } from "../../utils/functions/FormatDate";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const FechaPicker2 = ({ onNewFechaEntrada, disabled = false }) => {
  const [value, setValue] = useState();

  const formatFechaMYSQL = (newValue) => {
    setValue(newValue);
    onNewFechaEntrada(FormatDateTimeMYSQL(newValue._d));
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        disabled={disabled}
        value={value}
        inputFormat="DD/MM/YYYY HH:mm:ss"
        onChange={formatFechaMYSQL}
        renderInput={(params) => <TextField {...params} onKeyDown={handleKeyDown}/>}
      />
    </LocalizationProvider>
  );
};

export default FechaPicker2;
