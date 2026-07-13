export const LogoIcon = (props) => (
	<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<rect x="4" y="4" width="40" height="40" rx="14" fill="currentColor" opacity="0.15" />
		<rect x="12" y="16" width="24" height="4" rx="2" fill="currentColor" />
		<rect x="12" y="22" width="24" height="4" rx="2" fill="currentColor" opacity="0.8" />
		<rect x="12" y="28" width="24" height="4" rx="2" fill="currentColor" opacity="0.5" />
	</svg>
);

export const Logo = (props) => (
	<div {...props} className={["inline-flex items-center gap-3", props.className].filter(Boolean).join(" ")}>
		<LogoIcon className="size-8 text-primary" />
		<span style={{ fontFamily: 'var(--font-display)', letterSpacing: '1px' }} className="text-2xl text-primary font-bold">
			SIDE BURGER
		</span>
	</div>
);
