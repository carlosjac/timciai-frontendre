# Emails salientes

Cada correo que su entidad intenta enviar queda aquí: a quién, con qué asunto y si salió. No se crean a mano desde esta lista.

## Para qué sirve

Sirve para comprobar que el cliente recibió el aviso, para leer por qué no salió y para volver a encolar un envío fallido. El rechazo permanente de una dirección también queda en Rebotes de email.

## Cuándo sale un correo

Un borrador no avisa. El correo se encola al registrar la operación, si el cliente tiene un contacto con correo y con el aviso de ese tipo marcado:

- Notif. ventas, al registrar una venta.
- Notif. débitos, al registrar un débito.
- Notif. créditos, al registrar un crédito.
- Notif. cobranzas, al registrar un cobro.
- Notif. pagos vencidos, en el recordatorio de mora, según la política de mora del cliente.

En la ficha de una operación ya registrada, Emails enviados lista los de esa operación. Reenviar notificación crea un correo nuevo para los contactos de ese tipo. El envío anterior no se modifica.

Si la entidad está en modo prueba, los correos salen solo al buzón de prueba.

El Tipo de la ficha es el código del aviso:

- `commercial_transaction_registered`: el aviso al registrar la operación.
- `overdue_balance_reminder`: el recordatorio de deuda vencida.
- `entity_signup_ready`: el aviso de que el acceso quedó listo.
- `ops_alert_…`: un aviso interno de una alerta. El asunto empieza por «[Timci]». No es el correo al cliente. Reintentarlo vuelve a enviar ese aviso, no la factura.

## Lista

Hace falta la entidad en la cabecera. La lista trae los más nuevos primero. No hay botón Crear.

- Acciones: Reintentar, solo si el estado es Fallido y usted puede gestionar correos.
- Estado: en qué punto está el envío. Más abajo está cada uno.
- Asunto y destinatarios.
- Intentos: cuántos se hicieron y el máximo, por ejemplo 2/5.
- Último error: el motivo del fallo, cuando lo hay.
- Creado: cuándo se encoló.

Puede marcar varios Fallidos y usar Reintentar seleccionados. El lote toma hasta 50. Un Enviado no se puede marcar. Exportar CSV baja el listado con las columnas visibles.

## Estados

- Pendiente de envío (`pending_send`): está en la cola. Todavía no salió.
- Esperando comprobante (`pending_attachment`): el correo espera el PDF. Cuando el comprobante se emite, pasa a pendiente de envío. Si la emisión no se concreta, puede quedar cancelado.
- Enviando (`sending`): el envío está en curso.
- Enviado (`sent`): salió. La ficha muestra la fecha en Enviado. Un rebote puede llegar después: el estado sigue en Enviado y el rechazo se ve en Rebotes de email.
- Fallido (`failed`): no salió. Si hay próximo intento, es un fallo temporal y el sistema vuelve a probar solo, con esperas de 1, 5, 15, 60 y 360 minutos, hasta agotar el máximo. Si no hay próximo intento, es un rechazo permanente o se acabaron los intentos: no se reintenta solo.
- Cancelado (`cancelled`): no se va a enviar. En esta lista no hay Reintentar. En la ficha de la operación, Reintentar también aparece si está cancelado.

## Ficha

Ve el estado, el tipo, el asunto, los destinatarios, los intentos, cuándo se creó, el próximo intento y cuándo se envió. El último error, si existe, queda en rojo debajo.

Intentos de envío lista cada prueba:

- Intento y la hora de inicio.
- Resultado: Enviado, Fallo temporal o Fallo permanente.
- Último error: el texto de esa prueba.

Reintentar, arriba, solo si está Fallido. Vuelve a dejarlo pendiente de envío y el conteo de intentos empieza de nuevo. No cambia la dirección. Si el correo era inválido, va a fallar otra vez: corríjalo en el cliente antes.

## En la operación

En la venta, el débito, el crédito o el cobro registrado, el cuadro Emails enviados muestra el estado y el asunto. Ver abre esta ficha. Reintentar aparece en Fallido y también en Cancelado. Reenviar notificación pide confirmación y genera un correo nuevo. Si la operación sigue en borrador y no hay correos, el cuadro no se muestra.

## Qué puede salir mal

Sin la entidad en la cabecera, la lista no carga. Reintentar un Fallido permanente sin corregir el contacto repite el mismo rechazo. Un correo Esperando comprobante no sale hasta que el comprobante se emita. En modo prueba, el cliente no recibe el mensaje: lo recibe el buzón de prueba.

## Paso siguiente

Si el error dice que la dirección fue rechazada, corrija el contacto del cliente y revise Rebotes de email. Si el comprobante no se emitió, ábralo desde Comprobantes y reintente la emisión antes de reenviar el aviso.
