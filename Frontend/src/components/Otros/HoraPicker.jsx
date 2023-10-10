import React, { useState } from "react";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const HoraPicker = ({ onNewHoraEntrada }) => {
  const [value, setValue] = useState();
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <TimePicker
        label="Hora"
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          console.log(newValue);
          onNewHoraEntrada(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};

export default HoraPicker;
