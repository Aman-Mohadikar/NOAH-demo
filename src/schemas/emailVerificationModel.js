import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const emailVerificationSchema = new mongoose.Schema({
    token: { type: String, unique: true},
    userId: { type: ObjectId, ref: "User", required: true },
    email_verification_status: { type: String, default: "UNVERIFIED", enum: ['VERIFIED', 'UNVERIFIED'] }
}, { timestamps: true })

const emailVerification = mongoose.model('email-verification', emailVerificationSchema);

export default emailVerification;