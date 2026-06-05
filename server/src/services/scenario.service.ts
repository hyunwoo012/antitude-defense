import Scenario from "../models/scenario.model";
import ScenarioDecision from "../models/scenarioDecision.model";

const DEFAULT_USER_ID = "demo-user";

type ChapterSeed = {
	chapterId: number;
	chapterSlug: string;
	chapterTitle: string;
	chapterDescription: string;
	coreAttitude: string;
	learningGoal: string;
};

type ScenarioSeed = {
	chapterId: number;
	scenarioNo: string;
	scenarioSlug: string;
	title: string;
	eventPeriod: string;
	summary: string;
	background: string;
	difficulty: "쉬움" | "보통" | "어려움";
	estimatedMinutes: number;
	keywords: string[];
	learningPoints: string[];
	aiEvaluationPoints: string[];
	expectedFeedback: string;
};

const getUserId = (userId?: string) => userId?.trim() || DEFAULT_USER_ID;

const createServiceError = (statusCode: number, message: string) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

const CHAPTERS: ChapterSeed[] = [
	{
		chapterId: 1,
		chapterSlug: "falling-market-attitude",
		chapterTitle: "떨어질 때의 태도",
		chapterDescription:
			"시장이 급락할 때 공포에 휩쓸리지 않고 하락 원인과 리스크를 분석하는 법을 학습합니다.",
		coreAttitude: "공포 조절",
		learningGoal:
			"급락장에서 감정적인 전량 매도나 무리한 저가 매수를 피하는 기준을 세웁니다.",
	},
	{
		chapterId: 2,
		chapterSlug: "when-everyone-buys",
		chapterTitle: "다들 산다고 할 때",
		chapterDescription:
			"테마주, 급등주, 주변 추천 상황에서 군중심리와 FOMO를 경계하는 법을 학습합니다.",
		coreAttitude: "군중심리 경계",
		learningGoal:
			"성장 기대와 단기 과열을 구분하고 추격매수 위험을 판단합니다.",
	},
	{
		chapterId: 3,
		chapterSlug: "do-not-sway-by-news",
		chapterTitle: "뉴스에 흔들리지 않는 법",
		chapterDescription:
			"뉴스의 표면적 호재·악재보다 시장 기대치와 반영 여부를 해석하는 법을 학습합니다.",
		coreAttitude: "정보 해석",
		learningGoal:
			"뉴스의 이벤트 유형, 영향 대상, 반영 정도를 함께 판단합니다.",
	},
	{
		chapterId: 4,
		chapterSlug: "hold-or-sell",
		chapterTitle: "버틸까, 팔까",
		chapterDescription:
			"손실 구간에서 막연히 버티거나 성급히 매도하지 않고 기준을 세우는 법을 학습합니다.",
		coreAttitude: "손실 대응",
		learningGoal:
			"손실 자체보다 하락 원인, 추세 훼손, 실적 변화를 기준으로 판단합니다.",
	},
	{
		chapterId: 5,
		chapterSlug: "recovery-signal",
		chapterTitle: "회복장의 신호",
		chapterDescription:
			"급락 이후 반등과 실제 추세 전환을 구분하고 회복 신호를 해석하는 법을 학습합니다.",
		coreAttitude: "기회 포착",
		learningGoal:
			"정책 대응, 업황 회복, 투자심리 변화를 종합해 회복 가능성을 판단합니다.",
	},
	{
		chapterId: 6,
		chapterSlug: "keep-my-principle",
		chapterTitle: "내 원칙 지키기",
		chapterDescription:
			"비중 관리, 분산 투자, 수익 실현 등 장기적인 투자 습관과 원칙을 학습합니다.",
		coreAttitude: "투자 습관",
		learningGoal:
			"시장 상황에 흔들리지 않고 자신의 리스크 관리 기준을 유지합니다.",
	},
];

