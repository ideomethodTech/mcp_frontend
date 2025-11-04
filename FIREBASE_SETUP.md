# Firebase Authentication Setup

This project uses Firebase Authentication for user authentication with Google OAuth.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Google Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Enable it and add your project support email
4. Save the changes

### 3. Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click on the web icon (`</>`) to create a web app
4. Register your app with a nickname
5. Copy the configuration values

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Add Authorized Domains (Important!)

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your development domain (`localhost`)
3. Add your production domain (when deploying)

### 6. Run the Application

```bash
npm run dev
```

## Authentication Features

- ✅ Google OAuth sign-in
- ✅ Email/password sign-in
- ✅ Email/password sign-up
- ✅ Protected routes
- ✅ User session persistence
- ✅ Automatic logout on token expiry
- ✅ User profile display (name, email, photo)

## Authentication Flow

1. User visits the application
2. If not logged in, redirected to `/login`
3. User can sign in with Google or email/password
4. After successful authentication, redirected to dashboard
5. All protected routes require authentication
6. User can logout from the header dropdown menu

## Environment Variables Format

Replace the following values in `.env.local`:

- `your_api_key_here`: Your Firebase API key
- `your_project_id`: Your Firebase project ID
- `your_project_id.firebaseapp.com`: Your auth domain
- `your_project_id.appspot.com`: Your storage bucket
- `your_sender_id`: Your messaging sender ID
- `your_app_id`: Your Firebase app ID

## Troubleshooting

### Common Issues

1. **"Firebase is not defined" error**
   - Make sure you've added all environment variables
   - Restart the development server after adding `.env.local`

2. **Google sign-in not working**
   - Verify Google authentication is enabled in Firebase Console
   - Check that you've added the correct authorized domains
   - Ensure OAuth consent screen is configured

3. **Environment variables not loading**
   - Make sure `.env.local` is in the root directory
   - Variables must start with `NEXT_PUBLIC_`
   - Restart the dev server after changes

