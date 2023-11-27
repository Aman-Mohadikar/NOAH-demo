import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    organizationName: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, default: "ACTIVE", enum: ['ACTIVE', 'INACTIVE'] }
}, { timestamps: true })

const organization = mongoose.model('Organization', organizationSchema);

export default organization;