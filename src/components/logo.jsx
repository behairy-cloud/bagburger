/* Bag Burger brand assets, served from /public. */
export const LogoIcon = (props) => (
	<img src="/logo.jpg" alt="" {...props} />
);

export const LogoWordmark = (props) => (
	<img src="/logo.jpg" alt="BAG BURGER" {...props} />
);

export const Logo = (props) => (
	<div {...props} className={["inline-flex items-center gap-3", props.className].filter(Boolean).join(" ")}>
		<LogoIcon className="size-8 rounded-lg" />
		<span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }} className="text-2xl text-primary font-bold">
			BAG BURGER
		</span>
	</div>
);
