import { Button, Card, CardBody, CardFooter } from "@chakra-ui/react";
import { Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react";
import React from "react";

const formatter = new Intl.NumberFormat("ko-KR", {
	style: "currency",
	currency: "KRW",
});

export default function StockCard(props: any) {
	return (
		<Card className="StockCard">
			<CardBody>
				<Stat>
					<StatLabel>{props.symbol}</StatLabel>
					<StatNumber>{formatter.format(props.price)}</StatNumber>
					{props.count > 0 && (
						<StatHelpText>
							{props.count || 1} share{props.count > 1 ? "s" : ""} *{" "}
							{formatter.format(props.price)}
						</StatHelpText>
					)}
				</Stat>
			</CardBody>
			{props.showButtons && (
				<CardFooter>
					<Button size="sm" onClick={props.onBuy}>
						BUY
					</Button>
					<Button size="sm" onClick={props.onBuy}>
						SELL
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
