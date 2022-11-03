import { Tester } from "../lib/tester";
import jsonwebtoken from "jsonwebtoken";
import jwt from "jwt-simple";
import * as jose from 'jose';

new Tester("jwt tests", null, null, (t) => {
    
    // It seems that this not working is a bun issue as it does work in node
    // https://github.com/oven-sh/bun/issues/1454
    t.test("test jsonwebtoken", async () => {
        const secret = "Im not that smart";
        const data = {msg:"My secret message"};
        const json_web_token = jsonwebtoken.sign(data, secret);
        const decoded = jsonwebtoken.verify(json_web_token, secret);
        // TODO whats wrong with decoded being returned as a string instead of a JwtPayload
        // when the return type is of string | JwtPayload... Like how can it be both lol
        t.expect(decoded.msg === data.msg);
    });

    // It seems that this not working is a bun issue as it does work in node
    // https://github.com/oven-sh/bun/issues/1454
    t.test("test jwt-simple", async () => {
        const secret = "Im not that smart";
        const data = {msg:"My secret message"};
        const json_web_token = jwt.encode(data, secret);
        const decoded = jwt.decode(json_web_token, secret);
        t.expect(decoded.msg === data.msg);
    });

    t.test("test jose sign", async () => {
        const secret = "Im not that smart";
        const data = {msg:"My secret message"};
        const json_web_token = await new jose.SignJWT(data)
            .setProtectedHeader({ alg: 'ES256' })
            .setExpirationTime('5h')
            .sign(Buffer.from(secret));
        const decoded = await jose.jwtVerify(json_web_token, Buffer.from(secret));
        t.expect(decoded.payload.msg === data.msg);
    });

    t.test("test jose encrypt", async () => {
        const secret = "this-key-must-be-of-256-bits-aaa";
        const data = {msg:"My secret message"};
        const json_web_token = await new jose.EncryptJWT(data)
            .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
            .setExpirationTime('5h')
            .encrypt(Buffer.from(secret));
        const decoded = await jose.jwtDecrypt(json_web_token, Buffer.from(secret));
        t.expect(decoded.payload.msg === data.msg);
    });

}).run();