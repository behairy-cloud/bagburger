import { CategoryRankChart } from "@/components/category-rank-chart";
import { RefundReturnRateChart } from "@/components/refund-return-rate-chart";
import { RevenueChart } from "@/components/revenue-chart";
import { DashboardStats } from "@/components/stats";
import { TopProductsChart } from "@/components/top-products-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ImageOff } from "lucide-react";
import { useState } from "react";

function MostSoldImage({ src, alt }) {
	const [failed, setFailed] = useState(false);
	if (!src || failed) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-[#FFF6E0] text-muted-foreground">
				<ImageOff size={28} />
			</div>
		);
	}
	return (
		<img
			src={src}
			alt={alt}
			className="w-full h-full object-cover"
			onError={() => setFailed(true)}
		/>
	);
}

export function Dashboard({
	summary,
	revenueRows,
	categoryRows,
	flowRows,
	topItemsRows = [],
	onRefresh,
	onCopyWhatsapp,
	onOpenMenu,
	onScrollOrders,
}) {
	const mostSold = topItemsRows[0];

	return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 pb-12">
            <DashboardStats summary={summary} />
            
            <RevenueChart rows={revenueRows} onViewOrders={onScrollOrders} />
            
            {mostSold && (
                <Card className="md:col-span-1 lg:col-span-2 overflow-hidden relative border-[rgba(244,177,40,0.4)] bg-gradient-to-br from-[rgba(244,177,40,0.08)] to-transparent shadow-[0_0_30px_-8px_rgba(244,177,40,0.3)] group">
                    <CardContent className="p-6 flex items-center gap-6 h-full">
                        <div className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-[#F4E6C0] shadow-[0_10px_24px_-12px_rgba(60,42,0,0.2)] transition-transform duration-500 group-hover:scale-105">
                            <MostSoldImage key={mostSold.id} src={mostSold.imagePath} alt={mostSold.name} />
                            <div className="absolute top-2 right-2 w-7 h-7 bg-gradient-to-br from-[#F7C158] to-[#F4B128] rounded-full flex items-center justify-center shadow-lg">
                                <Trophy size={14} className="text-[#202020]" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-[var(--fire-bright)] font-semibold mb-1">المنتج الأكثر مبيعاً</p>
                            <h3 className="text-2xl font-display text-foreground truncate mb-2">{mostSold.name}</h3>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="bg-[rgba(244,177,40,0.1)] px-3 py-1 rounded-full text-muted-foreground border border-[rgba(244,177,40,0.2)]">
                                    <strong className="text-foreground">{mostSold.qty}</strong> طلب
                                </span>
                                <span className="text-muted-foreground/60 hidden sm:inline">أعلى إيراد هذا الأسبوع</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <TopProductsChart rows={topItemsRows} />
            
            <RefundReturnRateChart rows={flowRows} onViewOrders={onScrollOrders} />
            <CategoryRankChart rows={categoryRows} />
        </div>
    );
}
