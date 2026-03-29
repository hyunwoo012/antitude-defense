import { Request, Response } from "express";
import dotenv from "dotenv";
import NodeCache from "node-cache";

console.log("=== NEW news.controller.ts loaded ===", __filename);

dotenv.config();

const { SearchApi } = require("financial-news-api");
const searchApi = SearchApi(process.env.STOTRA_NEWSFILTER_API);

// Cache the results for 15 minutes
const cache = new NodeCache({ stdTTL: 15 * 60 });

const getNews = async (req: Request, res: Response) => {
	/*
	#swagger.tags = ['News']
	*/
	const symbol = req.params.symbol || "";
	const symbolQuery = symbol !== "" ? "symbols:" + symbol + " AND " : "";

	if (cache.has(symbol + "-news")) {
		res.status(200).json(cache.get(symbol + "-news"));
		return;
	}

	// NewsFilter API 키가 없으면 Yahoo fallback 없이 빈 배열 반환
	if (
		process.env.STOTRA_NEWSFILTER_API === undefined ||
		process.env.STOTRA_NEWSFILTER_API === ""
	) {
		console.warn("No NewsFilter API key provided. Returning empty news array.");
		res.status(200).json([]);
		return;
	}

	const query = {
		queryString:
			symbolQuery +
			"(source.id:bloomberg OR source.id:reuters OR source.id:cnbc OR source.id:wall-street-journal)",
		from: 0,
		size: 10,
	};

	searchApi
		.getNews(query)
		.then((response: any) => {
			const news = response.articles.map((newsItem: any) => ({
				title: newsItem.title,
				publishedAt: newsItem.publishedAt,
				source: newsItem.source.name,
				sourceUrl: newsItem.sourceUrl,
				symbols: newsItem.symbols,
				description: newsItem.description,
			}));

			cache.set(symbol + "-news", news);
			res.status(200).json(news);
		})
		.catch((err: any) => {
			console.log("News API failed:", err);
			res.status(200).json([]);
		});
};

export default { getNews };