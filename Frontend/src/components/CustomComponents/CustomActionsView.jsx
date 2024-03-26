import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CustomActionsView = ({ onSaveOperation = () => {}, onShowCreateButton = true }) => {
  const navigate = useNavigate()

  const navigateBack = () => {
    navigate(-1)
  }

  const handleGoBack = () => {
    navigateBack()
  }

  return (
    <div className="btn-toolbar ms-4 mt-3">
      {onShowCreateButton && <button
        type='button'
        onClick={onSaveOperation}
        className='btn btn-primary me-2'>
            Guardar
      </button>}
      <button
        type="button"
        onClick={handleGoBack}
        className="btn btn-secondary"
      >
            Volver
      </button>
    </div>
  )
}
