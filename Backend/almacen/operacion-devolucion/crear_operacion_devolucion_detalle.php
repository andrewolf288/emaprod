<?php
// CON ESTE SCRIPT VAMOS A REALIZAR EL CUMPLIMIENTO DE UNA OPERACION DE DEVOLUCION
/*
    1. EL SCRIPT DEBE VERIFICAR SI LA OPCION MARCADA ES:
        a. RETORNO A STOCK
            i. se debe verificar el detalle de lotes de salida (IMPORTANTE: siempre se sabra de donde salio)
            segun la información de salida registrada en movimiento_operacion_facturacion
            ii. se registra en movimiento_operacion_devolucion los retornos correspondientes
        b. NO RETORNO A STOCK
            i. Por cada detalle de la nota de credito debemos crear un registro en operacion_devolucion_calidad
            
*/