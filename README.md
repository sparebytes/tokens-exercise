# Tokens Service Exercise

## Configuration

- We must be very careful about any misconfigurations to prevent downtime and
  insecure settings

## Encryption at rest

- [AES 256 GCM](src/encryption.ts#L4)
- [Changing primary encryption key mid-process](src/encryptionKeys.ts#L23)
- [Encryption Key Rotation](.env.development)

## Encryption in Transit

- Ensure the internal network communication is encrypted

## Tokens

- [UUIDs for Tokens](src/utils.ts#L19)

## Persistence

- [DB Transaction for Update](src/persist.ts#L65)
- [Expiring Updated Tokens](src/persist.ts#L70)

## Logging

- [Logging](src/server.ts#L16)
- [Internal Server Errors](src/server.ts#L21)
- [Errors](src/persist.ts#L27)

## Auth

- [Bearer Tokens](src/server.ts#L27)
  - Provides protection if services which do not need access to this api are
    compromised.
  - Provides protection if the database is compromised
  - Each service which requires access should use a unique bearer token to for
    rate tracking and to allow the services to be quickly removed from the
    allow-list in the case it is compromised

## Api Limits

- [Max Secret Size](src/server.ts#L8)
- [Max Tokens at Once](src/server.ts#L11)
- Rate Limiting

## Api

- [Updating Secrets](src/server.ts#L109)

## Other Notes

- No public access so typical CORS and other brother precautions protections are
  not required
