import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getPresentacionFinal } from '../../../helpers/Referenciales/producto/getPresentacionFinal'

const defaultOption = {
  value: 0,
  label: 'Selecciona una presentacion final',
  id: 0
}

export const FilterPresentacionFinalDynamic = ({
  onNewInput,
  idProdt,
  defaultValue = 0
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProductos = async () => {
    const result = await getPresentacionFinal(idProdt)
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2 === null ? '000000' : element.codProd2,
          label: element.nomProd,
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

  // use effect cuando se carga el componente
  useEffect(() => {
    const controller = new AbortController()
    obtenerDataProductos()
    return () => controller.abort()
  }, [])

  // cuando cambia el producto intermedio
  useEffect(() => {
    obtenerDataProductos()
  }, [idProdt])

  // use effect para cuando hay cambios en el valor por defecto
  useEffect(() => {
    // verficar si defualtvalue coincide
    const defaultValueOption = options.find(
      (option) => option.id === defaultValue
    )
    if (defaultValueOption) {
      setValue(defaultValueOption)
    }
  }, [defaultValue])

  const handleChange = (event, value) => {
    onNewInput(value)
    setValue(value)
  }

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
