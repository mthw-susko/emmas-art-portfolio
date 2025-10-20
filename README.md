# Emma's Artist Portfolio

A modern, responsive artist portfolio website built with Next.js, TypeScript, Firebase, and Framer Motion. Features an easy-to-use admin interface for content management.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Admin Interface**: Secret login (triple-click Emma's name) for easy content management
- **Artwork Gallery**: Masonry-style grid layout with smooth animations
- **Individual Artwork Pages**: Focused view with title, description, and "more works" section
- **About Page**: Two-column layout with bio, skills, clients, and contact form
- **Firebase Integration**: Real-time data sync and secure authentication
- **Smooth Animations**: Framer Motion for delightful user experience

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd emmas-portfolio
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Get your Firebase config from Project Settings

### 3. Environment Variables

Create a `.env.local` file in the root directory with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important**: The build will fail without valid Firebase credentials. Make sure to set up Firebase first before building for production.

### 4. Firestore Collections

The app expects these Firestore collections:

#### `/artworks`
```javascript
{
  title: string,
  description?: string,
  imageUrl: string,
  order: number,
  createdAt: timestamp
}
```

#### `/about/content`
```javascript
{
  bio: string,
  email: string,
  instagram: string,
  portraitUrl?: string,
  skills: [
    { name: string, percentage: number }
  ],
  clients: [string]
}
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Note**: The admin functionality requires Firebase setup. Without Firebase credentials, you can still view the public pages, but admin features won't work.

## Admin Access

To access the admin interface:
1. Click on "Emma" in the header 3 times quickly
2. Enter the admin email and password
3. You'll be able to manage artworks and edit the about page

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your Firebase environment variables in Vercel's dashboard
4. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## Customization

### Changing the Artist Name

Update the `artistName` prop in `src/components/Header.tsx`:

```tsx
<Header artistName="Your Name" />
```

### Styling

The app uses Tailwind CSS. Key customization points:
- Colors: Update the color palette in `tailwind.config.ts`
- Fonts: Modify font imports in `src/app/globals.css`
- Layout: Adjust spacing and sizing in component files

### Adding New Features

The codebase is well-structured for easy extension:
- Components are in `src/components/`
- Pages are in `src/app/`
- Types are defined in `src/types/index.ts`
- Firebase utilities are in `src/lib/`

## Support

For questions or issues, please check the documentation or create an issue in the repository.# emmas-art-portfolio
