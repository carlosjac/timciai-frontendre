# Informes

El detalle detrás de los indicadores del tablero. Cada informe responde una pregunta de cobranza de su entidad. No se cargan a mano: salen de las operaciones ya registradas.

## Para qué sirve

Sirve para bajar del número del tablero a los clientes, comprobantes e ítems que lo componen, y para llevarse ese detalle a Excel. Un borrador no entra. Una venta, un débito, un crédito o un cobro anulados dejan de contar en los informes de operación; la anulación se ve en Ajustes y anulaciones.

## Lista

Elija el informe en el selector. Arriba de la tabla están los totales del informe, por moneda. Exportar Excel baja el mismo recorte, con las fechas en el formato de su preferencia.

Hace falta la entidad en la cabecera. Sin ella, la pantalla no carga.

La barra muestra solo los filtros que cambian ese informe.

- Período: últimos 7, 30 o 90 días. Aparece en Facturado, Diario de cobranzas, Impuestos, Ventas y cobranzas, Imputaciones y Ajustes y anulaciones. En Gestión de cobranza filtra los recordatorios y los rebotes; no filtra los abonos, pero los botones siguen porque el resto del informe sí los usa.
- Moneda: todas, o una. Aparece en todos. Recorta las filas y los totales. En Gestión de cobranza no recorta los rebotes.
- Tramo de atraso: solo en Antigüedad de saldos. Todos los tramos, o uno: Al día, 1–30, 31–60, 61–90 o +90.

Antigüedad de saldos, Remanentes sin imputar y Cartera por cliente son el estado de hoy. En esos tres la pantalla oculta el período, oculta el rango de fechas y avisa que es el saldo a hoy. Quedan la moneda y, en Antigüedad de saldos, el tramo de atraso.

## Antigüedad de saldos

Sirve para decidir a quién cobrar primero. Muestra cada venta o débito registrado que todavía tiene saldo abierto, y lo ubica según los días de atraso a hoy.

Al día: todavía no venció, o no tiene fecha de vencimiento. Después, 1–30, 31–60, 61–90 y +90. El total de cada tramo es el mismo número que el gráfico de antigüedad del tablero. El total Abierto es toda la deuda abierta de ese recorte.

- Cliente, comprobante, tipo (venta o débito), moneda e importe abierto.
- Vencimiento, días de atraso y tramo. Cero días significa que no está vencido.
- Concepto: el texto de la operación.

La pantalla no muestra el período: este informe es el saldo abierto a hoy. Use la moneda para una sola, y Tramo de atraso para quedarse con uno, por ejemplo solo +90. Todos los tramos muestra la deuda abierta completa. Una deuda ya saldada no aparece.

## Facturado del período

Sirve para ver cuánto se vendió en el rango y qué ventas arman el Facturado del tablero. Lista cada venta registrada cuya fecha de operación cae en el período. La suma es ese facturado.

No incluye notas de débito, notas de crédito ni cobros. Una venta anulada no entra. El orden es por fecha y número.

- Fecha, cliente, comprobante, moneda, importe y concepto.

Cambie el período o la moneda para cerrar otro rango. Si el tablero y este informe no coinciden, revise que estén mirando el mismo período y la misma moneda.

## Diario de cobranzas

Sirve para cerrar la caja del período. Lista cada cobro registrado en el rango, con el medio de pago. La suma es el Cobrado del tablero: el dinero ingresado, aunque todavía no se haya imputado a una factura.

Un cobro en borrador no entra. Un cobro anulado tampoco. No incluye ventas ni notas de crédito.

- Fecha, cliente, comprobante, moneda, importe, medio de pago y concepto.

Si un cobro no tiene medio de pago, esa columna queda vacía. El medio se elige al registrar el cobro.

## Impuestos por alícuota

Sirve para el IVA del período. Toma el IVA de cada venta, débito o crédito registrado en el rango y lo separa por alícuota. El total de cada alícuota es el mismo que el panel de IVA del tablero.

Una nota de crédito resta. Un débito y una venta suman. Los cobros no tienen IVA aquí. Si la entidad no usa impuestos, o el comprobante no trae IVA, la fila no aparece.

- Fecha, cliente, comprobante, tipo, moneda, alícuota e IVA.

Arriba, cada total se nombra con el porcentaje. Filtre por moneda si declara una sola.

## Ventas y cobranzas

Sirve para ver, en el mismo período, a quién se le vendió y qué se vendió. Tiene dos tablas.

Por cliente: cuánto se le facturó y cuánto pagó. Ventas son las ventas registradas. Cobranzas son los cobros registrados. No suma débitos ni créditos. Un cliente puede tener ventas y cero cobranzas, o al revés. Los totales de arriba son esas dos sumas.

Por ítem: cantidad e importe de las líneas de esas ventas. El nombre es el del producto. Si la línea no tiene producto, usa la descripción de la línea. El importe es el subtotal de la línea, sin repartir el IVA en otra columna.

Sirve para saber qué clientes concentran la facturación y qué productos se movieron. No dice si esa venta sigue impaga: para el saldo use Cartera o Antigüedad.

## Imputaciones

Sirve para ver a qué deuda se aplicó cada cobro o cada nota de crédito del período. Una fila es un tramo aplicado: el origen es el cobro o el crédito, y el destino es la venta o el débito.

