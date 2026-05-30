# Release APK

Place the **signed release** APK here for submission or distribution.

## Build

From the project root:

```sh
npm run android:release
```

Output (default):

`android/app/build/outputs/apk/release/app-release.apk`

## Copy here (optional)

```sh
npm run android:copy-release
```

This copies the APK to `releases/mifania-release.apk`.

## Verify signing

```sh
# Requires Android SDK build-tools on PATH
apksigner verify --verbose releases/mifania-release.apk
```

You should see `Verified using v2 scheme (APK Signature Scheme v2): true`.

## Note

APK binaries are large and are **not** committed to git by default. Rebuild with the steps above, or copy your latest `app-release.apk` into this folder before submitting.
