"use client"

import { useState, useEffect } from "react"
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
import { productService, categoryService } from "@/services/productService"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface Product {
  id: number
  organizationId?: number
  name: string
  sku: string
  categoryId: number | null
  category?: {
    id: number
    name: string
  }
  type: 'consu' | 'product' | 'service'
  salePrice: number
  costPrice: number
  currentStock: number
  minimumStock: number
  unit: string
  description?: string
  hsnCode?: string
  isActive: boolean
  barcode?: string
  brand?: string
  model?: string
  weight?: number
  dimensions?: string
  notes?: string
  salesTaxId?: number
  trackInventory: boolean
  
  // Computed fields for display only
  status?: "In Stock" | "Low Stock" | "Out of Stock"
  price?: string // formatted price for display
}

type SortField = 'name' | 'salePrice' | 'currentStock' | 'categoryId'
type SortOrder = 'asc' | 'desc'

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    sku: "WH-001",
    categoryId: 1,
    category: { id: 1, name: "Electronics" },
    type: "product",
    salePrice: 8999.00,
    costPrice: 6500.00,
    currentStock: 45,
    minimumStock: 10,
    unit: "Unit",
    description: "Premium wireless headphones with noise cancellation",
    hsnCode: "8518",
    isActive: true,
    trackInventory: true,
    price: "₹8,999.00",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "BS-002",
    categoryId: 1,
    category: { id: 1, name: "Electronics" },
    type: "product",
    salePrice: 7199.00,
    costPrice: 5200.00,
    currentStock: 23,
    minimumStock: 5,
    unit: "Unit",
    description: "Portable Bluetooth speaker with excellent sound quality",
    hsnCode: "8518",
    isActive: true,
    trackInventory: true,
    price: "₹7,199.00",
    status: "In Stock",
  },
  {
    id: 3,
    name: "USB Cable",
    sku: "UC-003",
    categoryId: 2,
    category: { id: 2, name: "Accessories" },
    type: "product",
    salePrice: 1169.00,
    costPrice: 800.00,
    currentStock: 0,
    minimumStock: 20,
    unit: "Unit",
    description: "High-speed USB-C to USB-A cable",
    hsnCode: "8544",
    isActive: true,
    trackInventory: true,
    price: "₹1,169.00",
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Laptop Stand",
    sku: "LS-004",
    categoryId: 2,
    category: { id: 2, name: "Accessories" },
    type: "product",
    salePrice: 4139.00,
    costPrice: 2800.00,
    currentStock: 12,
    minimumStock: 15,
    unit: "Unit",
    description: "Adjustable aluminum laptop stand",
    hsnCode: "7326",
    isActive: true,
    trackInventory: true,
    price: "₹4,139.00",
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Wireless Mouse",
    sku: "WM-005",
    categoryId: 1,
    category: { id: 1, name: "Electronics" },
    type: "product",
    salePrice: 2699.00,
    costPrice: 1800.00,
    currentStock: 67,
    minimumStock: 10,
    unit: "Unit",
    description: "Ergonomic wireless mouse with precision tracking",
    hsnCode: "8471",
    isActive: true,
    trackInventory: true,
    price: "₹2,699.00",
    status: "In Stock",
  },
]

