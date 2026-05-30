# Mifania Mobile — Security Notes

This document summarizes how the Android app protects user data and authenticates with the Mifania API. It is intended for reviewers and developers.

## Authentication & API access

- **JWT (Lexik)** — Protected API calls send `Authorization: Bearer <token>` (see `src/app/api/client.ts`).
- **HTTPS only in release** — Release builds set `usesCleartextTraffic: false` in `android/app/build.gradle`. Debug builds allow cleartext for local development.
- **Session expiry** — On `401` / expired JWT, `handleSessionExpired()` in `src/utils/authSession.ts` dispatches logout so stale tokens are not reused.
- **Firebase Auth** — Email/password and Google Sign-In; Google configured in `App.tsx` with offline refresh support.

## Credential & token storage

| Data | Storage | Notes |
|------|---------|--------|
| Auth token & user | **iOS Keychain / Android Keystore** via `react-native-keychain` (`src/utils/secureStorage.ts`) | Auth slice uses `secureStorage` in `src/app/reducers/rootReducer.ts`. |
| Cart, wishlist, notifications | **AsyncStorage** (redux-persist) | Non-secret UI state; not used for raw passwords. |
| Passwords | **Never persisted** | Entered only on login / change-password screens. |

On logout, `secureStorage.removeItem('persist:auth')` runs before the store resets (`src/app/store/index.ts`).

## Account security features (in-app)

- **Change password** — `ChangePasswordScreen` → `POST` account security API with current + new password.
- **Deactivate account** — `AccountSecurityScreen` calls deactivate API, then signs out Firebase/Google and clears Redux.
- **Password fields** — Masked by default (`secureTextEntry` on `FormInput` with `PasswordVisibilityToggle`).

## Real-time (Socket.IO)

- Connects after login to the Railway Socket.IO server (`src/services/socket.ts`).
- Socket `auth` payload includes `userId` (room `user_<id>` on server).
- Connection errors containing `401` / `Unauthorized` stop reconnection attempts.

## Local & push notifications

- **Notifee** displays on-device notifications when socket events or FCM foreground messages arrive.
- **POST_NOTIFICATIONS** permission declared in `AndroidManifest.xml` (Android 13+).
- Notification tap handlers route order-related alerts to order tracking (`AppNavigator`, `index.js`).

## Release signing (Android)

- Release APKs are signed with a project keystore referenced in `android/gradle.properties` (`MYAPP_UPLOAD_*`).
- Keystore file: `android/app/releaseMe.jks` (keep private; do not commit passwords to public repos).
- Verify a build:  
  `apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk`

## Dependencies & transport

- API base URL: production Symfony/API Platform host (`ASSET_URL` in `src/app/api/client.ts`).
- Socket URL: production Railway WebSocket host (`SOCKET_URL` in `src/services/socket.ts`).
- **Firebase Crashlytics** — Crash reporting enabled in release Gradle config.

## Recommendations (production hardening)

1. Move keystore passwords out of `gradle.properties` into `~/.gradle/gradle.properties` or CI secrets.
2. Add certificate pinning if threat model requires MITM resistance beyond TLS.
3. Enable ProGuard/R8 (`enableProguardInReleaseBuilds`) after testing release builds.
4. Rotate any credentials that were ever committed to version control.

## Related backend

- Symfony API: JWT-protected routes, role-based access (see Mifania-Web `README.md`).
- Account APIs: `AccountSecurityController` (change password, deactivate).
