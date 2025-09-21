"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Edit, Trash2, Mail, Phone, Save, X, Eye, Download, Users, Building2, Filter, MoreHorizontal, MapPin } from "lucide-react"
import { contactsApi, Contact, Address } from "@/lib/api"

// Types for the component
interface ContactStats {
  totalCustomers: number;
  totalVendors: number;
  activeContacts: number;
  totalOutstanding: number;
}

interface ContactFormData {
  name: string; // This will be mapped to contactName in API calls
  email: string;
  phone: string;
  contactType: 'customer' | 'vendor' | 'both'; // This will be mapped to proper case in API calls
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  paymentTerms?: string;
  addresses: {
    addressType: 'billing' | 'shipping' | 'both';
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: 'savings' | 'current';
  };
}

export default function ContactsPage() {
  // State management
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("contactName")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false) // Add loading state

  // Debug state changes
  useEffect(() => {
    console.log('isCreateDialogOpen changed to:', isCreateDialogOpen);
  }, [isCreateDialogOpen]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    contactType: 'customer',
    gstNumber: '',
    panNumber: '',
    creditLimit: 0,
    paymentTerms: '',
    addresses: [{
      addressType: 'billing',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    }]
  })

  const { toast } = useToast()

  // Load contacts data with multiple retry strategies
  const loadContacts = async (retryCount = 0) => {
    try {
      setLoading(true)
      
      console.log(`📞 Starting loadContacts attempt ${retryCount + 1}`);
      
      // Check authentication
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      console.log('🔐 Auth check - Token exists:', !!token);
      console.log('🔐 Auth check - User exists:', !!user);
      
      if (!token) {
        console.error('❌ No auth token found, user needs to login');
        toast({
          title: "Authentication Required",
          description: "Please login to view contacts",
          variant: "destructive",
        });
        return;
      }
      
      let contactsResponse;
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        sortBy,
        sortOrder
      };

      console.log('📞 Loading contacts with params:', params);
      console.log('📞 Active tab:', activeTab);
      console.log('📞 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1');

      // Try multiple API endpoints in sequence
      let apiCallSuccessful = false;
      
      try {
        switch (activeTab) {
          case 'customers':
            console.log('📞 Calling contactsApi.getCustomers...');
            contactsResponse = await contactsApi.getCustomers(params);
            break;
          case 'vendors':
            console.log('📞 Calling contactsApi.getVendors...');
            contactsResponse = await contactsApi.getVendors(params);
            break;
          default:
            console.log('📞 Calling contactsApi.getAll...');
            contactsResponse = await contactsApi.getAll(params);
        }
        apiCallSuccessful = true;
      } catch (apiError) {
        console.error('📞 Primary API call failed, trying fallback...', apiError);
        
        // Fallback: try the generic getAll endpoint regardless of tab
        try {
          console.log('📞 Fallback: Calling contactsApi.getAll...');
          contactsResponse = await contactsApi.getAll(params);
          apiCallSuccessful = true;
        } catch (fallbackError) {
          console.error('📞 Fallback API call also failed:', fallbackError);
          
          // Final fallback: try the debug endpoint that shows all contacts
          try {
            console.log('📞 Final fallback: Calling getAllDebug...');
            contactsResponse = await contactsApi.getAllDebug();
            apiCallSuccessful = true;
            console.log('📞 Debug endpoint successful');
          } catch (debugError) {
            console.error('📞 Even debug endpoint failed:', debugError);
            throw debugError;
          }
        }
      }

      console.log('📞 Raw API Response:', JSON.stringify(contactsResponse, null, 2));

      if (contactsResponse.success && contactsResponse.data) {
        console.log('✅ API call successful');
        console.log('📊 Contacts data:', contactsResponse.data.contacts);
        console.log('📊 Number of contacts:', contactsResponse.data.contacts?.length || 0);
        
        const contactsArray = contactsResponse.data.contacts || [];
        setContacts(contactsArray);
        
        if (contactsResponse.data.pagination) {
          setTotalPages(contactsResponse.data.pagination.totalPages);
          console.log('📊 Pagination:', contactsResponse.data.pagination);
        }
        
        // If we got contacts, show success message
        if (contactsArray.length > 0) {
          console.log('✅ Successfully loaded', contactsArray.length, 'contacts');
        } else {
          console.log('⚠️ API successful but no contacts returned');
          
          // If no contacts and this is first attempt, try once more without filters
          if (retryCount === 0) {
            console.log('🔄 Retrying without filters...');
            setTimeout(() => {
              loadContacts(1);
            }, 1000);
            return;
          }
        }
        
      } else {
        console.error('❌ API call failed:', contactsResponse);
        console.error('❌ Error message:', contactsResponse.message);
        
        toast({
          title: "API Error",
          description: contactsResponse.message || "Failed to load contacts from server",
          variant: "destructive",
        });
        
        // Set empty array if API call fails
        setContacts([]);
      }
    } catch (error: any) {
      console.error('💥 Exception in loadContacts:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // If this is the first attempt and we got a network error, try again
      if (retryCount < 2 && (error.message.includes('fetch') || error.message.includes('network'))) {
        console.log(`🔄 Network error, retrying in 2 seconds... (attempt ${retryCount + 2})`);
        setTimeout(() => {
          loadContacts(retryCount + 1);
        }, 2000);
        return;
      }
      
      toast({
        title: "Connection Error",
        description: `Failed to load contacts: ${error.message}. Please check if the backend server is running.`,
        variant: "destructive",
      });
      // Set empty array on error
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const statsResponse = await contactsApi.getStats();
      console.log('Stats response:', statsResponse);
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        console.error('Failed to load stats:', statsResponse);
        // Set default stats if API call fails
        setStats({
          totalCustomers: 0,
          totalVendors: 0,
          activeContacts: 0,
          totalOutstanding: 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set default stats on error
      setStats({
        totalCustomers: 0,
        totalVendors: 0,
        activeContacts: 0,
        totalOutstanding: 0
      });
    }
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadContacts();
  }, [currentPage, searchTerm, activeTab, sortBy, sortOrder]);

  useEffect(() => {
    loadStats();
    // Add debug call to understand the data issue
    debugContacts();
  }, []);

  // IMMEDIATE LOAD: Force load contacts as soon as component mounts
  useEffect(() => {
    console.log('🚀 Component mounted - triggering immediate contact load');
    
    // Small delay to ensure DOM is ready
    const immediateLoad = setTimeout(() => {
      console.log('🚀 Executing immediate contact load...');
      forceReloadContacts();
    }, 100);

    return () => clearTimeout(immediateLoad);
  }, []); // Only run once on mount

  // Debug function to check backend data
  const debugContacts = async () => {
    try {
      console.log('🐛 Calling debug endpoint...');
      const debugResponse = await contactsApi.debug();
      console.log('🐛 Debug response:', JSON.stringify(debugResponse, null, 2));
    } catch (error) {
      console.error('🐛 Debug call failed:', error);
    }
  };

  // Force reload contacts - can be called from console
  const forceReloadContacts = async () => {
    console.log('🔄 Force reloading contacts...');
    setContacts([]); // Clear current contacts
    setLoading(true);
    await loadContacts(0);
  };

  // Make force reload available globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceReloadContacts = forceReloadContacts;
      (window as any).debugContacts = debugContacts;
      console.log('🔧 Debug functions available: window.forceReloadContacts(), window.debugContacts()');
    }
  }, []);

  // Handle create contact
  const handleCreateContact = async () => {
    console.log('=== CREATE CONTACT BUTTON CLICKED ===');
    console.log('Current contactForm state:', JSON.stringify(contactForm, null, 2));
    
    // Check authentication
    const token = localStorage.getItem('authToken');
    console.log('Auth token available:', !!token);
    console.log('isCreating state:', isCreating);
    
    if (isCreating) {
      console.log('Already creating, returning early');
      return; // Prevent double clicks
    }
    
    try {
      setIsCreating(true);
      console.log('Set isCreating to true');
      
      // Validate required fields
      if (!contactForm.name.trim()) {
        console.log('Validation failed: Name is required');
        toast({
          title: "Validation Error",
          description: "Contact name is required",
          variant: "destructive",
        });
        return;
      }

      // Show loading state
      toast({
        title: "Creating Contact...",
        description: "Please wait while we save your contact",
      });

      // Prepare contact data for API - exactly match backend validation schema
      const contactData: any = {
        contactName: contactForm.name.trim(),
        contactType: contactForm.contactType.charAt(0).toUpperCase() + contactForm.contactType.slice(1), // 'Customer', 'Vendor', 'Both'
      };

      // Add optional fields only if they have values
      if (contactForm.email && contactForm.email.trim()) {
        contactData.email = contactForm.email.trim();
      }
      
      if (contactForm.phone && contactForm.phone.trim()) {
        contactData.phone = contactForm.phone.trim();
      }

      // For now, skip GST and PAN to avoid validation pattern errors
      // TODO: Add proper pattern validation for GST and PAN numbers
      
      contactData.isCompany = false;
      contactData.isActive = true;

      console.log('Prepared API data:', JSON.stringify(contactData, null, 2));
      console.log('Making API call to contactsApi.create...');

      const response = await contactsApi.create(contactData);
      
      console.log('API Response received:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('Success! Contact created successfully');
        // Success notification
        toast({
          title: "✅ Success!",
          description: "Contact created successfully and saved to database",
          variant: "default",
        });
        
        // Close dialog and refresh data
        console.log('Closing dialog and refreshing data...');
        setIsCreateDialogOpen(false);
        resetForm();
        loadContacts();
        loadStats();
      } else {
        console.log('API call failed with response:', response);
        // Handle API error response with detailed error message
        const errorMessage = response.message || "Failed to create contact";
        
        toast({
          title: "❌ Creation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('ERROR in handleCreateContact:', error);
      console.error('Error stack:', error.stack);
      
      // Try to extract more detailed error information
      let errorMessage = "Failed to create contact. Please check your connection and try again.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // If it's a validation error, try to get more details
      if (error.message?.includes('Validation failed')) {
        errorMessage = "Validation failed - please check all required fields are properly filled.";
      }
      
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('Setting isCreating to false');
      setIsCreating(false); // Clear loading state
    }
  };

  // Handle update contact
  const handleUpdateContact = async () => {
    if (!editingContact || !editingContact.id) return;
    
    try {
      const contactData = {
        contactName: contactForm.name.trim(),
        contactType: contactForm.contactType.charAt(0).toUpperCase() + contactForm.contactType.slice(1) as 'Customer' | 'Vendor' | 'Both',
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        gstNumber: contactForm.gstNumber || undefined,
        panNumber: contactForm.panNumber || undefined,
        creditLimit: contactForm.creditLimit || undefined,
        // Note: paymentTerms not supported in current Contact interface
      };
      const response = await contactsApi.update(editingContact.id, contactData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingContact(null);
        resetForm();
        loadContacts();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  // Handle delete contact
  const handleDeleteContact = async (id: number) => {
    try {
      const response = await contactsApi.delete(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
        loadContacts();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const response = await contactsApi.bulkDelete(selectedContacts);
      if (response.success) {
        toast({
          title: "Success",
          description: `${response.data?.deletedCount || 0} contacts deleted successfully`,
        });
        setSelectedContacts([]);
        loadContacts();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await contactsApi.export('csv', {
        contactType: activeTab === 'all' ? undefined : activeTab.slice(0, -1), // customers -> customer
        search: searchTerm
      });
      
      if (response.success && response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
        toast({
          title: "Success",
          description: "CSV export started. Download will begin shortly.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export contacts to CSV",
        variant: "destructive",
      });
    }
  };

  // Form utilities
  const resetForm = () => {
    setContactForm({
      name: '',
      email: '',
      phone: '',
      contactType: 'customer',
      gstNumber: '',
      panNumber: '',
      creditLimit: 0,
      paymentTerms: '',
      addresses: [{
        addressType: 'billing',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }]
    });
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.contactName || contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      contactType: contact.contactType?.toLowerCase() as 'customer' | 'vendor' | 'both' || 'customer',
      gstNumber: contact.gstNumber || '',
      panNumber: contact.panNumber || '',
      creditLimit: contact.creditLimit || 0,
      paymentTerms: '', // Note: not available in current Contact interface
      addresses: contact.addresses?.map(addr => ({
        addressType: addr.addressType,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || 'India'
      })) || [{
        addressType: 'billing',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }],
      // Note: bankDetails not available in current Contact interface
    });
    setIsEditDialogOpen(true);
  };

  const addAddress = () => {
    setContactForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        addressType: 'shipping',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }]
    }));
  };

  const removeAddress = (index: number) => {
    setContactForm(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const updateAddress = (index: number, field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area - add left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{/* Page Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contacts</h1>
                  <p className="text-sm sm:text-base text-gray-600">Manage your customers and vendors</p>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                  {/* Export CSV button - responsive */}
                  <Button 
                    variant="outline" 
                    onClick={handleExport}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <Button 
                      className="w-full sm:w-auto flex items-center justify-center space-x-2"
                      onClick={() => {
                        console.log('Add Contact button clicked!');
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Contact</span>
                    </Button>
                    <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Contact</DialogTitle>
                        <DialogDescription>
                          Add a new customer or vendor to your system
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={contactForm.name}
                              onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                              placeholder="Enter contact name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contactType">Type *</Label>
                            <Select 
                              value={contactForm.contactType} 
                              onValueChange={(value: 'customer' | 'vendor' | 'both') => 
                                setContactForm(prev => ({...prev, contactType: value}))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>

                        {/* Tax Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                              id="gstNumber"
                              value={contactForm.gstNumber || ''}
                              onChange={(e) => setContactForm(prev => ({...prev, gstNumber: e.target.value}))}
                              placeholder="Enter GST number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="panNumber">PAN Number</Label>
                            <Input
                              id="panNumber"
                              value={contactForm.panNumber || ''}
                              onChange={(e) => setContactForm(prev => ({...prev, panNumber: e.target.value}))}
                              placeholder="Enter PAN number"
                            />
                          </div>
                        </div>

                        {/* Financial Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="creditLimit">Credit Limit</Label>
                            <Input
                              id="creditLimit"
                              type="number"
                              value={contactForm.creditLimit?.toString() || ''}
                              onChange={(e) => setContactForm(prev => ({...prev, creditLimit: parseFloat(e.target.value) || 0}))}
                              placeholder="Enter credit limit"
                            />
                          </div>
                          <div>
                            <Label htmlFor="paymentTerms">Payment Terms</Label>
                            <Input
                              id="paymentTerms"
                              value={contactForm.paymentTerms || ''}
                              onChange={(e) => setContactForm(prev => ({...prev, paymentTerms: e.target.value}))}
                              placeholder="e.g., 30 days"
                            />
                          </div>
                        </div>

                        {/* Addresses */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Addresses</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addAddress}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add Address
                            </Button>
                          </div>
                          
                          {contactForm.addresses.map((address, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <Select 
                                  value={address.addressType} 
                                  onValueChange={(value: 'billing' | 'shipping' | 'both') => 
                                    updateAddress(index, 'addressType', value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="shipping">Shipping</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {contactForm.addresses.length > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => removeAddress(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <Input
                                  value={address.addressLine1}
                                  onChange={(e) => updateAddress(index, 'addressLine1', e.target.value)}
                                  placeholder="Street address"
                                />
                                <Input
                                  value={address.addressLine2 || ''}
                                  onChange={(e) => updateAddress(index, 'addressLine2', e.target.value)}
                                  placeholder="Street address line 2 (optional)"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <Input
                                    value={address.city}
                                    onChange={(e) => updateAddress(index, 'city', e.target.value)}
                                    placeholder="City"
                                  />
                                  <Input
                                    value={address.state}
                                    onChange={(e) => updateAddress(index, 'state', e.target.value)}
                                    placeholder="State"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <Input
                                    value={address.postalCode}
                                    onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                                    placeholder="Postal code"
                                  />
                                  <Input
                                    value={address.country}
                                    onChange={(e) => updateAddress(index, 'country', e.target.value)}
                                    placeholder="Country"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                        <Button 
                          type="button"
                          onClick={() => {
                            console.log('=== BUTTON CLICK DETECTED ===');
                            handleCreateContact();
                          }}
                          className="w-full sm:w-auto"
                          disabled={!contactForm.name.trim() || isCreating}
                        >
                          {isCreating ? "Creating..." : "Create Contact"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Statistics Cards */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Total Customers</CardTitle>
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold">{stats.totalCustomers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Total Vendors</CardTitle>
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold">{stats.totalVendors}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Active Contacts</CardTitle>
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold">{stats.activeContacts}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Total Outstanding</CardTitle>
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold">₹{stats.totalOutstanding.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <Card className="mb-4 sm:mb-6">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contactName">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="contactType">Type</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedContacts.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <span className="text-sm text-blue-700">
                        {selectedContacts.length} contact(s) selected
                      </span>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete Selected
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Contacts</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {selectedContacts.length} contact(s)? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkDelete}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedContacts([])}
                          className="w-full sm:w-auto"
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contacts Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Contacts</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading contacts...</p>
                    </div>
                  </div>
                ) : contacts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm ? 
                            `No contacts match your search "${searchTerm}"` : 
                            "Get started by adding your first contact"
                          }
                        </p>
                        <Button onClick={() => {
                          console.log('Add Contact (empty state) button clicked!');
                          setIsCreateDialogOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Contacts List */}
                    <div className="grid gap-4">
                      {contacts.map((contact) => (
                        <Card key={contact.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                              <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                                <Checkbox
                                  checked={selectedContacts.includes(contact.id || 0)}
                                  onCheckedChange={(checked) => {
                                    if (checked && contact.id) {
                                      setSelectedContacts([...selectedContacts, contact.id]);
                                    } else if (contact.id) {
                                      setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                                    }
                                  }}
                                  className="mt-1"
                                />
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 font-semibold text-sm sm:text-lg">
                                    {(contact.contactName || contact.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{contact.contactName || contact.name || 'Unknown Contact'}</h3>
                                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 mt-1">
                                    {contact.email && (
                                      <div className="flex items-center">
                                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                        <span className="truncate">{contact.email}</span>
                                      </div>
                                    )}
                                    {contact.phone && (
                                      <div className="flex items-center">
                                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                        <span>{contact.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge 
                                      variant={contact.contactType === 'Customer' ? 'default' : contact.contactType === 'Vendor' ? 'secondary' : 'outline'}
                                      className="text-xs"
                                    >
                                      {contact.contactType}
                                    </Badge>
                                    <Badge 
                                      variant={contact.isActive ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {contact.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                                <div className="text-left sm:text-right">
                                  <p className="text-xs sm:text-sm text-gray-600">Current Balance</p>
                                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                                    ₹{contact.openingBalance?.toLocaleString() || '0.00'}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(contact)}>
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(contact)}>
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {contact.contactName || contact.name || 'this contact'}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => contact.id && handleDeleteContact(contact.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-xs sm:text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
                          Showing {contacts.length} contacts
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <Label htmlFor="edit-contactType">Type *</Label>
                <Select 
                  value={contactForm.contactType} 
                  onValueChange={(value: 'customer' | 'vendor' | 'both') => 
                    setContactForm(prev => ({...prev, contactType: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Tax Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-gstNumber">GST Number</Label>
                <Input
                  id="edit-gstNumber"
                  value={contactForm.gstNumber || ''}
                  onChange={(e) => setContactForm(prev => ({...prev, gstNumber: e.target.value}))}
                  placeholder="Enter GST number"
                />
              </div>
              <div>
                <Label htmlFor="edit-panNumber">PAN Number</Label>
                <Input
                  id="edit-panNumber"
                  value={contactForm.panNumber || ''}
                  onChange={(e) => setContactForm(prev => ({...prev, panNumber: e.target.value}))}
                  placeholder="Enter PAN number"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-creditLimit">Credit Limit</Label>
                <Input
                  id="edit-creditLimit"
                  type="number"
                  value={contactForm.creditLimit || ''}
                  onChange={(e) => setContactForm(prev => ({...prev, creditLimit: parseFloat(e.target.value) || undefined}))}
                  placeholder="Enter credit limit"
                />
              </div>
              <div>
                <Label htmlFor="edit-paymentTerms">Payment Terms</Label>
                <Input
                  id="edit-paymentTerms"
                  value={contactForm.paymentTerms || ''}
                  onChange={(e) => setContactForm(prev => ({...prev, paymentTerms: e.target.value}))}
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateContact} className="w-full sm:w-auto">
              Update Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIAssistant />
    </div>
  )
}