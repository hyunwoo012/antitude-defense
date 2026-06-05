import React, { useEffect, useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Flex,
	Grid,
	GridItem,
	Heading,
	Progress,
	Spacer,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.service";

type Chapter = {
	chapterId: number;
	chapterSlug: string;
	chapterTitle: string;
	chapterDescription: string;
	coreAttitude: string;
	learningGoal: string;
	scenarioCount: number;
	completedCount: number;
	progressRate: number;
	isLocked: boolean;
};

const unwrapApiData = <T,>(payload: any): T => {
	return payload?.data ?? payload;
};

const nodePositions = [
	{ left: "13%", top: "58%" },
	{ left: "28%", top: "40%" },
	{ left: "43%", top: "64%" },
	{ left: "58%", top: "43%" },
	{ left: "73%", top: "63%" },
	{ left: "86%", top: "45%" },
];

function ChapterBurrowNode({
	chapter,
	index,
	isSelected,
	onHover,
	onClick,
}: {
	chapter: Chapter;
	index: number;
	isSelected: boolean;
	onHover: () => void;
	onClick: () => void;
}) {
	const pos = nodePositions[index] ?? nodePositions[0]!;

	return (
		<Box
			position="absolute"
			left={pos.left}
			top={pos.top}
			transform="translate(-50%, -50%)"
			textAlign="center"
			onMouseEnter={onHover}
		>
			<Button
				w={{ base: "116px", xl: "150px" }}
				h={{ base: "82px", xl: "104px" }}
				borderRadius="50% 50% 44% 44%"
				bg={isSelected ? "#FFEEF9" : "#6B4A2F"}
				color={isSelected ? "black" : "white"}
				border="7px solid rgba(255,255,255,0.95)"
				boxShadow={
					isSelected
						? "0 12px 0 rgba(255, 190, 225, 0.6), 0 16px 24px rgba(0,0,0,0.12)"
						: "0 10px 0 rgba(70,45,28,0.35), 0 14px 20px rgba(0,0,0,0.12)"
				}
				_hover={{
					bg: "#FFEEF9",
					color: "black",
					transform: "translateY(-4px)",
				}}
				_active={{
					transform: "translateY(0)",
				}}
				onClick={onClick}
			>
				<Stack spacing="1" align="center">
					<Text fontSize={{ base: "xs", xl: "sm" }} fontWeight="900">
						Chapter {chapter.chapterId}
					</Text>
					<Text
						fontSize={{ base: "sm", xl: "md" }}
						fontWeight="900"
						lineHeight="1.2"
						whiteSpace="normal"
					>
						{chapter.chapterTitle}
					</Text>
				</Stack>
			</Button>

			<Badge
				mt="3"
				colorScheme={isSelected ? "pink" : "gray"}
				borderRadius="full"
				px="3"
			>
				{chapter.completedCount}/{chapter.scenarioCount}
			</Badge>
		</Box>
	);
}

function BurrowMap({
	chapters,
	selectedChapter,
	setSelectedChapter,
}: {
	chapters: Chapter[];
	selectedChapter: Chapter | null;
	setSelectedChapter: (chapter: Chapter) => void;
}) {
	const navigate = useNavigate();

	return (
		<Box
			position="relative"
			h={{ base: "calc(100vh - 190px)", xl: "calc(100vh - 170px)" }}
			minH={{ base: "560px", xl: "700px" }}
			borderRadius="3xl"
			overflow="hidden"
			bg="#F6F0E8"
			borderWidth="1px"
			boxShadow="sm"
		>
			<Box
				position="absolute"
				left="0"
				top="0"
				w="100%"
				h="32%"
				bg="linear-gradient(180deg, #FFFFFF 0%, #EEF7EF 100%)"
			/>

			{Array.from({ length: 28 }).map((_, index) => (
				<Box
					key={index}
					position="absolute"
					left={`${3 + index * 3.7}%`}
					top={`${11 + (index % 4) * 3}%`}
					w="4px"
					h={`${34 + (index % 5) * 10}px`}
					bg="#8EA15E"
					borderRadius="full"
					transform={`rotate(${index % 2 === 0 ? -18 : 18}deg)`}
					opacity="0.85"
				/>
			))}

			<Box
				position="absolute"
				left="-5%"
				bottom="-8%"
				w="110%"
				h="80%"
				bg="#D8C5AA"
				borderTop="5px solid #B8A189"
				clipPath="polygon(0 22%, 9% 10%, 18% 16%, 29% 6%, 39% 17%, 50% 8%, 62% 18%, 74% 9%, 86% 17%, 100% 8%, 100% 100%, 0 100%)"
			/>

			<svg
				width="100%"
				height="100%"
				viewBox="0 0 1200 760"
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					pointerEvents: "none",
				}}
			>
				<path
					d="M120 470 C210 580 330 575 445 510 C560 450 620 585 760 610 C910 640 1010 540 1090 440"
					stroke="#9B8062"
					strokeWidth="34"
					fill="none"
					strokeLinecap="round"
					opacity="0.42"
				/>
				<path
					d="M325 330 C335 435 405 475 505 520"
					stroke="#9B8062"
					strokeWidth="28"
					fill="none"
					strokeLinecap="round"
					opacity="0.35"
				/>
				<path
					d="M715 340 C690 455 760 515 875 575"
					stroke="#9B8062"
					strokeWidth="28"
					fill="none"
					strokeLinecap="round"
					opacity="0.35"
				/>
			</svg>

			{chapters.map((chapter, index) => (
				<ChapterBurrowNode
					key={chapter.chapterId}
					chapter={chapter}
					index={index}
					isSelected={selectedChapter?.chapterId === chapter.chapterId}
					onHover={() => setSelectedChapter(chapter)}
					onClick={() => navigate(`/scenario/chapter/${chapter.chapterId}`)}
				/>
			))}

			<Box position="absolute" left="28px" top="28px">
				<Badge colorScheme="pink" px="4" py="2" borderRadius="full">
					ANTITUDE SCENARIO MAP
				</Badge>
			</Box>

			{selectedChapter && (
				<Card
					position="absolute"
					right="28px"
					bottom="28px"
					w={{ base: "300px", xl: "400px" }}
					bg="rgba(255,255,255,0.94)"
					backdropFilter="blur(8px)"
					boxShadow="lg"
				>
					<CardBody>
						<Stack spacing="3">
							<Box>
								<Text fontSize="sm" color="gray.500">
									Chapter {selectedChapter.chapterId}
								</Text>
								<Heading size="md">{selectedChapter.chapterTitle}</Heading>
								<Badge mt="2" colorScheme="purple">
									{selectedChapter.coreAttitude}
								</Badge>
							</Box>

							<Text fontSize="sm" color="gray.600">
								{selectedChapter.chapterDescription}
							</Text>

							<Box>
								<Flex mb="1">
									<Text fontSize="sm">진행률</Text>
									<Spacer />
									<Text fontSize="sm" fontWeight="900">
										{selectedChapter.progressRate}%
									</Text>
								</Flex>
								<Progress
									value={selectedChapter.progressRate}
									colorScheme="pink"
									borderRadius="full"
								/>
							</Box>

							<Button
								colorScheme="pink"
								onClick={() =>
									navigate(`/scenario/chapter/${selectedChapter.chapterId}`)
								}
							>
								챕터 입장하기
							</Button>
						</Stack>
					</CardBody>
				</Card>
			)}
		</Box>
	);
}

