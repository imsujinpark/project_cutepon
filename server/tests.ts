import { Tester } from "../lib/tester";
import jsonwebtoken from "jsonwebtoken";
import jwt from "jwt-simple";

new Tester("jwt tests", null, null, (t) => {
    
    t.test("test jsonwebtoken", () => {
        const secret = "Im not that smart";
        const data = {msg:"My secret message"};
        const json_web_token = jsonwebtoken.sign(data, secret);
        const decoded = jsonwebtoken.verify(json_web_token, secret);
        t.expect(decoded.msg === data.msg);
    });

    t.test("test jwt-simple", () => {
        const secret = "Im not that smart";
        const data = {msg:"My secret message"};
        const json_web_token = jwt.encode(data, secret);
        const decoded = jwt.decode(json_web_token, secret);
        t.expect(decoded.msg === data.msg);
    });
    
}).run();