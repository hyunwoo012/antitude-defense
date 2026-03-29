import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	Heading,
	Text,
	Input,
	Badge,
	VStack,
	HStack,
	SimpleGrid,
	Progress,
	Divider,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Textarea,
} from "@chakra-ui/react";

type FeatureKey = "paper" | "history" | "prediction" | "ai";

type StockItem = {
	name: string;
	code: string;
	market: string;
	price: number;
	change: number;
};

type ExplanationTag = {
	tag: string;
	explanation: string;
};

type HistoryExplanationResult = {
	tag_explanations: ExplanationTag[];
	overall_commentary: string;
};

const stockList: StockItem[] = [
	{ name: "삼성전자", code: "005930", market: "KOSPI", price: 74200, change: 1.24 },
	{ name: "SK하이닉스", code: "000660", market: "KOSPI", price: 165300, change: -0.82 },
	{ name: "카카오", code: "035720", market: "KOSPI", price: 42150, change: 0.65 },
	{ name: "NAVER", code: "035420", market: "KOSPI", price: 201500, change: 2.13 },
	{ name: "LG에너지솔루션", code: "373220", market: "KOSPI", price: 331000, change: -1.11 },
	{ name: "Apple", code: "AAPL", market: "NASDAQ", price: 212.4, change: 1.76 },
	{ name: "Tesla", code: "TSLA", market: "NASDAQ", price: 178.2, change: -2.31 },
	{ name: "NVIDIA", code: "NVDA", market: "NASDAQ", price: 901.2, change: 3.44 },
];

const featureMeta: Record<
	FeatureKey,
	{
		title: string;
		subtitle: string;
		description: string;
	}
> = {
	paper: {
		title: "모의투자",
		subtitle: "실시간 가격 기반 투자 연습",
		description:
			"국내·해외 종목을 검색하고 가상 자산으로 매수/매도를 경험하는 기본 투자 화면입니다.",
	},
	history: {
		title: "과거 데이터 시뮬레이션 게임",
		subtitle: "입력 3개 → 태그별 해설 생성",
		description:
			"시나리오 설명, 시장 데이터, 사용자 답변을 바탕으로 교육용 해설을 생성하는 기능입니다.",
	},
	prediction: {
		title: "시장가격 예측 시뮬레이션",
		subtitle: "다음 흐름 추론형 게임",
		description:
			"뉴스와 간단한 지표를 보고 다음 가격 방향을 예측하는 학습형 기능입니다.",
	},
	ai: {
		title: "AI 매수자 반응 생성기",
		subtitle: "4개 집단 반응 시뮬레이터(예정)",
		description:
			"개인투자자/기관/정부/연준 반응을 생성하는 별도 시뮬레이터 기능으로 분리 예정입니다.",
	},
};

