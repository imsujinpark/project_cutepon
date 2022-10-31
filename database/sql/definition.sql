-- Data Model as described in our brainstorming session

-- coupon
-- | Id (PK) | Title  | Description | Sent date | Expiration date | Redeem/Delete date | Origin (FK) | Target | Status |
-- | Long    | String | String      | Long      | Long            | Long               | Long        | Long   | Enum   |

drop table if exists coupon;
create table coupon (
    
    -- ** read-only data, definition of the coupon **
    id integer primary key autoincrement not null, -- Notes (Oscar) I believe sqlite will create an alias for rowid... TODO Gotta check
    title text not null,
    description text not null,
    created_date datetime not null,
    expiration_date datetime not null,
    origin_user integer not null references user(id),
    target_user integer not null references user(id),
    
    -- ** dynamic data, might change as coupon status changes **

    -- Enum describing the status of the coupon:
    -- 0 Active, 1 Redeemed, 2 Deleted, 3 Expired
    -- Make sure no invalid data enters is used for status
    status integer check(
        status >= 0 and
        status <= 3
    ) not null,

    -- Refers to the date that the coupon was "terminated" regardless of the reason, be it expired, was used, or deleted.
    finish_date datetime not null

);
-- Set an extra index for the table, since we will index by status and by origin pretty often
create index by_status_index on coupon (status);
create index by_origin_user_index on coupon (origin_user);


-- user
-- | uuid    | Id (PK) | Email  |
-- | string  | Long    | String |

drop table if exists user;
-- user is a read-only data and we dont expect it to change, at all
create table user (
    
    id integer primary key autoincrement not null,
    -- for now the public id is intended to be an email
    public_id text not null
    
);

-- Notes (Oscar) Apparently sqlite doesnt have readonly? So this is a workaround
create trigger readonly_user before update of id, public_id on user
begin
    select raise(abort, 'user is readonly!');
end


