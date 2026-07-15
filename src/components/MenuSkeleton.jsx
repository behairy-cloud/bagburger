export default function MenuSkeleton() {
  return (
    <div className="products-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="skeleton-card" style={{ height: 140, flexDirection: 'row' }}>
          <div className="skeleton w40" style={{ height: '100%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 8px' }}>
            <div className="skeleton skeleton-line h20 w60" />
            <div className="skeleton skeleton-line w80" />
            <div className="skeleton skeleton-line h20 w30" />
          </div>
        </div>
      ))}
    </div>
  );
}
