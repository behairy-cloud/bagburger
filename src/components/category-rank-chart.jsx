"use client";

import React from "react";
import { LabelList, Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const SLICE_PALETTE = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

const MAX_NAMED_SLICES = 4;

function consolidateTopFourAndOthers(data) {
	if (data.length <= MAX_NAMED_SLICES) {
		return [...data];
	}

	const sorted = [...data].sort((a, b) => b.share - a.share);
	const head = sorted.slice(0, MAX_NAMED_SLICES);
	const tail = sorted.slice(MAX_NAMED_SLICES);
	const othersShare = tail.reduce((sum, row) => sum + row.share, 0);

	return [...head, { category: "أخرى", share: othersShare }];
}

function buildSlices(data) {
	const chartConfig = {
		share: {
			label: "الحصة",
		},
	};

	const pieData = data.map((row, i) => {
		const key = `s${i}`;
		const color = SLICE_PALETTE[i % SLICE_PALETTE.length];
		chartConfig[key] = {
			label: row.category,
			color,
		};
		return {
			key,
			category: row.category,
			share: row.share,
			fill: color, // Use explicit hex/rgb values from SLICE_PALETTE
		};
	});

	return { chartConfig, pieData };
}

export function CategoryRankChart({ rows = [] }) {
	const data = React.useMemo(() => buildSlices(consolidateTopFourAndOthers(rows)), [rows]);

	return (
        <Card className="md:col-span-1 lg:col-span-2 border-[#F4E6C0] shadow-[0_14px_34px_-16px_rgba(60,42,0,0.14)]">
            <CardHeader className="pb-2">
				<CardTitle className="text-foreground font-display text-lg">توزيع الطلبات حسب القسم</CardTitle>
				<CardDescription className="text-muted-foreground">نسبة العناصر المطلوبة في كل قسم</CardDescription>
			</CardHeader>
            <CardContent className="my-auto p-0 pb-4">
				<ChartContainer className="aspect-auto h-72 w-full" config={data.chartConfig}>
					<PieChart accessibilityLayer>
						<Pie
                            cornerRadius={6}
                            data={data.pieData}
                            dataKey="share"
                            innerRadius={55}
                            nameKey="key"
                            outerRadius="82%"
                            stroke="#fff"
                            strokeWidth={3}
                            paddingAngle={3}
                            className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                        >
							<LabelList
                                className="fill-[#202020] font-bold text-sm"
                                dataKey="share"
                                fill="currentColor"
                                fontWeight={700}
                                formatter={(label) => `${Number(label).toLocaleString("en-US")}%`}
                                position="inside"
                                stroke="none"
                            />
						</Pie>
						<ChartTooltip 
                            content={
                                <ChartTooltipContent 
                                    className="min-w-36 border-[rgba(244,177,40,0.35)] bg-[rgba(255,255,255,0.97)] backdrop-blur-md"
                                    nameKey="key" 
                                    hideLabel 
                                />
                            } 
                        />
						<ChartLegend content={<ChartLegendContent className="flex flex-wrap gap-3 pt-4 text-muted-foreground" nameKey="key" />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
        </Card>
    );
}
