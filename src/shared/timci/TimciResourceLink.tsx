import { EditOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigation, type BaseKey } from '@refinedev/core';
import { Button } from 'antd';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

function stopModifiedClick(event: MouseEvent<HTMLElement>, to: string, navigate: (path: string) => void) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  navigate(to);
}

/** One link with Ant Design button styles. Refine's EditButton nests a button inside a link. */
export function TimciEditLink(props: {
  resource: string;
  recordItemId?: BaseKey;
  label: string;
  hideText?: boolean;
}) {
  const { editUrl } = useNavigation();
  const navigate = useNavigate();
  if (props.recordItemId == null || props.recordItemId === '') return null;
  const to = editUrl(props.resource, props.recordItemId);

  return (
    <Button
      href={to}
      aria-label={props.label}
      title={props.label}
      icon={<EditOutlined aria-hidden />}
      onClick={(event) => stopModifiedClick(event, to, navigate)}
    >
      {props.hideText ? null : props.label}
    </Button>
  );
}

/** One link with Ant Design button styles. Refine's ListButton nests a button inside a link. */
export function TimciListLink(props: { resource: string; label: string }) {
  const { listUrl } = useNavigation();
  const navigate = useNavigate();
  const to = listUrl(props.resource);

  return (
    <Button
      href={to}
      aria-label={props.label}
      icon={<UnorderedListOutlined aria-hidden />}
      onClick={(event) => stopModifiedClick(event, to, navigate)}
    >
      {props.label}
    </Button>
  );
}
