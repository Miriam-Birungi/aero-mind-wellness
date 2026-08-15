# AeroMind Wellness - Biometric Health & Hardware Integration Guide

This guide details recommended production integrations for real-time and asynchronous pilot wellness tracking across Web and Mobile (Flutter) applications.

---

## 1. Web Platform Integrations

### A. Web Bluetooth API (Direct BLE Heart Rate Sensors)
- **Supported Devices**: Polar H10, Garmin HRM-Pro, Whoop Strap 4.0 (BLE Mode), Apple Watch (BLE HR Broadcast mode), Wahoo TICKR.
- **Protocol**: Standard GATT Heart Rate Service (`0x180D`), Heart Rate Measurement Characteristic (`0x2A37`).
- **Implementation Path**:
  ```typescript
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }]
  });
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('heart_rate');
  const characteristic = await service.getCharacteristic('heart_rate_measurement');
  characteristic.startNotifications();
  characteristic.addEventListener('characteristicvaluechanged', (event) => {
    const value = event.target.value;
    const heartRate = value.getUint8(1);
    // Submit to Supabase wellness_metrics table
  });
  ```

### B. Cloud Fitness REST APIs & Webhooks

#### 1. Garmin Connect API
- **Endpoint Types**: Webhook Push API & Daily Summary Pull API.
- **Metrics Collected**: Stress Level (0-100), RHR (Resting Heart Rate), Body Battery, Sleep Architecture (Deep/REM/Light/Awake hours), Pulse Ox.
- **Auth Flow**: OAuth 2.0 with PKCE.
- **Supabase Integration**: Store `garmin_access_token` in user profile / Supabase Vault; run background sync via Supabase Edge Function `sync-garmin-daily`.

#### 2. Oura Cloud API v2
- **Endpoint**: `https://api.ouraring.com/v2/usercollection/sleep` & `daily_readiness`.
- **Metrics Collected**: Readiness Score, Sleep Efficiency, Resting Heart Rate, HRV (Heart Rate Variability), Temperature Deviation.
- **Auth Flow**: OAuth 2.0 Personal Access Token / Application Auth.

#### 3. Whoop Developer API v1
- **Endpoint**: `https://api.prod.whoop.com/developer/v1/cycle` & `recovery`.
- **Metrics Collected**: Strain Score, Recovery %, Sleep Performance %, RHR, HRV.

#### 4. Apple HealthKit via Health Auto Export / Cloud Webhooks
- iOS companion app or Health Auto Export app posts automated JSON payloads directly to Supabase Edge Function (`/functions/v1/apple-health-webhook`).

---

## 2. Mobile Platform Integrations (Flutter)

### A. `health` Flutter Package (Unified Apple HealthKit & Google Health Connect)
- **Supported OS**: iOS (HealthKit), Android (Google Health Connect & Google Fit).
- **Permissions Required**:
  - iOS: `NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription` in `Info.plist`.
  - Android: `android.permission.health.READ_HEART_RATE`, `android.permission.health.READ_SLEEP` in `AndroidManifest.xml`.
- **Implementation**:
  ```dart
  Health health = Health();
  bool requested = await health.requestAuthorization([
    HealthDataType.HEART_RATE,
    HealthDataType.SLEEP_ASLEEP,
    HealthDataType.STEPS,
  ]);
  List<HealthDataPoint> data = await health.getHealthDataFromTypes(
    startTime: DateTime.now().subtract(Duration(days: 1)),
    endTime: DateTime.now(),
    types: [HealthDataType.HEART_RATE, HealthDataType.SLEEP_ASLEEP],
  );
  ```

---

## 3. Database Ingestion Architecture

All integrations format output data into the standard Supabase payload:

```json
{
  "user_id": "<UUID>",
  "heart_rate": 68,
  "sleep_hours": 7.8,
  "steps": 8500,
  "score": 92
}
```

When inserted into `wellness_metrics`, the PostgreSQL trigger `on_wellness_metrics_inserted` automatically verifies rest compliance limits against FAA (8.0h) or UCAA (7.0h) rules and emits an alert into `active_alerts` if breached.
