import React, { useState, useEffect } from 'react'

import Select from 'react-select'
import { getEstadosEntradasStock } from './../../../almacen/helpers/entradas-stock/getEstadosEntradaStock'

export const FilterEstadoEntrada = ({ onNewInput }) => {
  const [result, setResult] = useState([])

  const obtenerDataEstadoEntradaStock = async () => {
    const resultPeticion = await getEstadosEntradasStock()
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desEntStoEst,
        id: element.id
      }
    })
    formatSelect.unshift({
      value: 0,
      label: 'Ambos',
      id: 0
    })
    setResult(formatSelect)
  }

  useEffect(() => {
    obtenerDataEstadoEntradaStock()
  }, [])

  const handledChange = (value) => {
    onNewInput(value)
  }

  return (
    <>
      <Select options={result} onChange={handledChange} />
    </>
  )
}
