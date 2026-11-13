# Emails salientes

Cada correo que una entidad intenta enviar queda aquí: a quién, con qué asunto y si salió. No se crean a mano desde esta lista.

## Para qué sirve

Sirve para ver si el aviso al cliente salió, por qué falló y si hay que reintentarlo. También quedan los avisos internos de una alerta. Elija la entidad en la cabecera: la lista es de esa organización. Quien administra la entidad ve los mismos envíos de su operación.

## Cuándo sale un correo

Un borrador no avisa. El correo se encola al registrar, si el cliente tiene un contacto con correo y con el aviso de ese tipo: ventas, débitos, créditos, cobranzas o pagos vencidos.

En la ficha de una operación registrada, Reenviar notificación crea un correo nuevo. El anterior no se modifica. En modo prueba, los correos salen solo al buzón de prueba.

El Tipo de la ficha es el código:

- `commercial_transaction_registered`: aviso al cliente al registrar.
- `overdue_balance_reminder`: recordatorio de deuda vencida.
- `entity_signup_ready`: el acceso de una alta quedó listo.
- `ops_alert_…`: aviso interno de una alerta. El asunto empieza por «[Timci]». Va a quien recibe las alertas de esa audiencia. Un fallo de este aviso no abre otra alerta, para no entrar en bucle. Reintentarlo reenvía el aviso interno, no la factura del cliente.

Si el fallo es de transporte, la alerta de la entidad es «Fallo de envío SMTP». Si la dirección es inválida, es «Email rechazado por el destinatario». El rebote que llega después está en Rebotes de email.

## Lista

Los más nuevos primero. No hay alta.

- Reintentar, solo en Fallido, si usted puede gestionar correos.
- Estado, asunto, destinatarios, intentos (hechos y máximo) y último error.
- Creado: cuándo se encoló.

Reintentar seleccionados toma hasta 50 Fallidos. Un Enviado no se marca. Exportar CSV baja las columnas visibles.

## Estados

- Pendiente de envío (`pending_send`): en la cola.
- Esperando comprobante (`pending_attachment`): espera el PDF. Al emitirse, pasa a pendiente de envío. Si la emisión no se concreta, puede quedar cancelado.
- Enviando (`sending`): en curso.
- Enviado (`sent`): salió. Un rebote posterior no cambia este estado.
- Fallido (`failed`): no salió. Con próximo intento, el sistema reintenta solo a los 1, 5, 15, 60 y 360 minutos, hasta el máximo. Sin próximo intento, fue un rechazo permanente o se agotaron los intentos.
- Cancelado (`cancelled`): no se envía. En esta lista no hay Reintentar. En la operación, Reintentar también está disponible si quedó cancelado.

## Ficha

Estado, tipo, asunto, destinatarios, intentos, creación, próximo intento y fecha de envío. El último error queda debajo, en rojo.

Intentos de envío: número, hora, resultado (Enviado, Fallo temporal o Fallo permanente) y el error de esa prueba.

Reintentar deja el mensaje otra vez pendiente y el conteo empieza de cero. No corrige la dirección.

## En la operación

El cuadro Emails enviados está en la venta, el débito, el crédito o el cobro registrado. Ver abre esta ficha. Reintentar cubre Fallido y Cancelado. Reenviar notificación genera un correo nuevo a los contactos de ese tipo.

## Qué puede salir mal

Sin entidad en la cabecera, la lista no carga. Reintentar un rechazo permanente sin corregir el contacto lo repite. Un correo que espera comprobante no sale hasta la emisión. En modo prueba el cliente no lo recibe.

## Paso siguiente

Corrija el contacto si la dirección fue rechazada, revise el rebote y, si el comprobante no se emitió, reintente la emisión antes de reenviar el aviso.
