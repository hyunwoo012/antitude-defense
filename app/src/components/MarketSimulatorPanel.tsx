import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	CloseButton,
	Flex,
	Grid,
	GridItem,
	Heading,
	HStack,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Portal,
	SimpleGrid,
	Spinner,
	Stack,
	Stat,
	StatLabel,
	StatNumber,
	Text,
	Textarea,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import api from "../services/api.service";

type StockLike = {
	symbol: string;
	name: string;
	price: number;
	changeRate: number;
	volume?: number;
};

type PricePoint = {
	t: number;
	price: number;
	return: number;
	rolling_vol: number;
	interest_rate: number;
	gov_stimulus: number;
};

type Participant = {
	key: string;
	title: string;
	stance: "buy" | "sell" | "hold";
	action: string;
	intensity: number;
	confidence: number;
	key_factors: string[];
};

type SimResult = {
	priceHistory: PricePoint[];
	participants: Participant[];
	market: {
		decision: string;
		comment: string;
		startPrice: number;
		endPrice: number;
		simulatedReturn: number;
		finalVolatility: number;
		interestRate: number;
		govStimulus: number;
	};
};

type Props = {
	stock: StockLike | null;
};

const formatNumber = new Intl.NumberFormat("ko-KR");

function SimulationLineChart({ points }: { points: PricePoint[] }) {
	const width = 720;
	const height = 240;
	const padding = 28;

	const path = useMemo(() => {
		if (!points || points.length < 2) return "";

		const prices = points.map((p) => p.price);
		const min = Math.min(...prices);
		const max = Math.max(...prices);
		const range = max - min || 1;

		return points
			.map((p, index) => {
				const x =
					padding +
					(index / Math.max(points.length - 1, 1)) * (width - padding * 2);
				const y =
					height -
					padding -
					((p.price - min) / range) * (height - padding * 2);

				return `${index === 0 ? "M" : "L"} ${x} ${y}`;
			})
			.join(" ");
	}, [points]);

	if (!points || points.length === 0) {
		return (
			<Flex h="260px" align="center" justify="center" bg="gray.50">
				<Text color="gray.500">시뮬레이션 실행 후 그래프가 표시됩니다.</Text>
			</Flex>
		);
	}

	const first = points[0]!;
    const last = points[points.length - 1]!;

	return (
		<Box bg="white" borderWidth="1px" borderRadius="xl" p="4">
			<Flex mb="3" align="center">
				<Box>
					<Text fontWeight="800">가격 변화</Text>
					<Text fontSize="sm" color="gray.500">
						Step {first.t} → Step {last.t}
					</Text>
				</Box>
				<Box flex="1" />
				<Text fontWeight="800">
					{formatNumber.format(Math.round(last.price))}
				</Text>
			</Flex>

			<Box overflowX="auto">
				<svg width="100%" viewBox={`0 0 ${width} ${height}`}>
					<rect x="0" y="0" width={width} height={height} fill="#F7FAFC" />
					<path d={path} fill="none" stroke="#3182ce" strokeWidth="3" />
					<line
						x1={padding}
						x2={width - padding}
						y1={height - padding}
						y2={height - padding}
						stroke="#CBD5E0"
					/>
				</svg>
			</Box>
		</Box>
	);
}

function ParticipantCard({ item }: { item: Participant }) {
	const colorScheme =
		item.stance === "buy" ? "red" : item.stance === "sell" ? "blue" : "gray";

	return (
		<Box bg="white" borderWidth="1px" borderRadius="xl" p="4">
			<Flex align="center" mb="2">
				<Text fontWeight="900">{item.title}</Text>
				<Box flex="1" />
				<Badge colorScheme={colorScheme}>{item.action}</Badge>
			</Flex>

			<Text fontSize="sm" color="gray.600">
				강도: {(item.intensity * 100).toFixed(0)}% · 신뢰도:{" "}
				{(item.confidence * 100).toFixed(0)}%
			</Text>

			<Stack mt="3" spacing="1">
				{item.key_factors?.length ? (
					item.key_factors.slice(0, 3).map((factor, index) => (
						<Text key={index} fontSize="sm">
							{index + 1}. {factor}
						</Text>
					))
				) : (
					<Text fontSize="sm" color="gray.500">
						LLM 신호가 없거나 관망 상태입니다.
					</Text>
				)}
			</Stack>
		</Box>
	);
}

