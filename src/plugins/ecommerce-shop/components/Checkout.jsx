import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcommerceStore } from '../store';
import { ecommerceDB } from '../database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, checkoutInfo, updateCheckoutInfo, createOrder } = useEcommerceStore(state => ({
    cart: state.cart,
    cartTotal: state.cartTotal,
    checkoutInfo: state.checkoutInfo,
    updateCheckoutInfo: state.updateCheckoutInfo,
    createOrder: state.createOrder,
  }));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    sameAsBilling: true,
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
    shippingMethod: 'standard',
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  // Redirect to products if cart is empty
  if (cart.length === 0) {
    navigate('/shop');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [name]: value
      }
    }));
  };

  const handleSameAsBillingChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked
    }));
  };

  const handleShippingMethodChange = (value) => {
    setFormData(prev => ({
      ...prev,
      shippingMethod: value
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate shipping info
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    // Validate billing info if different from shipping
    if (!formData.sameAsBilling) {
      if (!formData.billingAddress.firstName) newErrors['billing.firstName'] = 'First name is required';
      if (!formData.billingAddress.lastName) newErrors['billing.lastName'] = 'Last name is required';
      if (!formData.billingAddress.address) newErrors['billing.address'] = 'Address is required';
      if (!formData.billingAddress.city) newErrors['billing.city'] = 'City is required';
      if (!formData.billingAddress.state) newErrors['billing.state'] = 'State is required';
      if (!formData.billingAddress.zipCode) newErrors['billing.zipCode'] = 'ZIP code is required';
    }
    
    // Validate payment info
    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!formData.cardName) newErrors.cardName = 'Name on card is required';
      if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
      if (!formData.cardCvc) newErrors.cardCvc = 'CVC is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      // Prepare shipping address
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };
      
      // Prepare billing address
      const billingAddress = formData.sameAsBilling 
        ? shippingAddress 
        : formData.billingAddress;
      
      // Update checkout info in store
      updateCheckoutInfo({
        shippingAddress,
        billingAddress,
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
      });
      
      // Create order
      const orderData = {
        items: cart,
        total: cartTotal,
        shippingAddress,
        billingAddress,
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
        paymentStatus: 'pending',
        status: 'pending',
      };
      
      // Save order to database
      const order = await ecommerceDB.createOrder(orderData);
      
      // Create order in store
      const storeOrder = await createOrder(orderData);
      
      // Redirect to order confirmation
      navigate(`/shop/order-confirmation/${storeOrder.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  // Calculate shipping cost based on method
  const getShippingCost = () => {
    switch (formData.shippingMethod) {
      case 'express':
        return 15.99;
      case 'next-day':
        return 29.99;
      case 'standard':
      default:
        return cartTotal >= 50 ? 0 : 5.99;
    }
  };

  // Calculate tax (simplified as 8% of subtotal)
  const getTax = () => cartTotal * 0.08;

  // Calculate order total
  const getOrderTotal = () => cartTotal + getShippingCost() + getTax();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center" 
          onClick={() => navigate('/shop/cart')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input 
                      id="zipCode" 
                      name="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange} 
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleInputChange} 
                    disabled
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox 
                    id="sameAsBilling" 
                    checked={formData.sameAsBilling} 
                    onCheckedChange={handleSameAsBillingChange} 
                  />
                  <Label htmlFor="sameAsBilling">Billing address same as shipping</Label>
                </div>
              </CardContent>
            </Card>
            
            {!formData.sameAsBilling && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing.firstName">First Name</Label>
                      <Input 
                        id="billing.firstName" 
                        name="firstName" 
                        value={formData.billingAddress.firstName} 
                        onChange={handleBillingInputChange} 
                        className={errors['billing.firstName'] ? 'border-red-500' : ''}
                      />
                      {errors['billing.firstName'] && <p className="text-red-500 text-sm mt-1">{errors['billing.firstName']}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="billing.lastName">Last Name</Label>
                      <Input 
                        id="billing.lastName" 
                        name="lastName" 
                        value={formData.billingAddress.lastName} 
                        onChange={handleBillingInputChange} 
                        className={errors['billing.lastName'] ? 'border-red-500' : ''}
                      />
                      {errors['billing.lastName'] && <p className="text-red-500 text-sm mt-1">{errors['billing.lastName']}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billing.address">Address</Label>
                    <Input 
                      id="billing.address" 
                      name="address" 
                      value={formData.billingAddress.address} 
                      onChange={handleBillingInputChange} 
                      className={errors['billing.address'] ? 'border-red-500' : ''}
                    />
                    {errors['billing.address'] && <p className="text-red-500 text-sm mt-1">{errors['billing.address']}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="billing.city">City</Label>
                      <Input 
                        id="billing.city" 
                        name="city" 
                        value={formData.billingAddress.city} 
                        onChange={handleBillingInputChange} 
                        className={errors['billing.city'] ? 'border-red-500' : ''}
                      />
                      {errors['billing.city'] && <p className="text-red-500 text-sm mt-1">{errors['billing.city']}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="billing.state">State</Label>
                      <Input 
                        id="billing.state" 
                        name="state" 
                        value={formData.billingAddress.state} 
                        onChange={handleBillingInputChange} 
                        className={errors['billing.state'] ? 'border-red-500' : ''}
                      />
                      {errors['billing.state'] && <p className="text-red-500 text-sm mt-1">{errors['billing.state']}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="billing.zipCode">ZIP Code</Label>
                      <Input 
                        id="billing.zipCode" 
                        name="zipCode" 
                        value={formData.billingAddress.zipCode} 
                        onChange={handleBillingInputChange} 
                        className={errors['billing.zipCode'] ? 'border-red-500' : ''}
                      />
                      {errors['billing.zipCode'] && <p className="text-red-500 text-sm mt-1">{errors['billing.zipCode']}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billing.country">Country</Label>
                    <Input 
                      id="billing.country" 
                      name="country" 
                      value={formData.billingAddress.country} 
                      onChange={handleBillingInputChange} 
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
              </CardHeader>
              
              <CardContent>
                <RadioGroup 
                  value={formData.shippingMethod} 
                  onValueChange={handleShippingMethodChange}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-grow cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Standard Shipping</p>
                          <p className="text-sm text-muted-foreground">Delivery in 5-7 business days</p>
                        </div>
                        <div>
                          {cartTotal >= 50 ? (
                            <span className="font-medium text-green-600">FREE</span>
                          ) : (
                            <span className="font-medium">$5.99</span>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-grow cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Express Shipping</p>
                          <p className="text-sm text-muted-foreground">Delivery in 2-3 business days</p>
                        </div>
                        <div>
                          <span className="font-medium">$15.99</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="next-day" id="next-day" />
                    <Label htmlFor="next-day" className="flex-grow cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Next Day Delivery</p>
                          <p className="text-sm text-muted-foreground">Delivery on the next business day</p>
                        </div>
                        <div>
                          <span className="font-medium">$29.99</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              
              <CardContent>
                <Tabs value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                  <TabsList className="w-full">
                    <TabsTrigger value="credit-card" className="flex-1">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="paypal" className="flex-1">
                      PayPal
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="credit-card" className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        name="cardNumber" 
                        placeholder="1234 5678 9012 3456" 
                        value={formData.cardNumber} 
                        onChange={handleInputChange} 
                        className={errors.cardNumber ? 'border-red-500' : ''}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input 
                        id="cardName" 
                        name="cardName" 
                        placeholder="John Doe" 
                        value={formData.cardName} 
                        onChange={handleInputChange} 
                        className={errors.cardName ? 'border-red-500' : ''}
                      />
                      {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input 
                          id="cardExpiry" 
                          name