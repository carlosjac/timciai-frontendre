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

Revise importe, concepto, vencimiento, política, saldo pendiente e imputaciones. Registrar está en el borrador. En la nota registrada, Modificar imputaciones cambia a qué deudas se aplicó, sin anularla. Anular la revierte en la cuenta corriente.

## Qué puede salir mal

Sin concepto no se guarda. Sin vencimiento no se registra. Sin cotización, un débito en otra moneda no se registra. Las imputaciones no pueden superar el importe de la nota. Un borrador no aparece como deuda hasta que lo registre.

## Paso siguiente

Regístrelo y, cuando corresponda, cóbrelo junto con las ventas abiertas.
