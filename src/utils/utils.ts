import crypto from "crypto";
import mongoose from "mongoose";
import { TokenModel } from "../models/Token";

export function getHash(str: string): string {
    return crypto.createHash("sha256").update(str).digest("hex");
}

export async function generateToken(_id: mongoose.Types.ObjectId) {
    const now = Date.now();
    const hash = getHash(`${now}.${process.env.TOKEN_KEY}.${_id}`);
    const token = new TokenModel({
        token: hash,
        generationTime: now,
        expirationTime: now + 600 * 1000,
        user: _id,
    });
    await token.save();
    return token;
}
