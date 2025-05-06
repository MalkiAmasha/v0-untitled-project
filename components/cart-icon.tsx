"use client"

import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { useState, useEffect } from "react"

export function CartIcon() {
  const router = useRouter()
  const itemCount = useCartStore((state) => state.getItemCount())

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const count = isClient ? itemCount : 0

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => router.push("/cart")}
      aria-label="View cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-800 text-[10px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  )
}
