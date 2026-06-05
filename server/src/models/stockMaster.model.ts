import mongoose, { Schema, Document } from "mongoose";

export interface StockMasterDocument extends Document {
	symbol: string;
	name: string;
	market: string;
	assetType: string;
	tradable: boolean;
	sector?: string;
	isActive: boolean;
	source: string;
	updatedAt: Date;
}

const StockMasterSchema = new Schema<StockMasterDocument>(
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
			index: true,
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
			default: false,
		},
		sector: {
			type: String,
			default: "",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		source: {
			type: String,
			default: "KIS",
		},
	},
	{
		timestamps: true,
	},
);

StockMasterSchema.index({ symbol: 1 });
StockMasterSchema.index({ name: "text", symbol: "text" });

export default mongoose.model<StockMasterDocument>(
	"StockMaster",
	StockMasterSchema,
);