# Alertas

Un aviso de que falló algo de una entidad: la emisión de un comprobante, el envío de correo, un rebote o la facturación de un abono. No se crean a mano.

## Para qué sirve

Sirve para ver el fallo, abrir el comprobante, el correo, el cliente o el abono, y marcarlo cuando ya lo revisó. El tablero las cuenta en Salud mientras siguen pendientes. Arriba, «Hay N alerta(s) pendiente(s)» usa ese mismo recuento. Las atendidas siguen en la lista y ya no suman.

Elija la entidad en la cabecera. Ve las alertas de esa organización. Quien administra la entidad ve las de operación (rebote, rechazo y abono). Usted ve esas y, además, las de emisión y de SMTP.

## Cuándo usarla

Cuando Salud muestra emisión fallida o SMTP fallido, cuando el aviso de pendientes es mayor que cero, o cuando una entidad no recibe comprobantes o correos.

## Lista

La más nueva primero. Incluye pendientes y atendidas.

- Acciones: Atender, solo si sigue pendiente.
- Tipo: el código del fallo.
- Severidad: Error en correo y en emisión. Advertencia cuando un abono no pudo facturar.
- Título, resumen y fecha de creación. Puede filtrar por tipo o por fecha.

No hay alta. Abra la fila para la ficha.

## Fallo al emitir comprobante

Tipo `document_issue_failed`. Título «Fallo al emitir comprobante». La emisión terminó mal de forma definitiva. El resumen trae el mensaje de error. El enlace abre el comprobante. Desde ahí puede reintentar la emisión. Atender la alerta no vuelve a emitir: solo la saca de Salud.

## Fallo de envío SMTP

Tipo `smtp_transport_failed`. Título «Fallo de envío SMTP». El correo no salió por el transporte, no porque la dirección del cliente sea inválida. El enlace abre el correo enviado. Revise el servidor de salida. Un rechazo de la dirección del destinatario es otra alerta, la de más abajo.

## Rebote duro de email

Tipo `email_bounce_hard`. Título «Rebote duro de email». La dirección fue rechazada de forma permanente. El resumen la nombra. El enlace abre el cliente o el rebote. Atender el rebote en Rebotes de email cierra esta alerta.

## Email rechazado por el destinatario

Tipo `recipient_rejected`. Título «Email rechazado por el destinatario». El servidor rechazó la dirección. El enlace abre el cliente o el correo enviado. Corrija la dirección antes de volver a notificar.

## Abono sin facturar

Tipo `subscription_billing_blocked`. «Abono sin precio para facturar» o «Abono sin cotización para facturar». El enlace abre el abono. Si esa fecha se factura después, la alerta se cierra sola.

## Ficha

Ve severidad, tipo, resumen, fecha de creación y si está pendiente o atendida. Atender marca la fecha y la saca del recuento. No corrige la causa: use Abrir elemento relacionado o Editar email del cliente.

## Qué puede salir mal

Sin entidad en la cabecera, la lista no carga. Atender sin corregir el comprobante, el SMTP, el correo o el precio deja el fallo para la próxima vez. Una operación en borrador no emite comprobante ni avisa al cliente. El fallo de emisión y el de SMTP aparecen al registrar. El rebote y el rechazo aparecen cuando el correo ya salió y volvió mal. El abono genera la alerta en la pasada de facturación.

## Paso siguiente

Abra el comprobante, el correo o el abono del enlace, corrija la causa y atienda la alerta cuando ya no deba contar en Salud.
