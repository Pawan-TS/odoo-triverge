const API_BASE = 'http://localhost:3000/api/v1'

export const productService = {
  // Get all products
  async getProducts(token, params = {}) {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE}/products?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Create product
  async createProduct(token, productData) {
    try {
      console.log('🚀 STARTING PRODUCT CREATION')
      console.log('📥 Raw productData received:', JSON.stringify(productData, null, 2))
      console.log('🔑 Token present:', !!token)
      
      // Map frontend form data to backend schema with proper validation
      const backendData = {
        name: productData.name?.trim(), // Required: 2-255 chars
        sku: productData.sku?.trim() || null, // Optional: max 50 chars
        type: productData.type || 'consu', // Required: 'consu', 'product', or 'service'
        categoryId: (() => {
          // Handle string values from dropdown
          if (!productData.categoryId || productData.categoryId === 'no-category' || productData.categoryId === '') {
            return null;
          }
          const numericId = parseInt(productData.categoryId, 10);
          // Only accept valid database category IDs (not fallback IDs)
          return (numericId > 0 && numericId < 9000 && !isNaN(numericId)) ? numericId : null;
        })(), // Optional: positive integer, exclude fallback IDs
        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : 0, // Optional: non-negative
        costPrice: productData.costPrice ? parseFloat(productData.costPrice) : 0, // Optional: non-negative
        currentStock: productData.currentStock ? parseFloat(productData.currentStock) : 0, // Optional: non-negative
        minimumStock: productData.minimumStock ? parseFloat(productData.minimumStock) : 0, // Optional: non-negative
        unit: productData.unit?.trim() || 'Unit', // Optional: max 20 chars
        description: productData.description?.trim() || null, // Optional: max 1000 chars
        hsnCode: productData.hsnCode?.trim() || null, // Optional: max 20 chars
        barcode: productData.barcode?.trim() || null, // Optional: max 100 chars
        brand: productData.brand?.trim() || null, // Optional: max 100 chars
        model: productData.model?.trim() || null, // Optional: max 100 chars
        weight: productData.weight ? parseFloat(productData.weight) : null, // Optional: non-negative
        dimensions: productData.dimensions?.trim() || null, // Optional: max 100 chars
        notes: productData.notes?.trim() || null, // Optional: max 1000 chars
        isActive: productData.isActive !== undefined ? productData.isActive : true, // Optional: boolean
        trackInventory: productData.trackInventory !== undefined ? productData.trackInventory : true, // Optional: boolean
        salesTaxId: productData.salesTaxId || null, // Optional: positive integer
      }

      console.log('📤 Frontend form data received:', productData)
      console.log('📦 Backend payload prepared:', backendData)
      console.log('🔍 Key fields check:', {
        name: backendData.name,
        type: backendData.type,
        categoryId: backendData.categoryId,
        salePrice: backendData.salePrice,
        unit: backendData.unit
      })
      console.log('🔢 Data type verification:', {
        'categoryId type': typeof backendData.categoryId,
        'categoryId value': backendData.categoryId,
        'salePrice type': typeof backendData.salePrice,
        'salePrice value': backendData.salePrice,
        'original categoryId': productData.categoryId,
        'original categoryId type': typeof productData.categoryId
      })

      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      })

      console.log('📡 Backend response status:', response.status)

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.log('❌ Could not parse error response as JSON')
          const errorText = await response.text()
          console.log('❌ Raw error response:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        console.log('❌ Backend validation error details:', errorData)
        
        // Show detailed validation errors for 422
        if (response.status === 422) {
          console.log('🔍 422 VALIDATION FAILURE DETAILS:')
          console.log('- Status:', response.status)
          console.log('- Error message:', errorData.message)
          console.log('- Error details:', errorData.details || errorData.error || 'No details provided')
          console.log('- Full error object:', JSON.stringify(errorData, null, 2))
          console.log('- Data sent to backend:', JSON.stringify(backendData, null, 2))
          
          // Check for Joi validation errors (backend format)
          if (errorData.data?.errors && Array.isArray(errorData.data.errors)) {
            console.log('🚨 Specific backend validation errors:')
            errorData.data.errors.forEach((error, index) => {
              console.log(`  ${index + 1}. Field: ${error.field || 'unknown'}`)
              console.log(`     Error: ${error.message}`)
              console.log(`     Type: ${error.type || 'unknown'}`)
            })
          } else if (errorData.details && Array.isArray(errorData.details)) {
            console.log('🚨 Alternative validation errors format:')
            errorData.details.forEach((detail, index) => {
              console.log(`  ${index + 1}. Field: ${detail.field || detail.path || 'unknown'}`)
              console.log(`     Error: ${detail.message}`)
            })
          }
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  // Update product
  async updateProduct(token, productId, productData) {
    try {
      // Map frontend form data to backend schema
      const backendData = {
        name: productData.name,
        sku: productData.sku || null,
        type: productData.type || 'consu', // Backend default is 'consu'
        categoryId: productData.categoryId || null,
        salePrice: productData.salePrice ? parseFloat(productData.salePrice) : 0,
        costPrice: productData.costPrice ? parseFloat(productData.costPrice) : 0,
        currentStock: productData.currentStock || 0,
        minimumStock: productData.minimumStock || 0,
        unit: productData.unit || 'Unit',
        description: productData.description || null,
        hsnCode: productData.hsnCode || null,
        barcode: productData.barcode || null,
        brand: productData.brand || null,
        model: productData.model || null,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        dimensions: productData.dimensions || null,
        notes: productData.notes || null,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        trackInventory: productData.trackInventory !== undefined ? productData.trackInventory : true,
        salesTaxId: productData.salesTaxId || null,
      }

      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Delete product
  async deleteProduct(token, productId) {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  // Get product by ID
  async getProductById(token, productId) {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  },

  // Helper function to format product for display
  formatProductForDisplay(product) {
    return {
      ...product,
      price: `₹${product.salePrice?.toLocaleString('en-IN') || '0.00'}`,
      status: this.calculateStatus(product.currentStock, product.minimumStock),
    }
  },

  // Calculate stock status
  calculateStatus(currentStock, minimumStock) {
    if (currentStock === 0) return "Out of Stock"
    if (currentStock <= minimumStock) return "Low Stock"
    return "In Stock"
  },
}

// Category service
export const categoryService = {
  // Get all categories
  async getCategories(token, params = {}) {
    try {
      console.log('🌐 Making API call to:', `${API_BASE}/product-categories`)
      console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'No token')
      
      // Set a higher limit to get all categories for dropdown
      const defaultParams = { limit: 100, ...params }
      const query = new URLSearchParams(defaultParams).toString()
      
      const response = await fetch(`${API_BASE}/product-categories?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Categories API error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Categories API success response:', result)
      console.log('📊 Categories in response:', result.data?.categories?.length || 0)
      return result
    } catch (error) {
      console.error('💥 Error in categoryService.getCategories:', error)
      throw error
    }
  },
}
