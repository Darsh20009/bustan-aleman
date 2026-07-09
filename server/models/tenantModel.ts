import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  type: 'halaqa' | 'association' | 'academy' | 'independent_sheikh';
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
  };
  city?: string;
  country?: string;
  ownerId: mongoose.Types.ObjectId;
  settings?: {
    allowSelfRegistration?: boolean;
    requireParentApproval?: boolean;
    maxStudents?: number;
    subscriptionPlan?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9\-]+$/, 'الـ slug يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط']
  },
  type: { 
    type: String, 
    enum: ['halaqa', 'association', 'academy', 'independent_sheikh'],
    default: 'halaqa'
  },
  logo: String,
  colors: {
    primary:    { type: String, default: '#2E7D56' },
    secondary:  { type: String, default: '#D4AF37' },
    background: { type: String, default: '#F6E9C9' },
  },
  city:    String,
  country: { type: String, default: 'SA' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  settings: {
    allowSelfRegistration: { type: Boolean, default: true },
    requireParentApproval:  { type: Boolean, default: false },
    maxStudents:            { type: Number,  default: 200 },
    subscriptionPlan:       { type: String,  default: 'free' },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

tenantSchema.index({ slug: 1 });
tenantSchema.index({ ownerId: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
