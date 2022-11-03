import jwt from "jsonwebtoken";
import { Tester } from "../lib/tester";

new Tester("jwt tests", null, null, (t) => {
        
    t.test("test jwt token sign and verify", () => {
        const secret = "Im not that smart!";
        const message = "My secret message~";
        const json_web_token = jwt.sign({message}, secret);
        const decoded_message = jwt.verify(json_web_token, secret);
        t.expect(decoded_message === message);
    })

}).run();