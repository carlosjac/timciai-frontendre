# Políticas monetarias

Reglas de descuento y recargo según cuándo se paga, respecto de la emisión o del vencimiento.

## Para qué sirve

Se asignan a la entidad, al cliente, a la venta, al débito o al abono. La regla viaja con la venta o el débito. No cambia el importe al guardar ni al registrar esa deuda. Se aplica al cobrar o al imputar una nota de crédito: Timci calcula el ajuste para esa fecha y lo deja asentado. La pestaña Liquidación del cliente muestra el mismo cálculo antes de cobrar, sin registrar nada.

## Cuándo usarla

Si cobra distinto según el atraso o el adelanto. Si no, deje la política del sistema «Sin descuentos ni recargos» y omita este paso en Primeros pasos.

## Lista

Ve el nombre, el tipo y si está activa. La del sistema ya existe al dar de alta la entidad y no se puede borrar. Una inactiva no se puede elegir como predeterminada hasta que la active en su ficha.

## Alta

El tipo Franjas relativas cuenta tramos desde una fecha base: la emisión del documento o el vencimiento. Todas las franjas usan la misma unidad, días o meses.

Cada franja tiene:

- Desde y hasta. «Sin límite» deja el extremo abierto.
- Efecto: descuento (resta al cobrar), recargo (suma) o neutro (no cambia el importe).
- Porcentaje, obligatorio si el efecto es descuento o recargo.
- Tasa por día: solo si la unidad es días. Reparte el porcentaje por cada día dentro de la franja.

Reglas de cobertura:

- La primera franja debe empezar sin límite, para cubrir pagos adelantados.
- La última debe terminar sin límite, para cubrir atrasos largos.
- Las franjas se tocan, sin huecos ni solapes.

El nombre se sugiere según las franjas y puede cambiarlo. Deje la política activa si va a usarla ya.

## Ficha

Revise el resumen de las franjas: fecha base, unidad y cada tramo con su efecto y porcentaje. En la política del sistema solo puede cambiar el nombre. En una propia puede corregir las franjas mientras esté activa. Una política inactiva se activa desde esta ficha. Mientras esté inactiva no se edita.

Las ventas y débitos ya registrados conservan la regla que tenían al registrarse. Cambiar la política después no reescribe esas operaciones.

## Qué puede salir mal

Si falta el tramo abierto al inicio o al final, o si dos franjas se solapan o dejan un hueco, no se puede guardar. Una franja con descuento o recargo necesita un porcentaje. La tasa por día en una política medida en meses no se guarda.

## Paso siguiente

Déjela por defecto en la configuración de la entidad, o asígnela a un cliente. En la liquidación del cliente verá el ajuste antes de registrar el cobro.
