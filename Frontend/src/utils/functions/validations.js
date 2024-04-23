export function parserInputQuantity (cantidad) {
  return isNaN(cantidad) ? 0 : parseFloat(cantidad)
}

export function parserQuantityRequisicion (simMed, cantidad) {
  let cantidadParser = 0
  // Verificar si simMed es KLG
  if (simMed === 'KGM') {
    // Redondear la cantidad a 3 decimales exactos
    cantidadParser = parseFloat(cantidad.toFixed(3))
  } else {
    // Verificar si simMed es UND u otro y si la cantidad tiene decimales
    if (cantidad % 1 !== 0) {
      // Redondear la cantidad a la próxima unidad
      cantidadParser = parseInt(Math.ceil(cantidad))
    } else {
      cantidadParser = parseInt(cantidad)
    }
  }
  return cantidadParser
}
