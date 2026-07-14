/* Real brand assets, served from /public — background is the brand's
   charcoal-black (#231F20), matched by --bg-elev so they blend seamlessly. */
export const LogoIcon = (props) => (
	<img src="/main logo.jpg" alt="" {...props} />
);

export const LogoWordmark = (props) => (
	<img src="/second one.jpg" alt="SIDE BURGER — Your Right Side" {...props} />
);

export const Logo = (props) => (
	<div {...props} className={["inline-flex items-center gap-3", props.className].filter(Boolean).join(" ")}>
		<LogoIcon className="size-8 rounded-lg" />
		<span style={{ fontFamily: 'var(--font-display)', letterSpacing: '1px' }} className="text-2xl text-primary font-bold">
			SIDE BURGER
		</span>
	</div>
);
