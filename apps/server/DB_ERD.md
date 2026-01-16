# QuickBooks Integration Server

## Database ERD

```mermaid
erDiagram
  company {
    uuid id PK
    timestamp createdAt
    timestamp updatedAt
    varchar sourceId
    text accessToken
    timestamp accessTokenExpiresAt
    text refreshToken
    timestamp refreshTokenExpiresAt
  }
  
```
