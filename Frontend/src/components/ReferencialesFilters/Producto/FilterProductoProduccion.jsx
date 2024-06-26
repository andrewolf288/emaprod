import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getProductosProduccion } from './../../../helpers/Referenciales/producto/getProductosProduccion'

export const FilterProductoProduccion = ({
  onNewInput,
  idFrescos,
  idSalPar,
  idMol
}) => {
  const [result, setResult] = useState([])
  const [selectedValue, setSelectedValue] = useState(null)

  const obtenerDataProductoProduccion = async () => {
    const resultPeticion = await getProductosProduccion(
      idFrescos,
      idSalPar,
      idMol
    )
    const formatSelect = resultPeticion?.map((element) => {
      return {
        value: element.codProd2,
        label: element.nomProd,
        id: element.id
      }
    })
    setResult(formatSelect)
  }

  useEffect(() => {
    obtenerDataProductoProduccion()
  }, [])

  const handledChange = (event, value) => {
    setSelectedValue(value) // Guarda el valor seleccionado en el estado
    onNewInput(value)
  }

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        getOptionLabel={(option) => option.label}
        value={selectedValue} // Utiliza el valor seleccionado desde el estado
        onChange={handledChange}
        onInputChange={(event, value, reason) => {
          if (reason === 'input' && value === '') {
            onNewInput({ label: value })
          }
        }}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  )
}
