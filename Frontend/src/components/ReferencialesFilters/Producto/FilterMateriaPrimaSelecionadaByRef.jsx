import React, { useEffect, useState } from "react";
import { getMateriaPrimaByRef } from "../../../helpers/Referenciales/producto/getMateriPrimaByRef";
import { Autocomplete, TextField } from "@mui/material";

const defaultOption = {
  value: 0,
  label: "Selecciona una materia prima",
  id: 0,
};

export const FilterMateriaPrimaSelecionadaByRef = ({
  defaultValue = 0,
  onNewInput,
  prodRef,
}) => {
  const [options, setOptions] = useState([defaultOption]);
  const [value, setValue] = useState(defaultOption);

  const obtenerDataProducto = async () => {
    var { result } = await getMateriaPrimaByRef(prodRef);
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2,
          label: `${element.codProd2} - ${element.nomProd}`,
          id: element.id,
        };
      }),
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

  // la llamada a la base de datos solo se da una vez
  useEffect(() => {
    const controller = new AbortController();
    obtenerDataProducto();
    return () => controller.abort();
  }, []);

  // esto se llama cada vez que se da un cambio en el defaultValue
  useEffect(() => {
    // verficar si defualtvalue coincide
    const defaultValueOption = options.find(
      (option) => option.id === defaultValue
    );
    if (defaultValueOption) {
      setValue(defaultValueOption);
    }
  }, [defaultValue]);

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
