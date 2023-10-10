import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormatDateTimeMYSQL } from "../../utils/functions/FormatDate";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const FechaPickerDay = ({ onNewfecEntSto }) => {
  const [value, setValue] = useState();

  const formatFechaMYSQL = (newValue) => {
    setValue(newValue);
    onNewfecEntSto(FormatDateTimeMYSQL(newValue._d));
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        value={value}
        inputFormat="DD/MM/YYYY"
        onChange={formatFechaMYSQL}
        renderInput={(params) => (
          <TextField size="small" {...params} onKeyDown={handleKeyDown} />
        )}
      />
    </LocalizationProvider>
  );
};

export default FechaPickerDay;
