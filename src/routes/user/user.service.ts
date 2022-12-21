import { IUserBody } from "./user";
import { IUser, UserModel } from "../../models/User";
import { generateToken, getHash } from "../../utils/utils";
import { TokenModel } from "../../models/Token";
import { HttpException } from "../../utils/HttpException";

export class UserService {
    static async signUp(body: IUserBody) {
        const isEmail =
            /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
        const isPhone = /\+\d+/;
        let id_type: string;

        if (isEmail.exec(body.id)) id_type = "email";
        else if (isPhone.exec(body.id)) id_type = "phone";
        else throw new HttpException(400, "Invalid id");

        const password = getHash(body.password);

        const user = new UserModel({ id: body.id, id_type, password });
        await user.save();

        const token = await generateToken(user._id);

        return { success: true, token: token.token };
    }

    static async signIn(body: IUserBody) {
        const user = await UserModel.findOne({ id: body.id });
        if (!user) throw new HttpException(404, "User not found");

        const password = getHash(body.password);
        if (password != user.password)
            throw new HttpException(401, "Invalid password");

        const token = await generateToken(user._id);

        return { success: true, token: token.token };
    }

    static async getInfo(token: string) {
        const tokenDocument = await TokenModel.findOne({ token }).populate<{
            user: IUser;
        }>("user");
        return {
            id: tokenDocument?.user.id,
            id_type: tokenDocument?.user.id_type,
        };
    }

    static async logout(token: string, all?: string) {
        const tokenDocument = await TokenModel.findOne({ token });
        if (all) await TokenModel.deleteMany({ user: tokenDocument?.user });
        else await TokenModel.deleteOne({ token });
        return { success: true };
    }
}
