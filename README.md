# Mifania Mobile (React Native)

Android/iOS client for the Mifania sustainable fashion e-commerce platform. Connects to the Symfony API (JWT), Firebase Auth, Socket.IO realtime, and local notifications (Notifee).

## Submission checklist (30 pts — Mobile APK)

| Item | Location |
|------|----------|
| Signed release APK | Build below → copy to [`releases/`](releases/README.md) |
| WebSocket realtime | [Realtime demo](#realtime-demo-websocket) |
| Local notifications | Notifee + FCM (see [SECURITY.md](SECURITY.md)) |
| Security notes | [SECURITY.md](SECURITY.md) |

---

## Signed release APK

### Prerequisites

- Android SDK, JDK 17, `ANDROID_HOME` set
- Release keystore at `android/app/releaseMe.jks` with `MYAPP_UPLOAD_*` in `android/gradle.properties`

### Build release APK

```sh
npm install
npm run android:release
```

APK path:

`android/app/build/outputs/apk/release/app-release.apk`

### Copy for submission

```sh
npm run android:copy-release
# → releases/mifania-release.apk
```

### Verify signature

```sh
apksigner verify --verbose releases/mifania-release.apk
```

---

## Realtime demo (WebSocket)

The app connects to Socket.IO **after login** (`src/app/sagas/socket.ts` → `src/services/socket.ts`).

**Server:** `https://web-socket-production-29ca.up.railway.app` (path `/socket.io`)

**Events handled:**

| Event | App behavior |
|-------|----------------|
| `notification` | Local Notifee banner + in-app notification list |
| `new_order` | Local notification (“New Order Received”) |
| `order_status_update` | Local notification + refreshes orders in Redux |

### Demo steps (for reviewers)

1. Install the **release** or **debug** APK and log in as a customer.
2. Ensure the Mifania-Web API and `socket-server` are running (or use deployed Railway services).
3. From **admin/staff** (web) or API, change an order status or trigger a notification for that user.
4. On the device you should see:
   - A **local notification** (Notifee) in the tray, and/or
   - Updated **Notifications** screen and **My Orders** / tracking after tap.

**Logs (debug build):** Metro / `adb logcat` — look for `Socket connected` or connection errors.

---

## Local notifications

- **Socket-driven:** `src/services/socket.ts` → `notifee.displayNotification`
- **FCM foreground:** `App.tsx` → Notifee when a push arrives while app is open
- **Channel:** `default` (Android 8+), high importance
- **Tap:** Order-related notifications open Order Tracking (`AppNavigator`)

---

## Security

See **[SECURITY.md](SECURITY.md)** for JWT, Keychain token storage, HTTPS/cleartext policy, logout, and signing notes.

---

## Development

### Start Metro

```sh
npm start
```

### Run on Android (debug)

```sh
npm run android
```

### Run on iOS

```sh
cd ios && bundle exec pod install && cd ..
npm run ios
```

### Lint & test

```sh
npm run lint
npm run test
```

---

## Project structure

| Path | Purpose |
|------|---------|
| `App.tsx` | Root providers, FCM + Notifee setup |
| `src/app/` | Redux, sagas, API |
| `src/services/socket.ts` | Socket.IO client |
| `src/navigations/` | Auth / main stacks |
| `src/screens/` | Feature screens |
| `android/` | Native Android + signing |

More detail: [GEMINI.md](GEMINI.md)

---

## Backend

Pair with **Mifania-Web** (Symfony + API Platform) and the `socket-server` in that repo for full realtime and API behavior.
