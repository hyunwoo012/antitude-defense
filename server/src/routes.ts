import express from "express";
const router = express.Router();
import { verifySignUp, authJwt } from "./middleware";
import authController from "./controller/auth.controller";
import userController from "./controller/user.controller";
import stocksController from "./controller/stocks.controller";
import newsController from "./controller/news.controller";
import leaderboardController from "./controller/leaderboard.controller";

// Auth routes
router.post(
	"/api/auth/signup",
	[verifySignUp.checkDuplicateUsername],
	authController.signup,
);
router.post("/api/auth/login", authController.login);

// User data routes
router.get("/api/user/ledger", [authJwt.verifyToken], userController.getLedger);
router.get(
	"/api/user/holdings",
	[authJwt.verifyToken],
	userController.getHoldings,
);
router.get(
	"/api/user/portfolio",
	[authJwt.verifyToken],
	userController.getPortfolio,
);
router.get("/api/user/leaderboard", leaderboardController.getLeaderboard);

// User watchlist routes
router.get(
	"/api/user/watchlist",
	[authJwt.verifyToken],
	userController.getWatchlist,
);
router.post(
	"/api/user/watchlist/add/:symbol",
	[authJwt.verifyToken],
	userController.addToWatchlist,
);
router.post(
	"/api/user/watchlist/remove/:symbol",
	[authJwt.verifyToken],
	userController.removeFromWatchlist,
);

// Stocks routes
router.get("/api/stocks/search/:query", stocksController.search);
router.get("/api/stocks/:symbol/info", stocksController.getInfo);
router.get("/api/stocks/:symbol/historical", stocksController.getHistorical);

router.post(
	"/api/stocks/:symbol/buy",
	[authJwt.verifyToken],
	stocksController.buyStock,
);

router.post(
	"/api/stocks/:symbol/sell",
	[authJwt.verifyToken],
	stocksController.sellStock,
);

// News routes
router.get("/api/news", newsController.getNews);
router.get("/api/news/:symbol", newsController.getNews);

// History explanation AI route
router.post("/api/ai/history-explanation", async (req, res) => {
	console.log("=== /api/ai/history-explanation HIT ===");
	console.log("body:", req.body);

	const { scenarioText, marketDataText, userAnswerText } = req.body;

	const prompt = `
너는 금융 교육용 시뮬레이션 해설 모델이다.

입력은 3가지다.

[시나리오 설명]
${scenarioText}

[시장 데이터 / 실시간 데이터]
${marketDataText}

[사용자 답변]
${userAnswerText}

위 3개를 종합해서 사용자의 판단을 교육적으로 해설하라.

반드시 아래 JSON 형식으로만 한국어로 답하라.

{
  "tag_explanations": [
    {
      "tag": "시장 이해",
      "explanation": ""
    },
    {
      "tag": "리스크 판단",
      "explanation": ""
    },
    {
      "tag": "근거 적절성",
      "explanation": ""
    },
    {
      "tag": "전략 평가",
      "explanation": ""
    }
  ],
  "overall_commentary": ""
}
`;

	try {
		const response = await fetch("http://localhost:11434/api/generate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "qwen2.5:7b",
				prompt,
				stream: false,
				format: "json",
			}),
		});

		const data = await response.json();
		console.log("Ollama raw response:", data);

		if (!response.ok) {
			return res.status(500).json({
				error: "Ollama 응답 실패",
				detail: data,
			});
		}

		let parsed;
		try {
			parsed = JSON.parse(data.response);
		} catch (parseError) {
			console.error("JSON parse error:", parseError);
			console.error("raw response:", data.response);

			return res.status(500).json({
				error: "AI 응답 JSON 파싱 실패",
				raw: data.response,
			});
		}

		return res.json({
			result: parsed,
		});
	} catch (error) {
		console.error("AI route error:", error);
		return res.status(500).json({
			error: "Ollama 호출 실패",
			detail: String(error),
		});
	}
});

module.exports = router;