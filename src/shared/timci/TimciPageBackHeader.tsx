import type { ReactNode } from 'react';
import { List } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

type Props = {
  backPath: string;
  title: ReactNode;
  tags?: ReactNode;
  children: ReactNode;
};

/**
 * Same go-back chrome as Refine Edit/Show (`PageHeader` arrow), for screens that are not a CRUD action.
 */
export function TimciPageBackHeader({ backPath, title, tags, children }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();

  return (
    <List
      title={title}
      canCreate={false}
      breadcrumb={false}
      headerButtons={() => null}
      headerProps={{
        onBack: () => navigate(backPath),
        tags: tags == null ? undefined : (tags as never),
        backIcon: (
          <Button
            type="text"
            icon={<ArrowLeftOutlined aria-hidden />}
            aria-label={translate('import.job.back')}
          />
        ),
      }}
    >
      {children}
    </List>
  );
}
