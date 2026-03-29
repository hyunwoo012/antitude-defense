import React, { useState } from "react";
import {
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	Heading,
	Text,
	Textarea,
	VStack,
	HStack,
	SimpleGrid,
	Badge,
	Divider,
} from "@chakra-ui/react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

type AgentSignal = {
	stance: "buy" | "sell" | "hold";
	intensity: number;
	confidence: number;
	key_factors: string[];
};

type SimulationState = {
	sim_id: string;
	t: number;
	news_text: string;
	price: number;
	prev_price: number;
	last_price_change: number;
	last_return: number;
	interest_rate: number;
	gov_stimulus: number;
	rolling_vol: number;
	llm_signals: {
		FED?: AgentSignal;
		GOV?: AgentSignal;
		INST?: AgentSignal;
		RET?: AgentSignal;
	};
	use_llm: boolean;
	llm_every_n_steps: number;
	inst_scale: number;
	ret_scale: number;
};

type HistoryRow = {
	t: number;
	price: number;
	rate: number;
	stimulus: number;
	vol: number;
};

export default function AgentSimulator() {
	const [newsText, setNewsText] = useState(
		"미국 CPI가 예상보다 높게 발표되며 금리 인하 기대가 약화되었다."
	);

	const [simState, setSimState] = useState<SimulationState | null>(null);
	const [history, setHistory] = useState<HistoryRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const baseUrl = "http://127.0.0.1:8000";

	const pushHistory = (state: SimulationState) => {
		setHistory((prev) => [
			...prev,
			{
				t: state.t,
				price: state.price,
				rate: state.interest_rate,
				stimulus: state.gov_stimulus,
				vol: state.rolling_vol,
			},
		]);
	};

	const handleCreateSimulation = async () => {
		try {
			setLoading(true);
			setError("");

			const res = await fetch(`${baseUrl}/sim/create`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					news_text: newsText,
					use_llm: true,
					llm_model: "llama3.1:8b",
					llm_base_url: "http://127.0.0.1:11434",
					llm_every_n_steps: 10,
					n_retail: 400,
					n_institution: 20,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.detail || data?.error || "시뮬레이터 생성 실패");
			}

			setSimState(data.state);
			setHistory([
				{
					t: data.state.t,
					price: data.state.price,
					rate: data.state.interest_rate,
					stimulus: data.state.gov_stimulus,
					vol: data.state.rolling_vol,
				},
			]);
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "시뮬레이터 생성 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleApplyNews = async () => {
		if (!simState) {
			setError("먼저 시뮬레이터를 생성하세요.");
			return;
		}

		try {
			setLoading(true);
			setError("");

			const res = await fetch(`${baseUrl}/sim/${simState.sim_id}/news`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					news_text: newsText,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.detail || data?.error || "뉴스 적용 실패");
			}

			setSimState(data.state);
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "뉴스 적용 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleStep = async () => {
		if (!simState) {
			setError("먼저 시뮬레이터를 생성하세요.");
			return;
		}

		try {
			setLoading(true);
			setError("");

			const res = await fetch(`${baseUrl}/sim/${simState.sim_id}/step`, {
				method: "POST",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.detail || data?.error || "스텝 실행 실패");
			}

			setSimState(data.state);
			pushHistory(data.state);
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "스텝 실행 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleRun10 = async () => {
		if (!simState) {
			setError("먼저 시뮬레이터를 생성하세요.");
			return;
		}

		try {
			setLoading(true);
			setError("");

			const res = await fetch(`${baseUrl}/sim/${simState.sim_id}/run`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					steps: 10,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.detail || data?.error || "다중 스텝 실행 실패");
			}

			setSimState(data.state);
			pushHistory(data.state);
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "다중 스텝 실행 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		if (!simState) {
			setHistory([]);
			return;
		}

		try {
			setLoading(true);
			setError("");

			await fetch(`${baseUrl}/sim/${simState.sim_id}`, {
				method: "DELETE",
			});
		} catch (err) {
			console.error(err);
		} finally {
			setSimState(null);
			setHistory([]);
			setLoading(false);
		}
	};

	return (
		<Box>
			<VStack align="stretch" spacing={6}>
				<Box borderWidth="1px" borderRadius="xl" p={6} shadow="sm">
					<Text fontSize="sm" color="gray.500" mb={2}>
						Prototype / Simulator
					</Text>
					<Heading size="lg">4개 집단 반응 시뮬레이터</Heading>
					<Text mt={3} color="gray.600">
						뉴스를 입력하면 Python 시뮬레이터가 연준, 정부, 기관, 개인 반응을
						시장 상태와 함께 생성합니다.
					</Text>
				</Box>

				<Grid templateColumns={{ base: "1fr", xl: "1fr 1.2fr" }} gap={6}>
					<GridItem>
						<VStack align="stretch" spacing={4}>
							<Box borderWidth="1px" borderRadius="lg" p={4}>
								<Heading size="sm" mb={3}>
									뉴스 입력
								</Heading>
								<Textarea
									value={newsText}
									onChange={(e) => setNewsText(e.target.value)}
									minH="180px"
								/>
								<HStack mt={4} spacing={3}>
									<Button
										colorScheme="cyan"
										onClick={handleCreateSimulation}
										isLoading={loading}
									>
										시뮬레이터 생성
									</Button>
									<Button
										variant="outline"
										onClick={handleApplyNews}
										isDisabled={!simState || loading}
									>
										뉴스 적용
									</Button>
								</HStack>
							</Box>

							<Box borderWidth="1px" borderRadius="lg" p={4}>
								<Heading size="sm" mb={3}>
									실행 제어
								</Heading>
								<SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
									<Button onClick={handleStep} isDisabled={!simState || loading}>
										1 Step
									</Button>
									<Button onClick={handleRun10} isDisabled={!simState || loading}>
										10 Steps
									</Button>
									<Button
										variant="outline"
										onClick={handleApplyNews}
										isDisabled={!simState || loading}
									>
										News Update
									</Button>
									<Button colorScheme="red" variant="outline" onClick={handleReset}>
										Reset
									</Button>
								</SimpleGrid>
							</Box>

							{error && (
								<Box borderWidth="1px" borderRadius="lg" p={4} bg="red.50">
									<Text color="red.600">{error}</Text>
								</Box>
							)}
						</VStack>
					</GridItem>

					<GridItem>
						<VStack align="stretch" spacing={4}>
							<SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
								<MetricCard
									label="현재 가격"
									value={simState ? simState.price.toFixed(2) : "-"}
								/>
								<MetricCard
									label="금리"
									value={simState ? simState.interest_rate.toFixed(4) : "-"}
								/>
								<MetricCard
									label="정부 부양"
									value={simState ? simState.gov_stimulus.toFixed(3) : "-"}
								/>
								<MetricCard
									label="변동성"
									value={simState ? simState.rolling_vol.toFixed(4) : "-"}
								/>
							</SimpleGrid>

							<Box borderWidth="1px" borderRadius="lg" p={4}>
								<Heading size="sm" mb={3}>
									현재 시뮬레이션 상태
								</Heading>
								<VStack align="stretch" spacing={2}>
									<InfoRow label="Simulation ID" value={simState?.sim_id ?? "-"} />
									<InfoRow label="t" value={simState ? String(simState.t) : "-"} />
									<InfoRow
										label="Last Price Change"
										value={simState ? simState.last_price_change.toFixed(4) : "-"}
									/>
									<InfoRow
										label="Last Return"
										value={simState ? simState.last_return.toFixed(6) : "-"}
									/>
								</VStack>
							</Box>
						</VStack>
					</GridItem>
				</Grid>

				<SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
					<ChartCard
						title="Price"
						data={history}
						dataKey="price"
					/>
					<ChartCard
						title="Interest Rate"
						data={history}
						dataKey="rate"
					/>
					<ChartCard
						title="Gov Stimulus"
						data={history}
						dataKey="stimulus"
					/>
					<ChartCard
						title="Rolling Vol"
						data={history}
						dataKey="vol"
					/>
				</SimpleGrid>

				<Box borderWidth="1px" borderRadius="lg" p={4}>
					<Heading size="sm" mb={3}>
						4개 집단 최신 반응
					</Heading>
					<SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
						<SignalCard title="연준 (FED)" signal={simState?.llm_signals?.FED} />
						<SignalCard title="정부 (GOV)" signal={simState?.llm_signals?.GOV} />
						<SignalCard title="기관 (INST)" signal={simState?.llm_signals?.INST} />
						<SignalCard title="개인 (RET)" signal={simState?.llm_signals?.RET} />
					</SimpleGrid>
				</Box>
			</VStack>
		</Box>
	);
}

