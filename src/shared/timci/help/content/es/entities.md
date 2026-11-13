# Entidades

Cada entidad es la cuenta que opera un administrador: clientes, ventas y cobros. Usted da de alta esas cuentas y decide cuándo pasan a producción.

## Para qué sirve

Sirve para crear una entidad, revisar si está en prueba o en producción, completar lo que le falta para operar y activarla o desactivarla. El tablero, en Listas para operar, marca lo que todavía falta: emisión, impuestos, un medio de pago y el logo.

## Lista

La lista muestra el nombre, el modo de operación y si está activa. Filtre por nombre o por estado. Abra una fila para ver la ficha. Crear abre el alta.

## Alta

La entidad nueva queda en modo prueba. Complete las mismas pestañas que después verá en la ficha: identidad, datos generales, impuestos, comprobantes y al menos un medio de pago activo. Guarde. En prueba, los correos salen solo al buzón de prueba y los comprobantes llevan marca de prueba.

## Identidad

Nombre, país, tipo de persona, tipo y número de documento, y nombre de fantasía si quiere mostrarlo. El nombre identifica la entidad en el menú y en los comprobantes. Activo indica si puede usarse.

## Datos generales

Dirección, correo, teléfono y, en prueba, el correo de prueba. País por defecto, monedas aceptadas, moneda por defecto y moneda base. La moneda por defecto y la base tienen que estar entre las aceptadas.

Política de mora por defecto y las políticas que el administrador de esa entidad podrá elegir. Días de plazo de pago por defecto: se proponen al crear clientes. Política monetaria por defecto: descuento o recargo al cobrar. Publicidad, si está, se incluye en los comprobantes.

## Impuestos

Gestionar impuestos se define al crear la entidad y no se cambia después: evita mezclar operaciones con IVA y sin IVA. Si está activo, el perfil impositivo pide los datos del emisor según el país. Esos datos se usan al emitir. Si está inactivo, las ventas no calculan IVA.

## Comprobantes

Emisión de comprobantes:

- Ninguno: no genera PDF.
- No oficiales (X): comprobantes Timci.
- Oficiales: queda disponible cuando exista emisor del país.

El logo aparece arriba a la izquierda del PDF. Conviene un PNG horizontal, de hasta 512 KB. Puede subirlo, reemplazarlo o quitarlo desde Editar, en esta pestaña.

## Medios de pago

Cada medio tiene nombre, instrucciones (cuenta, alias o CBU) y las monedas en las que se usa. El administrador las ofrece al registrar un cobro. Deje al menos uno activo. Desactivar uno lo saca de los cobros nuevos. Tiene que quedar al menos un medio activo.

## Ficha

El modo de operación es Prueba o Producción. Pasar a producción borra las operaciones, los saldos, los comprobantes, la numeración y los correos de esa entidad. Conserva los clientes, los productos, las listas de precios y los abonos. A partir de ahí los correos van a los contactos del cliente. No hay vuelta atrás. Para confirmar, escriba el nombre de la entidad.

Activar deja la entidad disponible. Desactivar la deja inactiva hasta que la reactive. No se borran los datos. Una entidad inactiva no se edita: actívela desde la ficha. Cada pestaña se guarda con su propio botón.

## Qué puede salir mal

Sin un medio de pago activo la entidad no queda lista para operar. Sin emisión configurada no hay PDF. Si gestiona impuestos y falta el perfil, el tablero la muestra incompleta. Pasar a producción no se deshace: hágalo cuando la práctica de esa entidad ya no sirva.
