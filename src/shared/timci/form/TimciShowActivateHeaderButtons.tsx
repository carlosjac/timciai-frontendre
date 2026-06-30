import { EditButton, ListButton, RefreshButton } from '@refinedev/antd';
import type {
  EditButtonProps,
  ListButtonProps,
  RefreshButtonProps,
} from '@refinedev/antd';
import { Button, Divider } from 'antd';

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
  return (
    <>
      {listButtonProps ? <ListButton {...listButtonProps} /> : null}
      {refreshButtonProps ? <RefreshButton {...refreshButtonProps} /> : null}
      {editButtonProps || showToggle ? (
        <>
          <Divider type="vertical" style={{ height: '1.5em', margin: '0 4px' }} />
          {editButtonProps ? <EditButton {...editButtonProps} /> : null}
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
        </>
      ) : null}
    </>
  );
}
