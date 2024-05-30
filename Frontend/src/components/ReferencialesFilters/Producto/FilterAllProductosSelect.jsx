import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getAllProductos2 } from '../../../helpers/Referenciales/producto/getAllProductos2'

const defaultOption = {
  value: '',
  label: 'Selecciona un producto',
  id: ''
}
export const FilterAllProductosSelect = ({
  defaultValue = '',
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProducto = async () => {
    const result = await getAllProductos2()
    const formatSelect = [defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2,
          label: element.nomProd,
          id: element.id
        }
      })]
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
    obtenerDataProducto()
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
