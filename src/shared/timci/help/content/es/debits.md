# Débitos

Una nota de débito aumenta lo que el cliente debe, aparte de una venta. Guardar la deja en borrador. Registrar la confirma.

## Para qué sirve

Sirve para un cargo con concepto propio, por ejemplo un ajuste, un recargo que usted carga a mano o un importe que no sale de una lista de precios. Lleva política monetaria, como la venta, y puede avisar al cliente.

## Cuándo usarla

Cuando el importe no se arma con productos y cantidades. Si el cargo es una venta con ítems, use Ventas. Si se repite, use un abono.

## Borrador y Registrar

Guardar crea o actualiza la nota en borrador. El borrador se puede corregir y se puede eliminar. Todavía no entra en la cuenta corriente, no baja ni sube saldos de otras operaciones, no emite comprobante y no avisa al cliente.

Registrar confirma la nota. Hace falta porque el borrador es el preparativo: puede escribir el concepto, el importe y a qué deudas imputarlo sin mover la cuenta. Al registrar ocurre esto:

- La nota entra en la cuenta corriente y el saldo del cliente sube por el importe.
- El saldo pendiente de la nota es el importe menos lo que imputó a otras deudas. Lo que no imputó queda abierto en esta nota y se puede cobrar después.
- Si imputó el débito a ventas o débitos abiertos, esos destinos reciben ese monto al registrar.
- Se fija la cotización y el importe en moneda base.
- Se pide la emisión del comprobante, según cómo emita la entidad.
- Se avisa a los contactos que tengan Notif. débitos.
- Ya no se edita el encabezado ni se elimina. Puede modificar las imputaciones desde la ficha, con Modificar imputaciones, sin anular la nota. Anular genera el movimiento inverso y no se deshace.

## Lista

Los estados son los de una venta: borrador, registrada o anulada. Solo el borrador se edita o se elimina. Abra la fila para ver la ficha.

## Alta

Elija el cliente, la fecha, la moneda y el importe. El concepto es obligatorio: es el texto que explica el cargo.

- Vencimiento: hasta cuándo puede pagar esta nota. Hace falta para registrarla, salvo que la nota sea un ajuste generado por el sistema.
- Política monetaria: la regla de descuento o recargo que se aplicará al cobrar esta nota.
- Imputaciones: puede aplicar este débito a documentos abiertos del mismo cliente y la misma moneda. Si no hay destino, registre la nota igual: la deuda queda en la cuenta.
- Si la entidad gestiona impuestos, el importe que carga es el neto. Timci calcula el IVA.

La cotización puede quedar vacía en el borrador y hace falta al registrar si la moneda no es la base. Guardar deja la nota en borrador.

## Ficha

Revise importe, concepto, vencimiento, política, saldo pendiente e imputaciones. Registrar está en el borrador. Anular está en la nota registrada y revierte el movimiento en la cuenta corriente.

**Modificar imputaciones** está en la cabecera de esta ficha, junto a Anular. Aparece cuando la nota está registrada, no está anulada y usted puede actualizar débitos. En un borrador no está: ahí el reparto se cambia con Editar, y todavía no movió saldos.

El botón abre un panel con el mismo título y reemplaza a qué deudas se aplicó esta nota. El importe, el cliente, la fecha, la moneda, el concepto, el vencimiento y la política siguen igual. El movimiento de la cuenta corriente de esta nota también: ya sumó su importe. Lo que cambia es el saldo pendiente de la nota y el saldo abierto de los destinos.

El saldo pendiente de la nota pasa a ser el importe menos lo que deje imputado. Cada tramo se suma al saldo abierto de la venta o del débito destino. Lo que no impute queda abierto en esta nota y se puede cobrar después. No queda como saldo a favor del cliente.

El panel lista las ventas y los débitos registrados del mismo cliente y la misma moneda, y los que esta nota ya tenía imputados. En cada fila, «Efectivo a imputar» es la parte de esta nota que pasa a esa deuda. Puede:

- Pasar el cargo de un documento a otro.
- Imputar menos. El resto queda pendiente en esta nota.
- Imputar más, hasta el importe de la nota.
- Dejar todas las filas en cero. Toda la deuda queda en esta nota.
- Usar «Imputar automáticamente». Reparte el importe de la nota entre las deudas de la tabla, de la más antigua a la más nueva.

Al guardar, Timci quita el efecto del reparto anterior y aplica el nuevo. Esta corrección no genera el descuento ni el recargo de la política: esa política se aplica cuando un cobro o un crédito cierra la deuda. La suma imputada no puede superar el importe de la nota. El destino tiene que ser una venta o un débito registrados, del mismo cliente y la misma moneda. Para poder anular una venta o un débito que recibió esta nota, deje en cero la fila de esa deuda y guarde. Una nota anulada no muestra el botón.

## Qué puede salir mal

Sin concepto no se guarda. Sin vencimiento no se registra. Sin cotización, un débito en otra moneda no se registra. Las imputaciones no pueden superar el importe de la nota. Un borrador no aparece como deuda hasta que lo registre.

## Paso siguiente

Regístrelo y, cuando corresponda, cóbrelo junto con las ventas abiertas.
