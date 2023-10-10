import React from "react";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getAllProductos } from "./../../../helpers/Referenciales/producto/getAllProductos";
import { useAuth } from "../../../hooks/useAuth";

export const FilterAllProductos = ({
  onNewInput,
  inputs,
  productos,
  mostrarCodigo,
}) => {
  const [result, setResult] = useState([]);
  const [value, setValue] = useState({
    label: "",
  });

  const { user } = useAuth();
  const obtenerDataProductos = async () => {
    const resultPeticion = await getAllProductos(user);
    var formatSelect = resultPeticion.map((element) => {
      return {
        item: element,
        value: element.codProd2 === null ? "000000" : element.codProd2,
        label: element.nomProd,
        id: element.id,
        idProdFin: "", // only if products has records
      };
    });

    if (productos?.length) {
      var rows = [];
      formatSelect.map((obj) => {
        var producto = productos.find((val) => val.idProdt == obj.id);
        if (producto) {
          obj.idProdFin = producto.id;
          rows.push(obj);
        }
      });
      //formatSelect = formatSelect.filter((obj) => productos.includes(obj.id));
      setResult(rows);
    } else {
      setResult(formatSelect);
    }
  };

  useEffect(() => {
    obtenerDataProductos();
  }, [productos]);

  useEffect(() => {
    if (inputs?.producto) {
      //console.log(inputs?.producto)
      setValue(inputs?.producto);
    }
  }, [inputs]);

  const handledChange = (event, value) => {
    setValue(value);
    onNewInput(value);
  };

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        autoHighlight={true}
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : (mostrarCodigo && option.value ? option.value + " - " : "") +
              option.label
        }
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {(mostrarCodigo ? option.value + " - " : "") + option.label}
            </li>
          );
        }}
        value={value}
        onInputChange={(event, value, reason) => {
          if (reason == "input" && value == "") {
            onNewInput({ label: value });
          }
        }}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  );
};