const SCENARIOS: ScenarioSeed[] = [
	{
		chapterId: 1,
		scenarioNo: "1-1",
		scenarioSlug: "covid-pandemic-crash",
		title: "코로나 팬데믹 초기 폭락",
		eventPeriod: "2020.02 ~ 2020.03",
		summary: "코로나19 확산으로 글로벌 증시가 급락하고 공포 심리가 확산된 상황",
		background:
			"코로나19가 전 세계로 확산되면서 주식시장은 짧은 기간에 큰 폭으로 하락했습니다.",
		difficulty: "쉬움",
		estimatedMinutes: 20,
		keywords: ["급락", "공포", "변동성", "정책 대응"],
		learningPoints: ["공포장 대응", "변동성 판단", "장기 관점"],
		aiEvaluationPoints: [
			"하락 원인을 파악했는지",
			"변동성과 회복 가능성을 함께 고려했는지",
			"전량 매도 또는 무리한 저가 매수를 피했는지",
		],
		expectedFeedback:
			"공포 상황을 인식한 것은 적절하지만, 전량 매도는 회복 가능성을 고려하지 못한 판단일 수 있습니다.",
	},
	{
		chapterId: 1,
		scenarioNo: "1-2",
		scenarioSlug: "war-outbreak-market-risk",
		title: "전쟁 발발 직후 시장 불안",
		eventPeriod: "2022.02",
		summary: "러시아-우크라이나 전쟁 발발로 글로벌 증시와 원자재 시장이 불안정해진 상황",
		background:
			"지정학적 리스크가 커지며 유가와 원자재 가격이 급등하고 시장 불안이 확대되었습니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["전쟁", "지정학 리스크", "유가", "안전자산"],
		learningPoints: ["지정학 리스크 이해", "섹터별 영향 구분"],
		aiEvaluationPoints: [
			"단기 충격과 장기 산업 영향을 구분했는지",
			"수혜 섹터와 피해 섹터를 구분했는지",
		],
		expectedFeedback:
			"시장 전체 공포는 컸지만 모든 종목에 동일하게 부정적 영향을 주는 것은 아닙니다.",
	},
	{
		chapterId: 1,
		scenarioNo: "1-3",
		scenarioSlug: "financial-system-anxiety",
		title: "금융 불안 심리 확산",
		eventPeriod: "2023",
		summary: "은행권 부실 우려 또는 금융 시스템 불안 뉴스로 시장 심리가 위축된 상황",
		background:
			"특정 금융기관의 불안이 시장 전체의 리스크 회피 심리로 확산되는 상황입니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["금융 불안", "은행", "시스템 리스크", "시장 심리"],
		learningPoints: ["시스템 리스크", "과잉 반응 구분"],
		aiEvaluationPoints: [
			"특정 금융 이슈가 시장 전체에 미치는 간접 영향을 고려했는지",
			"과도한 공포와 실제 리스크를 구분했는지",
		],
		expectedFeedback:
			"개별 은행 이슈가 전체 시장으로 확산될 가능성을 고려한 점은 중요합니다.",
	},
	{
		chapterId: 2,
		scenarioNo: "2-1",
		scenarioSlug: "secondary-battery-boom",
		title: "2차전지 열풍",
		eventPeriod: "2023",
		summary: "전기차와 배터리 산업 성장 기대감으로 2차전지 관련 종목이 급등하는 상황",
		background:
			"산업 성장 기대와 개인투자자 관심이 결합되면서 관련 종목의 단기 상승이 커졌습니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["2차전지", "테마주", "추격매수", "과열"],
		learningPoints: ["성장 기대와 주가 과열 구분", "추격매수 경계"],
		aiEvaluationPoints: [
			"산업 성장성과 단기 과열 위험을 함께 고려했는지",
			"밸류에이션 부담을 확인했는지",
		],
		expectedFeedback:
			"성장 기대를 파악한 점은 적절하지만 이미 큰 폭으로 상승한 상태라 추격매수 위험을 고려해야 합니다.",
	},
	{
		chapterId: 2,
		scenarioNo: "2-2",
		scenarioSlug: "ai-theme-rally",
		title: "AI 테마 급등장",
		eventPeriod: "2023 ~ 2024",
		summary: "인공지능 산업 성장 기대감으로 AI 관련 종목이 단기간 급등하는 상황",
		background:
			"AI 산업 기대감이 커졌지만 모든 관련 종목이 실적 개선으로 이어지는 것은 아닙니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["AI", "테마", "실적 연결성", "과열"],
		learningPoints: ["테마성 상승과 실적 기반 상승 구분"],
		aiEvaluationPoints: [
			"뉴스 기대감이 실제 기업 실적과 연결되는지 판단했는지",
			"테마 과열을 고려했는지",
		],
		expectedFeedback:
			"AI 산업 성장 자체는 긍정적이지만 해당 기업의 실적과 직접 연결되는지 확인해야 합니다.",
	},
	{
		chapterId: 2,
		scenarioNo: "2-3",
		scenarioSlug: "retail-investor-overheat",
		title: "개인투자자 과열 매수",
		eventPeriod: "상황형",
		summary: "커뮤니티와 SNS에서 특정 종목 매수 분위기가 확산되고 개인투자자 수급이 몰리는 상황",
		background:
			"주변 수익 사례와 커뮤니티 분위기에 의해 투자 근거보다 감정이 앞서는 상황입니다.",
		difficulty: "쉬움",
		estimatedMinutes: 15,
		keywords: ["커뮤니티", "FOMO", "개인투자자", "거래량 급증"],
		learningPoints: ["군중심리 경계", "근거 기반 판단"],
		aiEvaluationPoints: [
			"판단이 데이터 기반인지 분위기 기반인지 평가",
			"단기 급등률과 리스크를 고려했는지",
		],
		expectedFeedback:
			"주변 분위기와 커뮤니티 반응만으로 매수하는 것은 위험합니다.",
	},
	{
		chapterId: 3,
		scenarioNo: "3-1",
		scenarioSlug: "interest-rate-announcement",
		title: "금리 발표 이후 시장 반응",
		eventPeriod: "상황형",
		summary: "중앙은행의 금리 인상 또는 동결 발표 이후 시장 변동성이 커진 상황",
		background:
			"금리 발표는 성장주, 금융주, 환율, 시장 심리에 복합적으로 영향을 줍니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["금리", "성장주", "긴축", "환율"],
		learningPoints: ["금리 뉴스 해석", "직접·간접 영향 구분"],
		aiEvaluationPoints: [
			"금리 변화의 직접 영향과 간접 영향을 구분했는지",
			"시장 예상 반영 여부를 고려했는지",
		],
		expectedFeedback:
			"금리 인상은 성장주에 부담이 될 수 있지만 시장이 이미 예상했는지도 함께 봐야 합니다.",
	},
	{
		chapterId: 3,
		scenarioNo: "3-2",
		scenarioSlug: "earnings-surprise-reaction",
		title: "기업 실적 발표와 주가 반응",
		eventPeriod: "상황형",
		summary: "기업이 실적을 발표했지만 주가는 예상과 다르게 움직이는 상황",
		background:
			"실적 수치가 좋아도 시장 기대치보다 낮으면 주가는 하락할 수 있습니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["실적", "컨센서스", "가이던스", "기대치"],
		learningPoints: ["실적과 기대치 비교", "가이던스 해석"],
		aiEvaluationPoints: [
			"단순 실적 개선이 아니라 예상 대비 결과를 고려했는지",
			"가이던스와 시장 반응을 함께 봤는지",
		],
		expectedFeedback:
			"실적은 증가했지만 시장 기대치에 미치지 못했다면 주가가 하락할 수 있습니다.",
	},
	{
		chapterId: 3,
		scenarioNo: "3-3",
		scenarioSlug: "policy-regulation-impact",
		title: "정책·규제 뉴스 영향",
		eventPeriod: "상황형",
		summary: "정부 정책 발표나 산업 규제로 특정 섹터의 주가가 흔들리는 상황",
		background:
			"정책 뉴스는 수혜 기업과 피해 기업을 동시에 만들 수 있습니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["정책", "규제", "수혜주", "피해주"],
		learningPoints: ["수혜·피해 대상 구분", "정책 영향 분석"],
		aiEvaluationPoints: [
			"정책 뉴스의 직접 수혜 대상과 피해 대상을 구분했는지",
			"섹터 전체와 개별 기업 영향을 분리했는지",
		],
		expectedFeedback:
			"정책 뉴스는 모든 종목에 같은 영향을 주지 않습니다.",
	},
	{
		chapterId: 4,
		scenarioNo: "4-1",
		scenarioSlug: "growth-stock-correction",
		title: "성장주 조정장",
		eventPeriod: "상황형",
		summary: "금리 상승과 투자심리 위축으로 성장주가 조정을 받는 상황",
		background:
			"성장주는 금리와 할인율 변화에 민감하게 반응할 수 있습니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["성장주", "조정", "금리 부담", "손절"],
		learningPoints: ["일시 조정과 추세 훼손 구분"],
		aiEvaluationPoints: [
			"손실 자체가 아니라 하락 원인을 분석했는지",
			"추세 훼손 여부를 고려했는지",
		],
		expectedFeedback:
			"손실이 발생했다는 이유만으로 매도하기보다 하락 원인이 일시적인지 구조적인지 확인해야 합니다.",
	},
	{
		chapterId: 4,
		scenarioNo: "4-2",
		scenarioSlug: "earnings-deterioration-holding",
		title: "실적 악화 기업 보유 상황",
		eventPeriod: "상황형",
		summary: "보유 중인 기업의 실적이 악화되고 주가가 하락하는 상황",
		background:
			"실적 악화가 일시적 문제인지 구조적 문제인지 판단해야 하는 상황입니다.",
		difficulty: "어려움",
		estimatedMinutes: 25,
		keywords: ["실적 악화", "재무 악화", "손절", "장기 보유"],
		learningPoints: ["보유·매도 기준 수립", "펀더멘털 변화 판단"],
		aiEvaluationPoints: [
			"실적 악화의 지속 가능성을 고려했는지",
			"기업 펀더멘털 변화를 확인했는지",
		],
		expectedFeedback:
			"단순히 손실이 크다는 이유로 버티는 것은 위험합니다.",
	},
	{
		chapterId: 4,
		scenarioNo: "4-3",
		scenarioSlug: "position-moved-against-expectation",
		title: "예상과 반대로 움직인 포지션",
		eventPeriod: "상황형",
		summary: "사용자가 매수한 뒤 주가가 예상과 반대로 하락하는 상황",
		background:
			"처음 판단이 틀렸을 때 추가매수, 손절, 관망 중 기준을 세워야 합니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["물타기", "손절", "추가매수", "리스크"],
		learningPoints: ["판단 오류 대응", "손절·추가매수 기준"],
		aiEvaluationPoints: [
			"물타기와 분할매수를 구분했는지",
			"하락 원인을 분석한 뒤 대응했는지",
		],
		expectedFeedback:
			"추가매수는 하락 원인을 분석한 뒤에 결정해야 합니다.",
	},
	{
		chapterId: 5,
		scenarioNo: "5-1",
		scenarioSlug: "covid-recovery-rally",
		title: "코로나 이후 반등장",
		eventPeriod: "2020.03 이후",
		summary: "코로나 급락 이후 정책 대응과 유동성 공급으로 시장이 빠르게 반등하는 상황",
		background:
			"중앙은행과 정부의 정책 대응이 시장 회복의 주요 신호로 작동한 상황입니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["정책 대응", "유동성", "반등", "회복장"],
		learningPoints: ["정책 효과 해석", "회복 신호 판단"],
		aiEvaluationPoints: [
			"정책 대응과 시장 심리 변화를 함께 고려했는지",
			"단기 반등과 회복 신호를 구분했는지",
		],
		expectedFeedback:
			"정책 대응과 유동성 공급은 시장 회복의 중요한 신호가 될 수 있습니다.",
	},
	{
		chapterId: 5,
		scenarioNo: "5-2",
		scenarioSlug: "semiconductor-cycle-recovery",
		title: "반도체 업종 회복 사이클",
		eventPeriod: "상황형",
		summary: "반도체 업황 부진 이후 재고 감소와 수요 회복 기대가 나타나는 상황",
		background:
			"반도체 업종은 사이클 산업이므로 재고와 수요 회복 신호를 봐야 합니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["반도체", "업황 회복", "재고", "수요"],
		learningPoints: ["산업 사이클 이해", "업황 회복 신호"],
		aiEvaluationPoints: [
			"단기 주가보다 업황 회복 신호를 고려했는지",
			"수요 전망과 재고 변화를 확인했는지",
		],
		expectedFeedback:
			"업황 회복 신호는 단기 주가보다 산업 데이터와 수요 전망을 함께 확인해야 합니다.",
	},
	{
		chapterId: 5,
		scenarioNo: "5-3",
		scenarioSlug: "policy-support-recovery",
		title: "정책 지원 이후 시장 회복",
		eventPeriod: "상황형",
		summary: "정부 또는 중앙은행의 지원 정책 발표 이후 시장이 회복세를 보이는 상황",
		background:
			"정책 지원은 투자심리 개선으로 이어질 수 있지만 실제 수혜 여부를 구분해야 합니다.",
		difficulty: "보통",
		estimatedMinutes: 20,
		keywords: ["정책 지원", "시장 회복", "수혜 섹터", "투자심리"],
		learningPoints: ["정책 효과와 투자심리", "수혜 대상 구분"],
		aiEvaluationPoints: [
			"정책 효과가 단기 기대인지 실제 산업 개선인지 고려했는지",
			"실제 수혜 대상을 구분했는지",
		],
		expectedFeedback:
			"정책 지원은 회복 신호가 될 수 있지만 실제 수혜 대상과 정책 지속성을 함께 확인해야 합니다.",
	},
	{
		chapterId: 6,
		scenarioNo: "6-1",
		scenarioSlug: "single-stock-concentration-crash",
		title: "한 종목 몰빵 후 급락",
		eventPeriod: "상황형",
		summary: "특정 종목에 과도한 비중을 투자한 뒤 해당 종목이 급락하는 상황",
		background:
			"한 종목 비중이 과도하면 작은 악재에도 전체 자산이 크게 흔들릴 수 있습니다.",
		difficulty: "쉬움",
		estimatedMinutes: 15,
		keywords: ["몰빵", "비중 관리", "분산 투자", "리스크"],
		learningPoints: ["비중 관리", "포트폴리오 리스크"],
		aiEvaluationPoints: [
			"종목 자체보다 포트폴리오 전체 위험을 고려했는지",
			"비중 조절 필요성을 인식했는지",
		],
		expectedFeedback:
			"한 종목 비중이 과도하면 작은 악재에도 전체 자산이 크게 흔들릴 수 있습니다.",
	},
	{
		chapterId: 6,
		scenarioNo: "6-2",
		scenarioSlug: "diversification-vs-concentration",
		title: "분산 투자와 집중 투자 비교",
		eventPeriod: "상황형",
		summary: "같은 시장 상황에서 집중 투자와 분산 투자 포트폴리오의 결과가 달라지는 상황",
		background:
			"집중 투자는 수익률이 클 수 있지만 손실 위험도 커집니다.",
		difficulty: "쉬움",
		estimatedMinutes: 15,
		keywords: ["분산 투자", "집중 투자", "변동성", "포트폴리오"],
		learningPoints: ["분산 효과", "변동성 관리"],
		aiEvaluationPoints: [
			"수익률뿐 아니라 변동성과 리스크를 함께 고려했는지",
			"초보자에게 맞는 비중 관리 기준을 세웠는지",
		],
		expectedFeedback:
			"초보자에게는 분산을 통한 리스크 관리가 중요합니다.",
	},
	{
		chapterId: 6,
		scenarioNo: "6-3",
		scenarioSlug: "greed-prevents-profit-taking",
		title: "수익 중 욕심 때문에 매도하지 못한 상황",
		eventPeriod: "상황형",
		summary: "수익 중인 종목을 보유하고 있지만 더 오를 것이라는 기대 때문에 매도 기준을 세우지 못하는 상황",
		background:
			"수익 중일 때도 기준이 없으면 수익을 잃거나 손실로 전환될 수 있습니다.",
		difficulty: "쉬움",
		estimatedMinutes: 15,
		keywords: ["수익 실현", "욕심", "고점 부담", "분할 매도"],
		learningPoints: ["수익 실현 기준", "탐욕 조절"],
		aiEvaluationPoints: [
			"목표 수익률과 분할 매도 기준을 고려했는지",
			"고점 부담과 리스크를 인식했는지",
		],
		expectedFeedback:
			"수익 중일 때도 매도 기준이 없으면 수익을 잃을 수 있습니다.",
	},
];

