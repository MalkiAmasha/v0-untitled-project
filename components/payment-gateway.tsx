"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentGatewayProps {
  amount: number
  onClose: () => void
  onComplete: () => void
}

export function PaymentGateway({ amount, onClose, onComplete }: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onComplete()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Payment</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessing}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
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
                value={cardDetails.cardHolder}
                onChange={handleInputChange}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
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
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between mb-2">
                <span>Total Amount:</span>
                <span className="font-bold">${amount.toFixed(2)}</span>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isProcessing ||
                  !cardDetails.cardNumber ||
                  !cardDetails.cardHolder ||
                  !cardDetails.expiryDate ||
                  !cardDetails.cvv
                }
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay $${amount.toFixed(2)}`
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
  )
}
