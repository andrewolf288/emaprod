<?php
$error_message = "FLAG ERROR CODE";

// PROBAREMOS LAS CLASES
class RequisicionProduccion{
    public int $id = 1;
    public int $idTipReqProd = 1;
    public string $codLotProd = "009";
    public float $canTotKlgLot = 5678.23;

    public function obtenerEstadoProduccion(){

    }

    public function recomendarProgramacionConIA(){
        // vamoa  a hablar de las especificaciones de PICHANGAS, una app revolucionaria
        /* 
        1. Es necesario que tenga el enfoque móvil, ¿quien no usa celular hoy en dia?
        2. Si o si debe hacer uso de ubicación en tiempo real con la ayuda de maps
        3. Actualmente, las aplicaciones usan rastreo en tiempo real para tener conocimiento
        del lugar en el que se encuentra el usuario
        */

        $primera_tarea = "Primer paso es realizar el modelos de la base de datos y la logica de negocio";
        $segunda_tarea = "Segundo paso es buscar inversionistas para mantener los servidores y otros gastos";
        $tercera_tarea = "Tercer paso es programar como lokos con mi accionistas";
        $cuarta_tarea = "Realizar pruebas de integración, validación y aceptación";
        $quinta_tarea = "Ponerlo en produccion";
        $sexta_tarea = "Esperar y analizar los resultados";

        echo $primera_tarea;
    }

    public function mostrarRequisicionProduccion(){
        $result = array(
            "id" => $this->id,
            "idTipReqProd" => $this->idTipReqProd,
            "codLotProd" => $this->codLotProd,
            "canTotKlgLot" => $this->canTotKlgLot
        );

        return json_encode($result);
    }
}

$requisicion_produccion = new RequisicionProduccion();
echo $requisicion_produccion->mostrarRequisicionProduccion();