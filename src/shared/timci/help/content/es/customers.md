# Clientes

Cada persona o empresa a la que le vende y le cobra.

## Para qué sirve

La venta, el abono y el cobro necesitan un cliente. En la ficha consulta qué quedó registrado, cuánto correspondería cobrar en una fecha y qué cobro o crédito se aplicó a cada deuda.

## Cuándo usarla

Al dar de alta a alguien, al corregir el correo de un contacto, al cambiar cómo se le vende o al revisar qué debe.

## Lista

Ve los clientes de la entidad elegida en la cabecera. Puede crear uno, editarlo o importar varios desde Excel.

Para importar, descargue la plantilla de esta entidad. La primera hoja explica cómo completarla. La fecha de corte es la de los saldos iniciales. Si no la indica, es hoy. Elija el archivo y confirme. Al terminar ve cuántos se crearon, cuántos ya existían y qué filas fallaron.

## Alta

Hay dos bloques: quién es y cómo se le vende.

Quién es: nombre, dirección, país, tipo de persona (física o jurídica), tipo de documento y número. El nombre, el tipo y el número de documento quedan fijos después de guardar.

Cómo se le vende propone los valores de las operaciones con este cliente. Si la entidad ya tiene moneda, plazo y políticas, el alta los muestra resumidos. Cambiar abre esos campos para este cliente. La lista de precios se elige siempre aparte.

Si la entidad gestiona impuestos, al final aparece el perfil impositivo. Los datos dependen del país de la entidad y se usan al emitir.

Si quiere avisos por correo, guarde al menos un contacto con email y marque qué avisos recibe.

## Ficha

La ficha tiene Datos generales, Contactos y, si puede ver la cuenta, Cuenta corriente, Liquidación e Imputaciones. Esas tres últimas son de consulta: no registran un cobro ni modifican saldos. Para corregir datos o contactos use Editar. Un cliente inactivo no se edita: actívelo desde esta ficha.

## Datos generales

Identifican al cliente.

- Nombre, tipo de documento y número: se ven y no se cambian.
- Dirección y país: se corrigen en Editar.
- Tipo de persona: persona física o persona jurídica.
- Activo: si está inactivo no entra en operaciones nuevas hasta que lo active.
- Cómo se le vende: queda plegado en esta pestaña. El detalle de cada campo está más abajo.
- Perfil impositivo: solo si la entidad gestiona impuestos.
- Al final, quién creó y quién modificó el registro, y cuándo.

## Cómo se le vende

Estos valores se proponen al registrar una venta, un débito, un crédito, un cobro o un abono de este cliente. En cada operación puede cambiarlos.

- **Lista de precios.** De qué lista salen los precios de los productos y servicios. Al agregar un ítem, Timci completa el precio de esa lista. Si el cliente tiene otra condición comercial, elija otra lista.
- **Moneda por defecto.** Moneda que se propone en las operaciones. Tiene que ser una de las que la entidad acepta. La cuenta corriente se abre por moneda: si alguna vez le vende en otra, aparece otra cuenta.
- **Política de notificación de mora por defecto.** Cuándo se envía el aviso de deuda vencida. Las opciones son las que la entidad dejó disponibles: no avisar, avisar todos los días desde el día siguiente al vencimiento, avisar un día fijo de la semana, o avisar los lunes del mes a partir del día 14 y a partir del día 21. Quién recibe ese aviso se marca en el contacto, en Notif. pagos vencidos. Sin correo en el contacto, el aviso no sale.
- **Días de plazo de pago.** Días desde la fecha de la operación hasta el vencimiento, cuando esa operación no indica otro plazo. Cero vence el mismo día. El plazo del cliente reemplaza al plazo de la entidad para este cliente.
- **Política monetaria por defecto.** Regla de descuento o recargo según cuándo se paga, respecto de la emisión o del vencimiento. Se copia a la venta o al débito. El importe registrado no cambia. Lo que cambia es lo que corresponde pagar en una fecha: descuento si paga antes, recargo si paga tarde, o nada. «Sin descuentos ni recargos» deja el importe como se registró. La pestaña Liquidación muestra ese efecto antes de cobrar. El ajuste se genera al cobrar, no al mirar la ficha.

## Contactos

Personas a las que Timci puede avisar. Cada una tiene nombre, correo y teléfono.

Los avisos se marcan por contacto:

