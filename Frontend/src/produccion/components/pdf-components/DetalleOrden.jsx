import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { stylesPDF } from './stylePDF'
import { _parseInt } from '../../../utils/functions/ParseInt'
const styles = stylesPDF

export const DetalleOrden = ({ result }) => {
  // importamos los estilos
  return (
    <>
      <View>
        <Text
          style={{
            ...styles.title,
            fontWeight: 'bold',
            fontSize: 7,
            marginLeft: -450,
            marginTop: -2
          }}
        >
          Producto Final
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.greenBackground]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}> N°</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text style={{ ...styles.gridTitle, flex: 1 }}>Código</Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: 'center'
                }}
              >
                Descripción de Item
              </Text>
              <Text style={styles.gridTitle}>U.M</Text>
              <Text style={styles.gridTitle}>Cantidad</Text>
            </View>
            {result.productos_finales?.map((producto, index) => (
              <View
                key={index}
                style={[
                  styles.gridRow,
                  index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
                ]}
              >
                <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                  {producto.id}
                </Text>
                <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                  {producto.codProd}
                </Text>
                <Text style={{ ...styles.gridContent_p, flex: 1 }}>
                  {producto.codProd2}
                </Text>
                <Text
                  style={{
                    ...styles.gridContent_p,
                    flex: 4,
                    textAlign: 'left'
                  }}
                >
                  {producto.nomProd}
                </Text>
                <Text style={styles.gridContent_p}>{producto.simMed}</Text>
                <Text style={styles.gridContent_num}>
                  {_parseInt(producto)}
                </Text>{' '}
                {/** producto.canTotProgProdFin */}
              </View>
            ))}
          </View>
        </View>

        <Text
          style={{
            ...styles.title,
            fontWeight: 'bold',
            fontSize: 7,
            marginLeft: -440,
            marginTop: -12
          }}
        >
          Detalle Envasado
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.green_]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}> Cód Aso</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 7,
                  // border: "1px solid black",
                  maxWidth: '40px'
                }}
              >
                Código
              </Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: 'center'
                  // border: "1px solid black",
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
                  // border: "1px solid black",
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
                  // border: "1px solid black",
                  maxWidth: '40px'
                }}
              >
                Cantidad
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 7,
                  // border: "1px solid black",
                  maxWidth: '40px'
                }}
              >
                Total
              </Text>
            </View>
            {result?.requisiciones
              ?.find((req) => req.desAre === 'Envasado')
              ?.detalles?.map((detalle, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridRow,
                    index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
                  ]}
                >
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.prodFCode}
                  </Text>
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.codProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 5.5,
                      // border: "1px solid black",
                      maxWidth: '40px'
                    }}
                  >
                    {detalle.codProd2}
                  </Text>
                  <Text
                    style={{
                      ...styles.gridContent_p,
                      flex: 4,
                      textAlign: 'left'
                      // border: "1px solid black",
                    }}
                  >
                    {detalle.nomProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 5.5,
                      maxWidth: '25px'
                      // border: "1px solid black",
                    }}
                  >
                    {detalle.simMed}
                  </Text>
                  {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 6.5,
                      maxWidth: '40px'
                      // border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle, 'canReqDet')}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 6.5,
                      maxWidth: '40px'
                      // border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle, 'acu')}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {result?.requisiciones?.find((req) => req.desAre === 'Envasado')
          ?.resumenProductos?.length && (
          <>
            <Text
              style={{
                ...styles.title,
                fontWeight: 'bold',
                fontSize: 7,
                marginLeft: -410,
                marginTop: -12
              }}
            >
              Acumulacion de envasado
            </Text>
            <View style={{ ...styles.section, marginTop: -25 }}>
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.green_]}>
                  <Text style={styles.gridTitle}>Código</Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 4,
                      textAlign: 'left'
                    }}
                  >
                    Descripción de Item
                  </Text>
                  <Text style={styles.gridTitle}>U.M</Text>
                  <Text style={styles.gridTitle}>Total</Text>
                </View>
                {result?.requisiciones
                  ?.find((req) => req.desAre === 'Envasado')
                  ?.resumenProductos.map((detalle, index) => (
                    <View
                      key={index}
                      style={[
                        styles.gridRow,
                        ...[{ backgroundColor: '#a4a8b0' }]
                      ]}
                    >
                      <Text style={styles.gridContent_p}>
                        {detalle.codProd2}
                      </Text>
                      <Text
                        style={{
                          ...styles.gridContent_p,
                          flex: 4,
                          textAlign: 'left'
                        }}
                      >
                        {detalle.nomProd}
                      </Text>
                      <Text style={styles.gridContent_p}>{detalle.simMed}</Text>
                      <Text style={styles.gridContent_num}>
                        {_parseInt(detalle, 'acu')}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </>
        )}

        <Text
          style={{
            ...styles.title,
            fontWeight: 'bold',
            fontSize: 7,
            marginLeft: -440,
            marginTop: -12
          }}
        >
          Detalle Encajado
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.yellow_]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Aso</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 7,
                  // border: "1px solid black",
                  maxWidth: '40px'
                }}
              >
                Código
              </Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: 'center'
                  // border: "1px solid black",
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
                  // border: "1px solid black",
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
                  // border: "1px solid black",
                  maxWidth: '40px'
                }}
              >
                Cantidad
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 7,
                  // border: "1px solid black",
                  maxWidth: '40px'
                }}
              >
                Total
              </Text>
            </View>
            {result.requisiciones
              .find((req) => req.desAre === 'Encajado')
              ?.detalles?.map((detalle, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridRow,
                    index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
                  ]}
                >
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.prodFCode}
                  </Text>
                  <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                    {detalle.codProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 5.5,
                      // border: "1px solid black",
                      maxWidth: '40px'
                    }}
                  >
                    {detalle.codProd2}
                  </Text>
                  <Text
                    style={{
                      ...styles.gridContent_p,
                      flex: 4,
                      textAlign: 'left'
                      // border: "1px solid black",
                    }}
                  >
                    {detalle.nomProd}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 5.5,
                      maxWidth: '25px'
                      // border: "1px solid black",
                    }}
                  >
                    {detalle.simMed}
                  </Text>
                  {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 6.5,
                      maxWidth: '40px'
                      // border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle)}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 6.5,
                      maxWidth: '40px'
                      // border: "1px solid black",
                    }}
                  >
                    {_parseInt(detalle, 'acu')}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {result?.requisiciones?.find((req) => req.desAre === 'Encajado')
          ?.resumenProductos?.length && (
          <>
            <Text
              style={{
                ...styles.title,
                fontWeight: 'bold',
                fontSize: 7,
                marginLeft: -410,
                marginTop: -12
              }}
            >
              Acumulacion de Encajado
            </Text>
            <View style={{ ...styles.section, marginTop: -25 }}>
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.yellow_]}>
                  <Text style={styles.gridTitle}>Código</Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 4,
                      textAlign: 'center'
                    }}
                  >
                    Descripción de Item
                  </Text>
                  <Text style={styles.gridTitle}>U.M</Text>
                  <Text style={styles.gridTitle}>Total</Text>
                </View>
                {result?.requisiciones
                  ?.find((req) => req.desAre === 'Encajado')
                  ?.resumenProductos.map((detalle, index) => (
                    <View
                      key={index}
                      style={[
                        styles.gridRow,
                        ...[{ backgroundColor: '#a4a8b0' }]
                      ]}
                    >
                      <Text style={styles.gridContent_p}>
                        {detalle.codProd2}
                      </Text>
                      <Text
                        style={{
                          ...styles.gridContent_p,
                          flex: 4,
                          textAlign: 'left'
                        }}
                      >
                        {detalle.nomProd}
                      </Text>
                      <Text style={styles.gridContent_p}>{detalle.simMed}</Text>
                      <Text style={styles.gridContent_num}>
                        {_parseInt(detalle, 'acu')}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </>
        )}
      </View>
    </>
  )
}
