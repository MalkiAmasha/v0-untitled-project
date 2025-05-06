"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/lib/cart-store"
import { FurniturePreview3D } from "@/components/furniture-preview-3d"

// Sample furniture items for the dashboard catalog
const furnitureItems = [
  {
    id: "sofa-1",
    name: "Modern Sectional Sofa",
    category: "sofas",
    type: "sofa",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#7a8c98", "#a89b8c", "#d2c8b4", "#8a7f72", "#6c7c74"],
    defaultColor: "#7a8c98",
    dimensions: { width: 2.8, depth: 1.7, height: 0.8 },
    materials: ["fabric", "leather"],
    defaultMaterial: "fabric",
    price: 1299,
    popular: true,
  },
  {
    id: "sofa-2",
    name: "Minimalist Loveseat",
    category: "sofas",
    type: "sofa",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#7a8c98", "#a89b8c", "#d2c8b4", "#8a7f72", "#6c7c74"],
    defaultColor: "#a89b8c",
    dimensions: { width: 1.8, depth: 0.9, height: 0.75 },
    materials: ["fabric", "leather"],
    defaultMaterial: "fabric",
    price: 899,
    popular: false,
  },
  {
    id: "chair-1",
    name: "Ergonomic Armchair",
    category: "chairs",
    type: "chair",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#7a8c98", "#a89b8c", "#d2c8b4", "#8a7f72", "#6c7c74"],
    defaultColor: "#d2c8b4",
    dimensions: { width: 0.8, depth: 0.85, height: 1.0 },
    materials: ["fabric", "leather"],
    defaultMaterial: "fabric",
    price: 599,
    popular: true,
  },
  {
    id: "table-1",
    name: "Coffee Table",
    category: "tables",
    type: "table",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#9c8c7c", "#b5a898", "#8a7f72", "#6c7c74", "#5b6057"],
    defaultColor: "#9c8c7c",
    dimensions: { width: 1.2, depth: 0.6, height: 0.45 },
    materials: ["wood", "glass", "metal"],
    defaultMaterial: "wood",
    price: 399,
    popular: true,
  },
  {
    id: "storage-1",
    name: "Bookshelf",
    category: "storage",
    type: "storage",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#9c8c7c", "#b5a898", "#8a7f72", "#6c7c74", "#5b6057"],
    defaultColor: "#8a7f72",
    dimensions: { width: 1.2, depth: 0.4, height: 1.8 },
    materials: ["wood", "metal"],
    defaultMaterial: "wood",
    price: 549,
    popular: true,
  },
  {
    id: "lighting-1",
    name: "Floor Lamp",
    category: "lighting",
    type: "lamp",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#9c8c7c", "#b5a898", "#8a7f72", "#6c7c74", "#5b6057"],
    defaultColor: "#6c7c74",
    dimensions: { width: 0.4, depth: 0.4, height: 1.6 },
    materials: ["metal", "fabric"],
    defaultMaterial: "metal",
    price: 199,
    popular: false,
  },
]