- Notif. ventas: cuando se registra una venta.
- Notif. créditos: cuando se registra una nota de crédito.
- Notif. débitos: cuando se registra una nota de débito.
- Notif. cobranzas: cuando se registra un cobro.
- Notif. pagos vencidos: el recordatorio de mora, en las fechas de la política de mora del cliente.

Puede agregar varios, quitar uno y cambiar el orden. En Editar, los contactos se guardan con su propio botón, aparte de los datos generales. Un contacto sin correo no recibe avisos.

## Cuenta corriente

Es el historial de lo ya registrado con este cliente, en la moneda que elija arriba. Hay una cuenta por moneda. El saldo del selector es el saldo de esa cuenta.

El saldo positivo significa que el cliente debe. El saldo cero o negativo significa que queda saldo a su favor.

La tabla es el extracto, con el movimiento más reciente primero:

- Número y fecha de la operación. El número abre esa venta, débito, crédito o cobro.
- Tipo. En una venta ve si está Pagada o Impaga. En un cobro o un crédito ve si está Imputado o Sin imputar, y el monto que todavía no se aplicó a una deuda.
- Concepto.
- Comprobante emitido, cuando existe, con enlace a ese documento.
- Estado: registrada o anulada. Un borrador todavía no entra en la cuenta.
- Importe del movimiento.
- Saldo acumulado después de ese movimiento.

Descargar PDF baja el extracto de la moneda elegida. Esta pestaña no aplica descuentos ni recargos por la fecha en que usted la mira: muestra los importes registrados.

## Liquidación

Responde cuánto correspondería cobrar en una fecha, con la política monetaria de cada deuda todavía abierta.

Elija la moneda y la fecha de «A pagar al». Por defecto es hoy. Cambiar la fecha recalcula. Mirar esta pestaña no registra nada y no modifica la cuenta corriente.

Solo entran ventas y débitos registrados que todavía tienen saldo abierto. Un cobro o una nota de crédito no aparecen como fila: ya redujeron ese abierto al imputarse. Si no queda nada abierto en esa fecha, la tabla queda vacía.

En cada fila:

- Número, fecha, vencimiento, tipo y concepto.
- Abierto: lo que falta saldar de esa deuda, al importe registrado.
- Ajuste: el descuento o el recargo que la política monetaria de esa operación calcula para la fecha elegida. El recargo suma. El descuento resta. Cero significa que en esa fecha la política no cambia el importe.
- A pagar: abierto más el ajuste. Es lo que correspondería cobrar de esa fila en esa fecha.

Arriba, Abierto suma los saldos abiertos, Ajuste suma los descuentos y recargos, y Total a saldar es lo que correspondería cobrar en conjunto.

La cuenta corriente y la liquidación se leen juntas. La cuenta corriente es el extracto de todo lo registrado y su saldo. La liquidación es el cálculo, a una fecha, de las deudas que siguen abiertas, ya con el descuento o el recargo de cada una. El total a saldar puede diferir del saldo de la cuenta porque el ajuste todavía no se registró: se genera al cobrar.

## Imputaciones

Muestra en qué deuda se aplicó cada cobro o cada nota de crédito, en la moneda elegida. Es de consulta: desde aquí no se imputa ni se desimputa.

Cada fila es un enlace:

- Origen: el cobro o el crédito que aportó el dinero, con su número, fecha y concepto. El enlace abre esa operación.
- Imputado: cuánto de ese origen se aplicó a esa deuda.
- Destino: la venta o el débito que se saldó, con su número, fecha y concepto. El enlace abre esa deuda.

Sirve cuando un cobro cubre varias facturas, cuando una factura se pagó con varios cobros, o cuando necesita ver por qué una venta figura Pagada o un cobro figura Sin imputar. La suma imputada de un origen puede ser menor que su importe: el resto sigue sin imputar y queda disponible para otra deuda. Si no hay filas, en esa moneda todavía no se aplicó ningún cobro ni crédito a una deuda.

## Qué puede salir mal

Sin la entidad elegida en la cabecera, el listado no carga. Un contacto sin correo no recibe avisos. Si hay rebotes de correo sin atender, puede seguir, y conviene corregir el correo antes de volver a avisar. La moneda por defecto tiene que ser una de las aceptadas por la entidad. Sin lista de precios no puede guardar el cliente.

## Paso siguiente

Registre una venta o cree un abono.
