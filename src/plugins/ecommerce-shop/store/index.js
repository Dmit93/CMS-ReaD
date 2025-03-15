/**
 * E-commerce Store
 *
 * Manages the state for the e-commerce functionality
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Create the store with persistence
export const useEcommerceStore = create(
  persist(
    (set, get) => ({
      // Cart state
      cart: [],
      cartTotal: 0,
      cartCount: 0,

      // User checkout information
      checkoutInfo: {
        shippingAddress: {},
        billingAddress: {},
        paymentMethod: null,
        shippingMethod: null,
      },

      // Orders
      orders: [],
      currentOrder: null,

      // Actions
      addToCart: (product, quantity = 1, attributes = {}) => {
        const cart = get().cart;
        const existingItemIndex = cart.findIndex(
          (item) =>
            item.product.id === product.id &&
            JSON.stringify(item.attributes) === JSON.stringify(attributes),
        );

        let newCart;
        if (existingItemIndex >= 0) {
          // Update existing item
          newCart = [...cart];
          newCart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          newCart = [...cart, { product, quantity, attributes }];
        }

        // Calculate totals
        const cartTotal = calculateCartTotal(newCart);
        const cartCount = calculateCartCount(newCart);

        set({ cart: newCart, cartTotal, cartCount });
      },

      updateCartItem: (index, quantity) => {
        const cart = [...get().cart];
        if (index >= 0 && index < cart.length) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.splice(index, 1);
          } else {
            // Update quantity
            cart[index].quantity = quantity;
          }

          // Calculate totals
          const cartTotal = calculateCartTotal(cart);
          const cartCount = calculateCartCount(cart);

          set({ cart, cartTotal, cartCount });
        }
      },

      removeFromCart: (index) => {
        const cart = [...get().cart];
        if (index >= 0 && index < cart.length) {
          cart.splice(index, 1);

          // Calculate totals
          const cartTotal = calculateCartTotal(cart);
          const cartCount = calculateCartCount(cart);

          set({ cart, cartTotal, cartCount });
        }
      },

      clearCart: () => {
        set({ cart: [], cartTotal: 0, cartCount: 0 });
      },

      updateCheckoutInfo: (info) => {
        set({
          checkoutInfo: {
            ...get().checkoutInfo,
            ...info,
          },
        });
      },

      createOrder: async (orderData) => {
        // In a real implementation, this would call an API
        const newOrder = {
          id: `order-${Date.now()}`,
          ...orderData,
          status: "pending",
          createdAt: new Date().toISOString(),
          items: [...get().cart],
          total: get().cartTotal,
        };

        const orders = [...get().orders, newOrder];

        set({
          orders,
          currentOrder: newOrder,
          cart: [],
          cartTotal: 0,
          cartCount: 0,
        });

        return newOrder;
      },

      getOrder: (orderId) => {
        return get().orders.find((order) => order.id === orderId) || null;
      },
    }),
    {
      name: "ecommerce-storage",
    },
  ),
);

// Helper functions
function calculateCartTotal(cart) {
  return cart.reduce((total, item) => {
    const price = item.product.salePrice || item.product.price;
    return total + price * item.quantity;
  }, 0);
}

function calculateCartCount(cart) {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Initialize the store
export function initializeEcommerceStore() {
  // Any initialization logic can go here
  console.log("E-commerce store initialized");
}
