# Cobros

El dinero que entró de un cliente. Guardar lo deja en borrador. Registrar confirma el ingreso.

## Para qué sirve

Baja la deuda de ventas y débitos. Si cobró de más, el resto queda a favor del cliente hasta que lo impute.

## Cuándo usarla

Cuando el cliente pagó. El importe es el efectivo ingresado, aunque todavía no lo haya aplicado entero a una factura.

## Borrador y Registrar

Guardar crea o actualiza el cobro en borrador. El borrador se puede corregir y se puede eliminar. El dinero todavía no entra en la cuenta corriente, las facturas siguen impagas, no se emite recibo y no se avisa al cliente. Las imputaciones quedan anotadas.

Registrar confirma el ingreso. Hace falta porque el borrador deja preparar el medio de pago y el reparto sin mover saldos ni aplicar descuentos. Al registrar ocurre esto:

- El cobro entra en la cuenta corriente y el saldo del cliente baja por el importe cobrado.
- Cada imputación reduce el saldo pendiente de la venta o del débito.
- «Efectivo a imputar» es lo que sale de este cobro. Timci lo pasa al saldo de esa deuda y aplica el descuento o el recargo de la política monetaria de esa venta o débito. El ajuste se genera en este momento, no al guardar el borrador.
- Lo que no imputó queda sin imputar. Puede aplicarse después, también al registrar una venta, salvo que marque «No auto-imputar».
- Se fija la cotización y el importe en moneda base.
- Se pide la emisión del recibo, según cómo emita la entidad.
- Se avisa a los contactos que tengan Notif. cobranzas.
- Ya no se edita el encabezado ni se elimina. Modificar imputaciones cambia a qué deudas se aplicó el dinero, sin anular el cobro. Anular genera el movimiento inverso en la cuenta corriente y no se deshace.

## Lista

Ve fecha, cliente, importe y estado: borrador, registrada o anulada. Un borrador se edita. Uno registrado no se abre en el formulario de edición.

## Alta

Elija el cliente, la fecha, la moneda y el importe cobrado.

- Medio de pago: sale de los medios activos de la entidad, en esa moneda. Es la instrucción con la que el cliente pagó (transferencia, efectivo u otra).
- Imputaciones: aplique ese efectivo a ventas o débitos abiertos del mismo cliente y la misma moneda. «Imputar automáticamente» reparte el importe entre las deudas abiertas. Puede imputar menos que lo cobrado.
- «No auto-imputar»: el resto no se aplica solo más adelante.
- En cada fila, «Efectivo a imputar» es la parte de este cobro que va a esa deuda. El saldo de la deuda puede ser distinto si la política tiene descuento o recargo: esa diferencia se resuelve al registrar.

Guardar deja el cobro en borrador.

## Ficha

Revise el medio de pago, lo imputado y el remanente. En la cuenta corriente, el cobro registrado muestra Imputado o Sin imputar, con el monto que todavía no se aplicó. Registrar está en el borrador. Anular está en el cobro registrado.

**Modificar imputaciones** está en la cabecera de esta ficha, junto a Anular. Aparece cuando el cobro está registrado, no está anulado y usted puede actualizar cobros. En un borrador no está: ahí el reparto se cambia con Editar, y todavía no movió saldos.

El botón abre un panel con el mismo título y reemplaza el reparto entero de este cobro. El importe, el cliente, la fecha, la moneda y el medio de pago siguen igual. El movimiento de la cuenta corriente de este cobro también: ya bajó por el importe cobrado. Lo que cambia es qué ventas o débitos quedan saldados y cuánto queda sin imputar.

El panel lista las ventas y los débitos registrados del mismo cliente y la misma moneda que todavía tienen saldo, y los que este cobro ya tenía imputados. En cada fila, «Efectivo a imputar» es la parte de este cobro que va a esa deuda. Puede:

- Pasar el dinero de una factura a otra.
- Imputar menos y dejar el resto sin imputar, a favor del cliente.
- Imputar más, hasta el importe del cobro, mientras la deuda tenga lugar.
- Dejar todas las filas en cero. El cobro queda entero sin imputar.
- Usar «Imputar automáticamente». Reparte el importe del cobro entre las deudas de la tabla, de la más antigua a la más nueva.

Al guardar, Timci devuelve el saldo a las deudas del reparto anterior y aplica el nuevo. Un tramo que no cierra la deuda baja ese saldo por el mismo efectivo y no genera descuento ni recargo. Un tramo que la cierra calcula la política monetaria de esa deuda con la fecha del cobro: anula el ajuste que este cobro había generado y, si la política corresponde, deja el descuento o el recargo nuevo.

La suma imputada no puede superar el importe del cobro. Cada fila no puede superar lo que esa deuda puede recibir: su saldo abierto más lo que este cobro ya tenía aplicado ahí. El destino tiene que ser una venta o un débito registrados, del mismo cliente y la misma moneda.

Lo que queda sin imputar puede aplicarse solo al registrar una venta posterior, de la más antigua a la más nueva. «No auto-imputar», en esta misma ficha, deja ese resto para una imputación manual. Ese interruptor no reescribe las imputaciones que ya guardó. Para poder anular una venta o un débito que recibió este cobro, deje en cero la fila de esa deuda y guarde. Un cobro anulado no muestra el botón.

## Qué puede salir mal

Sin medio de pago no se guarda. El importe tiene que alcanzar lo que imputa. Si no hay ventas ni débitos pendientes en esa moneda, no aparece nada para imputar y, al registrarlo, el cobro queda a cuenta. Un borrador no baja la deuda ni figura como cobrado en el tablero.

## Paso siguiente

En la ficha del cliente, la cuenta corriente muestra el saldo después del cobro registrado, y Liquidación deja de incluir las deudas que este cobro saldó.
