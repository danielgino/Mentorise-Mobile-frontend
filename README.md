# Mentorise Mobile App

Mentorise Mobile App is the student and tutor-facing mobile application of the Mentorise platform.

The application allows students to find peer tutors from their academic institution, match with relevant tutors, start conversations, receive lesson offers, confirm sessions, manage their profile, and follow their learning activity. Approved tutors can manage their tutor profile, submit or update teaching areas, create lesson offers, communicate with students, and track earnings.

This repository contains only the mobile application. It connects to the Mentorise backend API and works together with the separate Admin Web Panel, where administrators manage users, courses, tutor applications, notifications, and platform activity.

## Core Features

### Student Features

* Multi-step registration flow
* Academic profile setup
* Major, year, and course preference selection
* Tutor discovery through swipe and list views
* AI-supported tutor match reasons when provided by the backend
* Tutor profile viewing
* Real-time chat with tutors
* Session offer approval and decline
* Mock payment confirmation flow
* Lesson history grouped by status
* Notification center
* Push notification support
* Profile editing and avatar upload

### Tutor Features

* Tutor application flow
* Teaching scope selection by courses, years, or full major
* Transcript PDF upload
* Tutor application status handling
* Tutor profile editing
* Bio and cover image management
* Session offer creation from chat
* Earnings dashboard
* Per-lesson earnings history
* Real-time communication with students

### Shared Features

* Secure login and logout
* Forgot password and reset password flow
* Protected routes
* Real-time inbox updates
* Read and delivery indicators in chat
* Push notifications
* Profile image upload
* Hebrew and RTL interface
* Mobile-first navigation

## Main User Flows

### Registration and Onboarding

The registration process is split into multiple steps. The user enters personal details, selects an academic major, chooses academic status, and then configures learning preferences.

Supported learning preference options include:

* General tutoring in the user's major
* Specific courses
* Specific academic years
* Decide later

The onboarding state is preserved across screens so users can move between steps without losing the entered information.

### Tutor Discovery

The home screen provides two discovery modes:

* Swipe mode with animated tutor cards
* List mode for traditional browsing

Tutor cards display relevant information such as name, major, academic status, teaching scope, profile image, bio, and match reason when available.

A right swipe creates a match and opens a confirmation screen. From there, the user can open a conversation, view the tutor profile, or continue browsing.

### Tutor Application

Students can apply to become tutors through a structured application flow.

The application includes:

* Terms and requirements screen
* Teaching scope selection
* Course or year selection
* Full major tutoring option
* Optional notes
* Transcript PDF upload
* Application submission to the backend

The application flow also supports update requests for approved tutors who want to change their teaching areas.

### Chat and Inbox

The app includes a real-time chat system backed by STOMP WebSocket.

Chat features include:

* Conversation inbox
* Search by name or last message
* Unread message count
* Real-time message delivery
* Optimistic message rendering
* Delivery and read indicators
* Date separators
* Session offer messages
* Older message loading
* Conversation read tracking

### Session Offers and Lessons

Tutors can create lesson offers directly from the chat screen.

A lesson offer includes:

* Date
* Start time
* Duration
* Auto-calculated price
* Optional note

Students can approve and pay for offers through a mock payment flow or decline them. Lessons are organized into pending, upcoming, and completed sections.

### Notifications

The app supports both in-app notifications and Expo push notifications.

Notification features include:

* Real-time notification updates over WebSocket
* Notification tab with unread count
* Type-based notification icons
* Push notification registration after login
* Navigation to the relevant screen when a push notification is opened
* Mark-as-read behavior when the notification tab is focused

### Profile Management

Users can manage their profile directly from the mobile app.

Profile features include:

* Avatar upload and removal
* Phone number update
* Learning preference display and editing
* Tutor bio editing
* Tutor cover image upload
* Role badge
* Logout

### Tutor Earnings

Approved tutors have access to an earnings screen.

The earnings view includes:

* Current cycle summary
* Total earned amount
* Lesson count
* Per-lesson rows
* Previous earning cycles
* Empty states
* Pull-to-refresh

## Tech Stack

| Layer                   | Technology                                               |
| ----------------------- | -------------------------------------------------------- |
| Framework               | React Native with Expo                                   |
| Navigation              | Expo Router                                              |
| Language                | TypeScript                                               |
| Styling                 | NativeWind                                               |
| HTTP Client             | Axios                                                    |
| Real-Time Communication | STOMP over WebSocket                                     |
| Global State            | React Context and Zustand                                |
| Token Storage           | Expo SecureStore                                         |
| Push Notifications      | Expo Notifications                                       |
| Uploads                 | Cloudinary unsigned upload preset                        |
| Animation               | React Native Reanimated and Animated API                 |
| Icons                   | Lucide React Native and Expo Vector Icons                |
| Forms                   | Custom validation utilities and reusable form components |
| Font                    | Assistant                                                |

## Project Structure

