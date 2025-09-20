"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Package, Save, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface Product {
  id: number
  name: string
  sku: string
  category: string
  price: string
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  description?: string
  supplier?: string
  costPrice?: string
  sellingPrice?: string
}

type SortField = 'name' | 'price' | 'stock' | 'category'
type SortOrder = 'asc' | 'desc'

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    sku: "WH-001",
    category: "Electronics",
    price: "₹8,999.00",
    stock: 45,
    status: "In Stock",
    description: "Premium wireless headphones with noise cancellation",
    supplier: "Tech Supplier Co",
    costPrice: "₹6,500.00",
    sellingPrice: "₹8,999.00",
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "BS-002",
    category: "Electronics",
    price: "₹7,199.00",
    stock: 23,
    status: "In Stock",
    description: "Portable Bluetooth speaker with excellent sound quality",
    supplier: "Audio Devices Ltd",
    costPrice: "₹5,200.00",
    sellingPrice: "₹7,199.00",
  },
  {
    id: 3,
    name: "USB Cable",
    sku: "UC-003",
    category: "Accessories",
    price: "₹1,169.00",
    stock: 0,
    status: "Out of Stock",
    description: "High-speed USB-C to USB-A cable",
    supplier: "Cable Solutions",
    costPrice: "₹800.00",
    sellingPrice: "₹1,169.00",
  },
  {
    id: 4,
    name: "Laptop Stand",
    sku: "LS-004",
    category: "Accessories",
    price: "₹4,139.00",
    stock: 12,
    status: "Low Stock",
    description: "Adjustable aluminum laptop stand",
    supplier: "Office Supplies Co",
    costPrice: "₹2,800.00",
    sellingPrice: "₹4,139.00",
  },
  {
    id: 5,
    name: "Wireless Mouse",
    sku: "WM-005",
    category: "Electronics",
    price: "₹2,699.00",
    stock: 67,
    status: "In Stock",
    description: "Ergonomic wireless mouse with precision tracking",
    supplier: "Tech Peripherals Inc",
    costPrice: "₹1,800.00",
    sellingPrice: "₹2,699.00",
  },
]

const categories = ["Electronics", "Accessories", "Office Supplies", "Furniture", "Books", "Clothing"]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    stock: 0,
    status: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    description: "",
    supplier: "",
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle price sorting by removing currency and converting to number
    if (sortField === 'price') {
      aValue = parseFloat(a.price.replace(/[₹,]/g, ''))
      bValue = parseFloat(b.price.replace(/[₹,]/g, ''))
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      costPrice: "",
      sellingPrice: "",
      stock: 0,
      status: "In Stock",
      description: "",
      supplier: "",
    })
  }

  const generateSKU = (name: string, category: string) => {
    const namePrefix = name.substring(0, 2).toUpperCase()
    const categoryPrefix = category.substring(0, 1).toUpperCase()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${namePrefix}${categoryPrefix}-${randomNum}`
  }

  const getProductStatus = (stock: number): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (stock === 0) return "Out of Stock"
    if (stock <= 10) return "Low Stock"
    return "In Stock"
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.sellingPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const sku = formData.sku || generateSKU(formData.name, formData.category)
    const status = getProductStatus(formData.stock)

    const newProduct: Product = {
      id: Date.now(),
      ...formData,
      sku,
      status,
      price: formData.sellingPrice,
    }

    setProducts([...products, newProduct])

    toast({
      title: "Product Added",
      description: `${formData.name} has been added successfully`,
    })

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      costPrice: product.costPrice || "",
      sellingPrice: product.sellingPrice || product.price,
      stock: product.stock,
      status: product.status,
      description: product.description || "",
      supplier: product.supplier || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return

    if (!formData.name || !formData.category || !formData.sellingPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const status = getProductStatus(formData.stock)

    const updatedProduct: Product = {
      ...editingProduct,
      ...formData,
      status,
      price: formData.sellingPrice,
    }

    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))

    toast({
      title: "Product Updated",
      description: `${formData.name} has been updated successfully`,
    })

    setEditingProduct(null)
    resetForm()
    setIsEditDialogOpen(false)
  }

  const handleDeleteProduct = (product: Product) => {
    setProducts(products.filter(p => p.id !== product.id))

    toast({
      title: "Product Deleted",
      description: `${product.name} has been deleted successfully`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "secondary"
      case "Out of Stock":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <Header />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Products</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your inventory and product catalog</p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to your inventory. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        placeholder="Enter supplier name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price (₹)</Label>
                      <Input
                        id="costPrice"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                      <Input
                        id="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct}>
                    <Save className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sorting Controls */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center">Sort by:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className="h-8"
            >
              Name {getSortIcon('name')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('category')}
              className="h-8"
            >
              Category {getSortIcon('category')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('price')}
              className="h-8"
            >
              Price {getSortIcon('price')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('stock')}
              className="h-8"
            >
              Stock {getSortIcon('stock')}
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {sortedProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{product.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-1 space-y-1 sm:space-y-0">
                          <span>SKU: {product.sku}</span>
                          <span>Category: {product.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-base sm:text-lg">{product.price}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Badge variant={getStatusColor(product.status) as any} className="text-xs">
                          {product.status}
                        </Badge>
                        <div className="flex space-x-1 sm:space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {product.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update the product information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Product Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="Product SKU"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-supplier">Supplier</Label>
                    <Input
                      id="edit-supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      placeholder="Enter supplier name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-costPrice">Cost Price (₹)</Label>
                    <Input
                      id="edit-costPrice"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sellingPrice">Selling Price (₹) *</Label>
                    <Input
                      id="edit-sellingPrice"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Stock Quantity</Label>
                    <Input
                      id="edit-stock"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}
