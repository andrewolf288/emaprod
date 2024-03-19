import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getEncargadoCalidad } from '../../../helpers/Referenciales/encargado_calidad/getEncargadoCalidad'

const defaultOption = {
  value: null,
  label: 'Selecciona un encargado',
  id: null
}

export const FilterEncargadoCalidad = ({ defaultValue = null, onNewInput }) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProducto = async () => {
    let result = await getEncargadoCalidad()
    result = result.filter(
      (element) => element.idCla !== 2 && element.idCla !== 4
    )
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
          label: element.nomEncCal,
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

  useEffect(() => {
    const controller = new AbortController()
    obtenerDataProducto()
    return () => controller.abort()
  }, [])

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