export default function Scenario() {
	const toast = useToast();

	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const selected = useMemo(() => {
		return selectedChapter ?? chapters[0] ?? null;
	}, [selectedChapter, chapters]);

	const loadData = async () => {
		try {
			setIsLoading(true);

			const chapterRes = await api.get("/scenarios/chapters");
			const chapterData = unwrapApiData<Chapter[]>(chapterRes.data);

			setChapters(chapterData);
			setSelectedChapter(chapterData[0] ?? null);
		} catch (error) {
			console.error(error);

			toast({
				title: "시나리오 챕터를 불러오지 못했습니다.",
				status: "error",
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	return (
		<Box px={{ base: 4, md: 8 }} py="6" bg="gray.50" minH="100vh">
			<Flex align="center" mb="5">
				<Box>
					<Heading size="lg">시나리오</Heading>
					<Text mt="1" color="gray.500">
						개미굴을 선택해 투자 판단 학습을 시작하세요.
					</Text>
				</Box>
				<Spacer />
				<Badge colorScheme="pink" px="3" py="1" borderRadius="full">
					6개 챕터 · 18개 시나리오
				</Badge>
			</Flex>

			<Grid templateColumns="1fr">
				<GridItem>
					{isLoading ? (
						<Flex minH="600px" align="center" justify="center">
							<Text color="gray.500">개미굴을 불러오는 중...</Text>
						</Flex>
					) : (
						<BurrowMap
							chapters={chapters}
							selectedChapter={selected}
							setSelectedChapter={setSelectedChapter}
						/>
					)}
				</GridItem>
			</Grid>
		</Box>
	);
}