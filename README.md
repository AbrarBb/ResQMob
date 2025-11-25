# ResQMob - Emergency Response Network

A comprehensive emergency response mobile application built with React Native and Expo, featuring real-time SOS alerts, community safety networks, and emergency communication.

## Features

### 🚨 Emergency Response
- **One-tap SOS alerts** with customizable urgency levels
- **Real-time location sharing** during emergencies
- **Automatic escalation** for unresponded alerts
- **Emergency contact notifications** via SMS and push notifications

### 🗺️ Interactive Map
- **Live emergency alerts** displayed on map
- **Safe zones** (hospitals, police stations, fire stations)
- **Nearby responders** and their status
- **Real-time location tracking** during emergencies

### 💬 Emergency Communication
- **Emergency chat rooms** for active alerts
- **Community safety discussions**
- **Real-time messaging** with location sharing
- **Voice and video call integration**

### 📱 Community Safety
- **Safety feed** with tips and incident reports
- **Neighborhood watch groups**
- **Community safety updates**
- **Verified emergency services**

### 🔐 Privacy & Security
- **Row-level security** with Supabase
- **Privacy mode** for discrete operation
- **Encrypted communications**
- **Secure authentication**

## Tech Stack

- **Frontend**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4.0
- **Backend**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Maps**: React Native Maps (native) / Web fallback
- **Notifications**: Expo Notifications
- **Location**: Expo Location
- **State Management**: React Hooks
- **Styling**: StyleSheet (React Native)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/resqmob.git
   cd resqmob
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env` file with your credentials

4. **Run database migrations**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration files in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_sample_data.sql`
     - `supabase/migrations/003_functions_and_triggers.sql`
     - `supabase/migrations/004_sample_emergency_data.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Demo Mode

The app includes a demo mode that works without Supabase configuration:

- **Email**: demo@resqmob.com
- **Password**: demo123

Demo mode includes sample data and simulated functionality for testing.

## Database Schema

### Core Tables

- **users** - User profiles and settings
- **sos_alerts** - Emergency alerts with location and urgency
- **sos_responders** - People responding to alerts
- **emergency_contacts** - User emergency contacts
- **chat_rooms** - Emergency communication channels
- **messages** - Real-time chat messages
- **feed_posts** - Community safety updates
- **safe_zones** - Hospitals, police stations, etc.
- **notifications** - Push notifications and alerts
- **location_updates** - Real-time location tracking
- **emergency_services** - Official emergency contacts

### Key Features

- **Row Level Security (RLS)** on all tables
- **Real-time subscriptions** for live updates
- **Distance calculation functions** for nearby queries
- **Automatic triggers** for data consistency
- **Comprehensive indexing** for performance

## API Functions

### Location Services
- `get_nearby_users(lat, lng, radius)` - Find users within radius
- `get_nearby_alerts(lat, lng, radius)` - Find active alerts
- `calculate_distance(lat1, lng1, lat2, lng2)` - Distance calculation

### Real-time Features
- Live SOS alerts
- Real-time chat messages
- Location updates
- Notification delivery

## Security

### Authentication
- Email/password authentication via Supabase Auth
- Secure session management
- Automatic token refresh

### Authorization
- Row Level Security (RLS) policies
- User-specific data access
- Privacy mode support
- Emergency override capabilities

### Data Protection
- Encrypted data transmission
- Secure API endpoints
- Privacy-compliant location sharing
- GDPR-ready data handling

## Platform Support

### Mobile (iOS/Android)
- Full native functionality
- Background location tracking
- Push notifications
- Hardware button SOS triggers
- Camera and media access

### Web
- Core functionality available
- Map fallback for web compatibility
- Limited location services
- No background processing

## Deployment

### Mobile Deployment
1. **Build for production**
   ```bash
   expo build:android
   expo build:ios
   ```

2. **Submit to app stores**
   ```bash
   expo submit:android
   expo submit:ios
   ```

### Web Deployment
1. **Build web version**
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting service**
   - Netlify, Vercel, or any static hosting
   - Configure environment variables
   - Set up custom domain

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@resqmob.com
- Documentation: [docs.resqmob.com](https://docs.resqmob.com)

## Acknowledgments

- Expo team for the amazing development platform
- Supabase for the backend infrastructure
- React Native community for the ecosystem
- Emergency services worldwide for their inspiration

---

**ResQMob** - Connecting communities for safer tomorrow 🚨