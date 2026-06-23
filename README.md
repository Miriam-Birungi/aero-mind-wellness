# AeroMind Wellness

AeroMind is an intelligent mental health platform for pilots, providing operational visibility into wellness metrics through wearable integration and AI insights.

## Architecture

- **Frontend**: React (Vite, TypeScript, Tailwind CSS, shadcn/ui)
- **Mobile**: Flutter 3.x (Clean Architecture, BLoC)
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, RLS)

## Getting Started

### React App
1. Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Run `npm install`
3. Run `npm run dev`

### Flutter App
1. Initialize Supabase in `main.dart` with your credentials.
2. Run `flutter pub get`
3. Run `flutter run`

### Supabase Schema
The SQL schema can be found in `supabase_schema.sql`.

## Features
- **Real-time Metrics**: Synchronized via Supabase from wearables.
- **Anonymous Messaging**: Support reports for pilots with admin oversight.
- **Cross-Platform**: Support for Android, iOS, and Web.
- **Internationalization**: Initial support for English and Spanish.