export default function PrototypeDashboard() {
	const [selectedFeature, setSelectedFeature] = useState<FeatureKey>("paper");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStock, setSelectedStock] = useState<StockItem | null>(stockList[0] ?? null);

	const [scenarioText, setScenarioText] = useState(
		"금리 인하 기대감이 커진 시점이며 기술주와 반도체 대형주의 투자심리가 개선되고 있다."
	);
	const [marketDataText, setMarketDataText] = useState(
		"나스닥 상승, 반도체 지수 상승, 거래량 증가, 외국인 수급 개선"
	);
	const [userAnswerText, setUserAnswerText] = useState(
		"반도체 대형주 비중을 늘리고 단기 상승 흐름에 대응하겠다."
	);
	const navigate = useNavigate();

	const [historyResult, setHistoryResult] = useState<HistoryExplanationResult | null>(null);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyError, setHistoryError] = useState("");

	const filteredStocks = useMemo(() => {
		const keyword = searchTerm.trim().toLowerCase();
		if (!keyword) return stockList;

		return stockList.filter((item) => {
			return (
				item.name.toLowerCase().includes(keyword) ||
				item.code.toLowerCase().includes(keyword) ||
				item.market.toLowerCase().includes(keyword)
			);
		});
	}, [searchTerm]);

	const handleRunHistoryExplanation = async () => {
		try {
			setHistoryLoading(true);
			setHistoryError("");
			setHistoryResult(null);

			const res = await fetch("http://localhost:3010/api/ai/history-explanation", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					scenarioText,
					marketDataText,
					userAnswerText,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.error || "해설 요청 실패");
			}

			setHistoryResult(data.result);
		} catch (error: any) {
			console.error(error);
			setHistoryError(error?.message || "해설 생성 중 오류가 발생했습니다.");
		} finally {
			setHistoryLoading(false);
		}
	};

	return (
		<Box>
			<VStack align="stretch" spacing={6}>
				<Box borderWidth="1px" borderRadius="xl" p={6} bg="chakra-body-bg" shadow="sm">
					<Flex
						direction={{ base: "column", lg: "row" }}
						justify="space-between"
						align={{ base: "flex-start", lg: "center" }}
						gap={5}
					>
						<Box>
							<Text fontSize="sm" color="gray.500" mb={2}>
								Prototype
							</Text>
							<Heading size="lg">주식 학습 프로토타입</Heading>
							<Text mt={3} color="gray.600">
								4개의 핵심 기능을 대시보드에서 바로 확인하고, 각 기능 화면을
								프로토타입 형태로 전환해볼 수 있습니다.
							</Text>
						</Box>

						<SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} minW={{ lg: "420px" }}>
							<StatCard label="가상 자산" value="₩10,000,000" />
							<StatCard label="시장 모드" value="국내/해외" />
							<StatCard label="해설 모델" value="Qwen2.5" />
							<StatCard label="프로토타입" value="V2" />
						</SimpleGrid>
					</Flex>
				</Box>

				<Box>
					<Heading size="md" mb={4}>
						메인 기능 4개
					</Heading>
					<SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
						<FeatureCard
							title={featureMeta.paper.title}
							subtitle={featureMeta.paper.subtitle}
							description={featureMeta.paper.description}
							isActive={selectedFeature === "paper"}
							onClick={() => setSelectedFeature("paper")}
						/>
						<FeatureCard
							title={featureMeta.history.title}
							subtitle={featureMeta.history.subtitle}
							description={featureMeta.history.description}
							isActive={selectedFeature === "history"}
							onClick={() => setSelectedFeature("history")}
						/>
						<FeatureCard
							title={featureMeta.prediction.title}
							subtitle={featureMeta.prediction.subtitle}
							description={featureMeta.prediction.description}
							isActive={selectedFeature === "prediction"}
							onClick={() => setSelectedFeature("prediction")}
						/>
						<FeatureCard
							title={featureMeta.ai.title}
							subtitle={featureMeta.ai.subtitle}
							description={featureMeta.ai.description}
							isActive={selectedFeature === "ai"}
							onClick={() => setSelectedFeature("ai")}
						/>
					</SimpleGrid>
				</Box>

				<Box borderWidth="1px" borderRadius="xl" p={6} shadow="sm">
					<VStack align="stretch" spacing={5}>
						<Box>
							<Text fontSize="sm" color="gray.500">
								선택된 기능
							</Text>
							<Heading size="md" mt={1}>
								{featureMeta[selectedFeature].title}
							</Heading>
							<Text mt={2} color="gray.600">
								{featureMeta[selectedFeature].description}
							</Text>
						</Box>

						<Divider />

						{selectedFeature === "paper" && (
							<PaperTradingPanel
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
								filteredStocks={filteredStocks}
								selectedStock={selectedStock}
								setSelectedStock={setSelectedStock}
							/>
						)}

						{selectedFeature === "history" && (
							<HistoryGamePanel
								scenarioText={scenarioText}
								setScenarioText={setScenarioText}
								marketDataText={marketDataText}
								setMarketDataText={setMarketDataText}
								userAnswerText={userAnswerText}
								setUserAnswerText={setUserAnswerText}
								historyResult={historyResult}
								historyLoading={historyLoading}
								historyError={historyError}
								onRunHistoryExplanation={handleRunHistoryExplanation}
							/>
						)}

						{selectedFeature === "prediction" && <PredictionGamePanel />}

						{selectedFeature === "ai" && (
	<AISimulatorPlaceholder onMove={() => navigate("/prototype/simulator")} />
)}
					</VStack>
				</Box>
			</VStack>
		</Box>
	);
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<Box borderWidth="1px" borderRadius="lg" p={3}>
			<Text fontSize="xs" color="gray.500">
				{label}
			</Text>
			<Text fontWeight="bold" mt={1}>
				{value}
			</Text>
		</Box>
	);
}

function FeatureCard({
	title,
	subtitle,
	description,
	isActive,
	onClick,
}: {
	title: string;
	subtitle: string;
	description: string;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<Box
			borderWidth="1px"
			borderRadius="xl"
			p={5}
			cursor="pointer"
			onClick={onClick}
			bg={isActive ? "cyan.50" : "transparent"}
			borderColor={isActive ? "cyan.400" : "inherit"}
			transition="0.2s"
			_hover={{ borderColor: "cyan.300", transform: "translateY(-2px)" }}
		>
			<Badge mb={3} colorScheme={isActive ? "cyan" : "gray"}>
				{isActive ? "선택됨" : "기능"}
			</Badge>
			<Heading size="sm">{title}</Heading>
			<Text fontSize="sm" color="gray.500" mt={1}>
				{subtitle}
			</Text>
			<Text fontSize="sm" mt={3} color="gray.600">
				{description}
			</Text>
		</Box>
	);
}

