import React, { useEffect, useRef } from "react";
import {
	CandlestickData,
	createChart,
	HistogramData,
	IChartApi,
} from "lightweight-charts";
import { Box, Flex, Text } from "@chakra-ui/react";

export type ChartPoint = {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
};

type Props = {
	data: ChartPoint[];
	height?: number;
};

const won = new Intl.NumberFormat("ko-KR", {
	style: "currency",
	currency: "KRW",
	maximumFractionDigits: 0,
});

const formatNumber = new Intl.NumberFormat("ko-KR");

function formatDateTime(timestampSeconds: number) {
	const date = new Date(timestampSeconds * 1000);

	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const mi = String(date.getMinutes()).padStart(2, "0");

	return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function InteractiveStockChart({ data, height = 390 }: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null);
	const chartRef = useRef<IChartApi | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		containerRef.current.innerHTML = "";

		if (data.length === 0) return;

		const chart = createChart(containerRef.current, {
			width: containerRef.current.clientWidth,
			height,
			layout: {
				background: { color: "#ffffff" },
				textColor: "#1A202C",
			},
			grid: {
				vertLines: { color: "#edf2f7" },
				horzLines: { color: "#edf2f7" },
			},
			crosshair: {
				mode: 1,
			},
			rightPriceScale: {
				borderColor: "#e2e8f0",
			},
			timeScale: {
				borderColor: "#e2e8f0",
				timeVisible: true,
				secondsVisible: false,
			},
		});

		chartRef.current = chart;

		const candleSeries = chart.addCandlestickSeries({
			upColor: "#e53e3e",
			downColor: "#3182ce",
			borderUpColor: "#e53e3e",
			borderDownColor: "#3182ce",
			wickUpColor: "#e53e3e",
			wickDownColor: "#3182ce",
		});

		const volumeSeries = chart.addHistogramSeries({
			priceFormat: {
				type: "volume",
			},
			priceScaleId: "",
		});

		volumeSeries.priceScale().applyOptions({
			scaleMargins: {
				top: 0.82,
				bottom: 0,
			},
		});

		const candleData: CandlestickData[] = data.map((item) => ({
			time: item.time as any,
			open: item.open,
			high: item.high,
			low: item.low,
			close: item.close,
		}));

		const volumeData: HistogramData[] = data.map((item) => ({
			time: item.time as any,
			value: item.volume || 0,
			color: item.close >= item.open ? "#e53e3e" : "#3182ce",
		}));

		candleSeries.setData(candleData);
		volumeSeries.setData(volumeData);
		chart.timeScale().fitContent();

		const tooltip = document.createElement("div");
		tooltip.style.position = "absolute";
		tooltip.style.display = "none";
		tooltip.style.pointerEvents = "none";
		tooltip.style.zIndex = "20";
		tooltip.style.padding = "10px 12px";
		tooltip.style.border = "1px solid #e2e8f0";
		tooltip.style.borderRadius = "8px";
		tooltip.style.background = "rgba(255, 255, 255, 0.96)";
		tooltip.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.12)";
		tooltip.style.fontSize = "12px";
		tooltip.style.lineHeight = "1.5";

		tooltipRef.current = tooltip;
		containerRef.current.appendChild(tooltip);

		chart.subscribeCrosshairMove((param: any) => {
			if (!tooltipRef.current || !containerRef.current) return;

			if (
				!param.point ||
				param.point.x < 0 ||
				param.point.y < 0 ||
				param.point.x > containerRef.current.clientWidth ||
				param.point.y > height
			) {
				tooltipRef.current.style.display = "none";
				return;
			}

			const seriesData = param.seriesData.get(candleSeries) as
				| CandlestickData
				| undefined;

			if (!seriesData) {
				tooltipRef.current.style.display = "none";
				return;
			}

			const currentPoint = data.find(
				(item) => Number(item.time) === Number(seriesData.time),
			);

			const volume = currentPoint?.volume ?? 0;
			const isUp = seriesData.close >= seriesData.open;
			const color = isUp ? "#e53e3e" : "#3182ce";

			tooltipRef.current.innerHTML = `
				<div style="font-weight:700; margin-bottom:4px;">
					${formatDateTime(Number(seriesData.time))}
				</div>
				<div>시가: <b>${won.format(seriesData.open)}</b></div>
				<div>고가: <b style="color:#e53e3e;">${won.format(seriesData.high)}</b></div>
				<div>저가: <b style="color:#3182ce;">${won.format(seriesData.low)}</b></div>
				<div>종가: <b style="color:${color};">${won.format(seriesData.close)}</b></div>
				<div>거래량: <b>${formatNumber.format(volume)}</b></div>
			`;

			const tooltipWidth = 170;
			const tooltipHeight = 140;

			let left = param.point.x + 16;
			let top = param.point.y + 16;

			if (left + tooltipWidth > containerRef.current.clientWidth) {
				left = param.point.x - tooltipWidth - 16;
			}

			if (top + tooltipHeight > height) {
				top = param.point.y - tooltipHeight - 16;
			}

			tooltipRef.current.style.left = `${left}px`;
			tooltipRef.current.style.top = `${top}px`;
			tooltipRef.current.style.display = "block";
		});

		const resizeObserver = new ResizeObserver(() => {
			if (containerRef.current) {
				chart.applyOptions({
					width: containerRef.current.clientWidth,
				});
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
			chart.remove();
		};
	}, [data, height]);

	if (data.length === 0) {
		return (
			<Flex
				h={`${height}px`}
				align="center"
				justify="center"
				bg="gray.50"
				borderRadius="lg"
			>
				<Text color="gray.500">차트 데이터를 불러오면 이 영역에 표시됩니다.</Text>
			</Flex>
		);
	}

	return (
		<Box
			ref={containerRef}
			position="relative"
			width="100%"
			height={`${height}px`}
			bg="white"
		/>
	);
}