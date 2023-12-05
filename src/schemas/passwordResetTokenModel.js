import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const passwordResetTokenSchema = new mongoose.Schema({
    user_id: { type: ObjectId, ref: "User", required : true },
    token: { type: String, unique: true, required: true},
    is_used: {type : Boolean, default : false},
    expiration_time: { type: Date, required: true },
}, { timestamps: true })

const passwordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default passwordResetToken;