const buildSteps = (scenario: ScenarioSeed) => {
	const basePrice = 100000 + scenario.chapterId * 8000;

	return [
		{
			stepNumber: 1,
			title: "상황 발생",
			dateLabel: scenario.eventPeriod,
			marketInfo: {
				indexFlow: "시장 변동성이 확대되고 투자심리가 흔들리는 구간입니다.",
				sectorFlow: "관련 섹터가 뉴스와 이벤트에 민감하게 반응하고 있습니다.",
				volatility: "보통 이상",
				volume: "평균 대비 증가",
			},
			stockInfo: {
				symbol: "005930",
				name: "삼성전자",
				price: basePrice,
				changeRate: -2.1,
				volume: 12500000,
			},
			newsCards: [
				{
					title: scenario.title,
					summary: scenario.summary,
					publishedAt: scenario.eventPeriod,
					source: "Antitude 시나리오 DB",
				},
			],
			eventInfo: scenario.background,
			hint: "뉴스 제목만 보지 말고 가격 변화, 거래량, 리스크 요인을 함께 확인하세요.",
			referenceDecision: "HOLD",
			referenceReason:
				"초기 상황에서는 정보가 충분하지 않으므로 성급한 매수·매도보다 관망하며 추가 정보를 확인하는 판단이 적절합니다.",
		},
		{
			stepNumber: 2,
			title: "시장 반응 확대",
			dateLabel: scenario.eventPeriod,
			marketInfo: {
				indexFlow: "시장 참여자들의 반응이 가격에 반영되기 시작했습니다.",
				sectorFlow: "관련 섹터 내에서도 수혜·피해 종목의 차이가 나타납니다.",
				volatility: "높음",
				volume: "급증",
			},
			stockInfo: {
				symbol: "005930",
				name: "삼성전자",
				price: Math.round(basePrice * 0.96),
				changeRate: -4.0,
				volume: 18200000,
			},
			newsCards: [
				{
					title: "시장 반응이 확대되며 투자자들의 판단이 엇갈리고 있습니다.",
					summary:
						"일부 투자자는 저가 매수를 고려하고, 일부 투자자는 리스크 확대를 우려하고 있습니다.",
					publishedAt: scenario.eventPeriod,
					source: "Antitude 시나리오 DB",
				},
			],
			eventInfo:
				"이 단계에서는 단기 가격 변화보다 변화의 원인과 지속 가능성을 판단해야 합니다.",
			hint: "추격매수, 공포매도, 무리한 물타기 중 어떤 심리가 작동하는지 점검하세요.",
			referenceDecision: "HOLD",
			referenceReason:
				"변동성이 확대된 구간에서는 리스크 관리와 정보 확인이 우선입니다.",
		},
		{
			stepNumber: 3,
			title: "판단 시점",
			dateLabel: scenario.eventPeriod,
			marketInfo: {
				indexFlow: "초기 충격 이후 시장 방향성이 조금씩 드러나는 구간입니다.",
				sectorFlow: "섹터별 차별화가 나타나며 투자 판단 기준이 중요해집니다.",
				volatility: "완화 또는 지속",
				volume: "평균 대비 높음",
			},
			stockInfo: {
				symbol: "005930",
				name: "삼성전자",
				price: Math.round(basePrice * 0.985),
				changeRate: 1.5,
				volume: 14800000,
			},
			newsCards: [
				{
					title: "추가 정보가 나오며 시장은 다음 방향을 탐색하고 있습니다.",
					summary:
						"사용자는 현재까지의 뉴스, 가격 흐름, 리스크를 바탕으로 최종 판단을 내려야 합니다.",
					publishedAt: scenario.eventPeriod,
					source: "Antitude 시나리오 DB",
				},
			],
			eventInfo:
				"이제 사용자는 매수, 매도, 관망 중 하나를 선택하고 자신의 판단 근거를 설명해야 합니다.",
			hint: "판단 이유에는 뉴스, 가격, 거래량, 리스크, 대안 전략 중 최소 2개 이상을 포함해보세요.",
			referenceDecision: "HOLD",
			referenceReason:
				"초보자 관점에서는 명확한 근거 없이 방향성을 확정하기보다 관망 또는 제한적 접근이 적절합니다.",
		},
	];
};

