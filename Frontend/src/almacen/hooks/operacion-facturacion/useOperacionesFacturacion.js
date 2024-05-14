import { useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'

export function useOperacionesFacturacion () {
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  const { loading, axiosInstance } = useAxiosWithLoading()
  const [dataFilter, setDataFilter] = useState({
    invSerFac: '',
    invNumFac: '',
    idReqEst: 0,
    customer: ''
  })

  const handleChangeInputValue = ({ target }) => {
    const { value, name } = target
    setDataFilter({
      ...dataFilter,
      [name]: value
    })
    filter(value, name)
  }

  const handleChangeSelectValue = (value) => {
    const { id, label } = value
    setDataFilter({
      ...dataFilter,
      idReqEst: id
    })
    filter(label, 'idReqEst')
  }

  return {
    loading,
    axiosInstance,
    dateState,
    handleEndDateChange,
    handleStartDateChange
  }
}
