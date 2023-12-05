import mongoose from "mongoose";

const designationSchema = new mongoose.Schema({
    designationName: { type: String, required: true, unique: true, trim: true },
    status: { type: String, default: "ACTIVE", enum: ['ACTIVE', 'INACTIVE'] }
}, { timestamps: true })

const designation = mongoose.model('Designation', designationSchema);

export default designation;