# Configuración de entidad

Define cómo opera esta entidad: contacto, monedas, plazos, avisos de mora y cómo le pagan.

## Para qué sirve

Estos datos se proponen al crear un cliente y, desde el cliente, al crear una venta, un débito, un crédito, un cobro o un abono. Guardar Datos generales marca el primer paso de la puesta en marcha.

## Cuándo usarla

Al empezar, y cada vez que cambie el correo, un medio de pago, la moneda por defecto, el plazo o la política monetaria.

## En esta pantalla

Hay dos pestañas. Cada una se guarda con su propio botón. Guardar una no guarda la otra.

## Datos generales

- Dirección, correo y teléfono: el contacto de la entidad. El correo es el de la cuenta.
- Correo de prueba: solo mientras la entidad está en modo prueba. En prueba, Para y Cc de todos los avisos son esta dirección. Si lo deja vacío, se usa el correo de la entidad. Al pasar a producción, los avisos van a los contactos del cliente.
- País por defecto: se propone al crear un registro que pide país.
- Monedas aceptadas: en cuáles puede operar. La moneda por defecto y la moneda base tienen que estar entre ellas. No puede quitar una moneda si ya hay registros que la usan.
- Moneda por defecto: se propone al crear operaciones y clientes.
- Moneda base: en la que se expresan los totales de la entidad y el importe en moneda base al registrar una transacción.
- Política de notificación de mora por defecto, y las políticas disponibles: cuáles puede elegir en un cliente y cuál se propone. El aviso de deuda vencida usa la política del cliente. Las opciones van desde no avisar hasta avisar todos los días o un día fijo de la semana.
- Días de plazo de pago por defecto: días desde la operación hasta el vencimiento, cuando el cliente o la operación no indican otro. Cero vence el mismo día.
- Política monetaria por defecto: descuento o recargo según cuándo se paga. Se propone en clientes y operaciones. «Sin descuentos ni recargos» deja el importe registrado.

Si la entidad está en prueba y usted puede pasarla a producción, el botón está en esta pestaña. Pasar a producción borra las operaciones, los saldos, los comprobantes, la numeración y los correos de práctica. Conserva clientes, productos, listas de precios y abonos. No hay vuelta atrás: confirme escribiendo el nombre de la entidad.

## Medios de pago

Cada medio tiene nombre, instrucciones (cuenta, alias, CBU u otro texto) y las monedas en las que se usa. Esas monedas salen de las aceptadas. El cobro pide un medio activo.

Deje al menos uno activo. Puede agregar, quitar, ordenar, activar y desactivar. Desactivar uno lo oculta en cobros nuevos. Tiene que quedar al menos un medio activo.

## Qué puede salir mal

La moneda por defecto y la moneda base tienen que estar entre las monedas aceptadas. Debe quedar al menos un medio de pago activo. La política de mora por defecto tiene que estar entre las disponibles.

## Paso siguiente

Cree una lista de precios.
