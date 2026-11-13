# Ventas

Una venta a un cliente. Guardar la deja en borrador. Registrar la confirma.

## Para qué sirve

Deja asentado lo vendido, el vencimiento y, una vez registrada, el saldo que el cliente debe. Sirve para un cargo que no se repite solo. Si el cargo se repite, use un abono: el abono genera esta venta y la registra.

## Cuándo usarla

Cuando entrega un producto o un servicio y tiene que cobrarlo. Mientras arma el detalle, déjela en borrador. Regístrela cuando el importe, el cliente y el vencimiento ya están bien.

## Borrador y Registrar

Guardar crea o actualiza la venta en borrador. El borrador se puede corregir y se puede eliminar. Todavía no entra en la cuenta corriente, no emite comprobante y no avisa al cliente. El tablero tampoco la cuenta.

Registrar confirma la venta. Hace falta porque el borrador es el preparativo: puede armar ítems, precios e impuestos sin mover saldos ni enviar avisos. Al registrar ocurre esto:

- La venta entra en la cuenta corriente y el saldo del cliente sube por el importe.
- Queda el saldo pendiente igual al total. Los cobros y las notas de crédito lo bajan después, al imputarse.
- Se fija la cotización y el importe en moneda base. Si la cotización cambió desde el borrador, elija la del borrador o la vigente.
- Se pide la emisión del comprobante, según cómo emita la entidad.
- Se avisa a los contactos del cliente que tengan Notif. ventas.
- Si hay cobros o créditos sin imputar de ese cliente, y no están marcados con «No auto-imputar», Timci puede aplicarlos a esta venta.
- Ya no se edita ni se elimina. Anular genera el movimiento inverso en la cuenta corriente y no se deshace.

## Lista

Ve el número, la fecha, el cliente, la moneda, el importe y el estado: borrador, registrada o anulada. Abra la fila para ver la ficha. En un borrador puede editar o eliminar. En una registrada, la ficha ofrece Registrar solo mientras siga en borrador, y Anular cuando ya está registrada y nadie la anuló antes.

## Alta

Elija el cliente. Timci propone su moneda, su plazo, su lista de precios y su política monetaria. Más opciones, o Cambiar, abre esos datos para esta venta.

- Fecha: la de la operación.
- Moneda: la cuenta corriente en la que va a quedar la deuda.
- Lista de precios: de dónde sale el precio al elegir un producto.
- Política monetaria: descuento o recargo según cuándo se pague. Se copia a la venta y se usa al cobrar. «Sin descuentos ni recargos» deja el importe como se registró.
- Vencimiento: hasta cuándo puede pagar sin atraso. Si no lo cambia, sale del plazo del cliente.

Agregue al menos un ítem:

- Producto o servicio. Si elige lista y producto, el precio de la lista se completa y puede cambiarlo.
- Descripción, cantidad y precio unitario.
- Descuento en porcentaje o en monto, si corresponde.
- Si la entidad gestiona impuestos, la categoría impositiva, el neto, el IVA y el bruto.

El total es la suma de los ítems. La cotización a moneda base puede quedar vacía en el borrador: hace falta al registrar, salvo que la moneda de la venta sea la moneda base. Guardar deja la venta en borrador. Desde la ficha, Registrar la confirma.

## Ficha

Revise ítems, impuestos si la entidad los gestiona, la cotización y el importe en moneda base. En una venta registrada ve el saldo pendiente y si está Pagada o Impaga. Las imputaciones recibidas muestran qué cobro o nota de crédito se aplicó a esta venta, y por cuánto. El comprobante, cuando existe, se abre desde el enlace. Desde aquí también puede reenviar el aviso si el contacto ya está corregido.

Registrar está en la ficha del borrador. Anular está en la ficha de la registrada. Eliminar solo aparece en el borrador.

## Qué puede salir mal

Sin ítems no se guarda. Sin vencimiento no se puede registrar. Sin cotización, una venta en otra moneda no se registra. Si el cliente tiene rebotes de correo, el aviso puede fallar: corrija el contacto y reenvíe la notificación desde la ficha. Un borrador no aparece en la cuenta corriente ni en el tablero: si el cliente «no debe» esa venta, revísela y regístrela.

## Paso siguiente

Cuando esté registrada, créele un cobro o deje que un cobro ya existente se le impute.
