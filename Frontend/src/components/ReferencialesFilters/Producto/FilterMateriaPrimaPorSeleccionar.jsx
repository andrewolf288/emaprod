import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getMateriaPrimaPorSeleccionar } from './../../../helpers/Referenciales/producto/getMateriaPrimaPorSeleccionar'

const defaultOption = {
  value: 0,
  label: 'Selecciona una materia prima',
  id: 0
}

export const FilterMateriaPrimaPorSeleccionar = ({
  defaultValue = 0,
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProducto = async () => {
    const result = await getMateriaPrimaPorSeleccionar()
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2,
          label: `${element.codProd2} - ${element.nomProd}`,
          id: element.id
        }
      })
    ]
    setOptions(formatSelect)
    // verficar si defualtvalue coincide
    const defaultValueOption = formatSelect.find(
      (option) => option.id === defaultValue
    )
    if (defaultValueOption) {
      setValue(defaultValueOption)
    }
  }

  const handleChange = (event, value) => {
    onNewInput(value)
    setValue(value)
  }

  // la llamada a la base de datos solo se da una vez
  useEffect(() => {
    const controller = new AbortController()
    obtenerDataProducto()
    return () => controller.abort()
  }, [])

  // esto se llama cada vez que se da un cambio en el defaultValue
  useEffect(() => {
    // verficar si defualtvalue coincide
    const defaultValueOption = options.find(
      (option) => option.id === defaultValue
    )
    if (defaultValueOption) {
      setValue(defaultValueOption)
    }
  }, [defaultValue])

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
  )
}
