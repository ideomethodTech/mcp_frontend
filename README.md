# MCP Frontend - AI Learning Hub

A modern Next.js frontend application for the Model Context Protocol (MCP) AI Learning Hub. This application provides an intuitive interface for AI-powered educational tools including chat, lesson planning, worksheet generation, and more.

## 🚀 Features

- **AI Chat Interface** - Interactive conversations with learning materials
- **Lesson Plan Generator** - AI-powered lesson planning tools
- **Worksheet Generator** - Create diverse educational worksheets
- **Answer Key Generator** - Automatic answer key generation
- **PPT Generator** - Transform content into presentations
- **Firebase Authentication** - Secure user authentication
- **Modern UI** - Built with Tailwind CSS and Radix UI components

## 🛠️ Tech Stack

- **Framework:** Next.js 15.3.3 with App Router
- **Styling:** Tailwind CSS + Radix UI
- **Authentication:** Firebase Auth
- **AI Integration:** Google Genkit
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mcp_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit in watch mode

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (main)/            # Protected main application routes
│   ├── admin/             # Admin panel
│   ├── login/             # Authentication pages
│   └── signup/
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── auth/             # Authentication components
├── contexts/             # React contexts
├── hooks/               # Custom React hooks
├── lib/                # Utility functions and configurations
└── ai/                 # AI integration and flows
    └── flows/          # Genkit AI flows
```

## 🔐 Authentication

The application supports:
- Email/Password authentication
- Google Sign-in
- Demo credentials for testing: `admin` / `admin`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of the MCP (Model Context Protocol) Learning Hub ecosystem.

---

**Related Projects:**
- Backend: [mcp_backend](https://github.com/ideomethodTech/mcp_backend)