```txt
mentorisemobile/
├── app/                       # Expo Router screens and route groups
│   ├── _layout.tsx            # Root layout, provider tree, route protection
│   ├── (auth)/                # Login and forgot password screens
│   ├── (onboarding)/          # Registration and learning preference setup
│   ├── (tabs)/                # Main authenticated tab navigation
│   ├── chat/[id].tsx          # Chat thread
│   ├── tutor/[id].tsx         # Tutor profile
│   ├── tutor-apply/           # Tutor application flow
│   ├── match/                 # Match confirmation flow
│   ├── earnings.tsx           # Tutor earnings screen
│   └── reset-password.tsx     # Password reset deep link screen
│
├── api/                       # API modules by domain
│   ├── apiClient.tsx          # Authenticated Axios client
│   ├── publicApiClient.tsx    # Public Axios client
│   ├── auth.tsx
│   ├── chatApi.tsx
│   ├── meApi.tsx
│   ├── sessionApi.tsx
│   └── uploadToCloudinary.tsx
│
├── auth/                      # Token storage helpers
├── components/                # Feature components and shared UI
│   ├── chat/
│   ├── earnings/
│   ├── layout/
│   ├── lessons/
│   ├── notifications/
│   ├── tutor-apply/
│   └── ui/
│
├── constants/                 # Routes, API paths, WebSocket config, validators
├── hooks/                     # Providers and reusable hooks
├── store/                     # Zustand stores
├── types/                     # TypeScript DTOs and shared types
└── .env.example               # Environment variable template
```

## Routing

The application uses Expo Router with file-based routing.

Main route groups:

```txt
app/
├── (auth)          # Public authentication screens
├── (onboarding)   # Registration and onboarding
├── (tabs)         # Main authenticated tab navigation
├── chat/[id]      # Dynamic chat screen
├── tutor/[id]     # Dynamic tutor profile screen
└── reset-password # Public reset-password deep link
```

Route protection is centralized in the root layout. Unauthenticated users are redirected to login, while authenticated users are prevented from returning to public authentication screens.

## API Integration

All backend communication is organized through domain-specific API modules under `api/`.

The backend base URL is configured through:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

The app uses two Axios clients:

```txt
apiClient.tsx        # Authenticated requests
publicApiClient.tsx  # Public requests
```

Authenticated requests automatically include:

```txt
Authorization: Bearer <token>
```

A centralized 401 handler clears the stored token, removes the authorization header, resets the authenticated user state, and disconnects the WebSocket client.

## Authentication

The authentication layer is managed by `AuthProvider`.

Responsibilities include:

* Reading the stored token on startup
* Setting the Axios authorization header
* Fetching the current user profile
* Exposing sign-in, sign-out, refresh, and user state
* Clearing state on logout or unauthorized responses

Token storage:

* Native platforms: Expo SecureStore
* Web fallback: localStorage

The token storage key is:

```txt
mentorise_token
```

## Real-Time Communication

The app uses STOMP over WebSocket for real-time features.

Implemented real-time channels include:

* Chat messages
* In-app notifications
* Unread message updates

The WebSocket URL is derived from the backend URL:

```txt
http://...  -> ws://.../ws
https://... -> wss://.../ws
```

The authentication token is sent through STOMP connection headers.

The WebSocket client connects only when the user is authenticated and disconnects automatically on logout.

## Push Notifications

Push notifications are implemented using Expo Notifications.

The app:

* Requests notification permissions
* Retrieves the Expo push token
* Sends the token to the backend after login
* Cleans up notification listeners on unmount
* Routes notification taps to the relevant app screen
* Avoids logging push tokens in production

## Uploads

The app uploads files directly to Cloudinary using an unsigned upload preset.

Supported uploads:

* Profile images
* Tutor cover images
* Tutor application transcript PDFs

Cloudinary configuration is provided through Expo public environment variables:

```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

No Cloudinary API secret or signing key is stored in the mobile application.

## Environment Variables

Create a local `.env` file based on `.env.example`.

Required variables:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Notes:

* Expo public variables are embedded in the client bundle and must not contain secrets.
* API keys, JWT signing secrets, database credentials, and private Cloudinary secrets must not be stored in this repository.
* `.env` files are ignored by Git.

## Installation

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

For a clean start:

```bash
npx expo start --clear
```

## Local Development Notes

When using a physical device, `localhost` points to the device itself, not the development machine.

For a physical device, set:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:8080
```

For Android emulator, a common local backend URL is:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

For iOS simulator, `localhost` may be used when the backend runs on the same machine.

## Build and Quality

Current project status:

* TypeScript compiles with zero errors
* Expo Doctor passes most checks
* Critical and high dependency vulnerabilities were resolved
* Remaining dependency warnings are moderate transitive Expo SDK constraints
* A small number of lint issues remain related to JSX entity escaping and non-blocking warnings

Useful commands:

```bash
npx tsc --noEmit
```

```bash
npx expo-doctor
```

```bash
npx expo lint
```

```bash
npm audit
```

## Security Notes

The mobile app includes several security-oriented implementation details:

* JWT stored with SecureStore on native platforms
* Centralized logout on unauthorized API responses
* Protected routes enforced at the root layout
* WebSocket authentication through STOMP headers
* Push tokens are sent only after login
* Sensitive values are not logged in production
* Runtime configuration is handled through environment variables
* No backend secrets are stored in the mobile app

Cloudinary uploads use an unsigned upload preset, which is a standard approach for client-side uploads. The preset should be restricted in the Cloudinary dashboard by file type, folder, and file size according to deployment needs.

## Related Mentorise Components

The complete Mentorise platform consists of:

* Mentorise Backend API
* Mentorise Mobile App
* Mentorise Admin Panel
* MySQL database
* WebSocket chat infrastructure
* Push notification system
* Cloudinary media storage

This repository contains only the mobile application.

## Summary

Mentorise Mobile App provides the main user-facing experience of the Mentorise platform. It supports students and tutors through onboarding, tutor discovery, real-time communication, session offers, profile management, notifications, and tutor earnings. The app is built with Expo, React Native, TypeScript, secure token storage, centralized API communication, and real-time WebSocket integration.
