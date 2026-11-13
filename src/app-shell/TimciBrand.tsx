import { Link } from 'react-router';

export function TimciWordmark({ height = 48 }: { height?: number }) {
  return (
    <img
      src="/logo-wordmark.png"
      alt="Timci"
      style={{ height, width: 'auto', maxWidth: '100%', display: 'block' }}
    />
  );
}

/** Sider title: wordmark when open, isotipo when collapsed. */
export function TimciBrandTitle({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
      {collapsed ? (
        <img
          src="/logo-mark.png"
          alt="Timci"
          style={{ height: 32, width: 'auto', display: 'block' }}
        />
      ) : (
        <TimciWordmark height={36} />
      )}
    </Link>
  );
}
