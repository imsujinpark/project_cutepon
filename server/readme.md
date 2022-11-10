# API

## Error handling

Possible errors that the server might send.

```ts
enum Errors {
    AuthorizationMissing,
    AuthorizationExpired,
    AuthorizationInvalid,
    RegistrationInvalidEmail,
    SendCouponTargetUnknown,
    SendCouponTargetMissing,
    Internal
};
```

The errors sent will be of the following form:

```ts
{
    error: number,
    message: string
}
```

You can use the `error: number` to branch your logic depending on the error as it will map 1:1 to the `enum Errors` defined above.

In cases that an unexpected error happens you will receive an `Errors.Internal`.

## Authorization

All routes starting with `/api/*` will have the `authorization` header check for a `token`.  
Those will reply with any of the following errors in case something is wrong with the authorization:

* `AuthorizationMissing`
* `AuthorizationInvalid`
* `AuthorizationExpired`


## Routes

### GET /api/hello

**Response**: Plain text string `Hello ${user.public_id}!`
    
    ex: Hello amazing.email@gmail.com!

Use this API to test that `Authorization` is working as intended.

### POST /api/send

**Request**:

```ts
body: json string = {

    target_user: string, /** The unique_id of the coupon's target user. */
    expiration_date: number?, /** The timetamp where the coupon expires. */
                              /** If null, default to 30 days. */
                              /** example: new Date("July 4 2034 12:30").getTime() */
    title: string?, /** The title of the coupon. If null, will default to "Coupon". */
    description: string?, /** The description of the coupon. If null, will default to an empty string "". */
}
```

**Response**:
   
```ts
body: json string = {
    id: number, /** Coupon identifier */
    title: string, /** The coupon title */
    description: string, /** The coupon description */
    created_date: number, /** The exact date the coupon was sent */
    expiration_date: number, /** The date the coupon expires */
    origin_user: string, /** The internal_id of the user who sent the coupon */
    target_user: string, /** The internal_id of the user who received the coupon */
    status: int,  /** The status of the coupon. Maps directly to the `enum CouponStatus` */
    finish_date: number | null /** The date a coupon was finished, (expired, used, or removed) */
}
```

**Possible errors**:

* `SendCouponTargetMissing`: When the target_user is missing.
* `SendCouponTargetUnknown`: When the target_user is not a known user in our database.

Creates a new `coupon` and sends it to the `target_user`.

### GET /api/available

**Response**:
   
```ts
body: json string = {

    /** A list of Coupons with status == Active */
    coupons: Coupon[] = [

        {
            id: number, /** Coupon identifier */
            title: string, /** The coupon title */
            description: string, /** The coupon description */
            created_date: number, /** The exact date the coupon was sent */
            expiration_date: number, /** The date the coupon expires */
            origin_user: string, /** The internal_id of the user who sent the coupon */
            target_user: string, /** The internal_id of the user who received the coupon */
            status: int,  /** The status of the coupon. Maps directly to the `enum CouponStatus` */
            finish_date: number | null /** The date a coupon was finished, (expired, used, or removed) */
        },
        /** ... */
    ]
}
```

Returns a list of all the available (coupon.status === Active) coupons of the sender.
Authorization header is used to identify the user.

### GET /refresh_token

**Request**:

* Header `Authorization`. Set the `refresh_token` you got on login as the Authorization header.

**Response**:
    
```ts
body: json string = {
    token: string, /** Short duration token for accessing the APIs that require identification. */
                   /** Put this token as is in the `Authorization` header of subsequent requests. */
    refresh_token: string, /** Long duration token used as a means of renewing your identification. */
                           /** If `token` expires, you can receive a new one by sending this `refresh_token` */
                           /** to the `refresh_token` API. */
}
```
Example:
```json
{ token: "d4800779-b9b1-4e4d-bb00-d2579f3f9cdb", refresh_token: "fd38d2f6-6cad-4495-8280-a5b033e27abb" }
```

**Possible errors**:
* AuthorizationMissing
* AuthorizationInvalid
* AuthorizationExpired

The idea is that if you have no token (or it has been rejected on an API request), you use this API.  
If you have no `refresh_token`, you login again via `/oauth2/google`.

### GET /oauth2/google

**Response**: Redirection to google auth form

This is the API that acts both as a "login" and a "register".
Redirects the user to an authorization form `https:accounts.google.com/o/oauth2/v2/auth`.
Completing the form will redirect the user, once again, to `/oauth2/google/callback`.
Finally, the client will be redirected to `/?token=#####&refresh_token=#####`. Check
`/oauth2/google/callback` for more information.

Because of how redirections work, the client is expected to "go" to
this location rather than make a GET request.

### GET /oauth2/google/callback

**Request**:

* `code`: number. Code set automatically by google on auth form completion.

**Response**:
    
Redirection to `/oauth2/tokens` with 2 URL parameters:
* token: string. Short duration token for accessing the APIs that require identification.
Put this token as is in the `Authorization` header of subsequent requests.
* refresh_token: string. Long duration token used as a means of renewing your identification.
If `token` expires, you can receive a new one by sending this `refresh_token` to the `refresh_token` API.

Example:

```
https://cutepon.net/oauth2/tokens?token=d4800779-b9b1-4e4d-bb00-d2579f3f9cdb&refresh_token=fd38d2f6-6cad-4495-8280-a5b033e27abb
```

The tokens returned will be subsequently used for accessing any API that requires authorization.
The client will never manually access this API.
When the client tries to login via oauth at `/oauth2/google` and completes the form,
google will redirect the client here, with the required data already set.