const buildScenarioDocuments = () => {
	return SCENARIOS.map((scenario) => {
		const chapter = CHAPTERS.find((item) => item.chapterId === scenario.chapterId);

		if (!chapter) {
			throw new Error(`Chapter not found for ${scenario.scenarioNo}`);
		}

		return {
			...scenario,
			chapterSlug: chapter.chapterSlug,
			chapterTitle: chapter.chapterTitle,
			chapterDescription: chapter.chapterDescription,
			coreAttitude: chapter.coreAttitude,
			learningGoal: chapter.learningGoal,
			chapterOrder: chapter.chapterId,
			decisionOptions: ["BUY", "SELL", "HOLD"],
			steps: buildSteps(scenario),
			isPublished: true,
		};
	});
};

export const ensureScenarioSeed = async () => {
	const count = await Scenario.countDocuments();

	if (count > 0) {
		return;
	}

	await Scenario.insertMany(buildScenarioDocuments());
};

export const getScenarioChapters = async (userIdInput?: string) => {
	const userId = getUserId(userIdInput);

	await ensureScenarioSeed();

	const scenarios = await Scenario.find({ isPublished: true })
		.sort({ chapterOrder: 1, scenarioNo: 1 })
		.lean();

	const decisions = await ScenarioDecision.find({ userId }).lean();

	const completedScenarioIds = new Set(
		decisions.map((decision) => String(decision.scenarioId)),
	);

	return CHAPTERS.map((chapter) => {
		const chapterScenarios = scenarios.filter(
			(scenario) => scenario.chapterId === chapter.chapterId,
		);

		const completedCount = chapterScenarios.filter((scenario) =>
			completedScenarioIds.has(String(scenario._id)),
		).length;

		return {
			...chapter,
			scenarioCount: chapterScenarios.length,
			completedCount,
			progressRate:
				chapterScenarios.length > 0
					? Math.round((completedCount / chapterScenarios.length) * 100)
					: 0,
			isLocked: false,
		};
	});
};

