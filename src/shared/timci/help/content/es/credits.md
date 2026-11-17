# Créditos

Una nota de crédito reduce lo que el cliente debe. Guardar la deja en borrador. Registrar la confirma.

## Para qué sirve

Sirve para bonificar, devolver o corregir un saldo cuando no entró dinero. Se imputa a ventas o débitos abiertos. Lo que no imputa queda a favor del cliente.

## Cuándo usarla

Cuando debe bajar la deuda y el cliente no pagó. Si entró dinero, regístrelo como cobro.

## Borrador y Registrar

Guardar crea o actualiza la nota en borrador. El borrador se puede corregir y se puede eliminar. Todavía no baja la cuenta corriente, no marca facturas como pagadas, no emite comprobante y no avisa al cliente. Las imputaciones quedan anotadas y se aplican al registrar.

Registrar confirma la nota. Hace falta porque el borrador deja preparar el importe y los destinos sin tocar saldos. Al registrar ocurre esto:

- La nota entra en la cuenta corriente y el saldo del cliente baja por el importe.
- Cada imputación reduce el saldo pendiente de la venta o del débito elegido.
- Si la deuda tenía descuento o recargo por la política monetaria, Timci lo calcula en este momento y lo deja asentado. El efectivo de la nota se convierte al saldo de esa deuda.
- Lo que no imputó queda sin imputar y puede aplicarse después, incluso solo, al registrar una venta, salvo que marque «No auto-imputar».
- Se fija la cotización y el importe en moneda base.
- Se pide la emisión del comprobante.
- Se avisa a los contactos que tengan Notif. créditos.
- Ya no se edita el encabezado ni se elimina. Modificar imputaciones, en la ficha, cambia los destinos sin anular la nota. Anular genera el movimiento inverso y no se deshace.

## Lista

Ve fecha, cliente, importe y estado: borrador, registrada o anulada. El borrador se puede cambiar. La nota registrada no se edita desde el formulario.

## Alta

Elija cliente, fecha, moneda e importe, y escriba el concepto.

- Imputaciones: elija la venta o el débito abierto, en la misma moneda, y el efectivo a imputar. Puede imputar menos que el importe de la nota.
- «No auto-imputar»: el resto no se aplica solo cuando más adelante registre una venta.
- Si la entidad gestiona impuestos, el importe es el neto.
- Si no hay documentos abiertos en esa moneda, la nota puede quedar sin imputar: al registrarla, el crédito queda a favor del cliente.

Guardar deja la nota en borrador.

## Ficha

Revise el concepto, lo imputado y lo que sigue sin imputar. En la cuenta corriente del cliente, la nota registrada muestra Imputado o Sin imputar. Registrar está en el borrador. Anular está en la registrada.

**Modificar imputaciones** está en la cabecera de esta ficha, junto a Anular. Aparece cuando la nota está registrada, no está anulada y usted puede actualizar créditos. En un borrador no está: ahí el reparto se cambia con Editar, y todavía no movió saldos.

El botón abre una página con el mismo título y reemplaza el reparto entero de esta nota. El importe, el cliente, la fecha, la moneda y el concepto siguen igual. El movimiento de la cuenta corriente de esta nota también: ya bajó por el importe. Lo que cambia es qué ventas o débitos quedan saldados y cuánto queda sin imputar.

La página lista las ventas y los débitos registrados del mismo cliente y la misma moneda que todavía tienen saldo, y los que esta nota ya tenía imputados. En cada fila, «Efectivo a imputar» es la parte de esta nota que va a esa deuda. Puede:

- Pasar el crédito de una factura a otra.
- Imputar menos y dejar el resto sin imputar, a favor del cliente.
- Imputar más, hasta el importe de la nota, mientras la deuda tenga lugar.
- Dejar todas las filas en cero. La nota queda entera sin imputar.
- Usar «Imputar automáticamente». Reparte el importe de la nota entre las deudas de la tabla, de la más antigua a la más nueva.

