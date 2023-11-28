import mongoose from "mongoose";


const userInvitationSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    token: { type: String },
    expiration_time: { type: Date },
    is_used: {type : Boolean, default : false}
}, { timestamps: true })

const userInvitation = mongoose.model('user-invitation', userInvitationSchema);

export default userInvitation;