# Sahayak: Digital Mental Health Support System for Higher Education

<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-handshake-icon lucide-heart-handshake"><path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762"/></svg>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-green)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

![img.png](img.png)

## 📋 Overview

Sahayak is a comprehensive digital mental health platform specifically designed for higher education institutions to address the growing mental health crisis among college students. Our platform provides culturally-sensitive, institution-specific psychological support through AI-guided interventions, professional counseling integration, and peer support systems.

Unlike generic Western-oriented mental health applications, Sahayak fills a critical gap with features tailored to diverse cultural contexts, multilingual support, and institution-specific customization.

## 🚀 Features

### For Students

- **Advanced Emotional Check-ins**: 300+ emotions categorized into color-coded sections
- **Personalized Wellness Toolkits**: Breathing exercises, videos, and audio content
- **AI Chatbot "Sage"**: 3D avatar support with multilingual capabilities
- **Confidential Therapist Booking**: Identity protection options
- **Encrypted Peer Forums**: AI moderation for safe community support

### For Therapists

- **Client Dashboard**: Comprehensive user data access
- **Integrated Session Management**: Note-taking capabilities
- **Tool Recommendation System**: Personalized resources for clients
- **Forum Moderation**: Professional oversight of community interactions

### For Administrators

- **Anonymous Institutional Analytics**: Data-driven insights
- **Therapist Management System**: Resource allocation optimization
- **Policy Insights**: Timestamped analytics for decision-making

## 🔒 Security

All user data is encrypted using SHA256 for maximum privacy and security. The platform emphasizes confidentiality across all interactions, with special attention to anonymous forum participation.

## 🛠️ Tech Stack

### Frontend

- React 19.1.0
- TypeScript 5.8.3
- Three.js (for 3D avatar)
- Framer Motion (animations)
- Radix UI (accessible components)

### Backend

- Express.js 4.18.2
- MongoDB with Mongoose 7.5.0
- Node.js with TypeScript
- JWT Authentication
- Google Auth integration

### AI & ML

- Google Generative AI integration
- ElevenLabs Voice AI
- GROQ SDK for language processing

## 📊 Platform Architecture

```
┌───────────────────┐    ┌────────────────────┐    ┌───────────────────┐
│  Student Portal   │    │  Therapist Portal  │    │   Admin Portal    │
└─────────┬─────────┘    └──────────┬─────────┘    └─────────┬─────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                           Shared API Layer                             │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Authentication & Authorization                    │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌──────────┬────────────┬──────────────┬────────────┬─────────────────┐
│ Emotional │  AI Chat  │  Counseling  │  Forums &  │  Analytics &    │
│ Tracking  │  Service  │  Management  │ Community  │  Reporting      │
└──────────┴────────────┴──────────────┴────────────┴─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm package manager
- MongoDB instance

### Installation

```bash
# Clone the repository
git clone https://github.com/iamtanishqsethi/RUOK-SIH
cd Sahayak

# Open Backend Folder
cd backend

# Install dependencies
npm install

# Set up environment variables
touch .env
# Edit .env with your configuration

# Start development server
npm run dev

# Open Frontend Folder
cd frontend

# Install dependencies
npm install

# Set up environment variables
touch .env
# Edit .env with your configuration

# Start development server
npm run dev
```

[//]: # "### Environment Variables"
[//]: #
[//]: # "Create a `.env` file with the following variables:"
[//]: #
[//]: # "```"
[//]: # "MONGODB_URI=your_mongodb_connection_string"
[//]: # "JWT_KEY=your_JWT_KEY"
[//]: # "GOOGLE_CLIENT_ID=your_google_client_id"
[//]: # "ELEVENLABS_API_KEY=your_elevenlabs_api_key"
[//]: # "GOOGLE_AI_API_KEY=your_google_ai_api_key"
[//]: # "CLOUDINARY_CLOUD_NAME=your_cloudinary_name"
[//]: # "CLOUDINARY_API_KEY=your_cloudinary_api_key"
[//]: # "CLOUDINARY_API_SECRET=your_cloudinary_api_secret"
[//]: # "```"

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