export function DashboardFurnitureCatalog() {
  const { toast } = useToast()
  const addToCart = useCartStore((state) => state.addItem)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [customizations, setCustomizations] = useState<Record<string, { color: string; material: string }>>({})
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)

    // Initialize customizations for all items
    const initialCustomizations: Record<string, { color: string; material: string }> = {}
    furnitureItems.forEach((item) => {
      initialCustomizations[item.id] = {
        color: item.defaultColor,
        material: item.defaultMaterial,
      }
    })
    setCustomizations(initialCustomizations)
  }, [])

  // Filter furniture items based on search query and selected category
  const filteredItems = furnitureItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  // Handle changing the color of an item
  const handleColorChange = (itemId: string, color: string) => {
    setCustomizations((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        color,
      },
    }))
  }

  // Handle changing the material of an item
  const handleMaterialChange = (itemId: string, material: string) => {
    setCustomizations((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        material,
      },
    }))
  }

  // Handle adding an item to the cart
  const handleAddToCart = (item: any) => {
    if (!customizations[item.id]) return

    const customization = customizations[item.id]

    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      color: customization.color,
      material: customization.material,
      category: item.category,
      type: item.type,
      dimensions: item.dimensions,
      quantity: 1,
    })

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  return (
    <div className="bg-light-sand-beige rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-charcoal-brown">Shop Furniture</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search furniture..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
            All
          </TabsTrigger>
          <TabsTrigger value="sofas" onClick={() => setSelectedCategory("sofas")}>
            Sofas
          </TabsTrigger>
          <TabsTrigger value="chairs" onClick={() => setSelectedCategory("chairs")}>
            Chairs
          </TabsTrigger>
          <TabsTrigger value="tables" onClick={() => setSelectedCategory("tables")}>
            Tables
          </TabsTrigger>
          <TabsTrigger value="storage" onClick={() => setSelectedCategory("storage")}>
            Storage
          </TabsTrigger>
          <TabsTrigger value="lighting" onClick={() => setSelectedCategory("lighting")}>
            Lighting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    {isClient && customizations[item.id] && (
                      <FurniturePreview3D
                        type={item.type}
                        color={customizations[item.id].color}
                        material={customizations[item.id].material}
                        dimensions={item.dimensions}
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price}</p>
                      </div>
                    </div>

                    {customizations[item.id] && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label className="text-xs">Color</Label>
                          <div className="flex gap-1 mt-1">
                            {item.colors.map((color) => (
                              <button
                                key={color}
                                className={`h-6 w-6 rounded-full border ${
                                  customizations[item.id]?.color === color
                                    ? "ring-2 ring-rich-walnut ring-offset-1"
                                    : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(item.id, color)}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Material</Label>
                          <RadioGroup
                            value={customizations[item.id].material}
                            onValueChange={(value) => handleMaterialChange(item.id, value)}
                            className="flex gap-2 mt-1"
                          >
                            {item.materials.map((material) => (
                              <div key={material} className="flex items-center space-x-1">
                                <RadioGroupItem value={material} id={`${item.id}-${material}`} className="h-3 w-3" />
                                <Label htmlFor={`${item.id}-${material}`} className="text-xs capitalize">
                                  {material}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button onClick={() => handleAddToCart(item)} className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {["sofas", "chairs", "tables", "storage", "lighting"].map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {furnitureItems
                  .filter(
                    (item) => item.category === category && item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative">
                        {isClient && customizations[item.id] && (
                          <FurniturePreview3D
                            type={item.type}
                            color={customizations[item.id].color}
                            material={customizations[item.id].material}
                            dimensions={item.dimensions}
                          />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">${item.price}</p>
                          </div>
                        </div>

                        {customizations[item.id] && (
                          <div className="mt-3 space-y-3">
                            <div>
                              <Label className="text-xs">Color</Label>
                              <div className="flex gap-1 mt-1">
                                {item.colors.map((color) => (
                                  <button
                                    key={color}
                                    className={`h-6 w-6 rounded-full border ${
                                      customizations[item.id]?.color === color
                                        ? "ring-2 ring-rich-walnut ring-offset-1"
                                        : ""
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorChange(item.id, color)}
                                    aria-label={`Select color ${color}`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Material</Label>
                              <RadioGroup
                                value={customizations[item.id].material}
                                onValueChange={(value) => handleMaterialChange(item.id, value)}
                                className="flex gap-2 mt-1"
                              >
                                {item.materials.map((material) => (
                                  <div key={material} className="flex items-center space-x-1">
                                    <RadioGroupItem
                                      value={material}
                                      id={`${item.id}-${material}`}
                                      className="h-3 w-3"
                                    />
                                    <Label htmlFor={`${item.id}-${material}`} className="text-xs capitalize">
                                      {material}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button onClick={() => handleAddToCart(item)} className="w-full">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
