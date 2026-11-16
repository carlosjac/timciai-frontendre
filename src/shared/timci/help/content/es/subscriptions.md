# Abonos

Un cargo que se repite. Guardar lo deja en borrador. Registrar enciende el calendario y, en cada fecha, Timci arma la venta y la deja registrada.

## Para qué sirve

Para lo que factura cada mes, u otro intervalo, al mismo cliente, con la misma lista y los mismos productos. La venta generada entra en la cuenta corriente como cualquier venta registrada. Usted no tiene que pasar esa venta de borrador a registrada: si la facturación termina bien, ya queda registrada.

## Cuándo usarla

Cuando el cargo es recurrente. Para un cargo único, cree una venta.

## Lista

Ve el cliente, el estado (borrador o registrado), la vigencia, el modo de período y si el abono está activo. Abra la fila para ver la ficha. Si la última facturación falló, la ficha muestra el error y esa fecha no queda facturada.

## Alta

Elija el cliente y la moneda. El precio de cada línea se busca en la moneda del abono.

- Moneda: una de las que admite la entidad. Si admite una sola, queda puesta y no se cambia. Si admite varias, se propone la moneda por defecto del cliente. Ejemplo: la entidad admite pesos y dólares, y el cliente tiene pesos. El alta propone pesos. Puede pasarlo a dólares: cada venta sale en dólares y el precio sale de la lista en dólares. Se puede cambiar hasta que el abono emita una venta.

- Cada cuántos meses: el intervalo, de 1 a 60. 1 es todos los meses. Desde el 1 de marzo e intervalo 3, la próxima fecha es el 1 de junio.
- Desde: la primera fecha de facturación. En el alta queda en blanco: hay que elegirla. No puede ser anterior a un año. Si se registra el 16 de noviembre con desde el 1 de diciembre, no hay venta hasta ese día.
- Hasta: opcional. Sin fecha, el abono sigue hasta que lo desactive. Hasta el 31 de diciembre no factura enero.
- Modo de período. Define qué lapso cubre cada venta. Con fecha 1 de marzo e intervalo 1:
  - Adelantado cubre marzo: desde el 1 hasta el 31.
  - Vencido cubre febrero: el intervalo que terminó el día anterior.
  - Adelantado 1 solo mes cubre un mes hacia adelante, aunque el intervalo sea mayor. Con intervalo 3, no cubre los tres meses: cubre marzo.
  - Vencido 1 solo mes cubre el mes que terminó el día anterior, aunque el intervalo sea mayor.
- Lista de precios: de dónde sale el precio de cada producto en la fecha de facturación. Si hay una sola, el alta la deja seleccionada.
- Política monetaria: la que se copia a la venta generada. Al cobrar esa venta se aplica el descuento o el recargo. En el alta se propone la política por defecto de la entidad.
- Líneas: al menos un producto o servicio activo y su cantidad. El precio no se escribe aquí: tiene que existir en la lista, para esa moneda, vigente en la fecha de facturación.
- Descuento % de la línea: 10 es el 10 % sobre el precio de lista de esa línea. Solo admite de 0 a 100. En la ficha se ve con dos decimales, por ejemplo 10,00 %.

## Borrador y Registrar

Guardar deja el abono en borrador. Sirve para armar el cliente, la moneda, las fechas, el intervalo, el modo, las líneas, la lista y la política sin emitir ventas. Se puede corregir o eliminar. Guardar no factura.

Registrar enciende el calendario. Hace falta porque el borrador es el preparativo: todavía no hay ventas ni entran en la cuenta corriente. Al registrar ocurre esto:

- Si la fecha desde ya llegó, emite la venta de ese vencimiento y la deja registrada. No hay que registrarla aparte.
- Si la fecha es futura, la venta sale ese día.
- Los vencimientos siguientes se generan solos y ya quedan registrados.

Después no se elimina el abono. Ejemplo: se guardó el producto equivocado. En borrador se edita o se borra. Si ya se registró y la venta existe, esa venta no se reabre: se anula la venta o se cierra el abono con Hasta.

## Ficha

El estado se ve arriba: Borrador o Registrado. En borrador, la cabecera ofrece Editar, Registrar y Eliminar. Registrar pide confirmación. Un abono registrado se puede editar y ya no se elimina.

Si ya emitió una venta, no se cambian el cliente, la moneda, la fecha desde, cada cuántos meses ni el modo de período. La fecha hasta, las líneas, la lista de precios y la política sí: entran en el vencimiento que todavía no se facturó. Ejemplo: la venta de marzo ya existe. Una línea nueva no la modifica y sale en abril. Hasta el 30 de abril no factura mayo. Si se registró y todavía no hay venta, se puede corregir todo.

Revise cliente, moneda, vigencia, modo, lista, política y líneas. Ventas generadas lista las que ya se emitieron, con enlace a cada una. Esas ventas están registradas: entran en la cuenta corriente, piden comprobante y pueden cobrarse. Desde esa venta, Ver abono vuelve a este abono.

Si el abono está registrado y todavía no hay ventas, la fecha desde es futura o la facturación falló. El último error de facturación dice el motivo.

Desactivar frena las próximas facturaciones. Las ventas ya registradas siguen en la cuenta.

## Qué puede salir mal

«No hay precio vigente» significa que el producto no tiene precio en esa lista, en la moneda del abono, para la fecha de facturación. «No hay cotización» significa que falta la cotización de esa moneda para ese día y la venta no pudo registrarse. Corrija el precio o la cotización: en la siguiente pasada, Timci retoma el borrador de esa venta y lo registra.

## Paso siguiente

Cuando la venta figure en Ventas generadas, cóbrela en Cobros y registre el cobro.
