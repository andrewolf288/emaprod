import toast from 'react-hot-toast'

export function alertWarning (message) {
  toast(message, {
    duration: 4000, // Duración de la notificación en milisegundos (opcional)
    style: {
      background: '#f2c068', // Color de fondo de la notificación
      border: '2px solid #fdcb6e', // Borde de la notificación
      color: '#2d3436' // Color del texto
    },
    iconTheme: {
      primary: '#fdcb6e', // Color del icono de advertencia
      secondary: '#2d3436' // Color de fondo del icono de advertencia
    },
    icon: '⚠️'
  })
}

export function alertError (message) {
  toast.error(
    message,
    {
      duration: 4000, // Duración de la notificación en milisegundos (opcional)
      style: {
        background: '#ffcccc', // Color de fondo de la notificación para errores
        border: '2px solid #ff4d4d', // Borde de la notificación para errores
        color: '#990000' // Color del texto para errores
      },
      iconTheme: {
        primary: '#ff4d4d', // Color del icono de error
        secondary: '#990000' // Color de fondo del icono de error
      },
      icon: '❌' // Emoji de '❌' para representar el error
    }
  )
}

export function alertSuccess () {
  toast.success(
    '¡Éxito! La operación se ha completado correctamente.',
    {
      duration: 4000, // Duración de la notificación en milisegundos (opcional)
      style: {
        background: '#d4edda', // Color de fondo de la notificación para éxito
        border: '2px solid #c3e6cb', // Borde de la notificación para éxito
        color: '#155724' // Color del texto para éxito
      },
      iconTheme: {
        primary: '#155724', // Color del icono de éxito
        secondary: '#d4edda' // Color de fondo del icono de éxito
      },
      icon: '✅' // Emoji de '✅' para representar el éxito
    }
  )
}
