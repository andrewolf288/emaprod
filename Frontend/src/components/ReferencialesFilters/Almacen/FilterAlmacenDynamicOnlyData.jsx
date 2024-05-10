import React, { useEffect, useState } from 'react'
import { getAlmacenes } from '../../../helpers/Referenciales/almacen/getAlmacenes'
import { Autocomplete, TextField } from '@mui/material'

const defaultOption = {
  value: 0,
  label: 'Selecciona un almacén',
  id: 0
}

export const FilterAlmacenDynamicOnlyData = ({
  defaultValue = 0,
  onNewInput,
  onlyData = [],
  disabled = false
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerAlmacenes = async () => {
    let result = await getAlmacenes()
    if (onlyData.length !== 0) {
      result = result.filter((element) => onlyData.includes(element.id))
    }
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
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

  // use effect cuando hay cambios en el valor por defecto
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
      disabled={disabled}
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
