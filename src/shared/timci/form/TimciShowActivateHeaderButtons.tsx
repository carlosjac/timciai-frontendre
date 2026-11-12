import { RefreshButton } from '@refinedev/antd';
import type { EditButtonProps, ListButtonProps, RefreshButtonProps } from '@refinedev/antd';
import { useResourceParams, useTranslate } from '@refinedev/core';
import { Button, Divider, Space } from 'antd';
import { TimciEditLink, TimciListLink } from '../TimciResourceLink.js';

export type TimciShowActivateHeaderButtonsProps = {
  listButtonProps?: ListButtonProps;
  editButtonProps?: EditButtonProps;
  refreshButtonProps?: RefreshButtonProps;
  showToggle: boolean;
  isActive?: boolean;
  toggleLoading: boolean;
  toggleLabel: string;
  onToggleClick: () => void;
  toggleButtonKey?: string;
};

export function TimciShowActivateHeaderButtons({
  listButtonProps,
  editButtonProps,
  refreshButtonProps,
  showToggle,
  isActive,
  toggleLoading,
  toggleLabel,
  onToggleClick,
  toggleButtonKey = 'activate-toggle',
}: TimciShowActivateHeaderButtonsProps) {
  const translate = useTranslate();
  const route = useResourceParams();
  const listName =
    (typeof listButtonProps?.resource === 'string' ? listButtonProps.resource : undefined) ??
    route.identifier ??
    route.resource?.name;
  const editName =
    (typeof editButtonProps?.resource === 'string' ? editButtonProps.resource : undefined) ??
    listName;

  return (
    <Space wrap size="middle">
      {listButtonProps && listName ? (
        <TimciListLink resource={listName} label={translate('buttons.list')} />
      ) : null}
      {refreshButtonProps ? <RefreshButton {...refreshButtonProps} /> : null}
      {editButtonProps || showToggle ? (
        <Divider type="vertical" style={{ height: '1.5em', margin: 0 }} />
      ) : null}
      {editButtonProps && editName ? (
        <TimciEditLink
          resource={editName}
          recordItemId={editButtonProps.recordItemId}
          label={translate('buttons.edit')}
        />
      ) : null}
      {showToggle ? (
        <Button
          key={toggleButtonKey}
          {...(isActive
            ? { type: 'default' as const, danger: true }
            : { color: 'green' as const, variant: 'solid' as const })}
          loading={toggleLoading}
          onClick={onToggleClick}
        >
          {toggleLabel}
        </Button>
      ) : null}
    </Space>
  );
}
