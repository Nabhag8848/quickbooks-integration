# OAuth2 with QBO
- refresh access tokens before they expire.
- create a company table and store both access & refresh, company_id. 
- on connecting different company it must add new record.
- do this without using sdk. 
- each company must have their own refresh token time, cause expiry of every company may or may not be same. use key-space-notification and key-event notification for now. 

https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0