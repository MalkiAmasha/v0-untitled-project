"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { GlossyButton } from "@/components/ui/glossy-button"
import { FurniturePreview3D } from "@/components/furniture-preview-3d"

// Furniture catalog data
const furnitureCategories = [
  { id: "sofas", name: "Sofas & Couches" },
  { id: "chairs", name: "Chairs & Seating" },
  { id: "tables", name: "Tables" },
  { id: "storage", name: "Storage" },
  { id: "beds", name: "Beds" },
  { id: "lighting", name: "Lighting" },
  { id: "decor", name: "Decor" },
]

// Sample furniture items
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
    id: "chair-2",
    name: "Dining Chair Set",
    category: "chairs",
    type: "chair",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#7a8c98", "#a89b8c", "#d2c8b4", "#8a7f72", "#6c7c74"],
    defaultColor: "#8a7f72",
    dimensions: { width: 0.5, depth: 0.55, height: 0.9 },
    materials: ["wood", "fabric"],
    defaultMaterial: "wood",
    price: 249,
    popular: false,
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
    id: "table-2",
    name: "Dining Table",
    category: "tables",
    type: "table",
    thumbnail: "/placeholder.svg?height=150&width=250",
    colors: ["#9c8c7c", "#b5a898", "#8a7f72", "#6c7c74", "#5b6057"],
    defaultColor: "#b5a898",
    dimensions: { width: 1.8, depth: 0.9, height: 0.75 },
    materials: ["wood", "glass"],
    defaultMaterial: "wood",
    price: 799,
    popular: false,
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

interface FurnitureCatalogProps {
  onSelectFurniture: (furniture: any) => void
  onClose: () => void
}

