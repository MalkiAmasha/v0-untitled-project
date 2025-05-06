"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, CreditCard, Gift, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { FurniturePreviewSmall } from "@/components/furniture-preview-small"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "googlepay">("card")
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showGiftCard, setShowGiftCard] = useState(false)
  const [saveCard, setSaveCard] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
    addressLine1: "",
    addressLine2: "",
    postcode: "",
    giftCard: "",
  })

  // Mock saved cards data
  const savedCards = [
    { id: 1, last4: "1234", color: "bg-blue-500", expiry: "02/25" },
    { id: 2, last4: "5678", color: "bg-red-500", expiry: "04/26" },
    { id: 3, last4: "9012", color: "bg-gradient-to-r from-green-400 to-teal-500", expiry: "11/27" },
  ]

  const subtotal = getTotal()
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19)

      setFormData((prev) => ({ ...prev, [name]: formattedValue }))
      return
    }

    // Format expiry date
    if (name === "expiry") {
      const cleanValue = value.replace(/\D/g, "")
      let formattedValue = cleanValue

      if (cleanValue.length > 2) {
        formattedValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`
      }

      setFormData((prev) => ({ ...prev, [name]: formattedValue }))
      return
    }

    // Limit CVV to 3-4 digits
    if (name === "cvv") {
      const cvvValue = value.replace(/\D/g, "").slice(0, 4)
      setFormData((prev) => ({ ...prev, [name]: cvvValue }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectCard = (cardId: number) => {
    setSelectedCard(cardId === selectedCard ? null : cardId)
  }

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setOrderComplete(true)
      // Clear the cart after successful payment
      clearCart()

      // In a real app, you would send the order to your backend here
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    }, 2000)
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">Your order has been placed and will be processed soon.</p>
            <p className="text-sm text-muted-foreground mb-6">Order total: ${total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mb-6">A confirmation email has been sent to {formData.email}</p>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscalemedia-transformed-removebg-preview-vqBzGArflcxKvkM4AobV4pUuRSe6wL.png"
              alt="RoomCrafter Logo"
              width={32}
              height={32}
            />
            <h1 className="text-xl font-bold">RoomCrafter</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push("/cart")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Cart</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-6 md:px:6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Shipping Method</h2>
                <RadioGroup defaultValue="standard" className="space-y-3">
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="font-medium">Standard Shipping</div>
                      <div className="text-sm text-muted-foreground">Delivery in 5-7 business days</div>
                    </Label>
                    <div className="font-medium">Free</div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="font-medium">Express Shipping</div>
                      <div className="text-sm text-muted-foreground">Delivery in 2-3 business days</div>
                    </Label>
                    <div className="font-medium">$15.00</div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

                    {/* Gift Card Option */}
                    <div className="flex items-center mb-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setShowGiftCard(!showGiftCard)}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Add gift cards
                      </Button>
                    </div>

                    {showGiftCard && (
                      <div className="mb-4 space-y-2">
                        <Label htmlFor="giftCard">Gift Card</Label>
                        <Input
                          id="giftCard"
                          name="giftCard"
                          placeholder="Enter gift card code"
                          value={formData.giftCard}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    {/* Payment Method Tabs */}
                    <Tabs
                      defaultValue="card"
                      className="w-full"
                      onValueChange={(value) => setPaymentMethod(value as "card" | "paypal" | "googlepay")}
                    >
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="card" className="flex items-center justify-center border border-gray-200">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Card
                        </TabsTrigger>
                        <TabsTrigger value="paypal" className="flex items-center justify-center border border-gray-200">
                          <div className="text-[#003087] font-bold">
                            <span className="text-[#0079C1]">Pay</span>
                            <span>Pal</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="googlepay"
                          className="flex items-center justify-center border border-gray-200"
                        >
                          <span className="flex">
                            <span className="text-blue-500">G</span>
                            <span className="text-red-500">o</span>
                            <span className="text-yellow-500">o</span>
                            <span className="text-blue-500">g</span>
                            <span className="text-green-500">l</span>
                            <span className="text-red-500">e</span>
                            <span className="ml-1">Pay</span>
                          </span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="card" className="space-y-4">
                        {/* Saved Cards */}
                        <div className="space-y-2">
                          <Label>Card Details</Label>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {savedCards.map((card) => (
                              <div
                                key={card.id}
                                className={`relative flex-shrink-0 w-16 h-10 rounded-md cursor-pointer border-2 ${
                                  selectedCard === card.id ? "border-primary" : "border-transparent"
                                }`}
                                onClick={() => handleSelectCard(card.id)}
                              >
                                <div className={`absolute inset-0 rounded-md ${card.color} p-1`}>
                                  <div className="text-white text-[8px] mt-auto">•••• {card.last4}</div>
                                </div>
                              </div>
                            ))}
                            <div
                              className="flex-shrink-0 w-16 h-10 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400"
                              onClick={() => setSelectedCard(null)}
                            >
                              <Plus className="h-4 w-4 text-gray-400" />
                              <span className="text-xs ml-1">New</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Form (only show if no saved card is selected) */}
                        {selectedCard === null && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cardHolder">Card Holder</Label>
                              <Input
                                id="cardHolder"
                                name="cardHolder"
                                placeholder="John Smith"
                                value={formData.cardHolder}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Expiration MM/YY</Label>
                                <Input
                                  id="expiry"
                                  name="expiry"
                                  placeholder="MM/YY"
                                  value={formData.expiry}
                                  onChange={handleInputChange}
                                  required
                                  disabled={isProcessing}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  name="cvv"
                                  placeholder="•••"
                                  type="password"
                                  value={formData.cvv}
                                  onChange={handleInputChange}
                                  required
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="block mb-2">Billing Address</Label>
                              <div className="space-y-2">
                                <Input
                                  id="addressLine1"
                                  name="addressLine1"
                                  placeholder="Address Line 1"
                                  value={formData.addressLine1}
                                  onChange={handleInputChange}
                                  required
                                  disabled={isProcessing}
                                />
                              </div>

                              <div className="space-y-2 mt-2">
                                <Input
                                  id="addressLine2"
                                  name="addressLine2"
                                  placeholder="Address Line 2 (Optional)"
                                  value={formData.addressLine2}
                                  onChange={handleInputChange}
                                  disabled={isProcessing}
                                />
                              </div>

                              <div className="space-y-2 mt-2">
                                <Input
                                  id="postcode"
                                  name="postcode"
                                  placeholder="Postcode"
                                  value={formData.postcode}
                                  onChange={handleInputChange}
                                  required
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="saveCard"
                                checked={saveCard}
                                onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                              />
                              <Label htmlFor="saveCard" className="text-sm">
                                Save this card
                              </Label>
                            </div>
                          </>
                        )}
                      </TabsContent>

                      <TabsContent value="paypal">
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="text-2xl font-bold text-[#0079C1]">
                            <span className="text-[#003087]">Pay</span>
                            <span>Pal</span>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            Click the button below to log in to your PayPal account and complete your purchase.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="googlepay">
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              G
                            </div>
                            <span className="ml-2 font-medium">Google Pay</span>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            Click the button below to pay with Google Pay.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Total Amount:</span>
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        isProcessing ||
                        (paymentMethod === "card" &&
                          selectedCard === null &&
                          (!formData.cardNumber ||
                            !formData.cardHolder ||
                            !formData.expiry ||
                            !formData.cvv ||
                            !formData.addressLine1 ||
                            !formData.postcode))
                      }
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        `Pay $${total.toFixed(2)}`
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-center text-muted-foreground mt-4">
                    <p>This is a demo payment gateway. No actual payment will be processed.</p>
                    <p className="mt-1">All card information is secure and will not be stored.</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-medium">Order Details</h4>
                  <div className="max-h-[300px] overflow-y-auto space-y-4 mt-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 border-b pb-3">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden relative flex-shrink-0">
                          <FurniturePreviewSmall
                            type={item.type}
                            color={item.color}
                            material={item.material}
                            dimensions={{ width: 1, depth: 1, height: 1 }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <div className="flex gap-2 mt-1">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="text-xs ml-1 capitalize">{item.material}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment methods icons */}
      <footer className="container px-4 py-6 md:px:6"></footer>
    </div>
  )
}