Al guardar, Timci devuelve el saldo a las deudas del reparto anterior y aplica el nuevo. Un tramo que no cierra la deuda baja ese saldo por el mismo importe y no genera descuento ni recargo. Un tramo que la cierra calcula la política monetaria de esa deuda con la fecha de la nota: anula el ajuste que esta nota había generado y, si la política corresponde, deja el descuento o el recargo nuevo.

La suma imputada no puede superar el importe de la nota. Cada fila no puede superar lo que esa deuda puede recibir: su saldo abierto más lo que esta nota ya tenía aplicado ahí. El destino tiene que ser una venta o un débito registrados, del mismo cliente y la misma moneda.

Lo que queda sin imputar puede aplicarse solo al registrar una venta posterior, de la más antigua a la más nueva. «No auto-imputar», en esta misma ficha, deja ese resto para una imputación manual. Ese interruptor no reescribe las imputaciones que ya guardó. Para poder anular una venta o un débito que recibió esta nota, deje en cero la fila de esa deuda y guarde. Una nota anulada no muestra el botón.

## Modificar imputaciones

Esta página cambia a qué ventas o débitos se aplicó un crédito ya registrado. El importe, el cliente, la fecha, la moneda y el concepto siguen igual. El movimiento de la cuenta corriente de esta nota también: ya bajó por ese importe. Lo que cambia es qué deudas quedan saldadas y cuánto queda sin imputar.

Además de este crédito, un cobro y un débito registrados también se imputan, cada uno desde su página Modificar imputaciones. En los tres casos el destino es una venta o un débito del mismo cliente y la misma moneda. Una venta no se imputa hacia otra transacción: solo recibe. Un cobro y un crédito tampoco reciben imputaciones.

El título muestra el tipo, el número corto y el total a imputar, con la moneda delante del importe. Por ejemplo: Crédito Nº 12 · Total a imputar: ARS 1500.00. Ese total es el tope: la suma de las filas no puede superarlo.

La tabla lista las ventas y los débitos registrados del mismo cliente y la misma moneda que todavía tienen saldo, y los que esta nota ya tenía imputados. Van por fecha, de la más antigua a la más nueva. Si la fecha coincide, siguen por el número corto, de menor a mayor.

En cada fila, «Efectivo a imputar» es la parte de esta nota que va a esa deuda. Puede:

- Pasar el crédito de una factura a otra.
- Imputar menos y dejar el resto sin imputar, a favor del cliente.
- Imputar más, hasta el total a imputar, mientras la deuda tenga lugar.
- Dejar todas las filas en cero. La nota queda entera sin imputar.
- Usar «Imputar automáticamente». Reparte el total a imputar con el mismo orden de la tabla. Solo completa las filas: el reparto se guarda al pulsar Guardar.

Al guardar, Timci devuelve el saldo a las deudas del reparto anterior y aplica el nuevo. Un tramo que no cierra la deuda baja ese saldo por el mismo importe y no genera descuento ni recargo. Un tramo que la cierra calcula la política monetaria de esa deuda con la fecha de la nota: anula el ajuste que esta nota había generado y, si la política corresponde, deja el descuento o el recargo nuevo.

Cada fila no puede superar lo que esa deuda puede recibir: su saldo abierto más lo que esta nota ya tenía aplicado ahí. El destino tiene que ser una venta o un débito registrados, del mismo cliente y la misma moneda.

Cancelar y la flecha vuelven a la ficha sin guardar. Lo que queda sin imputar puede aplicarse solo al registrar una venta posterior. «No auto-imputar» está en la ficha de la nota, no en esta página, y no reescribe lo que guarde aquí. Para poder anular una venta o un débito que recibió esta nota, deje en cero la fila de esa deuda y guarde.

## Qué puede salir mal

Sin concepto no se guarda. Sin cotización, una nota en otra moneda no se registra. El destino de una imputación tiene que estar registrado, con saldo abierto y en la misma moneda. Un borrador no reduce la deuda hasta que lo registre.

## Paso siguiente

Si además entró dinero, regístrelo como cobro. Si solo era un ajuste, con la nota registrada alcanza.
