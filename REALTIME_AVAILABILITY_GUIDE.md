# Real-Time Menu Availability Toggle System

This guide explains the complete implementation of the real-time availability toggle system for your restaurant admin panel.

## 🎯 Overview

The system allows restaurant admins to toggle menu item availability in real-time, with instant updates across:
- Admin dashboard (statistics update)
- Customer menu page (items appear/disappear)
- All connected clients (real-time synchronization)

## 🏗️ Architecture

### Backend Components

1. **API Endpoint**: `PUT /api/admin-supabase/menu-items/:id/availability`
2. **Socket.IO Events**: Real-time communication
3. **Database**: Prisma with SQLite/PostgreSQL

### Frontend Components

1. **AvailabilityToggle**: React component for admin panel
2. **Real-time Updates**: Socket.IO integration
3. **Menu Filtering**: Customer menu automatically filters unavailable items

## 📋 Implementation Details

### 1. Backend API Endpoint

**File**: `clean-backend/src/routes/admin-supabase.js`

```javascript
// PUT /api/admin/menu-items/:id/availability
router.put('/menu-items/:id/availability', [
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  // Updates menu item availability
  // Emits real-time events
  // Returns updated statistics
});
```

**Features**:
- Validates boolean input
- Updates database with new availability
- Calculates updated statistics
- Emits real-time events to all connected clients

### 2. Real-Time Events

**Socket.IO Events**:
- `menu.availability.changed` - Notifies all store clients
- `menu.statistics.updated` - Updates admin dashboard statistics

**Event Payload**:
```javascript
{
  itemId: "item_id",
  itemName: "Paneer Tikka",
  isAvailable: true,
  statistics: {
    totalItems: 91,
    availableItems: 85,
    outOfStockItems: 6
  },
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

### 3. Frontend Components

#### AvailabilityToggle Component

**File**: `clean-frontend/src/components/AvailabilityToggle.jsx`

**Features**:
- Visual toggle switch
- Loading states
- Error handling
- Real-time status updates

**Usage**:
```jsx
<AvailabilityToggle
  itemId={item.id}
  isAvailable={item.isAvailable}
  onToggle={handleAvailabilityToggle}
  storeSlug="siddhi"
/>
```

#### Updated MenuItemCard

**File**: `clean-frontend/src/components/MenuItemCard.jsx`

**Features**:
- Shows "Out of Stock" badge for unavailable items
- Disables "Add to Cart" button for unavailable items
- Visual opacity changes for unavailable items

### 4. Real-Time Integration

#### Admin Panel

**File**: `clean-frontend/src/pages/admin/MenuManagementWithSidebar.jsx`

**Features**:
- Joins admin room for real-time updates
- Updates statistics in real-time
- Handles toggle state changes

#### Customer Menu

**File**: `clean-frontend/src/pages/Menu.jsx`

**Features**:
- Listens for availability changes
- Automatically refetches menu data
- Filters out unavailable items

## 🚀 Usage Instructions

### For Admins

1. **Navigate to Menu Management**
   - Go to `/admin/menu`
   - Select "Menu Items" tab

2. **Toggle Availability**
   - Find the item you want to update
   - Click the toggle switch on the right
   - Watch statistics update in real-time

3. **Visual Indicators**
   - Green toggle = Available
   - Red toggle = Out of Stock
   - Loading spinner during updates

### For Customers

1. **Real-Time Updates**
   - Menu automatically updates when admin changes availability
   - Unavailable items show "Out of Stock" badge
   - "Add to Cart" button is disabled for unavailable items

2. **Visual Feedback**
   - Unavailable items have reduced opacity
   - Clear "Out of Stock" indicators
   - Disabled interaction states

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
FRONTEND_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000
```

### Socket.IO Configuration

The system uses Socket.IO for real-time communication:

- **Admin Room**: `admin-{storeSlug}` - For admin-specific updates
- **Store Room**: `store-{storeSlug}` - For customer updates
- **Auto-reconnection**: Built-in reconnection logic
- **Error Handling**: Graceful fallbacks

## 📊 Database Schema

The system uses the existing `MenuItem` model:

```prisma
model MenuItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  isAvailable Boolean  @default(true)  // ← This field controls availability
  isVeg       Boolean  @default(true)
  // ... other fields
}
```

## 🎨 UI/UX Features

### Admin Panel
- **Toggle Switch**: Intuitive on/off control
- **Status Labels**: Clear "Available"/"Out of Stock" indicators
- **Loading States**: Visual feedback during updates
- **Statistics**: Real-time counter updates

### Customer Menu
- **Visual Feedback**: Opacity changes for unavailable items
- **Status Badges**: Clear "Out of Stock" indicators
- **Disabled States**: Non-interactive buttons for unavailable items
- **Real-Time Updates**: Instant availability changes

## 🔄 Real-Time Flow

1. **Admin Action**: Admin toggles availability in admin panel
2. **API Call**: Frontend calls `PUT /api/admin/menu-items/:id/availability`
3. **Database Update**: Backend updates `isAvailable` field
4. **Statistics Calculation**: Backend calculates new statistics
5. **Socket Emission**: Backend emits events to all connected clients
6. **Admin Update**: Admin dashboard statistics update instantly
7. **Customer Update**: Customer menu page updates item availability
8. **Visual Feedback**: All clients see changes immediately

## 🛠️ Troubleshooting

### Common Issues

1. **Toggle Not Working**
   - Check network connection
   - Verify API endpoint is accessible
   - Check browser console for errors

2. **Real-Time Updates Not Working**
   - Verify Socket.IO connection
   - Check if admin joined correct room
   - Ensure backend is emitting events

3. **Statistics Not Updating**
   - Check if admin panel is listening for events
   - Verify statistics calculation in backend
   - Check browser console for event logs

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
// Listen for all socket events
socket.onAny((event, ...args) => {
  console.log('Socket event:', event, args);
});
```

## 🚀 Production Considerations

### Performance
- **Database Indexing**: Index on `isAvailable` field for faster queries
- **Connection Limits**: Monitor Socket.IO connection count
- **Caching**: Consider Redis for high-traffic scenarios

### Security
- **Authentication**: Ensure admin authentication for toggle operations
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: Validate all toggle inputs

### Monitoring
- **Event Logging**: Log all availability changes
- **Error Tracking**: Monitor failed toggle operations
- **Performance Metrics**: Track real-time update latency

## 📈 Future Enhancements

1. **Bulk Operations**: Toggle multiple items at once
2. **Scheduled Availability**: Set availability schedules
3. **Inventory Integration**: Link with stock levels
4. **Analytics**: Track availability patterns
5. **Notifications**: Alert when items go out of stock

## 🎯 Key Benefits

- **Real-Time**: Instant updates across all clients
- **User-Friendly**: Intuitive toggle interface
- **Scalable**: Handles multiple admins and customers
- **Reliable**: Built-in error handling and reconnection
- **Production-Ready**: Clean, maintainable code

This system provides a complete real-time availability management solution for your restaurant admin panel, ensuring customers always see accurate menu availability while giving admins full control over their inventory.
