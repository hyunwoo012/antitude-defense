import mongoose, { Schema, Document } from "mongoose";

export interface HoldingDocument extends Document {
	userId: string;
	symbol: string;
	name: string;
	market: string;
	quantity: number;
	reservedQuantity: number;
	avgPrice: number;
	totalBuyAmount: number;
	createdAt: Date;
	updatedAt: Date;
}

const HoldingSchema = new Schema<HoldingDocument>(
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
		quantity: {
			type: Number,
			required: true,
			default: 0,
		},
		reservedQuantity: {
			type: Number,
			required: true,
			default: 0,
		},
		avgPrice: {
			type: Number,
			required: true,
			default: 0,
		},
		totalBuyAmount: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

HoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default mongoose.model<HoldingDocument>("Holding", HoldingSchema);