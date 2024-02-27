import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { _parseInt } from "../../../utils/functions/ParseInt";

export const PDFTransformacionRequisicion = ({ requisicion, styles }) => {
  const requisicionEnvasado = requisicion.find(
    (element) => element.desAre === "Envasado"
  );
  const requisicionEncajado = requisicion.find(
    (element) => element.desAre === "Encajado"
  );
  console.log(requisicionEncajado);
  return (
    <View>
      <Text
        style={{
          ...styles.title,
          fontWeight: "bold",
          fontSize: 7,
          marginLeft: -380,
          marginTop: 10,
          fontWeight: "bold"
        }}
      >
        DETALLE REQUISICION DE MATERIALES
      </Text>
      {/* detalle de envasado */}
      <Text
        style={{
          ...styles.title,
          fontWeight: "bold",
          fontSize: 7,
          marginLeft: -450,
          marginTop: 5
        }}
      >
        Detalle Envasado
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.yellow_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 7,
                maxWidth: "40px"
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: "center"
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 7,
                maxWidth: "30px"
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 7,
                maxWidth: "40px"
              }}
            >
              Cantidad
            </Text>
          </View>
          {requisicionEnvasado?.reqDet.map((item, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {}
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {item.codProd}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 0.7,
                  textAlign: "center"
                }}
              >
                {item.codProd2}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  textAlign: "left"
                }}
              >
                {item.nomProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 5.5,
                  maxWidth: "25px"
                }}
              >
                {item.simMed}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 6.5,
                  maxWidth: "40px"
                }}
              >
                {_parseInt(item, "canReqDet")}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {/* detalle de encajado */}
      <Text
        style={{
          ...styles.title,
          fontWeight: "bold",
          fontSize: 7,
          marginLeft: -450,
          marginTop: 5
        }}
      >
        Detalle Encajado
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.yellow_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 7,
                maxWidth: "40px"
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: "center"
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 7,
                maxWidth: "30px"
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 7,
                maxWidth: "40px"
              }}
            >
              Cantidad
            </Text>
          </View>
          {requisicionEncajado?.reqDet.map((item, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {}
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {item.codProd}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 0.7,
                  textAlign: "center"
                }}
              >
                {item.codProd2}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  textAlign: "left"
                }}
              >
                {item.nomProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 5.5,
                  maxWidth: "25px"
                }}
              >
                {item.simMed}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 6.5,
                  maxWidth: "40px"
                }}
              >
                {_parseInt(item, "canReqDet")}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
