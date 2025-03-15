/**
 * E-commerce Shop Plugin
 *
 * A comprehensive e-commerce solution for the CMS platform
 */

import {
  ShoppingCart,
  Package,
  CreditCard,
  Tag,
  Settings,
  ShoppingBag,
} from "lucide-react";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import CategoryList from "./components/CategoryList";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminCategories from "./admin/AdminCategories";
import AdminAttributes from "./admin/AdminAttributes";
import AdminSettings from "./admin/AdminSettings";
import { initializeEcommerceStore } from "./store";
import { setupEcommerceDatabase } from "./database";

/**
 * Plugin metadata
 */
export const metadata = {
  id: "ecommerce-shop",
  name: "E-commerce Shop",
  version: "1.0.0",
  description:
    "Complete e-commerce solution with product management, shopping cart, checkout, and order processing",
  author: "Tempo CMS",
  icon: "ShoppingCart",
  dependencies: [],
};

/**
 * Initialize the plugin
 * @param {Object} api - Plugin API
 */
export async function initialize(api) {
  // Initialize the e-commerce database
  await setupEcommerceDatabase();

  // Initialize the store
  initializeEcommerceStore();

  // Register frontend routes
  api.registerRoute({
    id: "ecommerce-products",
    path: "/shop",
    component: ProductList,
    exact: true,
  });

  api.registerRoute({
    id: "ecommerce-product-detail",
    path: "/shop/product/:id",
    component: ProductDetail,
  });

  api.registerRoute({
    id: "ecommerce-categories",
    path: "/shop/categories",
    component: CategoryList,
  });

  api.registerRoute({
    id: "ecommerce-category-products",
    path: "/shop/category/:id",
    component: ProductList,
  });

  api.registerRoute({
    id: "ecommerce-cart",
    path: "/shop/cart",
    component: Cart,
  });

  api.registerRoute({
    id: "ecommerce-checkout",
    path: "/shop/checkout",
    component: Checkout,
  });

  api.registerRoute({
    id: "ecommerce-order-confirmation",
    path: "/shop/order-confirmation/:id",
    component: OrderConfirmation,
  });

  // Register admin routes and panels
  api.registerRoute({
    id: "ecommerce-admin-products",
    path: "/admin/ecommerce/products",
    component: AdminProducts,
  });

  api.registerRoute({
    id: "ecommerce-admin-orders",
    path: "/admin/ecommerce/orders",
    component: AdminOrders,
  });

  api.registerRoute({
    id: "ecommerce-admin-categories",
    path: "/admin/ecommerce/categories",
    component: AdminCategories,
  });

  api.registerRoute({
    id: "ecommerce-admin-attributes",
    path: "/admin/ecommerce/attributes",
    component: AdminAttributes,
  });

  api.registerRoute({
    id: "ecommerce-admin-settings",
    path: "/admin/ecommerce/settings",
    component: AdminSettings,
  });

  // Register menu items
  api.registerMenuItem({
    id: "ecommerce-shop",
    title: "Shop",
    icon: "ShoppingCart",
    path: "/shop",
    order: 30,
  });

  // Register admin menu items
  api.registerMenuItem({
    id: "ecommerce-admin",
    title: "E-commerce",
    icon: "ShoppingBag",
    path: "/admin/ecommerce",
    order: 40,
  });

  api.registerMenuItem({
    id: "ecommerce-admin-products",
    title: "Products",
    icon: "Package",
    path: "/admin/ecommerce/products",
    parent: "ecommerce-admin",
    order: 10,
  });

  api.registerMenuItem({
    id: "ecommerce-admin-orders",
    title: "Orders",
    icon: "ShoppingBag",
    path: "/admin/ecommerce/orders",
    parent: "ecommerce-admin",
    order: 20,
  });

  api.registerMenuItem({
    id: "ecommerce-admin-categories",
    title: "Categories",
    icon: "Tag",
    path: "/admin/ecommerce/categories",
    parent: "ecommerce-admin",
    order: 30,
  });

  api.registerMenuItem({
    id: "ecommerce-admin-attributes",
    title: "Attributes",
    icon: "Settings",
    path: "/admin/ecommerce/attributes",
    parent: "ecommerce-admin",
    order: 40,
  });

  api.registerMenuItem({
    id: "ecommerce-admin-settings",
    title: "Shop Settings",
    icon: "Settings",
    path: "/admin/ecommerce/settings",
    parent: "ecommerce-admin",
    order: 50,
  });

  // Register settings panel
  api.registerSettingsPanel({
    id: "ecommerce-settings",
    title: "E-commerce Settings",
    icon: "ShoppingCart",
    component: AdminSettings,
    order: 30,
  });

  // Subscribe to events
  api.events.on("content:published", handleContentPublished);

  // Return cleanup function
  return () => {
    api.events.off("content:published", handleContentPublished);
  };
}

/**
 * Handle content published event
 * @param {Object} content - Published content
 */
function handleContentPublished(content) {
  // Handle content published event if needed
  console.log(
    "Content published, checking if product needs updating:",
    content,
  );
}

/**
 * Clean up the plugin
 */
export async function cleanup() {
  // Clean up resources when plugin is deactivated
  console.log("E-commerce plugin cleanup");
}
