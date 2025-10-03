# 🔍 Debug Real-Time Updates

## 🚨 Current Issue
Real-time updates are not working - customer menu still requires refresh to see changes.

## 🛠️ Debugging Steps

### 1. **Check Backend Server**
```bash
# Start backend
./start-backend.sh

# Check if server is running
curl http://localhost:5000/api/menu?store=siddhi
```

### 2. **Test Socket Connection**
```bash
# Run socket debug script
node debug-socket.js
```

### 3. **Check Browser Console**
1. Open customer menu: `http://localhost:3000/menu?store=siddhi`
2. Open browser DevTools (F12)
3. Check Console tab for socket connection logs
4. Look for:
   - `🔌 Setting up real-time menu updates for store: siddhi`
   - `✅ Socket connected for menu updates`
   - `📡 Socket connected, setting up menu listeners`

### 4. **Test Admin Panel**
1. Open admin panel: `http://localhost:3000/admin/menu`
2. Toggle any menu item
3. Check browser console for:
   - `🔄 Menu availability changed:` event
   - Toast notifications

### 5. **Manual Testing**
1. **Admin Panel**: Toggle Paneer Tikka OFF
2. **Customer Menu**: Should show "Out of Stock" immediately
3. **Admin Panel**: Toggle Paneer Tikka ON  
4. **Customer Menu**: Should show "Available" immediately

## 🔧 Potential Issues & Solutions

### Issue 1: Socket Connection Failed
**Symptoms**: No socket connection logs in console
**Solution**: 
- Check if backend is running on port 5000
- Check CORS settings in backend
- Check firewall/network issues

### Issue 2: Events Not Received
**Symptoms**: Socket connects but no events received
**Solution**:
- Check if admin panel is emitting events
- Check room joining (`store-siddhi`)
- Check event names match exactly

### Issue 3: Cache Not Invalidating
**Symptoms**: Events received but UI not updating
**Solution**:
- Check React Query cache invalidation
- Check if refetch is being called
- Check component re-rendering

### Issue 4: Network Issues
**Symptoms**: Intermittent connection problems
**Solution**:
- Use fallback refresh mechanism
- Check network stability
- Use polling as fallback

## 🎯 Quick Fixes Applied

### 1. **Enhanced Socket Connection**
- Added better connection handling
- Added connection status tracking
- Added fallback mechanisms

### 2. **Improved Event Handling**
- Added multiple event listeners
- Added connection state tracking
- Added error handling

### 3. **Fallback Mechanisms**
- Auto-refresh every 10 seconds if socket disconnected
- Manual refresh button
- Page visibility change detection

### 4. **Better Debugging**
- Added console logs for all steps
- Added connection status indicators
- Added error tracking

## 🧪 Test Commands

### Test Backend API
```bash
curl -X PUT http://localhost:5000/api/admin-supabase/menu-items/ITEM_ID/availability?store=siddhi \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'
```

### Test Socket Connection
```bash
node debug-socket.js
```

### Test Frontend
1. Open customer menu
2. Check console for socket logs
3. Use manual refresh button if needed

## 🎯 Expected Behavior

### ✅ **Working Real-Time Updates**
1. Admin toggles item → Backend emits event
2. Customer menu receives event → Shows toast
3. Menu updates instantly → No refresh needed
4. Visual feedback → "Updating..." indicator

### ❌ **Current Issue**
- Events might not be reaching frontend
- Socket connection might be failing
- Cache invalidation might not work
- Component might not re-render

## 🚀 Next Steps

1. **Run the debug script** to check socket connection
2. **Check browser console** for error messages
3. **Test manual refresh** to verify API works
4. **Check network tab** for failed requests
5. **Verify backend logs** for emitted events

## 💡 Temporary Solution

If real-time updates still don't work:
1. Use the manual "🔄 Refresh" button
2. The fallback auto-refresh every 10 seconds
3. Page visibility change detection

The system will still work, just not as smoothly as intended.
