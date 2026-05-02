# LinkGuard - Your shield against malicious links

A modern, real-time link safety scanner that validates URLs and QR codes against Google Safe Browsing API to detect malware, phishing attempts, and other threats before you click.

## Features

- **QR Code Scanning**: Scan and decode QR codes instantly using your device camera
- **Image Upload**: Upload a QR code image to extract and validate the URL
- **URL Safety Check**: Paste any URL directly and check if it's safe or malicious
- **Google Safe Browsing**: Real-time threat detection powered by Google's Safe Browsing API
- **Redirect Detection**: Follows redirect chains to check the final destination URL
- **Scan History**: Persistent storage of all previous scans with results and timestamps
- **Responsive Design**: Fully responsive layout that works on mobile, tablet, and desktop devices
- **TypeScript**: Type-safe frontend codebase for better development experience

## Tech Stack

- **Frontend Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.10
- **Language**: TypeScript 6.0.2
- **Styling**: Tailwind CSS 4.2.4
- **QR Code Scanner**: html5-qrcode 2.3.8
- **QR Code Decoder**: jsqr 1.4.0
- **Backend**: Node.js with Express.js 5.2.1
- **ORM**: Prisma 7.8.0
- **Database**: PostgreSQL via Supabase
- **HTTP Client**: Axios 1.15.2
- **External API**: Google Safe Browsing API
- **Linting**: ESLint 10.2.1

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd LinkGuard
```

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:6543/postgres
DIRECT_URL=postgresql://user:password@host:5432/postgres
GOOGLE_API_KEY=your_google_api_key
```

Push the database schema:

```bash
npx prisma db push
npx prisma generate
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Development

Run both servers in separate terminals:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` with hot module reload (HMR) enabled.

The backend will run on `http://localhost:5000`.

## Build

To build the frontend for production:

```bash
cd client
npm run build
```

The optimized build output will be in the `dist/` directory.

## Preview

To preview the production build locally:

```bash
npm run preview
```

## Linting

To run ESLint:

```bash
cd client
npm run lint
```

## Project Structure

```
LinkGuard/
├── client/                     # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/         # Reusable React components
│       │   ├── Scanner.tsx     # QR upload, camera, and URL input
│       │   ├── ScanResult.tsx  # Safety result display card
│       │   └── RecentScans.tsx # Scan history list with skeleton loader
│       ├── types/              # TypeScript type definitions
│       │   └── index.ts
│       ├── App.tsx             # Root application component
│       ├── main.tsx            # Entry point
│       └── index.css           # Global styles
└── server/                     # Express.js backend API
    ├── controllers/
    │   └── scanController.js   # URL scan and history logic
    ├── routes/
    │   └── scan.js             # API route definitions
    ├── prisma/
    │   └── schema.prisma       # Database schema
    ├── prisma.config.mjs       # Prisma v7 configuration
    ├── index.js                # Server entry point
    └── package.json            # Backend dependencies
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scan` | Scan a URL for threats |
| `GET` | `/api/scan/history` | Get all previous scans |

### Example Request

```bash
POST /api/scan
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Example Response

```json
{
  "status": "safe"
}
```

## Security Features

- **Google Safe Browsing API**: Checks URLs against Google's threat database
- **Redirect Chain Detection**: Follows redirects to check the final destination
- **Threat Categories Monitored**:
  - Malware
  - Social Engineering / Phishing
  - Unwanted Software
  - Potentially Harmful Applications
- **Secure API Keys**: Sensitive credentials stored in environment variables

## Deployment

### Frontend → Vercel

1. Import repo in Vercel
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render

1. Create a new **Web Service**
2. Set **Root Directory** to `server`
3. Set **Build Command** to `npm install && npx prisma generate`
4. Set **Start Command** to `node index.js`
5. Add environment variables: `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_API_KEY`, `PORT`
6. Deploy

## Author

Kenneth Jhun N. Balino
Full Stack Developer

Built with React, Node.js, Express, Prisma, and Tailwind CSS