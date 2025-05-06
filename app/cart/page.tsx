"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { AnimatedSection } from "@/components/animated-section"
import { DecorativeBackground } from "@/components/decorative-background"
import { FurniturePreview3D } from "@/components/furniture-preview-3d"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08 // 8% tax
  }

  const calculateShipping = () => {
    return calculateSubtotal() > 1000 ? 0 : 50 // Free shipping over $1000
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping()
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  const handleContinueShopping = () => {
    router.push("/dashboard")
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <DecorativeBackground variant="dots" />

      <div className="container mx-auto px-4 py-8">
        <AnimatedSection animation="slide-down">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={handleContinueShopping} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rich-walnut to-highlight-terracotta bg-clip-text text-transparent flex items-center">
              <ShoppingCart className="mr-3 h-8 w-8 text-highlight-terracotta" />
              Your Cart
            </h1>
          </div>
        </AnimatedSection>

        {items.length === 0 ? (
          <AnimatedSection animation="fade-in" delay={100}>
            <Card className="glass-effect">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Looks like you haven't added any items to your cart yet. Explore our collection to find beautiful
                  furniture for your home.
                </p>
                <AnimatedButton onClick={handleContinueShopping} variant="gradient" animation="lift" className="mt-2">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Furniture
                </AnimatedButton>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatedSection animation="slide-up" delay={100}>
                <Card className="glass-effect">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle>Shopping Cart ({items.length} items)</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => clearCart()}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear Cart
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="divide-y">
                    {items.map((item, index) => (
                      <AnimatedSection
                        key={item.id}
                        animation="slide-in-left"
                        delay={100 + index * 50}
                        className="py-4 first:pt-6 last:pb-6"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-32 h-32 bg-muted/30 rounded-md overflow-hidden relative">
                            {isClient && (
                              <FurniturePreview3D
                                type={item.type}
                                color={item.color}
                                material={item.material}
                                dimensions={item.dimensions}
                              />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="font-semibold text-highlight-terracotta">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <span className="mr-2">Color:</span>
                                <span
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: item.color }}
                                ></span>
                              </div>
                              <p>
                                Material: <span className="capitalize">{item.material}</span>
                              </p>
                              {item.dimensions && (
                                <p>
                                  Dimensions: {item.dimensions.width}m × {item.dimensions.depth}m ×{" "}
                                  {item.dimensions.height}m
                                </p>
                              )}
                            </div>
                            <div className="mt-auto pt-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.id, Math.max(1, item.quantity - 1), item.customizations)
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.customizations)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedSection>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            <div className="lg:col-span-1">
              <AnimatedSection animation="slide-up" delay={200}>
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{calculateShipping() === 0 ? "Free" : `$${calculateShipping().toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span className="text-highlight-terracotta">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <AnimatedButton className="w-full" variant="gradient" animation="lift" onClick={handleCheckout}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </AnimatedButton>
                  </CardFooter>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="slide-up" delay={300}>
                <Card className="mt-4 bg-gradient-to-br from-highlight-gold/20 to-highlight-terracotta/20 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-highlight-gold/20 p-2 rounded-full">
                        <ShoppingBag className="h-5 w-5 text-highlight-gold" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Free shipping on orders over $1,000</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add ${Math.max(0, 1000 - calculateSubtotal()).toFixed(2)} more to qualify for free shipping!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
