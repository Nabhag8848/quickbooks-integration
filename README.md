# OAuth2 with QBO ✅
- refresh access tokens before they expire.
- create a company table and store both access & refresh, company_id. 
- on connecting different company it must add new record.
- do this without using sdk. 
- each company must have their own refresh token time, cause expiry of every company may or may not be same. use key-space-notification and key-event notification for now. 

https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0

# Initial backfill & Incremental Sync

1. user interaction cases: 

- we have workspace and each workspace has many users. 
- each workspace can have multiple companies / account connected by user(s).
- each account has customers and invoices related to particular customer. 
- user can connect to same account again after disconnecting. 
- user can connect to different account which may or may not connected before.


2. technical brainstroming: 

Initial backfill: 
- we want once user is connected to account, we start the initial backfill of entities. 
- user might disconnect while this backfill happening so we will store each pagination ( uptill whats successful) entity sync state per account / company. 
- we will start filling the entities starting from oldest first (created_at), 1000 at a time.
- when we start the initial backfill, we will have that as initial_attempt_time. 
- once one time sync is successful on initial connection we will store the (last_successful_sync_time = initial_attempt_time) to make sure any updates made during the initial backfills gets override into our db on next sync.
- after initial backfills is completed we need to fetch the entities in some interval which is updated >= last_sucessful_sync_time.
- when the initial backfill isn't completed and user disconnects when user connects back we will get last created_time of populated record for that user's company / account and query with operation with 
> (last_created_time >= created_time and updated_time >= lat_created_time_record-most_recent_created_at_in_db) 
to fix the stale data and get the newer data with created_time >= last_created_time with 
same timestamp approach. 
- when initial_backfill is completed but incremental sync was there we do similar approach as above but in this case we go with last_sync_successful_time instead of last_created_time

> SELECT * FROM Customer ORDERBY Metadata.CreateTime ASC STARTPOSITION 1 MAXRESULTS 1000
> SELECT * FROM Invoice ORDERBY Metadata.CreateTime ASC STARTPOSITION 1 MAXRESULTS 1000
> SELECT * FROM Customer WHERE CreateTime >= <> AND LastUpdatedTime >= <>  ORDERBY Metadata.CreateTime ASC STARTPOSITION 1 MAXRESULTS 1000
> SELECT * FROM Invoice WHERE CreateTime >= <> AND LastUpdatedTime >= <>  ORDERBY Metadata.CreateTime ASC STARTPOSITION 1 MAXRESULTS 1000
> SELECT * FROM Customer WHERE CreateTime >= <> ORDERBY Metadata.CreateTime ASC STARTPOSITION 1 MAXRESULTS 1000
> SELECT * FROM Invoice WHERE CreateTime >= <> ORDERBY Metadata.CreateTime ASC STARTPOSITION 1 MAXRESULTS 1000

- we must make sure customers get populated first then invoice everytime to avoid missing customer of invoice(s).
- we will first get all the customer and then get all the invoices in all the cases we have in order to avoid N + 1 query.

# Things thats good to handle: 
- Multi tenancy - solves entitiy object record name match across customer [ not priority ] 
- Api Failure [ handle ] 
- Token Expiration [ handle ]
- RateLimit (500 req / min - per QBO App) [ not priority ] 
- Api Status Down [ solution should be reliable to handle ]