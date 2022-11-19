# project_cutepon


## Core features and data model (Vertical Slice)

| Coupon  |        |             |           |                 |                    |             |        |        |
|---------|--------|-------------|-----------|-----------------|--------------------|-------------|--------|--------|
| Id (PK) | Title  | Description | Sent date | Expiration date | Redeem/Delete date | Origin (FK) | Target | Status |
| Long    | String | String      | Long      | Long            | Long               | Long        | Long   | Enum   |

| User    |         |        |
|---------|---------|--------|
| uuid    | Id (PK) | Email  |
| string  | Long    | String |

```txt
Enum Status (Active, Redeemed, Deleted, Expired)
```

* Google based oauth identification:
  * Remember/Automatically refresh the session.  
  Time: 1 day backend. 1 days client.

* 3 kinds of lists:
  
  (1) the user has received and Status Active,  
  (2) that the user has sent and any status,  
  (3) the user has received and Status not Active (Not core).  

  (1) It shows the title, description, Origin, sent date and expiration date, status?  
  (2) It shows the title, description, Target, sent date and expiration date, status  
  (3) It shows the title, description, Origin, sent date and expiration date, status  

  **Features** Delete, Redeem, Edit (Not core), Pinned coupons / unpin coupon (Not core), Pagination (Not core)
  * Delete coupon: We just press a button in the list of coupons, with confirmation (0.5 days, 0.5 days)
  * Redeem the coupons: Click a button for redeeming. (Confirmation is Not core)  
  Time: 1 day client, 0.5 days backend

* Send coupon to user:
  The way it works is that we set the target on the coupon creation menu/screen/page.  
  Requires input: Title (ascii), Description (ascii), Expiration date (Timestamp (Long) (Date object in js)), Target (as email, not long, no cache in client)  
  **Features**: autocompletion of emails (Not core).  
  Time: 1 day client, 0.5 days backend

## The rest...

* Socket-based network (Pub-Sub architecture - Redis) Not core
  * HTTP API + persisten network socket connection?????
  * client web sockets, how to use, how they work, how to react to errors. Apply to usecase (Realtime events?)
  * Send coupong to user (when the user receives it)
  * Coupon deleted user (when the coupong is deleted by an external source)
  * Coupon time limit related notifications (When X time is left for expiration)
  * Notifications (coupon expiring)

* Social-Friend system