export const getRecommendedScenarios = async () => {
	await ensureScenarioSeed();

	return Scenario.find({ isPublished: true })
		.sort({ chapterOrder: 1, scenarioNo: 1 })
		.limit(3)
		.select(
			"chapterId chapterTitle scenarioNo scenarioSlug title eventPeriod summary difficulty estimatedMinutes keywords",
		)
		.lean();
};

export const getScenariosByChapter = async (
	chapterIdOrSlug: string,
	userIdInput?: string,
) => {
	const userId = getUserId(userIdInput);

	await ensureScenarioSeed();

	const chapterIdNumber = Number(chapterIdOrSlug);

	const query = Number.isFinite(chapterIdNumber)
		? { chapterId: chapterIdNumber, isPublished: true }
		: { chapterSlug: chapterIdOrSlug, isPublished: true };

	const scenarios = await Scenario.find(query)
		.sort({ scenarioNo: 1 })
		.select(
			"chapterId chapterSlug chapterTitle chapterDescription coreAttitude learningGoal scenarioNo scenarioSlug title eventPeriod summary difficulty estimatedMinutes keywords learningPoints",
		)
		.lean();

	const decisions = await ScenarioDecision.find({ userId }).lean();

	return scenarios.map((scenario) => {
		const scenarioDecisions = decisions.filter(
			(decision) => String(decision.scenarioId) === String(scenario._id),
		);

		const maxStep = Math.max(
			0,
			...scenarioDecisions.map((decision) => decision.stepNumber),
		);

		return {
			...scenario,
			status:
				scenarioDecisions.length === 0
					? "NOT_STARTED"
					: maxStep >= 3
						? "COMPLETED"
						: "IN_PROGRESS",
			completedStepCount: scenarioDecisions.length,
		};
	});
};

