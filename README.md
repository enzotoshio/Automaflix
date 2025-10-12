# 🎬 Automaflix

A modern movie and TV series discovery application built with React, TypeScript, and Tailwind CSS. Automaflix provides a Netflix-like interface for browsing and searching movies, TV series, and episodes using the OMDb API.

## ✨ Features

- **Home Page**: Curated collections of featured movies, TV series, and episodes
- **Search Functionality**: Real-time search with filtering by media type (Movies, Series, Episodes)
- **Responsive Design**: Mobile-first design that works on all devices
- **Media Details**: Detailed view for movies and series with ratings, cast, and plot
- **State Management**: Efficient data fetching with TanStack

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with custom animations
- **Routing**: TanStack Router for type-safe routing
- **State Management**: TanStack Query for server state
- **UI Components**: Custom components with Radix UI primitives
- **API**: OMDb API for movie data
- **Code Quality**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/enzotoshio/Automaflix.git
   cd Automaflix
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Environment Setup

The application uses the OMDb API. For production use, you may need to obtain an API key from [OMDb API](http://www.omdbapi.com/apikey.aspx) and configure it in your environment.

## 📁 Project Structure

```
src/
├── api/              # API layer and types
│   └── movies.ts     # OMDb API integration
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (Button, Input)
│   ├── ContentCard.tsx
│   ├── ContentRow.tsx
│   └── Navbar.tsx
├── contexts/         # React contexts
│   └── search/      # Search state management
├── layout/          # Layout components
│   └── AppLayout.tsx
├── pages/           # Page components
│   ├── Home/
│   ├── MediaDetail/
│   ├── NotFound/
│   └── SearchResults/
├── lib/             # Utility functions
└── routes.tsx       # Route definitions
```

## 🎯 Key Features Explained

### Home Page Collections

- **Featured Movies**: Curated selection of popular movies including Batman Begins, The Dark Knight, Avengers: Endgame
- **Featured Series**: Popular TV shows like Game of Thrones, Breaking Bad, Rick and Morty
- **Featured Episodes**: Iconic episodes from beloved series

### Search System

- **Real-time Search**: Search as you type functionality
- **Type Filtering**: Filter results by Movies, Series, or Episodes
- **Pagination**: Navigate through multiple pages of results
- **Responsive Grid**: Adaptive layout for different screen sizes

### Media Details

- Comprehensive information including ratings, cast, plot, and technical details
- Integration with multiple rating sources (IMDb, Rotten Tomatoes, Metacritic)

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling and Theming

The application uses Tailwind CSS v4 with custom configuration:

- **Dark Theme**: Netflix-inspired dark color scheme
- **Custom Animations**: Smooth transitions and hover effects
- **Responsive Design**: Mobile-first approach with breakpoint-specific styles
- **Component Variants**: Using `class-variance-authority` for component styling

## 🔧 Configuration

### Vite Configuration

- **Path Aliases**: `@/` points to `src/` directory
- **Proxy Setup**: API requests proxied to OMDb API
- **Build Optimization**: TypeScript compilation and Vite bundling

### TypeScript

- Strict mode enabled
- Path mapping configured
- React 19 types included

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Enzo Toshio** - [GitHub](https://github.com/enzotoshio)

Project Link: [https://github.com/enzotoshio/Automaflix](https://github.com/enzotoshio/Automaflix)
