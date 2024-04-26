import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { _parseInt } from '../../../utils/functions/ParseInt'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'

export const PDFRequisicionEmpaquetadoPromocionalDetalle = ({ requisicion, styles }) => {
  const requisicionProductosFinales = []
  const requisicionMateriales = []
  requisicion.forEach((element) => {
    if (element.esProdFin === 1) {
      requisicionProductosFinales.push(element)
    }
    if (element.esMatReq === 1) {
      requisicionMateriales.push(element)
    }
  })

  return (
    <View>
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 7,
          marginLeft: 20
        }}
      >
        DETALLE REQUISICION EMPAQUETADO PROMOCIONAL
      </Text>
      {/* detalle de envasado */}
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 7,
          marginTop: 5,
          marginLeft: 20
        }}
      >
        Detalle requisición presentaciones
      </Text>
      <View style={{ ...styles.section, marginTop: -15 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.yellow_]}>
            <Text style={{ ...styles.gridTitle, flex: 1.5 }}>LOTE</Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '40px'
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: 'center'
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '30px'
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '40px'
              }}
            >
              Cantidad
            </Text>
          </View>
          {requisicionProductosFinales.map((item, index) => {
            const { codLotProd, fecVenLotProd, idProdc } = item
            const textInfoLote = idProdc === null ? 'FIFO' : `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`
            return (
              <View
                key={index}
                style={[
                  styles.gridRow,
                  index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
                ]}
              >
                <Text style={{ ...styles.gridContent_p, flex: 1.5 }}>
                  {textInfoLote}
                </Text>
                <Text
                  style={{
                    ...styles.gridContent_p,
                    flex: 0.7,
                    textAlign: 'center'
                  }}
                >
                  {item.codProd2}
                </Text>
                <Text
                  style={{
                    ...styles.gridContent_p,
                    flex: 4,
                    textAlign: 'left'
                  }}
                >
                  {item.nomProd}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 5.5,
                    maxWidth: '25px'
                  }}
                >
                  {item.simMed}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 6.5,
                    maxWidth: '40px'
                  }}
                >
                  {_parseInt(item, 'canReqEmpPromDet')}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
      {/* detalle de encajado */}
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 7,
          marginLeft: 20
        }}
      >
        Detalle requisición materiales
      </Text>
      <View style={{ ...styles.section, marginTop: -15 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.yellow_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '40px'
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: 'center'
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '30px'
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '40px'
              }}
            >
              Cantidad
            </Text>
          </View>
          {requisicionMateriales.map((item, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {item.codProd}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 0.7,
                  textAlign: 'center'
                }}
              >
                {item.codProd2}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  textAlign: 'left'
                }}
              >
                {item.nomProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 5.5,
                  maxWidth: '25px'
                }}
              >
                {item.simMed}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 6.5,
                  maxWidth: '40px'
                }}
              >
                {_parseInt(item, 'canReqEmpPromDet')}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
