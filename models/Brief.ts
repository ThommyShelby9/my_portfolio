import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const briefSchema = new Schema(
  {
    projectType: { type: String, required: true, enum: ['new', 'revamp', 'audit', 'spot', 'unsure'] },
    pitch: { type: String, required: true, maxlength: 500 },

    currentState: {
      type: String,
      required: true,
      enum: ['idea', 'design', 'inProgressBlocked', 'mvpInProd', 'existingRevamp', 'auditOnly'],
    },
    teamSize: { type: String, required: true, enum: ['solo', '2-5', '6-15', '15+'] },
    hasTechTeam: { type: Boolean, default: false },
    hasDesigner: { type: Boolean, default: false },
    hasProductOwner: { type: Boolean, default: false },
    notes: { type: String, default: null },

    deadline: { type: String, required: true, enum: ['<1m', '1-3m', '3-6m', 'flexible'] },
    budget: { type: String, required: true, enum: ['<5k', '5-15k', '15-40k', '40-100k', '100k+', 'undefined'] },

    firstName: { type: String, required: true, maxlength: 80 },
    lastName: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 200 },
    company: { type: String, default: null },
    website: { type: String, default: null },
    source: { type: String, default: null },
    prefersCall: { type: Boolean, default: false },

    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    locale: { type: String, default: 'fr', enum: ['fr', 'en'] },
    turnstileVerified: { type: Boolean, default: false },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

briefSchema.index({ createdAt: -1 })
briefSchema.index({ email: 1, createdAt: -1 })

export type BriefDoc = InferSchemaType<typeof briefSchema>

export const Brief = mongoose.models.Brief || mongoose.model('Brief', briefSchema)
