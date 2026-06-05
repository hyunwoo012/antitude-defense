import mongoose, { Schema, Document } from "mongoose";

export type TradeSide = "BUY" | "SELL";
export type TradeOrderType = "MARKET" | "LIMIT";
export type TradeOrderStatus = "PENDING" | "FILLED" | "CANCELED" | "REJECTED";

export interface TradeOrderDocument extends Document {
	userId: string;
	symbol: string;
	name: string;
	market: string;

	side: TradeSide;
	orderType: TradeOrderType;
	status: TradeOrderStatus;

	quantity: number;
	filledQuantity: number;

	orderPrice: number;
	limitPrice?: number | null;
	executedPrice?: number | null;

	reservedAmount: number;
	reservedQuantity: number;

	realizedProfit: number;
	rejectReason?: string;

	createdAt: Date;
	updatedAt: Date;
	executedAt?: Date | null;
	canceledAt?: Date | null;
}

const TradeOrderSchema = new Schema<TradeOrderDocument>(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		symbol: {
			type: String,
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		market: {
			type: String,
			default: "KRX",
		},

		side: {
			type: String,
			enum: ["BUY", "SELL"],
			required: true,
		},
		orderType: {
			type: String,
			enum: ["MARKET", "LIMIT"],
			required: true,
		},
		status: {
			type: String,
			enum: ["PENDING", "FILLED", "CANCELED", "REJECTED"],
			required: true,
			default: "PENDING",
			index: true,
		},

		quantity: {
			type: Number,
			required: true,
		},
		filledQuantity: {
			type: Number,
			default: 0,
		},

		orderPrice: {
			type: Number,
			default: 0,
		},
		limitPrice: {
			type: Number,
			default: null,
		},
		executedPrice: {
			type: Number,
			default: null,
		},

		reservedAmount: {
			type: Number,
			default: 0,
		},
		reservedQuantity: {
			type: Number,
			default: 0,
		},

		realizedProfit: {
			type: Number,
			default: 0,
		},
		rejectReason: {
			type: String,
			default: "",
		},

		executedAt: {
			type: Date,
			default: null,
		},
		canceledAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

TradeOrderSchema.index({ userId: 1, createdAt: -1 });
TradeOrderSchema.index({ userId: 1, status: 1 });
TradeOrderSchema.index({ symbol: 1, status: 1 });

export default mongoose.model<TradeOrderDocument>(
	"TradeOrder",
	TradeOrderSchema,
);