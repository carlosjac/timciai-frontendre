# Rebotes de email

Un rebote es la respuesta del servidor del destinatario: no aceptó el correo. No se cargan a mano. Llegan después del envío, aunque en Emails salientes ese mensaje figure como Enviado.

## Para qué sirve

Sirve para ver qué direcciones hay que corregir antes de volver a avisar. Mientras un rebote duro siga sin atender, el tablero lo cuenta en Mails rebotados y puede haber una alerta «Rebote duro de email». Al registrar una venta, un débito, un crédito o un cobro, si el cliente tiene un rebote o un rechazo sin atender, la pantalla lo advierte. Puede seguir, y conviene corregir el correo antes.

## Lista

Hace falta la entidad en la cabecera. Si no cambia el orden, los más nuevos quedan primero. Puede ordenar por email, por tipo o por fecha. La lista incluye atendidos y pendientes. No hay botón Crear.

- Acciones: Atender, solo si todavía no tiene fecha en Atendido y usted puede marcarlo.
- Email: la dirección rechazada.
- Tipo: el código que trajo el servidor. Más abajo está cada uno. El color rojo es un problema permanente. El amarillo es un atraso.
- Subtipo y diagnóstico: el detalle del servidor, por ejemplo buzón inexistente o buzón lleno.
- Ocurrido: cuándo rebotó.
- Atendido: cuándo lo marcó. Vacío significa pendiente.

Abra la fila para la ficha. Exportar CSV baja las columnas visibles.

## Tipos

- `hard`, rebote duro. El servidor rechazó la dirección de forma permanente y no va a aceptarla. Hay que corregir el contacto. Es el que cuenta en Mails rebotados mientras no lo atienda, y el que abre la alerta.
- `soft`, rebote blando. Fue temporal: el buzón estaba lleno o el servidor pidió esperar. La dirección puede servir más adelante. No entra en el recuento de Mails rebotados.
- `complaint`, queja. El destinatario marcó el correo como no deseado. Trátelo como un problema de esa dirección: no siga enviando el mismo aviso sin revisar el contacto.

El subtipo y el diagnóstico dicen cuál de los dos caminos tomar. «User unknown» o un buzón inexistente piden otra dirección. Un buzón lleno puede esperar.

## Ficha

Repite la dirección, el tipo, el subtipo, el diagnóstico, cuándo ocurrió y cuándo se atendió. Si el rebote está ligado a un cliente, Cliente ofrece Corregir contacto del cliente y abre la edición de ese cliente. Si no hay cliente, no hay enlace: la dirección no se pudo asociar a uno.

Esta ficha no tiene Atender. Se atiende desde la lista.

## Atender

Atender escribe la fecha y saca el rebote de los pendientes. El tablero deja de contarlo y se cierra la alerta de ese rebote. El registro sigue en la lista. No cambia el correo del cliente y no reenvía el mensaje. Si vuelve a notificar la misma dirección inválida, puede aparecer otro rebote.

## Qué puede salir mal

Sin la entidad en la cabecera, la lista no carga. Atender un rebote duro sin corregir el contacto deja el problema para el próximo aviso. Un rebote blando no se corrige igual que uno duro: espere o reintente el envío desde Emails salientes si el correo quedó Fallido. Un Enviado en Emails salientes no garantiza que el destinatario lo haya aceptado.

## Paso siguiente

Corrija el correo en el cliente y atienda el rebote cuando el aviso ya no le sirva. El envío nuevo se hace al registrar otra operación o con Reenviar notificación en la ficha de la operación.
