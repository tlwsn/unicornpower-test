import Ajv, { JSONSchemaType } from "ajv";
import { Request, Response, NextFunction } from "express";
import { TokenModel } from "../models/Token";
import { HttpException } from "./HttpException";
import { MongoServerError } from "mongodb";

export function validateBody<T>(schema: JSONSchemaType<T>) {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    return (req: Request<{}, {}, T>, res: Response, next: NextFunction) => {
        if (!validate(req.body))
            return res
                .status(400)
                .json({ success: false, error: "Incorrect params" });
        req.body = req.body as T;
        return next();
    };
}

export async function checkToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
        if (req.path == "/user/signin" || req.path == "/user/signup")
            return next();
        return res
            .status(401)
            .json({ success: false, error: "Token not provided" });
    }
    const token = tokenHeader.split(" ")[1];
    if (!token)
        return res
            .status(401)
            .json({ success: false, error: "Token not provided" });

    const findToken = await TokenModel.findOne({ token });
    if (!findToken)
        return res
            .status(401)
            .json({ success: false, error: "Token not valid" });

    const now = Date.now();
    if (findToken.expirationTime <= now)
        return res.status(401).json({ success: false, error: "Token expired" });

    if (req.path != "/user/logout")
        await TokenModel.updateOne(
            { token },
            { $set: { expirationTime: now + 600 * 1000 } }
        );
    next();
}

export function handleError(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof HttpException)
        return res
            .status(err.statusCode)
            .json({ success: false, error: err.message });
    if (err instanceof MongoServerError)
        if (err.code == 11000)
            return res.status(409).json({
                success: false,
                error: "User with same id already registered",
            });
    return res.status(500).json({ success: false, error: "Server error" });
}
