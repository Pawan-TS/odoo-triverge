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
  name: string;
  email: string;
  phone: string;
  contactType: 'customer' | 'vendor' | 'both';
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  paymentTerms?: string;
  addresses: Address[];
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
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    contactType: 'customer',
    addresses: [{
      type: 'billing',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    }]
  })

  const { toast } = useToast()

  // Load contacts data
  const loadContacts = async () => {
    try {
      setLoading(true)
      
      let contactsResponse;
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        sortBy,
        sortOrder
      };

      console.log('Loading contacts with params:', params);
      console.log('Active tab:', activeTab);

      switch (activeTab) {
        case 'customers':
          contactsResponse = await contactsApi.getCustomers(params);
          break;
        case 'vendors':
          contactsResponse = await contactsApi.getVendors(params);
          break;
        default:
          contactsResponse = await contactsApi.getAll(params);
      }

      console.log('Contacts response:', contactsResponse);

      if (contactsResponse.success && contactsResponse.data) {
        setContacts(contactsResponse.data.contacts || []);
        if (contactsResponse.data.pagination) {
          setTotalPages(contactsResponse.data.pagination.totalPages);
        }
      } else {
        console.error('Failed to load contacts:', contactsResponse);
        // Set empty array if API call fails
        setContacts([]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please check if the server is running.",
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
  }, []);

  // Handle create contact
  const handleCreateContact = async () => {
    try {
      const contactData = {
        ...contactForm,
        type: contactForm.contactType
      };
      const response = await contactsApi.create(contactData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Contact created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadContacts();
        loadStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive",
      });
    }
  };

  // Handle update contact
  const handleUpdateContact = async () => {
    if (!editingContact || !editingContact.id) return;
    
    try {
      const contactData = {
        ...contactForm,
        type: contactForm.contactType
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
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await contactsApi.export(format, {
        contactType: activeTab === 'all' ? undefined : activeTab.slice(0, -1), // customers -> customer
        search: searchTerm
      });
      
      if (response.success && response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
        toast({
          title: "Success",
          description: "Export started. Download will begin shortly.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export contacts",
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
      addresses: [{
        type: 'billing',
        street: '',
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
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      contactType: contact.type,
      gstNumber: contact.gstNumber,
      panNumber: contact.panNumber,
      creditLimit: contact.creditLimit,
      paymentTerms: contact.paymentTerms,
      addresses: contact.addresses || [{
        type: 'billing',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }],
      bankDetails: contact.bankDetails
    });
    setIsEditDialogOpen(true);
  };

  const addAddress = () => {
    setContactForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'shipping',
        street: '',
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

  const updateAddress = (index: number, field: keyof Address, value: string) => {
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
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
                  {/* Export buttons - hidden on mobile, shown as icons on tablet */}
                  <div className="hidden sm:flex sm:space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleExport('csv')}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline">Export CSV</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleExport('excel')}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline">Export Excel</span>
                    </Button>
                  </div>
                  
                  {/* Mobile export dropdown */}
                  <div className="sm:hidden">
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Export" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv" onSelect={() => handleExport('csv')}>
                          Export CSV
                        </SelectItem>
                        <SelectItem value="excel" onSelect={() => handleExport('excel')}>
                          Export Excel
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto flex items-center justify-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Contact</span>
                      </Button>
                    </DialogTrigger>
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
                              value={contactForm.creditLimit || ''}
                              onChange={(e) => setContactForm(prev => ({...prev, creditLimit: parseFloat(e.target.value) || undefined}))}
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
                                  value={address.type} 
                                  onValueChange={(value: 'billing' | 'shipping') => 
                                    updateAddress(index, 'type', value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="shipping">Shipping</SelectItem>
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
                                  value={address.street}
                                  onChange={(e) => updateAddress(index, 'street', e.target.value)}
                                  placeholder="Street address"
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
                        <Button onClick={handleCreateContact} className="w-full sm:w-auto">
                          Create Contact
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
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="currentBalance">Balance</SelectItem>
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
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{contact.name}</h3>
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
                                      variant={contact.type === 'customer' ? 'default' : contact.type === 'vendor' ? 'secondary' : 'outline'}
                                      className="text-xs"
                                    >
                                      {contact.type}
                                    </Badge>
                                    <Badge 
                                      variant={contact.status === 'active' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {contact.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                                <div className="text-left sm:text-right">
                                  <p className="text-xs sm:text-sm text-gray-600">Current Balance</p>
                                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                                    ₹{contact.currentBalance?.toLocaleString() || '0.00'}
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
                                          Are you sure you want to delete {contact.name}? This action cannot be undone.
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