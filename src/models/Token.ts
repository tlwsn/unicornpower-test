import mongoose from "mongoose";

const schema = new mongoose.Schema({
    token: { type: "string", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expirationTime: { type: "number", required: true },
    generationTime: { type: "number", required: true },
});

const TokenModel = mongoose.model("Token", schema);

export { TokenModel };
