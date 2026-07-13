"use client";

import { useId, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
    qty: {
		label: "عدد الطلبات",
		color: "var(--chart-1)",
	}
};

export function TopProductsChart({ rows = [] }) {
	const chartUid = useId().replace(/:/g, "");
	const idBarGradient = `top-bar-grad-${chartUid}`;

	// Take top 5
	const chartRows = useMemo(() => rows.slice(0, 5), [rows]);

	if (chartRows.length === 0) return null;

	return (
        <Card className="md:col-span-1 lg:col-span-2 overflow-hidden border-[rgba(244,236,221,0.08)] bg-[rgba(255,255,255,0.015)] shadow-[0_14px_34px_-16px_rgba(0,0,0,0.6)]">
            <CardHeader className="pb-2">
				<CardTitle className="text-cream text-lg font-display">الأصناف الأكثر مبيعاً</CardTitle>
				<CardDescription className="text-cream-dimmer">
					أعلى 5 أصناف تم طلبها مؤخراً
				</CardDescription>
			</CardHeader>
            <CardContent>
				<ChartContainer className="aspect-auto h-[260px] w-full" config={chartConfig}>
					<BarChart
                        accessibilityLayer
                        data={chartRows}
                        layout="vertical"
                        margin={{ left: -20, right: 20, top: 10, bottom: 0 }}
                    >
						<defs>
							<linearGradient id={idBarGradient} x1="0" x2="1" y1="0" y2="0">
								<stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.6} />
								<stop offset="100%" stopColor="var(--chart-1)" stopOpacity={1} />
							</linearGradient>
						</defs>
						<CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="rgba(244,236,221,0.06)" />
						<XAxis 
                            type="number" 
                            axisLine={false} 
                            tickLine={false} 
                            tickMargin={8} 
                            tick={{ fill: 'var(--cream-dimmer)', fontSize: 12 }} 
                            domain={[0, 'dataMax']}
                        />
						<YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tickMargin={8} 
                            tick={{ fill: 'var(--cream)', fontSize: 13, fontFamily: 'var(--font-body)' }} 
                            width={110}
                        />
						<ChartTooltip
                            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                            content={
								<ChartTooltipContent
                                    className="min-w-36 border-[rgba(217,164,65,0.2)] bg-[rgba(21,15,11,0.85)] backdrop-blur-md"
                                    indicator="line"
                                />
							}
                        />
						<Bar
                            dataKey="qty"
                            radius={[0, 4, 4, 0]}
                            barSize={24}
                        >
                            {chartRows.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#${idBarGradient})`} />
                            ))}
                        </Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
        </Card>
    );
}
