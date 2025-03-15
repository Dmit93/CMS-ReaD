import React from "react";
import { useNavigate } from "react-router-dom";
import { useEcommerceStore } from "../store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, updateCartItem, removeFromCart, clearCart } =
    useEcommerceStore((state) => ({
      cart: state.cart,
      cartTotal: state.cartTotal,
      updateCartItem: state.updateCartItem,
      removeFromCart: state.removeFromCart,
      clearCart: state.clearCart,
    }));

  const handleQuantityChange = (index, newQuantity) => {
    updateCartItem(index, newQuantity);
  };

  const handleRemoveItem = (index) => {
    removeFromCart(index);
  };

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  const handleProceedToCheckout = () => {
    navigate("/shop/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

          <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cart.length})</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div
                      className="w-full sm:w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0 cursor-pointer"
                      onClick={() =>
                        navigate(`/shop/product/${item.product.id}`)
                      }
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow sm:ml-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h3
                            className="font-medium hover:text-primary cursor-pointer"
                            onClick={() =>
                              navigate(`/shop/product/${item.product.id}`)
                            }
                          >
                            {item.product.name}
                          </h3>

                          <div className="text-sm text-muted-foreground mt-1">
                            {Object.entries(item.attributes || {}).map(
                              ([key, value]) => (
                                <span key={key} className="mr-4">
                                  {key}: {value}
                                </span>
                              ),
                            )}
                          </div>

                          <div className="mt-2">
                            {item.product.salePrice ? (
                              <>
                                <span className="font-medium">
                                  ${item.product.salePrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  ${item.product.price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium">
                                ${item.product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center mt-4 sm:mt-0">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="px-3 py-1 border-r"
                              onClick={() =>
                                handleQuantityChange(index, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-1">{item.quantity}</span>
                            <button
                              className="px-3 py-1 border-l"
                              onClick={() =>
                                handleQuantityChange(index, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.product.stock}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="ml-4 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        <span className="font-medium">
                          $
                          {(
                            (item.product.salePrice || item.product.price) *
                            item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleContinueShopping}>
                  Continue Shopping
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full" onClick={handleProceedToCheckout}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">We Accept</h3>
              <div className="flex space-x-2">
                <div className="w-12 h-8 bg-gray-200 rounded"></div>
                <div className="w-12 h-8 bg-gray-200 rounded"></div>
                <div className="w-12 h-8 bg-gray-200 rounded"></div>
                <div className="w-12 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
