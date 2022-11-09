# API

```
GET /api/hello

Input, Headers:

    * Authorization: string. Set the token you got on `/oauth2/google` or on `refresh_token` as the Authorization header.

Response text: `Hello ${user.public_id}!`
    
    ex: Hello amazing.email@gmail.com!

Use this API to test that Authorization is working as intended
```

```
GET /refresh_token

Input, Headers:

    * Authorization: string. Set the refresh_token you got on login as the Authorization header.

Response body json:
    
    * token: string. Short duration token for accessing the APIs that require identification.
    Put this token as is in the `Authorization` header of subsequent requests.
    * refresh_token: string. Long duration token used as a means of renewing your identification.
    If `token` expires, you can receive a new one by sending this `refresh_token` to the `refresh_token` API.

    ex: { token: d4800779-b9b1-4e4d-bb00-d2579f3f9cdb, refresh_token: fd38d2f6-6cad-4495-8280-a5b033e27abb }

The idea is that if you have no token (or it has been rejected on an API request), you use this API.
If you have no refresh_token, you login again via `/oauth2/google`.

TODO document errors and decided how to communicate errors.
```

```
GET /oauth2/google

Response: Redirection to google auth form

This is the API that acts both as a "login" and a "register".
Redirects the user to an authorization form `https://accounts.google.com/o/oauth2/v2/auth`.
Completing the form will redirect the user, once again, to `/oauth2/google/callback`.
Finally, the client will be redirected to '/?token=#####&refresh_token=#####'. Check
`/oauth2/google/callback` for more information.

Because of how redirections work, the client is expected to "go" to
this location rather than make a GET request.
```

```
GET /oauth2/google/callback

Input, URL Parameters:
    * code: number. Code set automatically by google on auth form completion.

Response:
    
    Redirection to '/' with 2 URL parameters:
    * token: string. Short duration token for accessing the APIs that require identification.
    Put this token as is in the `Authorization` header of subsequent requests.
    * refresh_token: string. Long duration token used as a means of renewing your identification.
    If `token` expires, you can receive a new one by sending this `refresh_token` to the `refresh_token` API.

    ex: https://cutepon.net/?token=d4800779-b9b1-4e4d-bb00-d2579f3f9cdb&refresh_token=fd38d2f6-6cad-4495-8280-a5b033e27abb

The tokens returned will be subsequently used for accessing any API that requires authorization.
The client will never manually access this API.
When the client tries to login via oauth at `/oauth2/google` and completes the form,
google will redirect the client here, with the required data already set.

TODO: This is not secure but for now its what it is.
```