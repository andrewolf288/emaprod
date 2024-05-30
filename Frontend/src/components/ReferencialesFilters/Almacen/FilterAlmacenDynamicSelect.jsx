import React, { useEffect, useState } from 'react'
import { getAlmacenes } from '../../../helpers/Referenciales/almacen/getAlmacenes'
import { Autocomplete, TextField } from '@mui/material'

const defaultOption = {
  value: '',
  label: 'Selecciona un almacen',
  id: ''
}

export const FilterAlmacenDynamicSelect = ({
  defaultValue = '',
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerAlmacenes = async () => {
    const result = await getAlmacenes()
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codAlm,
          label: element.nomAlm,
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
    obtenerAlmacenes()
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
