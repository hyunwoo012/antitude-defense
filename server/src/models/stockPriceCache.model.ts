import mongoose, { Schema, Document } from "mongoose";

export interface StockPriceCacheDocument extends Document {
	symbol: string;
	name: string;
	market?: string;
	assetType?: string;
	tradable: boolean;
	price: number;
	changePrice: number;
	changeRate: number;
	open: number;
	high: number;
	low: number;
	volume: number;
	fetchedAt: Date;
}

const StockPriceCacheSchema = new Schema<StockPriceCacheDocument>(
	{
		symbol: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		market: {
			type: String,
			default: "UNKNOWN",
		},
		assetType: {
			type: String,
			default: "UNKNOWN",
		},
		tradable: {
			type: Boolean,
			default: true,
		},
		price: {
			type: Number,
			default: 0,
		},
		changePrice: {
			type: Number,
			default: 0,
		},
		changeRate: {
			type: Number,
			default: 0,
		},
		open: {
			type: Number,
			default: 0,
		},
		high: {
			type: Number,
			default: 0,
		},
		low: {
			type: Number,
			default: 0,
		},
		volume: {
			type: Number,
			default: 0,
		},
		fetchedAt: {
			type: Date,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	},
);

StockPriceCacheSchema.index({ symbol: 1, fetchedAt: -1 });

export default mongoose.model<StockPriceCacheDocument>(
	"StockPriceCache",
	StockPriceCacheSchema,
);