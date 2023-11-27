import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const userDetailSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: Number, required: true, trim: true },
    status: { type: String, default: "ACTIVE" },
    createdBy: { type: ObjectId, ref: "User", required: true },
    updatedBy: { type: ObjectId, ref: "User", required: true },
}, { timestamps: true })

const userDetail = mongoose.model('userDetail', userDetailSchema);

export default userDetail;