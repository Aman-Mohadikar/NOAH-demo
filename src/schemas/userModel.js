import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    roleId: { type: Number,  required: true },
    phone: { type: Number, required: true, trim: true },
    designationId: {type: ObjectId, ref: 'Designation', required: true},
    status: { type: String, default: "ACTIVE" },
    createdBy: {type : Number},
    updatedBy: {type : Number}
}, { timestamps: true })

const user = mongoose.model('User', userSchema);

export default user;