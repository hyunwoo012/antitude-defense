import React, { useEffect, useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Flex,
	Heading,
	HStack,
	Progress,
	SimpleGrid,
	Spacer,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.service";

type ChapterScenario = {
	_id: string;
	chapterId: number;
	chapterSlug: string;
	chapterTitle: string;
	chapterDescription: string;
	coreAttitude: string;
	learningGoal: string;
	scenarioNo: string;
	scenarioSlug: string;
	title: string;
	eventPeriod: string;
	summary: string;
	difficulty: "쉬움" | "보통" | "어려움";
	estimatedMinutes: number;
	keywords: string[];
	learningPoints: string[];
	status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
	completedStepCount: number;
};

const unwrapApiData = <T,>(payload: any): T => payload?.data ?? payload;

const statusLabel = {
	NOT_STARTED: "미완료",
	IN_PROGRESS: "진행 중",
	COMPLETED: "완료",
};

const statusColor = {
	NOT_STARTED: "gray",
	IN_PROGRESS: "yellow",
	COMPLETED: "green",
};

export default function ScenarioChapter() {
	const { chapterId } = useParams();
	const navigate = useNavigate();
	const toast = useToast();

	const [scenarios, setScenarios] = useState<ChapterScenario[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const chapterInfo = useMemo(() => scenarios[0] ?? null, [scenarios]);

	const loadScenarios = async () => {
		try {
			setIsLoading(true);

			const res = await api.get(`/scenarios/chapters/${chapterId}`);
			setScenarios(unwrapApiData<ChapterScenario[]>(res.data));
		} catch (error) {
			console.error(error);
			toast({
				title: "챕터 시나리오를 불러오지 못했습니다.",
				status: "error",
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadScenarios();
	}, [chapterId]);

	return (
		<Box px={{ base: 4, md: 8 }} py="6" bg="gray.50" minH="100vh">
			<Flex align="center" mb="5">
				<Button variant="ghost" onClick={() => navigate("/scenario")}>
					← 개미굴 맵
				</Button>
				<Spacer />
				<Badge colorScheme="pink" px="3" py="1" borderRadius="full">
					챕터 시나리오
				</Badge>
			</Flex>

			<Card mb="6" overflow="hidden">
				<Box h="10px" bg="#FFEEF9" />
				<CardBody p={{ base: 5, md: 8 }}>
					{chapterInfo ? (
						<Flex direction={{ base: "column", xl: "row" }} gap="8">
							<Box flex="1">
								<Text fontSize="md" color="gray.500" fontWeight="800">
									Chapter {chapterInfo.chapterId}
								</Text>
								<Heading size="2xl" mt="2" letterSpacing="-0.04em">
									{chapterInfo.chapterTitle}
								</Heading>
								<Text mt="4" fontSize="lg" color="gray.600" lineHeight="1.8">
									{chapterInfo.chapterDescription}
								</Text>
							</Box>

							<Box
								w={{ base: "100%", xl: "420px" }}
								bg="gray.50"
								borderRadius="2xl"
								p="6"
							>
								<Stack spacing="5">
									<Box>
										<Text fontSize="sm" color="gray.500">
											핵심 태도
										</Text>
										<Heading size="md" mt="1">
											{chapterInfo.coreAttitude}
										</Heading>
									</Box>
									<Box>
										<Text fontSize="sm" color="gray.500">
											학습 목표
										</Text>
										<Text mt="1" fontSize="md" color="gray.700">
											{chapterInfo.learningGoal}
										</Text>
									</Box>
								</Stack>
							</Box>
						</Flex>
					) : (
						<Text color="gray.500">
							{isLoading ? "불러오는 중..." : "시나리오가 없습니다."}
						</Text>
					)}
				</CardBody>
			</Card>

			<SimpleGrid columns={{ base: 1, xl: 3 }} spacing="6">
				{scenarios.map((scenario) => (
					<Card
						key={scenario.scenarioSlug}
						overflow="hidden"
						borderWidth="1px"
						boxShadow="sm"
						_hover={{
							transform: "translateY(-4px)",
							boxShadow: "lg",
						}}
						transition="0.18s ease"
					>
						<Box h="12px" bg={scenario.status === "COMPLETED" ? "green.400" : "#FFEEF9"} />

						<CardBody p="7">
							<Stack spacing="5">
								<HStack>
									<Badge colorScheme="pink" fontSize="sm" px="3" py="1">
										{scenario.scenarioNo}
									</Badge>
									<Badge
										colorScheme={statusColor[scenario.status]}
										fontSize="sm"
										px="3"
										py="1"
									>
										{statusLabel[scenario.status]}
									</Badge>
									<Spacer />
									<Badge fontSize="sm" px="3" py="1">
										{scenario.difficulty}
									</Badge>
								</HStack>

								<Box>
									<Heading size="lg" lineHeight="1.35" letterSpacing="-0.04em">
										{scenario.title}
									</Heading>
									<Text mt="2" fontSize="md" color="gray.500">
										{scenario.eventPeriod} · 약 {scenario.estimatedMinutes}분
									</Text>
								</Box>

								<Text fontSize="md" color="gray.600" lineHeight="1.8" minH="86px">
									{scenario.summary}
								</Text>

								<Box bg="gray.50" p="4" borderRadius="xl">
									<Text fontWeight="900" mb="3">
										이 시나리오에서 배우는 것
									</Text>
									<Stack spacing="2">
										{scenario.learningPoints?.slice(0, 3).map((point) => (
											<Text key={point} fontSize="md" color="gray.700">
												• {point}
											</Text>
										))}
									</Stack>
								</Box>

								<HStack wrap="wrap">
									{scenario.keywords?.slice(0, 5).map((keyword) => (
										<Badge key={keyword} colorScheme="gray" px="2" py="1">
											#{keyword}
										</Badge>
									))}
								</HStack>

								<Box>
									<Flex mb="1">
										<Text fontSize="sm">진행 단계</Text>
										<Spacer />
										<Text fontSize="sm" fontWeight="900">
											{scenario.completedStepCount}/3
										</Text>
									</Flex>
									<Progress
										value={(scenario.completedStepCount / 3) * 100}
										colorScheme="pink"
										borderRadius="full"
									/>
								</Box>

								<Button
									h="48px"
									colorScheme="pink"
									fontSize="md"
									onClick={() =>
										navigate(`/scenario/play/${scenario.scenarioSlug}`)
									}
								>
									{scenario.status === "NOT_STARTED"
										? "시나리오 시작"
										: scenario.status === "IN_PROGRESS"
											? "이어하기"
											: "다시 보기"}
								</Button>
							</Stack>
						</CardBody>
					</Card>
				))}
			</SimpleGrid>
		</Box>
	);
}