import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getProveedores } from '../../../helpers/Referenciales/proveedor/getProveedores'

const defaultOption = {
  value: '',
  label: 'Selecciona un proveedor',
  id: ''
}

export const FilterProveedorDynamicSelect = ({ defaultValue = '', onNewInput }) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProveedor = async () => {
    const result = await getProveedores()
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProv,
          label: `${element.nomProv} ${element.apeProv}`,
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
    obtenerDataProveedor()
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
