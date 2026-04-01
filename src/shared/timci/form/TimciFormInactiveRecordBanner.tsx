import { useTranslate } from '@refinedev/core';
import { Alert, theme } from 'antd';

export type TimciFormInactiveRecordBannerProps = {
  /**
   * `false` = registro inactivo → se muestra el aviso.
   * `true`, `undefined` o `null` → no se muestra nada.
   */
  isActive: boolean | undefined | null;
  /** Clave i18n del mensaje; por defecto `audit.inactiveRecordBanner`. */
  messageKey?: string;
};

/**
 * Aviso destacado (error / rojo) cuando el registro está inactivo.
 * Usar en formularios de edición que expongan Activar/Desactivar además de Guardar.
 */
export function TimciFormInactiveRecordBanner(props: TimciFormInactiveRecordBannerProps) {
  const translate = useTranslate();
  const { token } = theme.useToken();

  if (props.isActive !== false) {
    return null;
  }

  const key = props.messageKey ?? 'audit.inactiveRecordBanner';

  return (
    <Alert
      type="error"
      showIcon
      role="status"
      aria-live="polite"
      message={
        <span
          style={{
            fontSize: token.fontSizeHeading4,
            lineHeight: token.lineHeightHeading4,
            fontWeight: token.fontWeightStrong,
            color: token.colorError,
          }}
        >
          {translate(key)}
        </span>
      }
      style={{
        marginBottom: token.marginLG,
        padding: `${token.paddingMD}px ${token.paddingLG}px`,
      }}
    />
  );
}