function PaperTradingPanel({
	searchTerm,
	setSearchTerm,
	filteredStocks,
	selectedStock,
	setSelectedStock,
}: {
	searchTerm: string;
	setSearchTerm: (v: string) => void;
	filteredStocks: StockItem[];
	selectedStock: StockItem | null;
	setSelectedStock: React.Dispatch<React.SetStateAction<StockItem | null>>;
}) {
	return (
		<Grid templateColumns={{ base: "1fr", xl: "1.2fr 0.8fr" }} gap={6}>
			<GridItem>
				<VStack align="stretch" spacing={4}>
					<Box borderWidth="1px" borderRadius="lg" p={4}>
						<Heading size="sm" mb={3}>
							종목 검색
						</Heading>
						<Input
							placeholder="삼성전자 / 005930 / AAPL / Apple"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Text fontSize="xs" color="gray.500" mt={2}>
							프로토타입에서는 더미 데이터로 검색됩니다.
						</Text>

						<VStack align="stretch" spacing={2} mt={4}>
							{filteredStocks.slice(0, 6).map((item) => (
								<Flex
									key={item.code}
									justify="space-between"
									align="center"
									borderWidth="1px"
									borderRadius="md"
									p={3}
									cursor="pointer"
									bg={selectedStock?.code === item.code ? "cyan.50" : "transparent"}
									onClick={() => setSelectedStock(item)}
								>
									<Box>
										<Text fontWeight="bold">{item.name}</Text>
										<Text fontSize="sm" color="gray.500">
											{item.code} · {item.market}
										</Text>
									</Box>
									<Box textAlign="right">
										<Text fontWeight="bold">
											{item.market === "KOSPI"
												? `₩${item.price.toLocaleString()}`
												: `$${item.price}`}
										</Text>
										<Text
											fontSize="sm"
											color={item.change >= 0 ? "green.500" : "red.500"}
										>
											{item.change >= 0 ? "+" : ""}
											{item.change}%
										</Text>
									</Box>
								</Flex>
							))}
						</VStack>
					</Box>

					<Box borderWidth="1px" borderRadius="lg" p={4}>
						<Heading size="sm" mb={3}>
							가격 차트 영역(프로토타입)
						</Heading>
						<HStack align="end" spacing={2} h="220px">
							{[40, 70, 55, 90, 65, 120, 80, 135, 100, 145, 110, 160].map(
								(h, idx) => (
									<Box
										key={idx}
										flex="1"
										bg="cyan.400"
										opacity={0.8}
										borderTopRadius="md"
										height={`${h}px`}
									/>
								)
							)}
						</HStack>
					</Box>
				</VStack>
			</GridItem>

			<GridItem>
				<VStack align="stretch" spacing={4}>
					<Box borderWidth="1px" borderRadius="lg" p={4}>
						<Heading size="sm" mb={3}>
							매수 / 매도 패널
						</Heading>
						<VStack align="stretch" spacing={3}>
							<InfoRow
								label="선택 종목"
								value={selectedStock ? `${selectedStock.name} (${selectedStock.code})` : "-"}
							/>
							<InfoRow
								label="현재가"
								value={
									selectedStock
										? selectedStock.market === "KOSPI"
											? `₩${selectedStock.price.toLocaleString()}`
											: `$${selectedStock.price}`
										: "-"
								}
							/>
							<InfoRow label="수량" value="10주" />
							<InfoRow label="예상 체결금액" value="₩742,000" />
						</VStack>

						<SimpleGrid columns={2} spacing={3} mt={4}>
							<Button colorScheme="red">매수</Button>
							<Button colorScheme="blue">매도</Button>
						</SimpleGrid>
					</Box>

					<Box borderWidth="1px" borderRadius="lg" p={4}>
						<Heading size="sm" mb={3}>
							내 포트폴리오
						</Heading>
						<Table size="sm">
							<Thead>
								<Tr>
									<Th>종목</Th>
									<Th>수량</Th>
									<Th>수익률</Th>
								</Tr>
							</Thead>
							<Tbody>
								<Tr>
									<Td>삼성전자</Td>
									<Td>12주</Td>
									<Td color="green.500">+2.15%</Td>
								</Tr>
								<Tr>
									<Td>SK하이닉스</Td>
									<Td>5주</Td>
									<Td color="red.500">-1.28%</Td>
								</Tr>
								<Tr>
									<Td>AAPL</Td>
									<Td>3주</Td>
									<Td color="green.500">+4.02%</Td>
								</Tr>
							</Tbody>
						</Table>
					</Box>
				</VStack>
			</GridItem>
		</Grid>
	);
}

