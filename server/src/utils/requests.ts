
import Cache from "node-cache";
import axios from "axios";
import dotenv from "dotenv";

console.log("=== NEW requests.ts loaded ===", __filename);

dotenv.config();

const stockCache = new Cache({ stdTTL: 60 }); // 1 minute
const API_KEY = process.env.STOTRA_ALPHAVANTAGE_API;
const BASE_URL = "https://www.alphavantage.co/query";

export const fetchStockData = async (symbol: string): Promise<any> => {
	const cacheKey = symbol + "-quote";

	try {
		if (stockCache.has(cacheKey)) {
			return stockCache.get(cacheKey);
		}

		if (!API_KEY) {
			throw new Error("STOTRA_ALPHAVANTAGE_API is missing");
		}

		const res = await axios.get(
			`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
				symbol,
			)}&apikey=${API_KEY}`,
		);

		if (res.data["Error Message"]) {
			throw new Error(res.data["Error Message"]);
		}

		if (res.data["Note"]) {
			throw new Error(res.data["Note"]);
		}

		const quote = res.data["Global Quote"];
		if (!quote || !quote["05. price"]) {
			throw new Error(`No quote data returned for ${symbol}`);
		}

		const regularMarketPrice = parseFloat(quote["05. price"]);
		const regularMarketPreviousClose = parseFloat(
			quote["08. previous close"] || "0",
		);
		const regularMarketChangePercent = parseFloat(
			String(quote["10. change percent"] || "0").replace("%", ""),
		);

		const stockData = {
			symbol,
			longName: symbol,
			regularMarketPrice,
			regularMarketPreviousClose,
			regularMarketChangePercent,
		};

		stockCache.set(cacheKey, stockData);
		return stockData;
	} catch (err: any) {
		console.error(`Error fetching ${symbol} stock data:`, err.message || err);
		throw err;
	}
};

export const fetchHistoricalStockData = async (
	symbol: string,
	period: "1d" | "5d" | "1m" | "6m" | "YTD" | "1y" | "all" = "1d",
): Promise<any> => {
	const periodTerm =
		period === "1d" || period === "5d" ? "short" : "long";
	const cacheKey = symbol + "-historical-" + periodTerm + "-" + period;

	try {
		if (stockCache.has(cacheKey)) {
			return stockCache.get(cacheKey);
		}

		if (!API_KEY) {
			throw new Error("STOTRA_ALPHAVANTAGE_API is missing");
		}

		let formattedData: number[][] = [];

		if (periodTerm === "short") {
			const res = await axios.get(
				`${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${encodeURIComponent(
					symbol,
				)}&interval=15min&outputsize=compact&apikey=${API_KEY}`,
			);

			console.log("INTRADAY RAW RESPONSE:", JSON.stringify(res.data, null, 2));

			if (res.data["Error Message"]) {
				throw new Error(res.data["Error Message"]);
			}

			if (res.data["Note"]) {
				throw new Error(res.data["Note"]);
			}

			const alphaData = res.data["Time Series (15min)"];
			if (!alphaData) {
				return [];
			}

			formattedData = Object.keys(alphaData)
				.map((key) => [
					new Date(key).getTime(),
					parseFloat(alphaData[key]["4. close"]),
				])
				.sort((a, b) => a[0] - b[0]);
		} else {
			const res = await axios.get(
				`${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
					symbol,
				)}&outputsize=compact&apikey=${API_KEY}`,
			);

			console.log("DAILY RAW RESPONSE:", JSON.stringify(res.data, null, 2));

			if (res.data["Error Message"]) {
				throw new Error(res.data["Error Message"]);
			}

			if (res.data["Note"]) {
				throw new Error(res.data["Note"]);
			}

			const dailyData = res.data["Time Series (Daily)"];
			if (!dailyData) {
				return [];
			}

			formattedData = Object.keys(dailyData)
				.map((key) => [
					new Date(key).getTime(),
					parseFloat(dailyData[key]["4. close"]),
				])
				.sort((a, b) => a[0] - b[0]);

			const now = Date.now();
			const dayMs = 24 * 60 * 60 * 1000;

			if (period === "1m") {
				formattedData = formattedData.filter(
					([ts]) => ts >= now - 30 * dayMs,
				);
			} else if (period === "6m") {
				formattedData = formattedData.filter(
					([ts]) => ts >= now - 180 * dayMs,
				);
			} else if (period === "1y") {
				formattedData = formattedData.filter(
					([ts]) => ts >= now - 365 * dayMs,
				);
			} else if (period === "YTD") {
				const startOfYear = new Date(
					new Date().getFullYear(),
					0,
					1,
				).getTime();
				formattedData = formattedData.filter(([ts]) => ts >= startOfYear);
			}
		}

		stockCache.set(cacheKey, formattedData);
		return formattedData;
	} catch (error: any) {
		console.error(
			`Error fetching ${symbol} historical data:`,
			error.message || error,
		);
		return [];
	}
};

export const searchStocks = async (query: string): Promise<any> => {
	try {
		if (!API_KEY) {
			console.error("STOTRA_ALPHAVANTAGE_API is missing");
			return [];
		}

		if (!query || query.trim().length < 1) {
			return [];
		}

		const res = await axios.get(
			`${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
				query,
			)}&apikey=${API_KEY}`,
		);

		if (res.data["Error Message"]) {
			console.error("Alpha Vantage search error:", res.data["Error Message"]);
			return [];
		}

		if (res.data["Note"]) {
			console.error("Alpha Vantage rate limit:", res.data["Note"]);
			return [];
		}

		const matches = res.data.bestMatches || [];

		return matches.map((item: any) => ({
			symbol: item["1. symbol"],
			shortname: item["2. name"],
			longname: item["2. name"],
			exchDisp: item["4. region"],
			exchange: item["4. region"],
			quoteType: "EQUITY",
		}));
	} catch (err: any) {
		console.error("searchStocks error:", err.message || err);
		return [];
	}
};