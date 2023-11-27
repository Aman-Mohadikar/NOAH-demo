import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const user_roleSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: "User", required: true},
    roleId: { type: ObjectId, ref: "Role", required: true },
})

const userRole = mongoose.model('user-role', user_roleSchema);

export default userRole;