function HistoryGamePanel({
	scenarioText,
	setScenarioText,
	marketDataText,
	setMarketDataText,
	userAnswerText,
	setUserAnswerText,
	historyResult,
	historyLoading,
	historyError,
	onRunHistoryExplanation,
}: {
	scenarioText: string;
	setScenarioText: (v: string) => void;
	marketDataText: string;
	setMarketDataText: (v: string) => void;
	userAnswerText: string;
	setUserAnswerText: (v: string) => void;
	historyResult: HistoryExplanationResult | null;
	historyLoading: boolean;
	historyError: string;
	onRunHistoryExplanation: () => void;
}) {
	return (
		<VStack align="stretch" spacing={4}>
			<Box borderWidth="1px" borderRadius="lg" p={4}>
				<Heading size="sm" mb={3}>
					입력 1. 시나리오 설명
				</Heading>
				<Textarea
					value={scenarioText}
					onChange={(e) => setScenarioText(e.target.value)}
					placeholder="DB에 저장될 시나리오 설명"
					minH="120px"
				/>
			</Box>

			<Box borderWidth="1px" borderRadius="lg" p={4}>
				<Heading size="sm" mb={3}>
					입력 2. 시장 데이터 / 실시간 데이터
				</Heading>
				<Textarea
					value={marketDataText}
					onChange={(e) => setMarketDataText(e.target.value)}
					placeholder="예: 나스닥 상승, 거래량 증가, 외국인 순매수"
					minH="120px"
				/>
			</Box>

			<Box borderWidth="1px" borderRadius="lg" p={4}>
				<Heading size="sm" mb={3}>
					입력 3. 사용자 답변
				</Heading>
				<Textarea
					value={userAnswerText}
					onChange={(e) => setUserAnswerText(e.target.value)}
					placeholder="예: 반도체 대형주 비중 확대"
					minH="120px"
				/>
			</Box>

			<Button
				colorScheme="cyan"
				onClick={onRunHistoryExplanation}
				isLoading={historyLoading}
			>
				해설 생성
			</Button>

			{historyError && (
				<Box borderWidth="1px" borderRadius="lg" p={4} bg="red.50">
					<Text color="red.600">{historyError}</Text>
				</Box>
			)}

			{historyResult && (
				<>
					<SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
						{historyResult.tag_explanations.map((item, index) => (
							<Box key={`${item.tag}-${index}`} borderWidth="1px" borderRadius="lg" p={4}>
								<Heading size="sm" mb={2}>
									{item.tag}
								</Heading>
								<Text color="gray.600">{item.explanation}</Text>
							</Box>
						))}
					</SimpleGrid>

					<Box borderWidth="1px" borderRadius="lg" p={4}>
						<Heading size="sm" mb={2}>
							총해설
						</Heading>
						<Text color="gray.600">{historyResult.overall_commentary}</Text>
					</Box>
				</>
			)}
		</VStack>
	);
}

function PredictionGamePanel() {
	return (
		<VStack align="stretch" spacing={4}>
			<Box borderWidth="1px" borderRadius="lg" p={4}>
				<Heading size="sm" mb={3}>
					현재 시장 힌트
				</Heading>
				<VStack align="stretch" spacing={2}>
					<InfoRow label="뉴스" value="금리 인하 기대감 확대" />
					<InfoRow label="거래량" value="전일 대비 18% 증가" />
					<InfoRow label="외국인 수급" value="순매수 전환" />
					<InfoRow label="변동성" value="중간 수준" />
				</VStack>
			</Box>

			<Box borderWidth="1px" borderRadius="lg" p={4}>
				<Heading size="sm" mb={3}>
					다음 가격 방향 예측
				</Heading>
				<HStack spacing={3}>
					<Button colorScheme="green">상승</Button>
					<Button colorScheme="red">하락</Button>
					<Button colorScheme="gray">횡보</Button>
				</HStack>
			</Box>

			<Box borderWidth="1px" borderRadius="lg" p={4}>
				<Heading size="sm" mb={3}>
					예측 정확도(예시)
				</Heading>
				<Text mb={2}>현재 점수: 72점</Text>
				<Progress value={72} borderRadius="md" />
			</Box>
		</VStack>
	);
}

function AISimulatorPlaceholder({
	onMove,
}: {
	onMove: () => void;
}) {
	return (
		<Box borderWidth="1px" borderRadius="lg" p={4}>
			<Heading size="sm" mb={3}>
				4개 집단 반응 시뮬레이터
			</Heading>
			<Text color="gray.600" mb={4}>
				이 기능은 Python 시뮬레이터와 연결된 별도 화면에서 실행됩니다.
			</Text>
			<Button colorScheme="cyan" onClick={onMove}>
				시뮬레이터 열기
			</Button>
		</Box>
	);
}
function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<Flex justify="space-between" align="center" borderWidth="1px" borderRadius="md" p={3}>
			<Text color="gray.500">{label}</Text>
			<Text fontWeight="medium">{value}</Text>
		</Flex>
	);
}