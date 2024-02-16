import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

const defaultOption = {
  value: 0,
  label: "Selecciona un lote",
  id: 0
};

export const FilterLotesDisponibles = ({
  defaultValue = 0,
  onNewInput,
  lotesDisponibles
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const formatDataLotesDisponibles = async () => {
    const formatSelect = [
      defaultOption,
      ...lotesDisponibles.map((element, index) => {
        return {
          value: element.id,
          label: `${index + 1}. Lote: ${
            element.codLotProd
          } - Fecha vencimiento: ${element.fecVenLotProd.split(" ")[0]}`,
          id: element.id,
          lote: element.codLotProd
        };
      })
    ];
    setOptions(formatSelect);
    // verficar si defualtvalue coincide
    const defaultValueOption = formatSelect.find(
      (option) => option.id === defaultValue
    );
    if (defaultValueOption) {
      setValue(defaultValueOption);
    }
  };

  const handleChange = (event, value) => {
    onNewInput(value);
    setValue(value);
  };

  // funcion que se ejecuta cuando se construye el componente
  useEffect(() => {
    formatDataLotesDisponibles();
  }, [lotesDisponibles]);

  return (
    <Autocomplete
      options={options}
      value={value}
      disableClearable
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      isOptionEqualToValue={(option, value) => option.id == value.id}
      renderInput={(params) => <TextField {...params} size="small" />}
    />
  );
};
