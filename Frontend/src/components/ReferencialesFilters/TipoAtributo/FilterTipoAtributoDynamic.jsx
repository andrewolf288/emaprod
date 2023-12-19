import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

const defaultOption = {
  value: 0,
  label: "Selecciona un tipo atributo",
  id: 0
};

const data = [
  { id: "N", nomTipAtr: "Numerico" },
  { id: "T", nomTipAtr: "Texto" },
  { id: "B", nomTipAtr: "Booleano" },
  { id: "O", nomTipAtr: "Opciones" }
];

export const FilterTipoAtributoDynamic = ({
  defaultValue = null,
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataMateriaPrima = async () => {
    const formatSelect = [
      defaultOption,
      ...data.map((element) => {
        return {
          value: element.id,
          label: `${element.nomTipAtr}`,
          id: element.id
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

  useEffect(() => {
    const controller = new AbortController();
    obtenerDataMateriaPrima();
    return () => controller.abort();
  }, []);

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