export function FurnitureCatalog({ onSelectFurniture, onClose }: FurnitureCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedItems, setSelectedItems] = useState<Record<string, { color: string; material: string }>>({})
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filter furniture items based on search query and selected category
  const filteredItems = furnitureItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Handle selecting a furniture item
  const handleSelectItem = (item: any) => {
    const isSelected = selectedItems[item.id]

    if (isSelected) {
      // If already selected, remove it
      const newSelectedItems = { ...selectedItems }
      delete newSelectedItems[item.id]
      setSelectedItems(newSelectedItems)
    } else {
      // If not selected, add it with default color and material
      setSelectedItems({
        ...selectedItems,
        [item.id]: {
          color: item.defaultColor,
          material: item.defaultMaterial,
        },
      })
    }
  }

  // Handle changing the color of a selected item
  const handleColorChange = (itemId: string, color: string) => {
    if (selectedItems[itemId]) {
      setSelectedItems({
        ...selectedItems,
        [itemId]: {
          ...selectedItems[itemId],
          color,
        },
      })
    }
  }

  // Handle changing the material of a selected item
  const handleMaterialChange = (itemId: string, material: string) => {
    if (selectedItems[itemId]) {
      setSelectedItems({
        ...selectedItems,
        [itemId]: {
          ...selectedItems[itemId],
          material,
        },
      })
    }
  }

  // Handle adding selected furniture to the room
  const handleAddToRoom = () => {
    // For each selected item, prepare it for adding to the room
    const furnitureToAdd = Object.entries(selectedItems).map(([itemId, customization]) => {
      const item = furnitureItems.find((f) => f.id === itemId)!
      return {
        id: `furniture-${Date.now()}-${itemId}`,
        type: item.category.replace(/s$/, ""), // Remove trailing 's' from category
        name: item.name,
        position: { x: 0, y: 0, z: 0 }, // Default position, will be adjusted when added
        dimensions: item.dimensions,
        rotation: { x: 0, y: 0, z: 0 },
        color: customization.color,
        material: customization.material,
        originalItem: item, // Keep reference to original catalog item
      }
    })

    // Pass the selected furniture back to the parent component
    onSelectFurniture(furnitureToAdd)
  }

  return (
    <div className="flex flex-col h-full bg-light-sand-beige">
      <div className="flex items-center justify-between p-4 border-b bg-creamy-almond">
        <h2 className="text-xl font-semibold text-charcoal-brown">Furniture Catalog</h2>
        <GlossyButton onClick={onClose} className="min-w-[100px]">
          Close
        </GlossyButton>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Categories and filters */}
        <div className="w-64 border-r bg-creamy-almond p-4 flex flex-col">
          <div className="mb-4">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search furniture..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center text-rich-walnut">
              <Filter className="h-4 w-4 mr-2" />
              Categories
            </h3>
            <div className="space-y-1">
              <button
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md text-sm",
                  selectedCategory === null ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                )}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </button>
              {furnitureCategories.map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-sm",
                    selectedCategory === category.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Price Range</h3>
            <Slider
              defaultValue={priceRange}
              min={0}
              max={2000}
              step={50}
              onValueChange={setPriceRange}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <div className="mt-auto">
            <Button className="w-full" onClick={handleAddToRoom} disabled={Object.keys(selectedItems).length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Room ({Object.keys(selectedItems).length})
            </Button>
          </div>
        </div>

        {/* Main content - Furniture items */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="selected">Selected ({Object.keys(selectedItems).length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p>No furniture items found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className={cn(
                          "overflow-hidden transition-all",
                          selectedItems[item.id] ? "ring-2 ring-rich-walnut" : "",
                        )}
                      >
                        <div className="relative">
                          {isClient && (
                            <FurniturePreview3D
                              type={item.type || item.category.replace(/s$/, "")}
                              color={selectedItems[item.id]?.color || item.defaultColor}
                              material={selectedItems[item.id]?.material || item.defaultMaterial}
                              dimensions={item.dimensions}
                            />
                          )}
                          {selectedItems[item.id] && (
                            <div className="absolute top-2 right-2 bg-rich-walnut text-creamy-almond rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">${item.price}</p>
                            </div>
                          </div>

                          {selectedItems[item.id] && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <Label className="text-xs">Color</Label>
                                <div className="flex gap-1 mt-1">
                                  {item.colors.map((color) => (
                                    <button
                                      key={color}
                                      className={cn(
                                        "h-6 w-6 rounded-full border",
                                        selectedItems[item.id].color === color
                                          ? "ring-2 ring-rich-walnut ring-offset-1"
                                          : "",
                                      )}
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
                                  value={selectedItems[item.id].material}
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
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button
                            variant={selectedItems[item.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSelectItem(item)}
                            className="w-full"
                          >
                            {selectedItems[item.id] ? "Selected" : "Select"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="popular" className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems
                    .filter((item) => item.popular)
                    .map((item) => (
                      <Card
                        key={item.id}
                        className={cn(
                          "overflow-hidden transition-all",
                          selectedItems[item.id] ? "ring-2 ring-primary" : "",
                        )}
                      >
                        <div className="relative">
                          {isClient && (
                            <FurniturePreview3D
                              type={item.type || item.category.replace(/s$/, "")}
                              color={selectedItems[item.id]?.color || item.defaultColor}
                              material={selectedItems[item.id]?.material || item.defaultMaterial}
                              dimensions={item.dimensions}
                            />
                          )}
                          {selectedItems[item.id] && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">${item.price}</p>
                            </div>
                          </div>

                          {selectedItems[item.id] && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <Label className="text-xs">Color</Label>
                                <div className="flex gap-1 mt-1">
                                  {item.colors.map((color) => (
                                    <button
                                      key={color}
                                      className={cn(
                                        "h-6 w-6 rounded-full border",
                                        selectedItems[item.id].color === color
                                          ? "ring-2 ring-primary ring-offset-1"
                                          : "",
                                      )}
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
                                  value={selectedItems[item.id].material}
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
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button
                            variant={selectedItems[item.id] ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSelectItem(item)}
                            className="w-full"
                          >
                            {selectedItems[item.id] ? "Selected" : "Select"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="selected" className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full">
                {Object.keys(selectedItems).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>No items selected</p>
                    <p className="text-sm">Select furniture items to add to your room</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {furnitureItems
                      .filter((item) => selectedItems[item.id])
                      .map((item) => (
                        <Card key={item.id} className="overflow-hidden ring-2 ring-primary">
                          <div className="relative">
                            {isClient && (
                              <FurniturePreview3D
                                type={item.type || item.category.replace(/s$/, "")}
                                color={selectedItems[item.id]?.color || item.defaultColor}
                                material={selectedItems[item.id]?.material || item.defaultMaterial}
                                dimensions={item.dimensions}
                              />
                            )}
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">${item.price}</p>
                              </div>
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <Label className="text-xs">Color</Label>
                                <div className="flex gap-1 mt-1">
                                  {item.colors.map((color) => (
                                    <button
                                      key={color}
                                      className={cn(
                                        "h-6 w-6 rounded-full border",
                                        selectedItems[item.id].color === color
                                          ? "ring-2 ring-primary ring-offset-1"
                                          : "",
                                      )}
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
                                  value={selectedItems[item.id].material}
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
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectItem(item)}
                              className="w-full"
                            >
                              Remove
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
