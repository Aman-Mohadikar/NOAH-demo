import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const roleSchema = new mongoose.Schema({
    roleName: { type: String, required: true, trim: true, unique: true },
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    status: { type: String, default: "ACTIVE", enum: ['ACTIVE', 'INACTIVE'] },
    id: {type: Number}
}, { timestamps: true })

const role = mongoose.model('Role', roleSchema);

export default role;