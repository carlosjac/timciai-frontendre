# Alertas

Un aviso de que algo de la operación no pudo terminar: un correo que no llegó, o un abono que no pudo facturar. No se crean a mano.

## Para qué sirve

Sirve para ver qué falló, abrir el cliente o el abono que hay que corregir, y marcar el aviso cuando ya lo revisó. Mientras siga pendiente, arriba aparece «Hay N alerta(s) pendiente(s)» con Ver alertas. Ese número no cuenta las que ya atendió.

Si va a notificar a un cliente y tiene un rebote o un rechazo sin atender, la venta, el débito, el crédito o el cobro se lo advierte. Puede seguir, y conviene corregir el correo antes.

## Cuándo usarla

Cuando aparece el aviso de arriba, o cuando un cliente no recibe mails, o cuando un abono figura con error de facturación.

## Lista

Hace falta la entidad elegida en la cabecera. La lista trae las alertas de esa entidad, la más nueva primero. Incluye las pendientes y las ya atendidas.

- Acciones: Atender, solo si la alerta sigue pendiente y usted puede marcarla.
- Tipo: el código del fallo. Más abajo está qué significa cada uno.
- Severidad: Error cuando el correo no llegó. Advertencia cuando el abono no pudo facturar.
- Título y resumen: qué pasó, en una frase. El resumen trae la dirección, el cliente o la fecha.
- Creada: cuándo se generó. Puede filtrar por tipo o por fecha.

No hay botón Crear. Abra la fila para ver la ficha.

## Rebote duro de email

Tipo `email_bounce_hard`. Título «Rebote duro de email». El servidor del destinatario rechazó la dirección de forma permanente y no va a aceptarla.

El resumen nombra la dirección. El enlace abre el cliente para corregir el correo, o el rebote si no hay cliente. Atender el rebote en Rebotes de email cierra también esta alerta. Corrija el contacto antes de volver a registrar una operación que avise.

## Email rechazado por el destinatario

Tipo `recipient_rejected`. Título «Email rechazado por el destinatario». El envío falló porque la dirección no es válida para ese servidor. Es un rechazo permanente, no un atraso del correo.

El enlace abre el cliente, o el correo enviado si no hay cliente. Cambie la dirección y atienda la alerta cuando ya no deba aparecer en el aviso de pendientes.

## Abono sin facturar

Tipo `subscription_billing_blocked`. Hay dos títulos:

- «Abono sin precio para facturar»: en la lista de precios del abono no hay un precio vigente para esa fecha y esa moneda.
- «Abono sin cotización para facturar»: falta la cotización de la moneda para ese día.

El resumen nombra al cliente y la fecha. El enlace abre el abono. Cuando esa fecha se factura bien, la alerta se cierra sola. Si sigue pendiente, cargue el precio o espere la cotización: la siguiente pasada retoma la venta y la registra.

## Ficha

Ve la severidad, el tipo, el resumen, cuándo se creó y si está pendiente o atendida. Atender, arriba, la marca como atendida y la saca del aviso de pendientes. No corrige el correo ni el precio: eso se hace en el enlace.

- Abrir elemento relacionado: el abono, el cliente o el rebote, según el fallo.
- Editar email del cliente: cuando la alerta está ligada a un cliente.

Una alerta ya atendida muestra la fecha en Atendida y ya no ofrece Atender.

## Qué puede salir mal

Sin la entidad en la cabecera, la lista no carga. Atender sin corregir la causa deja el problema: el próximo envío o la próxima facturación pueden generar otra alerta. Una venta en borrador no avisa al cliente. El rebote y el rechazo aparecen cuando el correo ya salió y volvió mal. El abono genera la alerta en la pasada de facturación, no al guardar el abono.

## Paso siguiente

Corrija el correo del cliente o el precio del abono, y atienda la alerta cuando el aviso ya no le sirva.
