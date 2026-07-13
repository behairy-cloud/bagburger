import { LayoutGridIcon, BarChart3Icon, ShoppingCartIcon, MenuIcon, SettingsIcon, HelpCircleIcon, ActivityIcon, LayoutDashboardIcon } from "lucide-react";

export const navGroups = [
	{
		label: "نظرة عامة",
		items: [
			{
				title: "لوحة التحكم",
				path: "#admin",
				icon: (
					<LayoutDashboardIcon />
				),
				isActive: true,
			},
			{
				title: "إحصاءات الطلبات",
				path: "#admin/analytics",
				icon: (
					<BarChart3Icon />
				),
			},
		],
	},
	{
		label: "الإدارة",
		items: [
			{
				title: "الطلبات",
				path: "#admin/orders",
				icon: (
					<ShoppingCartIcon />
				),
				subItems: [
					{ title: "كل الطلبات", path: "#admin" },
					{ title: "الجديدة", path: "#admin/new" },
					{ title: "قيد التحضير", path: "#admin/processing" },
				],
			},
			{
				title: "المنيو",
				path: "#menu",
				icon: (
					<MenuIcon />
				),
				subItems: [
					{ title: "عرض المنيو", path: "#menu" },
					{ title: "أقسام المنتجات", path: "#cat-shawarma" },
				],
			},
		],
	},
	{
		label: "الإعدادات",
		items: [
			{
				title: "إعدادات المتجر",
				path: "#admin/settings",
				icon: (
					<SettingsIcon />
				),
				subItems: [
					{ title: "الملف العام", path: "#admin/settings/profile" },
					{ title: "المديرين", path: "#admin/settings/staff" },
					{ title: "اتصال واتساب", path: "#admin/settings/contact" },
				],
			},
		],
	},
];

export const footerNavLinks = [
	{
		title: "مساعدة الفريق",
		path: "#admin/help",
		icon: (
			<HelpCircleIcon />
		),
	},
	{
		title: "حالة النظام",
		path: "#admin/status",
		icon: (
			<ActivityIcon />
		),
	},
];

export const navLinks = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item])),
	...footerNavLinks,
];
