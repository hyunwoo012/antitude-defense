import StockDetailCache from "../models/stockDetailCache.model";
import {
	fetchStockData,
	fetchStockFinancialData,
	normalizeStockSymbol,
} from "../utils/requests";

const DETAIL_TTL_MS = 6 * 60 * 60 * 1000; // 6시간

const isFresh = (fetchedAt: Date, ttlMs: number): boolean => {
	return Date.now() - fetchedAt.getTime() < ttlMs;
};

const toNumberOrNull = (value: any): number | null => {
	if (value === undefined || value === null || value === "") {
		return null;
	}

	const parsed = Number(String(value).replace(/,/g, ""));

	return Number.isFinite(parsed) ? parsed : null;
};

const buildSummary = (detail: {
	name: string;
	market: string;
	assetType: string;
	changeRate: number;
	volume: number;
}) => {
	const direction =
		detail.changeRate > 0
			? "상승"
			: detail.changeRate < 0
				? "하락"
				: "보합";

	return `${detail.name}은(는) ${detail.market} 시장의 ${detail.assetType} 종목입니다. 현재 등락률 기준으로 ${direction} 흐름을 보이고 있으며, 거래량은 ${detail.volume.toLocaleString(
		"ko-KR",
	)}주입니다.`;
};

export const getStockDetailWithCache = async (symbol: string) => {
	const normalizedSymbol = normalizeStockSymbol(symbol);

	const cached = await StockDetailCache.findOne({
		symbol: normalizedSymbol,
	}).lean();

	if (cached && cached.fetchedAt && isFresh(cached.fetchedAt, DETAIL_TTL_MS)) {
		return {
			source: "cache",
			detail: cached,
		};
	}
    const stock = await fetchStockData(normalizedSymbol);

    const financial = await fetchStockFinancialData(normalizedSymbol).catch(
	    (error) => {
		    console.error(
			    `financial detail fetch failed: ${normalizedSymbol}`,
			    error.message || error,
		    );

		return {};
	},
);


	const now = new Date();

	const detailData = {
		symbol: stock.symbol ?? normalizedSymbol,
		name: stock.name ?? stock.longName ?? stock.shortName ?? normalizedSymbol,
		market: stock.market ?? "KRX",
		assetType: stock.assetType ?? "STOCK",
		tradable: stock.tradable ?? true,

		price: Number(stock.price ?? stock.regularMarketPrice ?? 0),
		changePrice: Number(stock.changePrice ?? stock.regularMarketChange ?? 0),
		changeRate: Number(
			stock.changeRate ?? stock.regularMarketChangePercent ?? 0,
		),
		open: Number(stock.open ?? stock.regularMarketOpen ?? 0),
		high: Number(stock.high ?? stock.regularMarketDayHigh ?? 0),
		low: Number(stock.low ?? stock.regularMarketDayLow ?? 0),
		volume: Number(stock.volume ?? stock.regularMarketVolume ?? 0),

		// 현재 KIS 현재가 응답만으로는 부족할 수 있으므로 null로 먼저 저장.
		// 이후 재무제표 API 연결 시 이 필드를 실제 값으로 채우면 된다.
		marketCap: toNumberOrNull(financial.marketCap ?? stock.marketCap),
        per: toNumberOrNull(financial.per ?? stock.per),
        pbr: toNumberOrNull(financial.pbr ?? stock.pbr),
        eps: toNumberOrNull(financial.eps ?? stock.eps),
        bps: toNumberOrNull(financial.bps ?? stock.bps),
        roe: toNumberOrNull(financial.roe ?? stock.roe),
        revenue: toNumberOrNull(financial.revenue ?? stock.revenue),
        operatingProfit: toNumberOrNull(
    	financial.operatingProfit ?? stock.operatingProfit,
),
        netIncome: toNumberOrNull(financial.netIncome ?? stock.netIncome),

		source: "KIS",
		fetchedAt: now,
	};

	const summary = buildSummary({
		name: detailData.name,
		market: detailData.market,
		assetType: detailData.assetType,
		changeRate: detailData.changeRate,
		volume: detailData.volume,
	});

	const saved = await StockDetailCache.findOneAndUpdate(
		{
			symbol: normalizedSymbol,
		},
		{
			$set: {
				...detailData,
				summary,
			},
		},
		{
			upsert: true,
			new: true,
			setDefaultsOnInsert: true,
		},
	).lean();

	return {
		source: "kis",
		detail: saved,
	};
};