export default function MarketSimulatorPanel({ stock }: Props) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const [newsText, setNewsText] = useState("");
	const [steps, setSteps] = useState(60);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<SimResult | null>(null);

	const runSimulation = async (nextSteps?: number) => {
		if (!stock) {
			toast({
				title: "종목을 먼저 선택하세요.",
				status: "warning",
				isClosable: true,
			});
			return;
		}

		const runSteps = nextSteps ?? steps;

		try {
			setIsLoading(true);
			setSteps(runSteps);

			const res = await api.post("/simulator/run-visual", {
				symbol: stock.symbol,
				stockName: stock.name,
				currentPrice: stock.price,
				changeRate: stock.changeRate,
				volume: stock.volume,
				newsText,
				steps: runSteps,
			});

			const data = res.data?.data ?? res.data;

			setResult(data);
		} catch (error: any) {
			console.error(error);

			toast({
				title: "시장 시뮬레이션 실행 실패",
				description:
					error?.response?.data?.message ||
					"Python FastAPI 또는 Ollama 실행 상태를 확인하세요.",
				status: "error",
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Portal>
				<Button
					position="fixed"
					right={{ base: "20px", md: "32px" }}
					bottom={{ base: "72px", md: "88px" }}
					zIndex="popover"
					borderRadius="full"
					colorScheme="purple"
					boxShadow="lg"
					onClick={onOpen}
				>
					시장 시뮬레이터
				</Button>
			</Portal>

			<Modal isOpen={isOpen} onClose={onClose} size="6xl">
				<ModalOverlay />
				<ModalContent maxW="1180px" h="86vh">
					<ModalHeader borderBottomWidth="1px">
						<Flex align="center">
							<Box>
								<Heading size="md">시장 반응 시뮬레이터</Heading>
								<Text fontSize="sm" color="gray.500" mt="1">
									뉴스/이벤트에 따른 연준·정부·기관·개미 반응과 가격 변화를 시뮬레이션합니다.
								</Text>
							</Box>
							<Box flex="1" />
							<CloseButton onClick={onClose} />
						</Flex>
					</ModalHeader>

					<ModalBody overflowY="auto" py="5">
						<Grid templateColumns={{ base: "1fr", xl: "360px 1fr" }} gap="5">
							<GridItem>
								<Box bg="white" borderWidth="1px" borderRadius="xl" p="4">
									<Text fontWeight="900" mb="2">
										입력 뉴스/이벤트
									</Text>

									<Text fontSize="sm" color="gray.500" mb="3">
										선택 종목: {stock ? `${stock.name} (${stock.symbol})` : "없음"}
									</Text>

									<Textarea
										value={newsText}
										onChange={(e) => setNewsText(e.target.value)}
										placeholder="예: 삼성전자가 AI 반도체 수요 증가로 실적 개선 기대를 받고 있다."
										rows={9}
										resize="none"
									/>

									<HStack mt="4" spacing="2" wrap="wrap">
										{[1, 10, 30, 60, 100].map((step) => (
											<Button
												key={step}
												size="sm"
												variant={steps === step ? "solid" : "outline"}
												colorScheme={steps === step ? "purple" : "gray"}
												onClick={() => setSteps(step)}
											>
												{step} step
											</Button>
										))}
									</HStack>

									<Button
										mt="4"
										w="100%"
										colorScheme="purple"
										onClick={() => runSimulation()}
										isLoading={isLoading}
									>
										시뮬레이션 실행
									</Button>

									<Text mt="3" fontSize="xs" color="gray.500">
										Ollama와 Python FastAPI가 실행 중이어야 LLM 신호가 생성됩니다.
									</Text>
								</Box>
							</GridItem>

							<GridItem>
								{isLoading ? (
									<Flex h="500px" align="center" justify="center">
										<Stack align="center">
											<Spinner size="xl" />
											<Text color="gray.500">시뮬레이션 실행 중...</Text>
										</Stack>
									</Flex>
								) : (
									<Stack spacing="5">
										<SimulationLineChart points={result?.priceHistory || []} />

										{result?.market && (
											<Box bg="white" borderWidth="1px" borderRadius="xl" p="4">
												<Flex align="center" mb="3">
													<Text fontWeight="900">시장 결과</Text>
													<Box flex="1" />
													<Badge colorScheme="purple">
														{result.market.decision}
													</Badge>
												</Flex>

												<SimpleGrid columns={{ base: 2, md: 4 }} spacing="4">
													<Stat>
														<StatLabel>시작 가격</StatLabel>
														<StatNumber fontSize="lg">
															{formatNumber.format(
																Math.round(result.market.startPrice),
															)}
														</StatNumber>
													</Stat>
													<Stat>
														<StatLabel>최종 가격</StatLabel>
														<StatNumber fontSize="lg">
															{formatNumber.format(
																Math.round(result.market.endPrice),
															)}
														</StatNumber>
													</Stat>
													<Stat>
														<StatLabel>시뮬레이션 수익률</StatLabel>
														<StatNumber
															fontSize="lg"
															color={
																result.market.simulatedReturn >= 0
																	? "red.500"
																	: "blue.500"
															}
														>
															{(result.market.simulatedReturn * 100).toFixed(2)}%
														</StatNumber>
													</Stat>
													<Stat>
														<StatLabel>최종 변동성</StatLabel>
														<StatNumber fontSize="lg">
															{result.market.finalVolatility.toFixed(4)}
														</StatNumber>
													</Stat>
												</SimpleGrid>

												<Text mt="3" color="gray.600">
													{result.market.comment}
												</Text>
											</Box>
										)}

										<SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
											{result?.participants?.map((item) => (
												<ParticipantCard key={item.key} item={item} />
											))}
										</SimpleGrid>
									</Stack>
								)}
							</GridItem>
						</Grid>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}