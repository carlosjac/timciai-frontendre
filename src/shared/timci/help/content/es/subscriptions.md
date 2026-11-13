# Abonos

Un cargo que se repite. En cada fecha de facturación, Timci arma la venta y la registra.

## Para qué sirve

Para lo que factura cada mes, u otro intervalo, al mismo cliente, con la misma lista y los mismos productos. La venta generada entra en la cuenta corriente como cualquier venta registrada. Usted no tiene que pasar esa venta de borrador a registrada: si la facturación termina bien, ya queda registrada.

## Cuándo usarla

Cuando el cargo es recurrente. Para un cargo único, cree una venta.

## Lista

Ve el cliente, la moneda, la vigencia, el modo de período y si el abono está activo. Abra la fila para ver la ficha. Si la última facturación falló, la ficha muestra el error y esa fecha no queda facturada.

## Alta

Elija el cliente. La moneda no se elige: es la moneda por defecto de ese cliente. Si necesita otra moneda, cámbiela en el cliente antes de crear el abono.

- Cada cuántos meses: el intervalo, de 1 a 60. 1 es todos los meses.
- Desde: la primera fecha de facturación. No puede ser anterior a un año atrás.
- Hasta: opcional. Sin fecha, el abono sigue hasta que lo desactive.
- Modo de período. Define qué lapso cubre cada venta:
  - Adelantado: desde la fecha de facturación hasta el día anterior a la próxima, según el intervalo.
  - Vencido: el intervalo que terminó el día anterior a la fecha de facturación.
  - Adelantado 1 solo mes: un mes hacia adelante, aunque el intervalo sea mayor.
  - Vencido 1 solo mes: el mes que terminó el día anterior a la fecha de facturación.
- Lista de precios: de dónde sale el precio de cada producto en la fecha de facturación.
- Política monetaria: la que se copia a la venta generada. Al cobrar esa venta se aplica el descuento o el recargo.
- Líneas: al menos un producto o servicio activo y su cantidad. El precio no se escribe aquí: tiene que existir en la lista, para esa moneda, vigente en la fecha de facturación.

Guardar deja el abono activo. No es una transacción en borrador: el borrador aparece en la venta que el abono genere si la facturación no llega a registrarla.

## Ficha

Revise cliente, vigencia, modo, lista, política y líneas. Ventas generadas lista las que ya se emitieron, con enlace a cada una. Esas ventas están registradas: entran en la cuenta corriente, piden comprobante y pueden cobrarse.

Si todavía no hay ventas, el período no llegó, la fecha desde es futura, o la facturación falló. El último error de facturación dice el motivo. Puede corregir lista, política, fechas y líneas mientras el abono siga vigente. El cliente y la fecha desde no se cambian después del alta.

Desactivar frena las próximas facturaciones. Las ventas ya registradas siguen en la cuenta.

## Qué puede salir mal

«No hay precio vigente» significa que el producto no tiene precio en esa lista, en la moneda del cliente, para la fecha de facturación. «No hay cotización» significa que falta la cotización de esa moneda para ese día y la venta no pudo registrarse. Corrija el precio o la cotización: en la siguiente pasada, Timci retoma el borrador de esa venta y lo registra.

## Paso siguiente

Cuando la venta figure en Ventas generadas, cóbrela en Cobros y registre el cobro.
