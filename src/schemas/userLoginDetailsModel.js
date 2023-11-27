import mongoose from "mongoose";

const userLoginDetailsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },
    last_login: { type: Date, default: null },
    last_login_ip: String,
    last_wrong_login_attempt: { type: Date, default: null },
    last_wrong_login_attempt_ip: String,
    wrong_login_count: { type: Number, default: 0, },
});

const userLoginDetails = mongoose.model('UserLoginDetails', userLoginDetailsSchema);

export default userLoginDetails;
