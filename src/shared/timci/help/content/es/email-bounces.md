# Rebotes de email

La respuesta del servidor del destinatario: no aceptó el correo. No se cargan a mano. Pueden llegar aunque en Emails salientes el mensaje figure como Enviado.

## Para qué sirve

Sirve para ver qué direcciones hay que corregir antes de volver a avisar. Elija la entidad en la cabecera. El tablero de esa entidad cuenta en Mails rebotados los rebotes duros que nadie atendió, y cada uno puede abrir la alerta «Rebote duro de email». Quien administra la entidad ve los rebotes de su organización y los atiende desde la misma lista.

## Lista

Si no cambia el orden, los más nuevos quedan primero. Puede ordenar por email, por tipo o por fecha. Incluye atendidos y pendientes. No hay alta.

- Atender, solo si sigue pendiente.
- Email, tipo, subtipo, diagnóstico, fecha en que ocurrió y fecha en que se atendió.
- El tipo se muestra con el código del servidor. Rojo: problema permanente. Amarillo: atraso.

Abra la fila para la ficha. Exportar CSV baja las columnas visibles.

## Tipos

- `hard`, rebote duro. Rechazo permanente. Hay que corregir el contacto. Cuenta en Mails rebotados hasta que se atiende, y abre la alerta.
- `soft`, rebote blando. Temporal: buzón lleno o servidor que pidió esperar. No entra en ese recuento.
- `complaint`, queja. El destinatario lo marcó como no deseado. Conviene dejar de enviar a esa dirección hasta revisarla.

El subtipo y el diagnóstico distinguen un buzón inexistente, que pide otra dirección, de un buzón lleno, que puede esperar.

## Ficha

Dirección, tipo, subtipo, diagnóstico, ocurrido y atendido. Si hay cliente, Corregir contacto del cliente abre su edición. Si no hay cliente, la dirección no quedó asociada a uno.

Atender se hace en la lista, no en esta ficha.

## Atender

Escribe la fecha, lo saca del recuento de Mails rebotados y cierra la alerta de ese rebote. El registro sigue en la lista. No cambia el correo ni reenvía el mensaje. La misma dirección inválida puede rebotar de nuevo.

## Qué puede salir mal

Sin entidad en la cabecera, la lista no carga. Atender sin corregir el contacto deja el fallo para el próximo aviso. Un Enviado en Emails salientes no prueba que el destinatario lo haya aceptado. Un rebote blando no se trata como uno duro.

## Paso siguiente

Corrija el contacto del cliente y atienda el rebote cuando ya no deba contar. El nuevo envío sale al registrar otra operación o con Reenviar notificación.
