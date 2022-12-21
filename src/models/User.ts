import mongoose from "mongoose";

export interface IUser {
    id: string;
    password: string;
    id_type: "phone" | "email";
}

const schema = new mongoose.Schema<IUser>({
    id: { type: "string", required: true, unique: true },
    password: { type: "string", required: true },
    id_type: { type: "string", enum: ["phone", "email"] },
});

const UserModel = mongoose.model("User", schema);

export { UserModel };
