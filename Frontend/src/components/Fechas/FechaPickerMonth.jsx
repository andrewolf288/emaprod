import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormatDateTimeMYSQL } from "../../utils/functions/FormatDate";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const FechaPickerMonth = ({ onNewfecEntSto, label }) => {
  const [value, setValue] = useState();

  const formatFechaMYSQL = (newValue) => {
    setValue(newValue);
    onNewfecEntSto(FormatDateTimeMYSQL(newValue._d));
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        label={label}
        value={value}
        inputFormat="DD/MM/YYYY"
        views={["year", "month", "day"]}
        onChange={formatFechaMYSQL}
        renderInput={(params) => (
          <TextField size="small" {...params} onKeyDown={handleKeyDown}/>
        )}
      />
    </LocalizationProvider>
  );
};

export default FechaPickerMonth;