- Fecha, cliente y moneda del origen.
- Origen y su número, con el importe total de ese cobro o crédito.
- Destino, su número y su vencimiento.
- Aplicado: lo que este tramo descontó de esa deuda.
- Abierto destino: lo que esa deuda sigue debiendo ahora. Si es cero, el estado es Cierre. Si queda saldo, es Parcial.
- Ajuste: el descuento o recargo de política que se generó al cancelar esa deuda con ese cobro. Cero si no hubo ajuste.

El total Aplicado suma los tramos, no el importe entero del cobro. Un cobro imputado a dos facturas sale en dos filas. El período mira la fecha del cobro o del crédito, no la de la factura. Sirve para explicar un saldo y para revisar si el dinero se aplicó a la deuda que usted quería.

## Remanentes sin imputar

Sirve para encontrar dinero o crédito a favor que todavía no se aplicó a ninguna deuda. Lista cobros y notas de crédito registrados con un resto sin imputar. El total Remanente es el Saldo a favor del tablero.

Es el saldo a hoy. La pantalla no muestra el período. La moneda sí lo recorta.

- Fecha, cliente, comprobante, tipo (cobro o crédito) y moneda.
- Importe: el total del documento. Imputado: lo ya aplicado. Remanente: lo que falta aplicar.
- Fuera de FIFO: Sí cuando ese documento se guardó con «No auto-imputar». Ese resto no se aplica solo a la próxima venta; hay que imputarlo a mano desde el cobro o el crédito. No: la próxima venta registrada puede tomarlo sola.

Sirve para no dejar un cobro olvidado y para saber cuáles exigen una imputación manual. Un documento ya aplicado por completo no aparece.

## Ajustes y anulaciones

Sirve para ver, en el período, lo que no es una venta ni un cobro nuevo: los ajustes que nacieron al cobrar, y lo que se anuló.

Ajustes de política. Descuentos y recargos creados al registrar un cobro o un crédito, según la política monetaria. El tipo dice si es débito o crédito. Con signo: el crédito resta y el débito suma, igual que el ajuste del tablero. Disparado por es el número del cobro que lo originó. El concepto explica la banda. El total Ajustes usa ese signo.

Anulaciones. Documentos operativos anulados en el período. La fecha es la de la anulación, no la original del comprobante. Reverso es el comprobante que revirtió el movimiento. El total Anulaciones suma esos importes. Sirve para revisar qué se dio de baja en el rango y con qué documento quedó la reversa.

Una anulación no se puede deshacer. El documento anulado ya no entra en Facturado, en el Diario ni en la antigüedad.

## Cartera por cliente

Sirve para ver cuánto debe, o cuánto tiene a favor, cada cliente. Una fila es la cuenta corriente de ese cliente en esa moneda. Es el saldo de hoy. La pantalla no muestra el período. La moneda sí lo recorta.

Positivo: el cliente debe. Negativo: tiene saldo a favor. Cero: la cuenta está saldada. El total Saldo suma esas cuentas en la moneda.

No es el detalle de cada comprobante ni el saldo a favor sin imputar. Para ver qué documentos siguen abiertos, use Antigüedad. Para ver solo el resto de un cobro, use Remanentes. Sirve para el estado de cuenta de un cliente y para comparar clientes entre sí.

## Gestión de cobranza

Sirve para la gestión del día: a quién ya se le avisó la deuda, qué correos no llegan y qué abonos se van a facturar o se frenaron. Tiene tres bloques.

Recordatorios enviados. Cada aviso de deuda vencida que salió en el período, con la fecha de evaluación, el cliente y la moneda. El período y la moneda sí lo filtran. Sirve para no volver a reclamar el mismo día a quien ya recibió el aviso, y para ver a quién no se le avisó.

Rebotes duros. Mails que el servidor del destinatario rechazó de forma permanente en el período: email, subtipo y diagnóstico, y el cliente cuando el rebote está ligado a uno. El período los filtra. La moneda no: se listan todos los del rango. Sirve para corregir el contacto antes de volver a notificar. Atender el rebote se hace en Rebotes de email; este informe los deja juntos para el rango.

Suscripciones. Todos los abonos, no solo los del período. El período no los cambia; por eso en este informe los botones de período siguen visibles: los usan los recordatorios y los rebotes. Inicio, fin, próximo cobro y cada cuántos meses factura. Con próximo cobro: tiene fecha para la próxima factura. En 7 días: esa fecha cae de hoy a siete días. Detenida: la última facturación falló; la columna Error trae el motivo. Arriba del cuadro, los mismos tres conteos por moneda. La moneda del selector recorta los abonos. Sirve para preparar la facturación de la semana y para retomar un abono detenido por falta de precio o de cotización.

## Qué puede salir mal

Sin la entidad en la cabecera no hay datos. Un período distinto al del tablero muestra otros totales: Facturado, Cobrado e IVA del tablero usan el mismo criterio solo si el rango y la moneda coinciden. Antigüedad, remanentes y cartera no tienen período: son el saldo de hoy. En Gestión de cobranza, el período mueve recordatorios y rebotes, y no mueve los abonos. La moneda no mueve los rebotes. Un borrador no aparece hasta que lo registre.

## Paso siguiente

Exporte el informe si lo va a compartir. Para corregir un saldo, abra el cliente o la operación. Para una deuda vieja, priorice el tramo +90. Para un correo que no llega, corrija el contacto del rebote.
