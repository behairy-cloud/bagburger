import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { fmt } from "@/js/products";

const fallbackStats = [{
    label: "إجمالي الطلبات",
    value: "0",
    delta: 0,
    hint: "حتى الآن",
}, {
    label: "طلبات اليوم",
    value: "0",
    delta: 0,
    hint: "مقارنة بالأمس",
}, {
    label: "قيمة الطلبات",
    value: "0 ريال",
    delta: 0,
    hint: "كل الطلبات",
}, {
    label: "متوسط الطلب",
    value: "0 ريال",
    delta: 0,
    hint: "إجمالي/عدد الطلبات",
}];

export function DashboardStats({ summary }) {
	const stats = summary
		? [{
			label: "إجمالي الطلبات",
			value: summary.totalOrders.toLocaleString("en-US"),
			delta: summary.totalOrdersDelta,
			hint: "آخر 7 أيام مقابل 7 قبلها",
		}, {
			label: "طلبات اليوم",
			value: summary.todayOrders.toLocaleString("en-US"),
			delta: summary.todayOrdersDelta,
			hint: "مقارنة بيوم أمس",
		}, {
			label: "قيمة الطلبات",
			value: fmt(summary.revenue),
			delta: summary.revenueDelta,
			hint: "كل الطلبات المسجلة",
		}, {
			label: "متوسط الطلب",
			value: fmt(Math.round(summary.averageOrderValue)),
			delta: summary.averageOrderValueDelta,
			hint: "القيمة / العدد",
		}]
		: fallbackStats;

	return (
        <>
            {stats.map((stat) => (
				<StatCard key={stat.label} stat={stat} />
			))}
        </>
    );
}

function StatCard({ stat }) {
	const { label, value, delta, hint } = stat;
	return (
        <Card className="relative overflow-hidden group border-[#F4E6C0] shadow-[0_10px_24px_-12px_rgba(60,42,0,0.1)] transition-all duration-300 hover:shadow-[0_14px_34px_-12px_rgba(60,42,0,0.2)] hover:border-[rgba(244,177,40,0.4)] hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(244,177,40,0.08)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
            <CardHeader className="pb-2">
				<CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
					{label}
				</CardTitle>
			</CardHeader>
            <CardContent>
				<p className="text-balance font-bold text-3xl tabular-nums tracking-tight text-foreground">
					{value}
				</p>
			</CardContent>
            <CardFooter className="gap-2 text-xs pt-1 border-t border-[#F4E6C0] mt-2">
				<Delta value={delta}>
					<DeltaIcon />
					<DeltaValue />
				</Delta>
				<span className="text-pretty text-muted-foreground/80">{hint}</span>
			</CardFooter>
        </Card>
    );
}
