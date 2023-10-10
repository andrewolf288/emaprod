import React from "react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { getLoteProduccionMolienda } from "./../helpers/requisicion/getLoteProduccionMolienda";

export const FilterLoteProduccion = ({ onNewInput }) => {
  const [result, setResult] = useState([]);

  const obtenerDataLoteProduccionMolienda = async () => {
    const { result } = await getLoteProduccionMolienda();
    const formatSelect = result.map((element) => {
      return {
        value: element.id, //ID DE LA PRODUCCION
        label: `${element.codLotProd} - ${element.nomProd} - ${element.fecProdIni}`, // NOMBRE DE LA FORMULA Y PRODUCTO
        id: element.id,
      };
    });
    setResult(formatSelect);
  };

  useEffect(() => {
    obtenerDataLoteProduccionMolienda();
  }, []);

  const handledChange = ({ value }) => {
    onNewInput(value);
  };

  return (
    <>
      <Select options={result} onChange={handledChange} />
    </>
  );
};
