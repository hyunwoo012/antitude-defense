import mongoose, { Schema, Document } from "mongoose";

export interface TradingAccountDocument extends Document {
	userId: string;
	cash: number;
	reservedCash: number;
	initialCash: number;
	currency: string;
	createdAt: Date;
	updatedAt: Date;
}

const TradingAccountSchema = new Schema<TradingAccountDocument>(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		cash: {
			type: Number,
			required: true,
			default: 10_000_000,
		},
		reservedCash: {
			type: Number,
			required: true,
			default: 0,
		},
		initialCash: {
			type: Number,
			required: true,
			default: 10_000_000,
		},
		currency: {
			type: String,
			default: "KRW",
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model<TradingAccountDocument>(
	"TradingAccount",
	TradingAccountSchema,
);