function MetricCard({ label, value }: { label: string; value: string }) {
	return (
		<Box borderWidth="1px" borderRadius="lg" p={4}>
			<Text fontSize="xs" color="gray.500">
				{label}
			</Text>
			<Text fontWeight="bold" mt={1}>
				{value}
			</Text>
		</Box>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<Flex justify="space-between" align="center" borderWidth="1px" borderRadius="md" p={3}>
			<Text color="gray.500">{label}</Text>
			<Text fontWeight="medium" maxW="70%" textAlign="right" wordBreak="break-all">
				{value}
			</Text>
		</Flex>
	);
}

function ChartCard({
	title,
	data,
	dataKey,
}: {
	title: string;
	data: HistoryRow[];
	dataKey: "price" | "rate" | "stimulus" | "vol";
}) {
	return (
		<Box borderWidth="1px" borderRadius="lg" p={4}>
			<Heading size="sm" mb={3}>
				{title}
			</Heading>
			<Box h="260px">
				{data.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="t" />
							<YAxis />
							<Tooltip />
							<Line
								type="monotone"
								dataKey={dataKey}
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<Flex align="center" justify="center" h="100%">
						<Text color="gray.500">아직 데이터가 없습니다.</Text>
					</Flex>
				)}
			</Box>
		</Box>
	);
}

