import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: "ACTIVE" },
    createdBy: {type : Number},
    updatedBy: {type : Number}
}, { timestamps: true })

const user = mongoose.model('User', userSchema);

export default user;