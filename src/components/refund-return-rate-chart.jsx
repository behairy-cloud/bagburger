"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { ArrowRightIcon } from "lucide-react";

const chartConfig = {
    incoming: { label: "جديدة", color: "var(--chart-1)" },
    active: { label: "قيد التنفيذ", color: "var(--chart-2)" },
};

export function RefundReturnRateChart({ rows = [], onViewOrders }) {
	const first = rows[0] || { incoming: 0, active: 0 };
	const last = rows.at(-1) || first;
	const incomingTrendPct = first.incoming > 0 ? ((last.incoming - first.incoming) / first.incoming) * 100 : 0;

	return (
        <Card className="md:col-span-1 lg:col-span-2 border-[rgba(244,236,221,0.06)] bg-[rgba(255,255,255,0.015)] shadow-[0_14px_34px_-16px_rgba(0,0,0,0.6)]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4">
				<div className="space-y-1">
					<CardTitle className="text-cream font-display text-lg">تدفق الطلبات</CardTitle>
					<CardDescription className="text-cream-dimmer">جديدة مقابل قيد التنفيذ خلال 7 أيام</CardDescription>
				</div>
				<div className="space-y-1 mt-3 sm:mt-0">
					<CardTitle className="text-right text-[var(--gold)] text-2xl font-bold">
						{rows.at(-1)?.active?.toLocaleString("en-US") ?? "0"}
					</CardTitle>
					<CardDescription className="text-cream-dimmer">طلبات قيد التحضير اليوم</CardDescription>
				</div>
			</CardHeader>
            <CardContent className="mt-auto">
				<ChartContainer className="aspect-auto h-60 w-full p-0" config={chartConfig}>
					<LineChart accessibilityLayer data={rows} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
						<CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="rgba(244,236,221,0.06)" />
						<XAxis
                            axisLine={false}
                            dataKey="day"
                            interval={1}
                            minTickGap={8}
                            tickLine={false}
                            tickMargin={12}
                            tick={{ fill: 'var(--cream-dimmer)', fontSize: 12 }}
                        />
						<ChartTooltip 
                            cursor={{ stroke: 'rgba(217,164,65,0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={
                                <ChartTooltipContent 
                                    className="min-w-36 border-[rgba(217,164,65,0.2)] bg-[rgba(21,15,11,0.85)] backdrop-blur-md"
                                    indicator="line" 
                                />
                            } 
                        />
						<Line 
                            dataKey="incoming" 
                            dot={{ fill: 'var(--bg)', stroke: 'var(--chart-1)', strokeWidth: 2, r: 4 }}
                            activeDot={{ fill: 'var(--chart-1)', stroke: 'var(--bg)', strokeWidth: 2, r: 6 }}
                            stroke="var(--chart-1)" 
                            strokeWidth={3} 
                            type="monotone" 
                        />
						<Line 
                            dataKey="active" 
                            dot={{ fill: 'var(--bg)', stroke: 'var(--chart-2)', strokeWidth: 2, r: 4 }}
                            activeDot={{ fill: 'var(--chart-2)', stroke: 'var(--bg)', strokeWidth: 2, r: 6 }}
                            stroke="var(--chart-2)" 
                            strokeWidth={3} 
                            type="monotone" 
                        />
					</LineChart>
				</ChartContainer>
			</CardContent>
            <CardFooter className="border-t border-[rgba(255,255,255,0.03)] pt-4 mt-2">
				<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-muted-foreground text-xs">
					<Delta value={incomingTrendPct}>
						<DeltaIcon />
						<DeltaValue />
					</Delta>
					<span className="inline-flex min-w-0 text-pretty text-muted-foreground/80">مقارنة بأول وآخر يوم في النافذة</span>
				</div>
				<Button onClick={onViewOrders} className="text-muted-foreground hover:text-[var(--gold)] transition-colors" size="xs" variant="ghost">
					إدارة الطلبات
					<ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
				</Button>
			</CardFooter>
        </Card>
    );
}
