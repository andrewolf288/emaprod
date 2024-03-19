import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'

const defaultOption = {
  value: 0,
  label: 'Selecciona un producto',
  id: 0
}

export const FilterProductosProgramados = ({
  defaultValue = 0,
  products = [],
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProducto = () => {
    const formatSelect = [
      defaultOption,
      ...products.map((element) => {
        return {
          item: element,
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

  useEffect(() => {
    // verficar si defualtvalue coincide
    const defaultValueOption = options.find(
      (option) => option.id === defaultValue
    )

    if (defaultValueOption) {
      setValue(defaultValueOption)
    }
  }, [defaultValue])

  useEffect(() => {
    const controller = new AbortController()
    obtenerDataProducto()
    return () => controller.abort()
  }, [products])

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
