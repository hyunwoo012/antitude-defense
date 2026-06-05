import mongoose, { Schema, Document, Types } from "mongoose";

export type ScenarioDecisionAction = "BUY" | "SELL" | "HOLD";

export interface ScenarioDecisionDocument extends Document {
	userId: string;
	scenarioId: Types.ObjectId;
	scenarioNo: string;
	stepNumber: number;

	action: ScenarioDecisionAction;
	quantity: number;
	ratio: number;
	tags: string[];
	reason: string;

	aiScore?: {
		signalUtilization?: number;
		directFactorUnderstanding?: number;
		indirectFactorAwareness?: number;
		riskControl?: number;
		historicalAlignment?: number;
		alternativeDecisionQuality?: number;
	};
	aiFeedback?: {
		summary?: string;
		strengths?: string[];
		weaknesses?: string[];
		missedFactors?: string[];
		alternative?: string;
	};

	createdAt: Date;
	updatedAt: Date;
}

const ScenarioDecisionSchema = new Schema<ScenarioDecisionDocument>(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		scenarioId: {
			type: Schema.Types.ObjectId,
			ref: "Scenario",
			required: true,
			index: true,
		},
		scenarioNo: {
			type: String,
			required: true,
			index: true,
		},
		stepNumber: {
			type: Number,
			required: true,
		},

		action: {
			type: String,
			enum: ["BUY", "SELL", "HOLD"],
			required: true,
		},
		quantity: {
			type: Number,
			default: 0,
		},
		ratio: {
			type: Number,
			default: 0,
		},
		tags: {
			type: [String],
			default: [],
		},
		reason: {
			type: String,
			default: "",
		},

		aiScore: {
			signalUtilization: { type: Number, default: null },
			directFactorUnderstanding: { type: Number, default: null },
			indirectFactorAwareness: { type: Number, default: null },
			riskControl: { type: Number, default: null },
			historicalAlignment: { type: Number, default: null },
			alternativeDecisionQuality: { type: Number, default: null },
		},
		aiFeedback: {
			summary: { type: String, default: "" },
			strengths: { type: [String], default: [] },
			weaknesses: { type: [String], default: [] },
			missedFactors: { type: [String], default: [] },
			alternative: { type: String, default: "" },
		},
	},
	{
		timestamps: true,
	},
);

ScenarioDecisionSchema.index(
	{ userId: 1, scenarioId: 1, stepNumber: 1 },
	{ unique: true },
);

export default mongoose.model<ScenarioDecisionDocument>(
	"ScenarioDecision",
	ScenarioDecisionSchema,
);