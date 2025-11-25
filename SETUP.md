# ResQMob Setup Guide

This guide will help you set up ResQMob with Supabase backend.

## Quick Start (Demo Mode)

The app works immediately in demo mode with these credentials:
- **Email**: demo@resqmob.com
- **Password**: demo123

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - **Name**: ResQMob
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users

### 2. Get Project Credentials

1. Go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Environment Variables

Update your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run these migration files in order:

#### Migration 1: Initial Schema
Copy and paste the content from `supabase/migrations/001_initial_schema.sql`

#### Migration 2: Sample Data  
Copy and paste the content from `supabase/migrations/002_sample_data.sql`

#### Migration 3: Functions and Triggers
Copy and paste the content from `supabase/migrations/003_functions_and_triggers.sql`

#### Migration 4: Sample Emergency Data
Copy and paste the content from `supabase/migrations/004_sample_emergency_data.sql`

### 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:8081` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:8081`
   - `exp://localhost:8081` (for Expo)
   - Your production URL when deploying

### 6. Enable Real-time

1. Go to **Database** → **Replication**
2. Enable real-time for these tables:
   - `sos_alerts`
   - `sos_responders` 
   - `messages`
   - `location_updates`
   - `notifications`

### 7. Test Connection

Restart your app and check the console for:
```
✅ Connected to Supabase successfully
```

## Features Configuration

### Push Notifications

1. **Get Expo Project ID**:
   ```bash
   expo whoami
   ```

2. **Update notification service** in `lib/notifications.ts`:
   ```typescript
   const token = await Notifications.getExpoPushTokenAsync({
     projectId: 'your-expo-project-id',
   });
   ```

### Maps Configuration

For production maps:

1. **Google Maps** (Android):
   - Get API key from Google Cloud Console
   - Add to `app.json`:
   ```json
   {
     "android": {
       "config": {
         "googleMaps": {
           "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
         }
       }
     }
   }
   ```

2. **Apple Maps** (iOS):
   - No additional configuration needed
   - Uses native Apple Maps

### Location Services

1. **Background Location** (iOS):
   - Add to `app.json`:
   ```json
   {
     "ios": {
       "infoPlist": {
         "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs location access for emergency services.",
         "NSLocationWhenInUseUsageDescription": "This app needs location access for emergency services."
       }
     }
   }
   ```

2. **Background Location** (Android):
   - Already configured in `app.json`

## Production Deployment

### Mobile Apps

1. **Build for production**:
   ```bash
   expo build:android
   expo build:ios
   ```

2. **Update Supabase settings**:
   - Add production URLs to redirect URLs
   - Update CORS settings if needed

### Web Deployment

1. **Build web version**:
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting**:
   - Netlify: Drag and drop `dist` folder
   - Vercel: Connect GitHub repository
   - Custom server: Upload `dist` folder

3. **Update Supabase**:
   - Add production domain to redirect URLs
   - Update CORS settings

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**:
   - Check your `.env` file
   - Ensure no extra spaces in keys
   - Restart development server

2. **Database connection failed**:
   - Verify project URL is correct
   - Check if migrations ran successfully
   - Ensure RLS policies are enabled

3. **Real-time not working**:
   - Enable real-time in Supabase dashboard
   - Check table publications
   - Verify RLS policies allow subscriptions

4. **Location not working**:
   - Grant location permissions
   - Check device location services
   - Verify HTTPS in production

5. **Push notifications not working**:
   - Update Expo project ID
   - Check device notification permissions
   - Verify push token generation

### Getting Help

1. **Check logs**:
   ```bash
   expo logs
   ```

2. **Supabase logs**:
   - Go to **Logs** in Supabase dashboard
   - Check for errors and warnings

3. **Debug mode**:
   ```bash
   expo start --dev-client
   ```

## Security Checklist

- [ ] Environment variables are secure
- [ ] RLS policies are enabled on all tables
- [ ] API keys are not exposed in client code
- [ ] HTTPS is used in production
- [ ] User data is properly encrypted
- [ ] Emergency contacts are verified
- [ ] Location data is handled securely

## Performance Optimization

- [ ] Database indexes are created
- [ ] Real-time subscriptions are optimized
- [ ] Images are compressed and cached
- [ ] Location updates are throttled
- [ ] Background tasks are efficient

---

Need help? Create an issue on GitHub or contact support@resqmob.com