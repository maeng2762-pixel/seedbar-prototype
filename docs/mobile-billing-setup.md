# Seedbar Mobile Billing Bridge

Seedbar web app now includes a mobile billing integration layer intended for App Store / Play Store subscription builds.

## Frontend bridge contract

The app looks for one of these objects:

- `window.Capacitor.Plugins.SeedbarBilling`
- `window.SeedbarMobileBilling`

Supported methods:

- `getStatus()`
- `purchaseSubscription({ productId, plan, platform })`
- `restorePurchases()`

Expected response shape:

```json
{
  "provider": "app_store",
  "platform": "ios",
  "plan": "pro",
  "status": "active",
  "productId": "seedbar_studio_monthly",
  "entitlementId": "seedbar_studio",
  "receiptId": "transaction_or_receipt_id",
  "expiresAt": "2026-04-21T12:00:00.000Z"
}
```

## Backend sync endpoints

- `GET /api/billing/me`
- `POST /api/billing/mobile/sync`
- `POST /api/billing/mobile/restore`

The mobile client should:

1. complete store purchase or restore
2. call `/api/billing/mobile/sync`
3. refresh plan capabilities

## Current product mapping

- `pro` -> `seedbar_studio_monthly`
- `studio` -> `seedbar_team_monthly`

Update `src/services/mobileBilling.js` when actual store product IDs are ready.
