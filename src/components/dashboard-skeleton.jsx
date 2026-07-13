export function DashboardSkeleton() {
	return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="skeleton-card rounded-lg p-4">
				<div className="skeleton skeleton-line h20 w40" />
				<div className="skeleton skeleton-line h20 w60" />
				<div className="skeleton skeleton-line h20 w30" />
			</div>
            <div className="skeleton-card rounded-lg p-4 md:col-span-2 lg:col-span-4">
				<div className="skeleton skeleton-line h20 w30" />
				<div className="skeleton skeleton-line h80 w100" />
			</div>
            <div className="skeleton-card rounded-lg p-4 md:col-span-2">
				<div className="skeleton skeleton-line h20 w40" />
				<div className="skeleton skeleton-line h80 w100" />
			</div>
            <div className="skeleton-card rounded-lg p-4">
				<div className="skeleton skeleton-line h20 w40" />
				<div className="skeleton skeleton-line h20 w80" />
				<div className="skeleton skeleton-line h20 w60" />
			</div>
        </div>
    );
}
