import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	CloseButton,
	Flex,
	HStack,
	IconButton,
	Portal,
	Spinner,
	Stack,
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
	changePrice?: number;
	volume?: number;
};

type ChartPointLike = {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
};

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	decision?: string;
	riskLevel?: string;
	reasons?: string[];
	alternative?: string;
	disclaimer?: string;

	priceHistory?: {
		t: number;
		price: number;
		return: number;
		rolling_vol: number;
		interest_rate: number;
		gov_stimulus: number;
	}[];

	llmSignals?: Record<string, any>;
	simState?: any;
	missedFactors?: string[];
	educationPoint?: string;
};


type Props = {
	stock: StockLike | null;
	chartPoints: ChartPointLike[];
	chartPeriod: string;
	chartInterval: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultQuestions = [
	"AI라면 지금 매수할까?",
	"이 종목의 단기 리스크는 뭐야?",
	"초보자가 지금 들어가도 괜찮을까?",
];

export default function AiAssistantPanel({
	stock,
	chartPoints,
	chartPeriod,
	chartInterval,
}: Props) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: createId(),
			role: "assistant",
			content:
			"선택한 종목의 현재가, 차트 흐름, 재무지표를 바탕으로 AI라면 어떤 판단을 할지 비교해드립니다. 이 기능은 투자 권유가 아니라 초보 투자자 학습용 판단 비교 기능입니다.",
		},
	]);

	const selectedStockLabel = useMemo(() => {
		if (!stock) return "종목 미선택";
		return `${stock.name} (${stock.symbol})`;
	}, [stock]);

	const sendQuestion = async (question?: string) => {
		const userQuestion = (question ?? input).trim();

		if (!userQuestion) return;

		if (!stock) {
			toast({
				title: "종목을 먼저 선택하세요.",
				status: "warning",
				isClosable: true,
			});
			return;
		}

		const userMessage: Message = {
			id: createId(),
			role: "user",
			content: userQuestion,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const res = await api.post("/ai/stock-assistant", {
				symbol: stock.symbol,
				stockName: stock.name,
				currentPrice: stock.price,
				changeRate: stock.changeRate,
				changePrice: stock.changePrice,
				volume: stock.volume,
				chartPeriod,
				chartInterval,
				chartPoints: chartPoints.slice(-80),
				userQuestion,
			});

			const data = res.data?.data ?? res.data;

			const assistantMessage: Message = {
			id: createId(),
			role: "assistant",
			content: data.summary || "분석 결과를 생성했습니다.",
			decision: data.decision,
			riskLevel: data.riskLevel,
			reasons: data.reasons || [],
			alternative: data.alternative,
			disclaimer: data.disclaimer,

			priceHistory: data.priceHistory || [],
			llmSignals: data.llmSignals || {},
			simState: data.simState,
};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error: any) {
			console.error(error);

			setMessages((prev) => [
				...prev,
				{
					id: createId(),
					role: "assistant",
					content:
						error?.response?.data?.message ||
						"AI라면 응답을 불러오지 못했습니다.",
				},
			]);
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
					bottom={{ base: "20px", md: "32px" }}
					zIndex="popover"
					borderRadius="full"
					colorScheme="blue"
					boxShadow="lg"
					onClick={onOpen}
				>
					AI라면?
				</Button>
			</Portal>

			{isOpen && (
				<Portal>
					<Box
						position="fixed"
						right={{ base: "12px", md: "32px" }}
						bottom={{ base: "80px", md: "92px" }}
						w={{ base: "calc(100vw - 24px)", md: "760px", xl: "920px" }}
						h={{ base: "calc(100vh - 110px)", md: "720px" }}
						bg="white"
						borderWidth="1px"
						borderRadius="2xl"
						boxShadow="2xl"
						zIndex="popover"
						overflow="hidden"
					>
						<Flex
							px="4"
							py="3"
							borderBottomWidth="1px"
							align="center"
							gap="3"
						>
							<Box>
								<Text fontWeight="900">AI라면?</Text>
								<Text fontSize="sm" color="gray.500">
									{selectedStockLabel}
								</Text>
							</Box>
							<Box flex="1" />
							<Badge colorScheme="blue">Beta</Badge>
							<CloseButton onClick={onClose} />
						</Flex>

						<Box h={{ base: "calc(100% - 230px)", md: "500px" }} overflowY="auto" p="4" bg="gray.50">
							<Stack spacing="3">
								{messages.map((message) => (
									<Flex
										key={message.id}
										justify={message.role === "user" ? "flex-end" : "flex-start"}
									>
										<Box
											maxW="88%"
											bg={message.role === "user" ? "blue.500" : "white"}
											color={message.role === "user" ? "white" : "gray.800"}
											borderWidth={message.role === "assistant" ? "1px" : "0"}
											borderRadius="xl"
											px="4"
											py="3"
											boxShadow={message.role === "assistant" ? "sm" : "none"}
										>
											{message.decision && (
												<HStack mb="2">
													<Badge colorScheme="purple">
														판단: {message.decision}
													</Badge>
													{message.riskLevel && (
														<Badge colorScheme="orange">
															위험도: {message.riskLevel}
														</Badge>
													)}
												</HStack>
											)}

											<Text whiteSpace="pre-wrap">{message.content}</Text>

											{message.reasons && message.reasons.length > 0 && (
												<Box mt="3">
													<Text fontWeight="700" fontSize="sm" mb="1">
														근거
													</Text>
													<Stack spacing="1">
														{message.reasons.map((reason, index) => (
															<Text key={index} fontSize="sm">
																{index + 1}. {reason}
															</Text>
														))}
													</Stack>
												</Box>
											)}

											{message.alternative && (
												<Box mt="3">
													<Text fontWeight="700" fontSize="sm" mb="1">
														대안 판단
													</Text>
													<Text fontSize="sm">{message.alternative}</Text>
												</Box>
											)}
											{message.priceHistory?.length ? (
	<Box mt="3" p="3" bg="gray.50" borderRadius="lg">
		<Text fontWeight="700" fontSize="sm" mb="2">
			시뮬레이션 결과
		</Text>

		<Text fontSize="sm">
			시작 가격: {message.priceHistory[0]?.price?.toFixed(2)}
		</Text>

		<Text fontSize="sm">
			최종 가격:{" "}
			{
				message.priceHistory[
					message.priceHistory.length - 1
				]?.price?.toFixed(2)
			}
		</Text>

		<Text fontSize="sm">
			스텝 수: {message.priceHistory.length - 1}
		</Text>
	</Box>
) : null}

{message.llmSignals &&
	Object.keys(message.llmSignals).length > 0 && (
		<Box mt="3" p="3" bg="gray.50" borderRadius="lg">
			<Text fontWeight="700" fontSize="sm" mb="2">
				LLM 에이전트 신호
			</Text>

			<Stack spacing="2">
				{Object.entries(message.llmSignals).map(
					([role, signal]: any) => (
						<Box key={role}>
							<Text fontWeight="700">{role}</Text>

							<Text fontSize="sm">
								판단: {signal?.stance} / 강도:{" "}
								{signal?.intensity} / 신뢰도:{" "}
								{signal?.confidence}
							</Text>

							{Array.isArray(signal?.key_factors) && (
								<Text fontSize="sm" color="gray.600">
									요인: {signal.key_factors.join(", ")}
								</Text>
							)}
						</Box>
					),
				)}
			</Stack>
		</Box>
)}

											{message.disclaimer && (
												<Text mt="3" fontSize="xs" color="gray.500">
													{message.disclaimer}
												</Text>
											)}
										</Box>
									</Flex>
								))}

								{isLoading && (
									<Flex justify="flex-start">
										<Box
											bg="white"
											borderWidth="1px"
											borderRadius="xl"
											px="4"
											py="3"
										>
											<HStack>
												<Spinner size="sm" />
												<Text fontSize="sm">AI라면 판단 중...</Text>
											</HStack>
										</Box>
									</Flex>
								)}
							</Stack>
						</Box>

						<Box p="4" borderTopWidth="1px">
							<HStack mb="3" spacing="2" overflowX="auto">
								{defaultQuestions.map((question) => (
									<Button
										key={question}
										size="xs"
										variant="outline"
										onClick={() => sendQuestion(question)}
										isDisabled={isLoading}
										flexShrink={0}
									>
										{question}
									</Button>
								))}
							</HStack>

							<Textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="예: AI라면 지금 매수할까?"
								size="sm"
								resize="none"
								rows={3}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										sendQuestion();
									}
								}}
							/>

							<Flex mt="3" justify="flex-end">
								<Button
									colorScheme="blue"
									size="sm"
									onClick={() => sendQuestion()}
									isLoading={isLoading}
								>
									전송
								</Button>
							</Flex>
						</Box>
					</Box>
				</Portal>
			)}
		</>
	);
}