export const getScenarioDetail = async (
	scenarioIdOrSlug: string,
	userIdInput?: string,
) => {
	const userId = getUserId(userIdInput);

	await ensureScenarioSeed();

	const query =
		scenarioIdOrSlug.match(/^[0-9a-fA-F]{24}$/)
			? { _id: scenarioIdOrSlug }
			: {
					$or: [
						{ scenarioSlug: scenarioIdOrSlug },
						{ scenarioNo: scenarioIdOrSlug },
					],
				};

	const scenario = await Scenario.findOne({
		...query,
		isPublished: true,
	}).lean();

	if (!scenario) {
		throw createServiceError(404, "시나리오를 찾을 수 없습니다.");
	}

	const decisions = await ScenarioDecision.find({
		userId,
		scenarioId: scenario._id,
	}).sort({ stepNumber: 1 }).lean();

	return {
		scenario,
		decisions,
		progress: {
			completedStepCount: decisions.length,
			totalStepCount: scenario.steps.length,
			isCompleted: decisions.length >= scenario.steps.length,
		},
	};
};

export const submitScenarioDecision = async (params: {
	userId?: string;
	scenarioIdOrSlug: string;
	stepNumber: number;
	action: "BUY" | "SELL" | "HOLD";
	quantity?: number;
	ratio?: number;
	tags?: string[];
	reason?: string;
}) => {
	const userId = getUserId(params.userId);

	const detail = await getScenarioDetail(params.scenarioIdOrSlug, userId);
	const scenario = detail.scenario;

	const step = scenario.steps.find(
		(item: any) => Number(item.stepNumber) === Number(params.stepNumber),
	);

	if (!step) {
		throw createServiceError(404, "해당 단계가 존재하지 않습니다.");
	}

	if (!["BUY", "SELL", "HOLD"].includes(params.action)) {
		throw createServiceError(400, "판단은 BUY, SELL, HOLD 중 하나여야 합니다.");
	}

	const decision = await ScenarioDecision.findOneAndUpdate(
		{
			userId,
			scenarioId: scenario._id,
			stepNumber: params.stepNumber,
		},
		{
			$set: {
				userId,
				scenarioId: scenario._id,
				scenarioNo: scenario.scenarioNo,
				stepNumber: params.stepNumber,
				action: params.action,
				quantity: Number(params.quantity || 0),
				ratio: Number(params.ratio || 0),
				tags: params.tags || [],
				reason: params.reason || "",
				aiFeedback: {
					summary:
						"현재는 판단 저장 단계입니다. 이후 사건-영향 구조와 AI 평가 엔진을 연결하여 상세 피드백을 제공합니다.",
					strengths: [],
					weaknesses: [],
					missedFactors: [],
					alternative: step.referenceReason,
				},
			},
		},
		{
			upsert: true,
			new: true,
			setDefaultsOnInsert: true,
		},
	).lean();

	return {
		decision,
		reference: {
			referenceDecision: step.referenceDecision,
			referenceReason: step.referenceReason,
			expectedFeedback: scenario.expectedFeedback,
			aiEvaluationPoints: scenario.aiEvaluationPoints,
		},
	};
};