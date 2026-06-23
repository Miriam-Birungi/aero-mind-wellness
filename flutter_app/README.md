# AeroMind Wellness - Flutter App

Mobile application for AeroMind Wellness platform.

## Features
- Supabase Integration (Auth & DB)
- Offline Support (Hive Caching)
- Role-based Access (Pilot & Admin)
- Localization (English & Spanish)
- Real-time Connectivity Monitoring

## Setup
1. Copy `assets/.env.example` to `assets/.env` and add your Supabase credentials.
2. Run `flutter pub get`.
3. Run `flutter run`.

## Architecture
This project follows Clean Architecture principles:
- **Data**: Supabase API Service, Hive Caching.
- **Domain**: Entities and Repository Interfaces.
- **Logic**: BLoC for state management.
- **Presentation**: Flutter Widgets and Pages.
