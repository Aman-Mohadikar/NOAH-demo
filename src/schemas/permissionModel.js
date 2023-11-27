import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const rolePermissionSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: 'User', required: true },
    roleId: { type: ObjectId, ref: 'Role', required: true },
    permissionId: { type: ObjectId, ref: 'Permission', required: true },
    view_status: { type: Boolean, required: true },
    edit_status: { type: Boolean, required: true },
    delete_status: { type: Boolean, required: true }
}, { timestamps: true })

const permission = mongoose.model('rolePermission', rolePermissionSchema);

export default permission;