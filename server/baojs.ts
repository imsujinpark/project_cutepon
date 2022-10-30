import Bao from "baojs";

const app = new Bao();

function getUser(id: string): Promise<{ [key: string]: any; }> {
    throw "NotImplemented";
}

function getPost(id: string): Promise<{ [key: string]: any; }> {
    throw "NotImplemented";
}

function throwExpression(msg: string): never {
    throw new Error(msg);
}

// Middleware is split into middleware that runs before the routes, and middleware that runs after them. This helps to contribute to the performance of Bao.js.

// Runs before the routes
app.before((ctx) => {
    const user = getUser(ctx.headers.get("Authorization") ?? throwExpression("Not Authorization found!"));

    // The `.forceSend()` method tells Bao to not pass the Context object to anything else but instead
    // send it straight to the user. This is useful in cases like this where we don't want unauthenticated
    // users to be able to access our routes and so we just reject their request before it can make it to the route handler.

    if (user === null) return ctx.sendEmpty({ status: 403 }).forceSend();
    ctx.extra["auth"] = user;
    return ctx;
});

app.get("/hello", (ctx) => {
    return ctx.sendText(`Hello ${ctx.extra.user.displayName}!`);
});

// Runs after the routes
app.after((ctx) => {
    ctx?.res?.headers.append("version", "1.2.3");
    return ctx;
});

app.get("/", (ctx) => {
    return ctx.sendText("Hello World!");
});

app.post("/pretty", async (ctx) => {
    const json = await ctx.req.json();
    return ctx.sendPrettyJson(json);
});

app.get("/user/:user", async (ctx) => {
    const user = await getUser(ctx.params.user);
    return ctx.sendJson(user);
});

app.get("/user/:user/:post/data", async (ctx) => {
    const post = await getPost(ctx.params.post);
    return ctx.sendJson({ post: post, byUser: ctx.params.user });
});

// Wildcards are different to named parameters as wildcards must be at the end of paths as they will catch everything.
// The following would be produced from the example below:
// 
//     GET /posts/123 => /123
//     GET /posts/123/abc => /123/abc

app.get("/posts/*post", (ctx) => {
    return ctx.sendText(ctx.params.post);
});

// A perpetually broken POST route
app.post("/broken", (ctx) => {
    throw "An intentional error has occurred in POST /broken";
    return ctx.sendText("I will never run...");
});

function logErrorToLoggingService(error: Error) {
    throw "NotImplemented";
}

// Custom error handler
app.errorHandler = (error: Error) => {
    logErrorToLoggingService(error);
    return new Response("Oh no! An error has occurred...");
};

// Custom 404 not found handler
app.notFoundHandler = () => {
    return new Response("Route not found...");
};

app.listen();