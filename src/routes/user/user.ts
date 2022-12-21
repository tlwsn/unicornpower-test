import { JSONSchemaType } from "ajv";
import { Router } from "express";
import { validateBody } from "../../utils/middleware";
import { UserService } from "./user.service";

const userRouter = Router();

export interface IUserBody {
    id: string;
    password: string;
}

const userBodySchema: JSONSchemaType<IUserBody> = {
    type: "object",
    properties: {
        id: { type: "string" },
        password: { type: "string" },
    },
    required: ["id", "password"],
};

userRouter.post(
    "/signup",
    validateBody(userBodySchema),
    async (req, res, next) => {
        try {
            const signup = await UserService.signUp(req.body);
            res.json(signup);
        } catch (e: any) {
            next(e);
        }
    }
);

userRouter.post(
    "/signin",
    validateBody(userBodySchema),
    async (req, res, next) => {
        try {
            const signin = await UserService.signIn(req.body);
            res.json(signin);
        } catch (e: any) {
            next(e);
        }
    }
);

userRouter.get("/info", async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const info = await UserService.getInfo(token);
    res.json(info);
});

userRouter.get("/logout", async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1]!;
    const all = req.query.all as string | undefined;
    const logout = await UserService.logout(token, all);
    res.json(logout);
});

export { userRouter };
