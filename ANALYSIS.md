# AeroMind Wellness System Analysis Report

This document provides a comprehensive analysis of the AeroMind Wellness platform, which consists of a React web client, a Flutter mobile client, and a Supabase backend integration. It details the system architecture, completed features, remaining/unimplemented items, database schema alignment, known code quality/linting issues, and recommendations for future improvement.

---

## 1. System Architecture

AeroMind Wellness is structured as a cross-platform, offline-first application leveraging direct cloud backend integration.

- **Web Client**: React (v18) built with Vite and TypeScript. Styling uses Tailwind CSS, component layouts use shadcn/ui (Radix Primitives), and visualizations are built using `recharts`.
- **Mobile Client**: Flutter (v3.x) using a clean architecture pattern split into four key layers:
  - **Data**: Handlers for API calls (Supabase client), SQLite caching / key-value caches (`hive`, `shared_preferences`), and local hardware features (`health`, `flutter_local_notifications`).
  - **Domain**: Domain entities and abstract repository definitions representing core business objects and behaviors.
  - **Logic (BLoC)**: Handles state transitions for Authentication and Wellness tracking.
  - **Presentation**: UI widgets, pages, and customized components with localized support via ARB files.
- **Backend (BaaS)**: Supabase acts as the secure, unified backend providing Authentication, PostgreSQL Database, and Realtime sync services. It features automatic compliance alerting through custom trigger procedures in PL/pgSQL.

---

## 2. Completed Features

### Web & Mobile Parity
- **Onboarding Flow**: Multi-step setup gathering pilot demographics, compliance selection (FAA vs. UCAA), and metric permission preferences.
- **Biometric Wearable Syncing**: Real-time biometric wearable synchronization (heart rate, sleep, steps) with manual entry and Web Bluetooth capability, persisted to Supabase.
- **Dashboard & Score calculation**: Custom algorithm calculating a generalized Wellness Score based on sleep, pulse, and activity metrics.
- **Anonymous Reporting Support**: Message submission categorized into Fatigue, Stress, Safety, or General feedback with Row Level Security (RLS) guaranteeing pilot privacy, severity levels, and automated tracking reference generation.
- **Admin Analytics Dashboard**: Restricted oversight views displaying fleet-wide wellness indicators, anonymous report listings with severity badges, active FAA/UCAA compliance triggers, and graphical aggregate charts with CSV exports.
- **Mental Exercises**: Guided deep breathing screen helper.

### Mobile-Specific
- **Local Reminders**: Daily 9 AM local notification check-in schedules via `flutter_local_notifications`.
- **Offline Caching**: Device-state sync engine leveraging `hive` databases to cache wellness data.
- **Connectivity Monitoring**: Real-time banner alerts indicating cached visual fallback when connectivity is severed.
- **Dynamic Localizations**: Full localization (l10n) setup with complete ARB file pairs for Spanish (`es`) and English (`en`).
- **PDF Report Generator**: Generates and prints wellness progress summaries.

---

## 3. Database Schema Alignment

The SQL schema described in `supabase_schema.sql` matches the implementations in the frontend.

| Table Name | Primary Key | Foreign Key / Target | Row Level Security (RLS) Status |
| :--- | :--- | :--- | :--- |
| `profiles` | `id (UUID)` | `auth.users (cascade)` | Enabled. Active policies limit updates/reads to self. |
| `onboarding_data` | `user_id (UUID)` | `profiles.id (cascade)` | Enabled. Active policies limit access to owners. |
| `wellness_metrics` | `id (BIGINT)` | `profiles.id (cascade)` | Enabled. Restricted read/insert actions per user owner. |
| `anonymous_messages` | `id (BIGINT)` | None | Enabled. Inserts allowed for everyone, read permissions restricted exclusively to roles identified as `'admin'`. |
| `active_alerts` | `id (BIGINT)` | `profiles.id (cascade)` | Enabled. Select policies configured for self or role `'admin'`. |

### Database Triggers:
- **`on_auth_user_created`**: Automates profile creation upon registration.
- **`on_wellness_metrics_inserted`**: Executes compliance calculation comparing logged sleep against rule limits (8.0h for FAA, 7.0h for UCAA), raising active alerts into `active_alerts` automatically on breach.

---

## 4. Hardware & Ecosystem Integration Architecture

For production wellness tracking, AeroMind supports:
1. **Web Bluetooth API**: Direct connection to BLE heart rate monitors (0x180D Service) and smart sensors in Chrome/Edge browsers.
2. **Cloud Fitness REST APIs**: Direct webhooks and OAuth 2.0 integrations with Garmin Connect API, Oura Cloud v2, and Whoop Developer API.
3. **Mobile Native Health Kits**: Native sync using Apple HealthKit (`HKQuantityTypeIdentifierHeartRate`, `HKCategoryTypeIdentifierSleepAnalysis`) and Google Health Connect via Flutter's `health` package.

---

## 5. Code Quality & Verification

- Automated testing powered by Vitest for web algorithms and Flutter test suite for mobile UI and business logic.
- Full compliance with ESLint rules and Flutter static analysis checks.