function SignalCard({
	title,
	signal,
}: {
	title: string;
	signal?: AgentSignal;
}) {
	const stanceColor =
		signal?.stance === "buy"
			? "green"
			: signal?.stance === "sell"
			? "red"
			: "gray";

	return (
		<Box borderWidth="1px" borderRadius="lg" p={4}>
			<Heading size="sm" mb={3}>
				{title}
			</Heading>

			{signal ? (
				<VStack align="stretch" spacing={3}>
					<HStack justify="space-between">
						<Text color="gray.500">Stance</Text>
						<Badge colorScheme={stanceColor}>{signal.stance}</Badge>
					</HStack>
					<HStack justify="space-between">
						<Text color="gray.500">Intensity</Text>
						<Text fontWeight="medium">{signal.intensity.toFixed(3)}</Text>
					</HStack>
					<HStack justify="space-between">
						<Text color="gray.500">Confidence</Text>
						<Text fontWeight="medium">{signal.confidence.toFixed(3)}</Text>
					</HStack>

					<Divider />

					<Box>
						<Text color="gray.500" mb={2}>
							Key Factors
						</Text>
						<VStack align="stretch" spacing={1}>
							{signal.key_factors?.length > 0 ? (
								signal.key_factors.map((factor, idx) => (
									<Text key={`${factor}-${idx}`} fontSize="sm">
										• {factor}
									</Text>
								))
							) : (
								<Text fontSize="sm" color="gray.500">
									요인 없음
								</Text>
							)}
						</VStack>
					</Box>
				</VStack>
			) : (
				<Text color="gray.500">아직 생성된 신호가 없습니다.</Text>
			)}
		</Box>
	);
}