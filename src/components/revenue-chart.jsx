"use client";

import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { ArrowRightIcon } from "lucide-react";

const xAxisIntervalByPeriod = {
	7: 0,
	14: 1,
	30: 3,
};

const chartConfig = {
    revenue: {
		label: "قيمة الطلبات",
		color: "var(--chart-1)",
	}
};

export function RevenueChart({ rows = [], onViewOrders }) {
	const chartUid = useId().replace(/:/g, "");
	const idAreaGradient = `revenue-area-grad-${chartUid}`;
	const [periodDays, setPeriodDays] = useState(14);

	const chartRows = useMemo(() => rows.slice(-periodDays), [rows, periodDays]);

	const growthPct = useMemo(() => {
		const first = chartRows[0]?.revenue ?? 0;
		const last = chartRows.at(-1)?.revenue ?? first;
		if (!first) return 0;
		return ((last - first) / first) * 100;
	}, [chartRows]);

	return (
        <Card className="md:col-span-2 lg:col-span-4 border-[#F4E6C0] shadow-[0_14px_34px_-16px_rgba(60,42,0,0.14)]">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
				<CardTitle className="text-balance text-foreground font-display text-lg">إجمالي الطلبات عبر الأيام</CardTitle>
				<div className="flex items-center gap-2">
					{[7, 14, 30].map((value) => (
						<Button
							key={value}
							type="button"
							variant={periodDays === value ? "default" : "outline"}
							size="sm"
							onClick={() => setPeriodDays(value)}
                            className={periodDays === value 
                                ? "bg-gradient-to-r from-[var(--chart-2)] to-[var(--chart-1)] text-[#202020] hover:opacity-90 font-bold border-0" 
                                : "border-[#F4E6C0] text-muted-foreground hover:text-foreground hover:bg-[rgba(244,177,40,0.08)]"}
						>
							آخر {value} يوم
						</Button>
					))}
				</div>
			</CardHeader>
            <CardContent>
				<ChartContainer className="aspect-auto h-64 w-full p-0" config={chartConfig}>
					<AreaChart
                        accessibilityLayer
                        data={[...chartRows]}
                        margin={{ left: 24, right: 8, top: 12, bottom: 0 }}>
						<defs>
							<linearGradient id={idAreaGradient} x1="0" x2="0" y1="0" y2="1">
								<stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
								<stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.0} />
							</linearGradient>
						</defs>
						<CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="rgba(107,107,107,0.15)" />
						<XAxis
                            axisLine={false}
                            dataKey="date"
                            interval={xAxisIntervalByPeriod[periodDays]}
                            tickLine={false}
                            tickMargin={12}
                            tick={{ fill: 'var(--cream-dimmer)', fontSize: 12 }}
                            tickFormatter={(value) => String(value).slice(5)}
                        />
						<ChartTooltip
                            cursor={{ stroke: 'var(--chart-1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={
								<ChartTooltipContent
                                    className="min-w-36 border-[rgba(244,177,40,0.35)] bg-[rgba(255,255,255,0.97)] backdrop-blur-md"
                                    indicator="line"
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ""}
                                />
							}
                        />
						<Area
                            dataKey="revenue"
                            dot={{ fill: 'var(--bg)', stroke: 'var(--chart-1)', strokeWidth: 2, r: 4 }}
                            activeDot={{ fill: 'var(--chart-1)', stroke: 'var(--bg)', strokeWidth: 2, r: 6 }}
                            fill={`url(#${idAreaGradient})`}
                            stroke="var(--chart-1)"
                            strokeWidth={3}
                            type="monotone"
                        />
					</AreaChart>
				</ChartContainer>
			</CardContent>
            <CardFooter className="flex items-center justify-between border-t border-[#F4E6C0] pt-4 mt-2">
				<div className="flex items-center gap-1 text-muted-foreground text-xs">
					<Delta value={growthPct}>
						<DeltaIcon />
						<DeltaValue />
					</Delta>
					<p className="inline-flex text-pretty">مقارنة بين أول وآخر يوم في الفترة</p>
				</div>
				<Button onClick={onViewOrders} className="text-muted-foreground hover:text-[var(--gold)] transition-colors" size="xs" variant="ghost">
					عرض الطلبات
					<ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
				</Button>
			</CardFooter>
        </Card>
    );
}
