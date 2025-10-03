const { supabaseAdmin } = require('./supabase');

class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.isSupabaseAvailable = supabaseAdmin !== null;
  }

  // Subscribe to order changes for admin dashboard
  subscribeToOrders(storeSlug, callback) {
    if (!this.isSupabaseAvailable) {
      console.log('💾 SQLite mode: Real-time subscriptions not available');
      return null;
    }

    const subscription = supabaseAdmin
      .channel(`orders:${storeSlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeSlug}`
        },
        (payload) => {
          console.log('📦 Order update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.subscriptions.set(`orders:${storeSlug}`, subscription);
    return subscription;
  }

  // Subscribe to customer changes
  subscribeToCustomers(callback) {
    if (!this.isSupabaseAvailable) {
      console.log('💾 SQLite mode: Real-time subscriptions not available');
      return null;
    }

    const subscription = supabaseAdmin
      .channel('customers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('👤 Customer update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('customers', subscription);
    return subscription;
  }

  // Subscribe to order item changes
  subscribeToOrderItems(orderId, callback) {
    if (!this.isSupabaseAvailable) {
      console.log('💾 SQLite mode: Real-time subscriptions not available');
      return null;
    }

    const subscription = supabaseAdmin
      .channel(`order_items:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('🛒 Order item update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.subscriptions.set(`order_items:${orderId}`, subscription);
    return subscription;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName) {
    if (!this.isSupabaseAvailable) {
      return;
    }

    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      supabaseAdmin.removeChannel(subscription);
      this.subscriptions.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    if (!this.isSupabaseAvailable) {
      return;
    }

    for (const [channelName, subscription] of this.subscriptions) {
      supabaseAdmin.removeChannel(subscription);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
    this.subscriptions.clear();
  }

  // Get real-time order data
  async getOrdersRealtime(storeSlug) {
    if (!this.isSupabaseAvailable) {
      console.log('💾 SQLite mode: Real-time data not available');
      return [];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          store:stores(*),
          order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('store_id', storeSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      throw error;
    }
  }

  // Get real-time customer data
  async getCustomersRealtime() {
    if (!this.isSupabaseAvailable) {
      console.log('💾 SQLite mode: Real-time data not available');
      return [];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select(`
          *,
          orders(
            id,
            order_number,
            total,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      throw error;
    }
  }

  // Get real-time dashboard data
  async getDashboardDataRealtime(storeSlug) {
    if (!this.isSupabaseAvailable) {
      console.log('💾 SQLite mode: Real-time data not available');
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        recentOrders: []
      };
    }

    try {
      // Get orders for the store
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('store_id', storeSlug);

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
      const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;

      // Get recent orders with customer details
      const { data: recentOrders, error: recentError } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          order_items(
            quantity,
            menu_item:menu_items(name)
          )
        `)
        .eq('store_id', storeSlug)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          items: order.order_items.map(item => 
            `${item.quantity}x ${item.menu_item.name}`
          ).join(', '),
          total: order.total,
          status: order.status,
          createdAt: order.created_at,
          paymentMethod: order.payment_method
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      throw error;
    }
  }
}

module.exports = new RealtimeService();
