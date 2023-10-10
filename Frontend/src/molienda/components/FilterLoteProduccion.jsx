import React from "react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { getLoteProduccionMolienda } from "./../helpers/requisicion/getLoteProduccionMolienda";

export const FilterLoteProduccion = ({ onNewInput, produccion }) => {
  const [result, setResult] = useState([]);
  const [value, setValue] = useState({
    value: "none",
    label: "NINGUNO",
    id: "none",
  });

  const obtenerDataLoteProduccionMolienda = async () => {
    const { result } = await getLoteProduccionMolienda();
    var formatSelect = result.map((element) => {
      return {
        value: element.id, //ID DE LA PRODUCCION
        label: `${element.codLotProd} - ${element.nomProd} - ${element.fecProdIni}`, // NOMBRE DE LA FORMULA Y PRODUCTO
        id: element.id,
      };
    });
    formatSelect = [
      ...[{ value: "none", label: "NINGUNO", id: "none" }],
      ...formatSelect,
    ];
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataLoteProduccionMolienda();
  }, []);

  useEffect(() => {
    if (produccion) {
      //setValue(produccion);
    }
  }, [produccion]);

  const handledChange = (item) => {
    onNewInput(item.value);

    //console.log(item);
    setValue(item);
  };

  return (
    <>
      <Select options={result} value={value || {}} onChange={handledChange} />
    </>
  );
};
