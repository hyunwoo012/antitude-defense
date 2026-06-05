import mongoose, { Schema, Document } from "mongoose";

export interface StockDetailCacheDocument extends Document {
	symbol: string;
	name: string;
	market: string;
	assetType: string;
	tradable: boolean;

	price: number;
	changePrice: number;
	changeRate: number;
	open: number;
	high: number;
	low: number;
	volume: number;

	marketCap?: number | null;
	per?: number | null;
	pbr?: number | null;
	eps?: number | null;
	bps?: number | null;
	roe?: number | null;
	revenue?: number | null;
	operatingProfit?: number | null;
	netIncome?: number | null;

	summary: string;
	source: string;
	fetchedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const StockDetailCacheSchema = new Schema<StockDetailCacheDocument>(
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
			default: "KRX",
		},
		assetType: {
			type: String,
			default: "STOCK",
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

		marketCap: {
			type: Number,
			default: null,
		},
		per: {
			type: Number,
			default: null,
		},
		pbr: {
			type: Number,
			default: null,
		},
		eps: {
			type: Number,
			default: null,
		},
		bps: {
			type: Number,
			default: null,
		},
		roe: {
			type: Number,
			default: null,
		},
		revenue: {
			type: Number,
			default: null,
		},
		operatingProfit: {
			type: Number,
			default: null,
		},
		netIncome: {
			type: Number,
			default: null,
		},

		summary: {
			type: String,
			default: "",
		},
		source: {
			type: String,
			default: "KIS",
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

export default mongoose.model<StockDetailCacheDocument>(
	"StockDetailCache",
	StockDetailCacheSchema,
);