// Categories are now loaded dynamically from the backend

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{id: number, name: string}[]>([
    // Initialize empty - will load from API or use safe fallback
  ])
  const { toast } = useToast()
  const { user } = useAuth()

  // Debug: Monitor categories state changes
  useEffect(() => {
    console.log('🔄 Categories state updated:', categories.length, 'categories')
    console.log('📝 Current categories:', categories.map(c => `${c.id}: ${c.name}`))
  }, [categories])

  // Load products and categories from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        console.log('🔑 Auth token status:', token ? `Present (${token.length} chars)` : 'Missing')
        
        if (!token) {
          console.log('❌ No auth token found, user needs to login')
          toast({
            title: "Authentication Required",
            description: "Please login to access products",
            variant: "destructive",
          })
          setProducts([])
          setCategories([
            { id: 9999, name: "Login Required" },
          ])
          setLoading(false)
          return
        }

        console.log('Loading products from backend...')
        
        // Load products
        const productsResponse = await productService.getProducts(token)
        console.log('Products response:', productsResponse)
        
        if (productsResponse.success && productsResponse.data?.products) {
          const formattedProducts = productsResponse.data.products.map(product => ({
            ...product,
            price: `₹${product.salePrice?.toLocaleString('en-IN') || '0.00'}`,
            status: getProductStatus(product.currentStock || 0, product.minimumStock || 0)
          }))
          setProducts(formattedProducts)
          console.log('Products loaded:', formattedProducts.length)
        } else {
          console.log('No products found or API error, using fallback')
          setProducts([])
        }

        // Load categories from API
        if (token) {
          try {
            console.log('🔄 Loading categories from API...')
            const categoriesResponse = await categoryService.getCategories(token)
            console.log('📋 Categories API response:', categoriesResponse)
            
            if (categoriesResponse.success && categoriesResponse.data?.categories && categoriesResponse.data.categories.length > 0) {
              console.log('✅ Loading real categories from API:', categoriesResponse.data.categories.length)
              console.log('📝 API Category IDs and names:', categoriesResponse.data.categories.map(c => `${c.id}: ${c.name}`))
              setCategories(categoriesResponse.data.categories)
            } else {
              console.log('❌ API returned no categories, using safe fallback')
              console.log('Response structure:', Object.keys(categoriesResponse))
              if (categoriesResponse.data) {
                console.log('Data structure:', Object.keys(categoriesResponse.data))
              }
              // Use safe fallback categories with high IDs to avoid conflicts
              setCategories([
                { id: 9999, name: "General (Fallback)" },
                { id: 9998, name: "Electronics (Fallback)" },
                { id: 9997, name: "Accessories (Fallback)" },
                { id: 9996, name: "Office Supplies (Fallback)" },
                { id: 9995, name: "Furniture (Fallback)" },
                { id: 9994, name: "Books (Fallback)" },
                { id: 9993, name: "Clothing (Fallback)" },
              ])
            }
          } catch (error) {
            console.error('❌ Error loading categories from API:', error)
            console.error('Error details:', error.message)
            console.log('🔄 Using safe fallback categories due to API error')
            // Use safe fallback categories with high IDs to avoid conflicts
            setCategories([
              { id: 9999, name: "General (Fallback)" },
              { id: 9998, name: "Electronics (Fallback)" },
              { id: 9997, name: "Accessories (Fallback)" },
              { id: 9996, name: "Office Supplies (Fallback)" },
              { id: 9995, name: "Furniture (Fallback)" },
              { id: 9994, name: "Books (Fallback)" },
              { id: 9993, name: "Clothing (Fallback)" },
            ])
          }
        } else {
          console.log('🔄 No token available, using safe fallback categories')
          setCategories([
            { id: 9999, name: "General (No Auth)" },
            { id: 9998, name: "Electronics (No Auth)" },
            { id: 9997, name: "Accessories (No Auth)" },
            { id: 9996, name: "Office Supplies (No Auth)" },
            { id: 9995, name: "Furniture (No Auth)" },
            { id: 9994, name: "Books (No Auth)" },
            { id: 9993, name: "Clothing (No Auth)" },
          ])
        }

      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load products. Using offline data.",
          variant: "destructive",
        })
        // Fallback to mock data
        setProducts(initialProducts)
        setCategories([
          { id: 1, name: "Electronics" },
          { id: 2, name: "Accessories" },
          { id: 3, name: "Office Supplies" },
          { id: 4, name: "Furniture" },
          { id: 5, name: "Books" },
          { id: 6, name: "Clothing" },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    type: "consu" as 'consu' | 'product' | 'service', // Backend default is 'consu'
    categoryId: null as number | null,
    salePrice: 0,
    costPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    unit: "Unit", // Matches backend default
    description: "",
    hsnCode: "",
    barcode: "",
    brand: "",
    model: "",
    weight: null as number | null, // Should be null, not 0
    dimensions: "",
    notes: "",
    isActive: true,
    trackInventory: true,
    salesTaxId: null as number | null,
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle category sorting
    if (sortField === 'categoryId') {
      aValue = a.category?.name || ''
      bValue = b.category?.name || ''
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
      type: "consu", // Backend default
      categoryId: null,
      salePrice: 0,
      costPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      unit: "Unit",
      description: "",
      hsnCode: "",
      barcode: "",
      brand: "",
      model: "",
      weight: null, // Should be null
      dimensions: "",
      notes: "",
      isActive: true,
      trackInventory: true,
      salesTaxId: null,
    })
  }

  const generateSKU = (name: string, category: string) => {
    const namePrefix = name.substring(0, 2).toUpperCase()
    const categoryPrefix = category.substring(0, 1).toUpperCase()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${namePrefix}${categoryPrefix}-${randomNum}`
  }

  const getProductStatus = (currentStock: number, minimumStock: number): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (currentStock === 0) return "Out of Stock"
    if (currentStock <= minimumStock) return "Low Stock"
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

  const handleAddProduct = async () => {
    // Backend-aligned validation (matches Joi schema)
    const errors = []
    
    // Required fields
    if (!formData.name?.trim()) {
      errors.push("Product Name is required")
    } else if (formData.name.trim().length < 2) {
      errors.push("Product Name must be at least 2 characters long")
    } else if (formData.name.trim().length > 255) {
      errors.push("Product Name cannot exceed 255 characters")
    }
    
    // Type validation (required)
    if (!formData.type || !['consu', 'product', 'service'].includes(formData.type)) {
      errors.push("Product Type must be Consumable, Storable Product, or Service")
    }
    
    // Optional field validations
    if (formData.sku && formData.sku.trim().length > 50) {
      errors.push("SKU cannot exceed 50 characters")
    }
    
    if (formData.salePrice < 0) {
      errors.push("Sale Price cannot be negative")
    }
    
    if (formData.costPrice < 0) {
      errors.push("Cost Price cannot be negative")
    }
    
    if (formData.currentStock < 0) {
      errors.push("Current Stock cannot be negative")
    }
    
    if (formData.minimumStock < 0) {
      errors.push("Minimum Stock cannot be negative")
    }
    
    // Category validation - exclude fallback categories (IDs > 9000)
    if (formData.categoryId && formData.categoryId >= 9000) {
      errors.push("Please select a real category or leave category empty. Fallback categories cannot be used.")
    } else if (formData.categoryId && categories.length > 0 && !categories.find(cat => cat.id === formData.categoryId)) {
      errors.push(`Selected category (ID: ${formData.categoryId}) is not valid. Available: ${categories.map(c => `${c.id}: ${c.name}`).join(', ')}`)
    }
    
    // Temporary: Allow creating products without categories if only fallback categories are available
    const hasRealCategories = categories.some(cat => cat.id < 9000)
    if (formData.categoryId && !hasRealCategories) {
      console.log('⚠️ Only fallback categories available, removing categoryId to allow product creation')
      // Don't add error, but we'll remove the categoryId in the API call
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive",
      })
      return
    }

    const token = localStorage.getItem('authToken')
    console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing')
    console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'null')
    
    if (!token) {
      console.log('❌ No token found in localStorage')
      toast({
        title: "Authentication Error",
        description: "Please log in to add products",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🚀 Creating product with complete form data:', formData)
      console.log('📝 Form validation passed for:', { 
        name: formData.name, 
        sku: formData.sku, 
        salePrice: formData.salePrice,
        type: formData.type,
        categoryId: formData.categoryId,
        unit: formData.unit,
        currentStock: formData.currentStock,
        minimumStock: formData.minimumStock
      })
      console.log('📊 Categories available:', categories.map(c => `${c.id}: ${c.name}`))
      console.log('🎯 Selected category ID:', formData.categoryId)
      
      // Detailed data type checking
      console.log('🔍 Data type validation:')
      console.log('- name type:', typeof formData.name, 'value:', formData.name)
      console.log('- type type:', typeof formData.type, 'value:', formData.type)
      console.log('- categoryId type:', typeof formData.categoryId, 'value:', formData.categoryId)
      console.log('- salePrice type:', typeof formData.salePrice, 'value:', formData.salePrice)
      console.log('- currentStock type:', typeof formData.currentStock, 'value:', formData.currentStock)
      
      const response = await productService.createProduct(token, formData)
      console.log('Create product response:', response)
      
      if (response.success && response.data) {
        const newProduct = {
          ...response.data,
          price: `₹${response.data.salePrice?.toLocaleString('en-IN') || '0.00'}`,
          status: getProductStatus(response.data.currentStock || 0, response.data.minimumStock || 0),
          category: categories.find(cat => cat.id === response.data.categoryId) || undefined,
        }
        
        setProducts([...products, newProduct])
        
        toast({
          title: "Product Added",
          description: `${formData.name} has been added successfully`,
        })

        resetForm()
        setIsAddDialogOpen(false)
      } else {
        throw new Error(response.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('💥 Error creating product:', error)
      console.error('Error details:', error.message)
      
      let errorMessage = "Failed to add product. Please try again."
      
      if (error.message.includes("Product category not found")) {
        errorMessage = `Category not found. Selected category ID: ${formData.categoryId}. Please select a different category or contact support.`
      } else if (error.message.includes("404")) {
        errorMessage = "API endpoint not found. Please check if the backend is running."
      } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        errorMessage = "Authentication failed. Please login again."
      } else if (error.message.includes("403")) {
        errorMessage = "Access denied. You don't have permission to create products."
      }
      
      toast({
        title: "Error Creating Product",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      type: product.type,
      categoryId: product.categoryId,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      unit: product.unit,
      description: product.description || "",
      hsnCode: product.hsnCode || "",
      barcode: product.barcode || "",
      brand: product.brand || "",
      model: product.model || "",
      weight: product.weight || null,
      dimensions: product.dimensions || "",
      notes: product.notes || "",
      isActive: product.isActive,
      trackInventory: product.trackInventory,
      salesTaxId: product.salesTaxId,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    // Backend-aligned validation (same as add product)
    const errors = []
    
    // Required fields (based on backend schema)
    if (!formData.name?.trim()) {
      errors.push("Product Name is required")
    }
    
    // Optional validation for better UX
    if (formData.salePrice < 0) {
      errors.push("Sale Price cannot be negative")
    }
    
    // Validate category exists if selected
    if (formData.categoryId && categories.length > 0 && !categories.find(cat => cat.id === formData.categoryId)) {
      errors.push(`Selected category (ID: ${formData.categoryId}) is not valid. Available: ${categories.map(c => `${c.id}: ${c.name}`).join(', ')}`)
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive",
      })
      return
    }

    const token = localStorage.getItem('authToken')
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to update products",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Updating product with data:', formData)
      
      const response = await productService.updateProduct(token, editingProduct.id, formData)
      console.log('Update product response:', response)
      
      if (response.success && response.data) {
        const updatedProduct = {
          ...response.data,
          price: `₹${response.data.salePrice?.toLocaleString('en-IN') || '0.00'}`,
          status: getProductStatus(response.data.currentStock || 0, response.data.minimumStock || 0),
          category: categories.find(cat => cat.id === response.data.categoryId) || undefined,
        }
        
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))
        
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully`,
        })

        setEditingProduct(null)
        resetForm()
        setIsEditDialogOpen(false)
      } else {
        throw new Error(response.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to delete products",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Deleting product:', product.id)
      
      const response = await productService.deleteProduct(token, product.id)
      console.log('Delete product response:', response)
      
      if (response.success) {
        setProducts(products.filter(p => p.id !== product.id))
        
        toast({
          title: "Product Deleted",
          description: `${product.name} has been deleted successfully`,
        })
      } else {
        throw new Error(response.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
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
    <ProtectedRoute>
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
                      <Label htmlFor="type">Product Type *</Label>
                      <Select value={formData.type} onValueChange={(value: 'consu' | 'product' | 'service') => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consu">Consumable</SelectItem>
                          <SelectItem value="product">Storable Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.categoryId?.toString() || "no-category"} onValueChange={(value) => {
                        console.log('🔄 Category dropdown change:', {
                          'raw value': value,
                          'value type': typeof value,
                          'parsed': parseInt(value),
                          'final categoryId': value && value !== "no-categories" && value !== "no-category" ? parseInt(value) : null
                        });
                        setFormData({...formData, categoryId: value && value !== "no-categories" && value !== "no-category" ? parseInt(value) : null});
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-category">No Category</SelectItem>
                          {categories.length > 0 ? (
                            categories.map((cat) => (
                              <SelectItem 
                                key={cat.id} 
                                value={cat.id.toString()}
                                disabled={cat.id >= 9000}
                              >
                                {cat.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-categories" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground">
                        Categories loaded: {categories.length}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price (₹)</Label>
                      <Input
                        id="costPrice"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Sale Price (₹) *</Label>
                      <Input
                        id="salePrice"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input
                        id="currentStock"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({...formData, currentStock: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimumStock">Minimum Stock</Label>
                      <Input
                        id="minimumStock"
                        value={formData.minimumStock}
                        onChange={(e) => setFormData({...formData, minimumStock: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        placeholder="Unit"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hsnCode">HSN Code</Label>
                      <Input
                        id="hsnCode"
                        value={formData.hsnCode}
                        onChange={(e) => setFormData({...formData, hsnCode: e.target.value})}
                        placeholder="HSN/SAC Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                        placeholder="Product barcode"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        placeholder="Product brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        placeholder="Product model"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        value={formData.weight || ""}
                        onChange={(e) => setFormData({...formData, weight: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="0.000"
                        type="number"
                        step="0.001"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                        placeholder="L x W x H"
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
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes..."
                      rows={2}
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
              onClick={() => handleSort('categoryId')}
              className="h-8"
            >
              Category {getSortIcon('categoryId')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('salePrice')}
              className="h-8"
            >
              Price {getSortIcon('salePrice')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('currentStock')}
              className="h-8"
            >
              Stock {getSortIcon('currentStock')}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No products match your search criteria.' : 'Get started by adding your first product.'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          ) : (
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
                          <span>Category: {product.category?.name || 'Uncategorized'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-base sm:text-lg">{product.price}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Stock: {product.currentStock}</p>
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
          )}

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
                    <Label htmlFor="edit-type">Product Type *</Label>
                    <Select value={formData.type} onValueChange={(value: 'consu' | 'product' | 'service') => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consu">Consumable</SelectItem>
                        <SelectItem value="product">Storable Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.categoryId?.toString() || "no-category"} onValueChange={(value) => {
                      console.log('🔄 Edit Category dropdown change:', {
                        'raw value': value,
                        'value type': typeof value,
                        'parsed': parseInt(value),
                        'final categoryId': value && value !== "no-categories" && value !== "no-category" ? parseInt(value) : null
                      });
                      setFormData({...formData, categoryId: value && value !== "no-categories" && value !== "no-category" ? parseInt(value) : null});
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-category">No Category</SelectItem>
                        {categories.length > 0 ? (
                          categories.map((cat) => (
                            <SelectItem 
                              key={cat.id} 
                              value={cat.id.toString()}
                              disabled={cat.id >= 9000}
                            >
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            No categories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Categories loaded: {categories.length}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-costPrice">Cost Price (₹)</Label>
                    <Input
                      id="edit-costPrice"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salePrice">Sale Price (₹) *</Label>
                    <Input
                      id="edit-salePrice"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-currentStock">Current Stock</Label>
                    <Input
                      id="edit-currentStock"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({...formData, currentStock: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-minimumStock">Minimum Stock</Label>
                    <Input
                      id="edit-minimumStock"
                      value={formData.minimumStock}
                      onChange={(e) => setFormData({...formData, minimumStock: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Input
                      id="edit-unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      placeholder="Unit"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-hsnCode">HSN Code</Label>
                    <Input
                      id="edit-hsnCode"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({...formData, hsnCode: e.target.value})}
                      placeholder="HSN/SAC Code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-barcode">Barcode</Label>
                    <Input
                      id="edit-barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      placeholder="Product barcode"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-brand">Brand</Label>
                    <Input
                      id="edit-brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Product brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">Model</Label>
                    <Input
                      id="edit-model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="Product model"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-weight">Weight (kg)</Label>
                    <Input
                      id="edit-weight"
                      value={formData.weight || ""}
                      onChange={(e) => setFormData({...formData, weight: e.target.value ? parseFloat(e.target.value) : null})}
                      placeholder="0.000"
                      type="number"
                      step="0.001"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dimensions">Dimensions</Label>
                    <Input
                      id="edit-dimensions"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                      placeholder="L x W x H"
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
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={2}
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
    </ProtectedRoute>
  )
}