# SIDDHI Frontend

A modern, mobile-first food ordering system frontend built with React, Vite, and Tailwind CSS.

## Features

- 🍽️ **Menu Display** - Beautiful menu with categories and search
- 🛒 **Shopping Cart** - Add items, manage quantities, and checkout
- 💳 **Payment Integration** - Razorpay payment gateway integration
- 📱 **Mobile-First Design** - Optimized for mobile devices
- 🔄 **Real-time Updates** - Live order status updates via Socket.IO
- 👨‍💼 **Admin Dashboard** - Complete admin interface for restaurant management
- 🎫 **Coupon System** - Apply and manage discount coupons
- 📊 **Order Tracking** - Real-time order status tracking

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router DOM
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd siddhi-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   # ... other variables
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── CartDrawer.jsx  # Shopping cart drawer
│   ├── MenuItemCard.jsx # Menu item display card
│   └── ...
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── Landing.jsx     # Home page
│   ├── Menu.jsx        # Menu page
│   ├── Checkout.jsx    # Checkout page
│   └── OrderStatus.jsx # Order tracking page
├── lib/                # Utility libraries
│   ├── api.js          # API client
│   └── socket.js       # Socket.IO client
├── store/              # State management
│   └── store.js        # Zustand stores
└── App.jsx             # Main app component
```

## Key Features

### Customer Features

- **Landing Page**: Welcome screen with navigation
- **Menu Page**: Browse menu by categories with search
- **Shopping Cart**: Add/remove items, manage quantities
- **Checkout**: Customer information and payment
- **Order Tracking**: Real-time order status updates

### Admin Features

- **Dashboard**: Key metrics and recent activity
- **Order Management**: View and update order status
- **Menu Management**: Manage menu items and categories
- **Inventory Management**: Track stock levels
- **Customer Management**: View customer database
- **Coupon Management**: Create and manage discounts
- **Reports**: Sales analytics and insights
- **Notifications**: Send customer notifications

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key | Yes |
| `VITE_SUPABASE_URL` | Supabase URL (optional) | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (optional) | No |

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

### Vercel

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to your web server

## API Integration

The frontend communicates with the backend API through:

- **REST API**: For CRUD operations
- **Socket.IO**: For real-time updates
- **Razorpay**: For payment processing

## State Management

The application uses Zustand for state management with separate stores:

- **Cart Store**: Shopping cart state
- **App Store**: Global app state
- **Order Store**: Order-related state
- **Admin Store**: Admin dashboard state

## Real-time Features

Socket.IO integration provides:

- Live order status updates
- Payment confirmations
- Inventory alerts
- Admin notifications

## Responsive Design

The application is built mobile-first with:

- Responsive grid layouts
- Touch-friendly interactions
- Optimized for small screens
- Progressive enhancement for larger screens

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
# Updated for Netlify deployment
