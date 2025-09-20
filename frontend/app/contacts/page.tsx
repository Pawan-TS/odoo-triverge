"use client"

import { useState } from "react"
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
import { Plus, Search, Edit, Trash2, Mail, Phone, Save, X } from "lucide-react"

interface Contact {
  id: number
  name: string
  email: string
  phone: string
  type: "Customer" | "Vendor"
  status: "Active" | "Inactive"
  balance: string
  address?: string
  company?: string
}

const initialCustomers: Contact[] = [
  {
    id: 1,
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1-555-0123",
    type: "Customer",
    status: "Active",
    balance: "₹2,450.00",
    address: "123 Business St, Mumbai",
    company: "Acme Corp",
  },
  {
    id: 2,
    name: "Tech Solutions Inc",
    email: "info@techsol.com",
    phone: "+1-555-0124",
    type: "Customer",
    status: "Active",
    balance: "₹1,200.00",
    address: "456 Tech Park, Bangalore",
    company: "Tech Solutions Inc",
  },
  {
    id: 3,
    name: "Global Enterprises",
    email: "sales@global.com",
    phone: "+1-555-0125",
    type: "Customer",
    status: "Inactive",
    balance: "₹0.00",
    address: "789 Global Plaza, Delhi",
    company: "Global Enterprises",
  },
]

const initialVendors: Contact[] = [
  {
    id: 4,
    name: "Office Supplies Co",
    email: "orders@officesupplies.com",
    phone: "+1-555-0200",
    type: "Vendor",
    status: "Active",
    balance: "-₹850.00",
    address: "321 Supply Street, Pune",
    company: "Office Supplies Co",
  },
  {
    id: 5,
    name: "Tech Hardware Ltd",
    email: "sales@techhw.com",
    phone: "+1-555-0201",
    type: "Vendor",
    status: "Active",
    balance: "-₹3,200.00",
    address: "654 Hardware Ave, Chennai",
    company: "Tech Hardware Ltd",
  },
  {
    id: 6,
    name: "Marketing Agency",
    email: "hello@marketing.com",
    phone: "+1-555-0202",
    type: "Vendor",
    status: "Active",
    balance: "-₹1,500.00",
    address: "987 Marketing Blvd, Hyderabad",
    company: "Marketing Agency",
  },
]

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("customers")
  const [customers, setCustomers] = useState<Contact[]>(initialCustomers)
  const [vendors, setVendors] = useState<Contact[]>(initialVendors)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Customer" as "Customer" | "Vendor",
    status: "Active" as "Active" | "Inactive",
    address: "",
    company: "",
  })

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      type: "Customer",
      status: "Active",
      address: "",
      company: "",
    })
  }

  const handleAddContact = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newContact: Contact = {
      id: Date.now(), // Simple ID generation
      ...formData,
      balance: "₹0.00",
    }

    if (formData.type === "Customer") {
      setCustomers([...customers, newContact])
    } else {
      setVendors([...vendors, newContact])
    }

    toast({
      title: "Contact Added",
      description: `${formData.name} has been added successfully`,
    })

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      type: contact.type,
      status: contact.status,
      address: contact.address || "",
      company: contact.company || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateContact = () => {
    if (!editingContact) return

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updatedContact: Contact = {
      ...editingContact,
      ...formData,
    }

    if (editingContact.type === "Customer") {
      setCustomers(customers.map(c => c.id === editingContact.id ? updatedContact : c))
    } else {
      setVendors(vendors.map(v => v.id === editingContact.id ? updatedContact : v))
    }

    toast({
      title: "Contact Updated",
      description: `${formData.name} has been updated successfully`,
    })

    setEditingContact(null)
    resetForm()
    setIsEditDialogOpen(false)
  }

  const handleDeleteContact = (contact: Contact) => {
    if (contact.type === "Customer") {
      setCustomers(customers.filter(c => c.id !== contact.id))
    } else {
      setVendors(vendors.filter(v => v.id !== contact.id))
    }

    toast({
      title: "Contact Deleted",
      description: `${contact.name} has been deleted successfully`,
    })
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contacts</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your customers and vendors</p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Create a new customer or vendor contact. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type *
                    </Label>
                    <Select value={formData.type} onValueChange={(value: "Customer" | "Vendor") => setFormData({...formData, type: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Customer">Customer</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="col-span-3"
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="col-span-3"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="col-span-3"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="col-span-3"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="col-span-3"
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value: "Active" | "Inactive") => setFormData({...formData, status: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleAddContact}>
                    <Save className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="customers" className="flex-1 sm:flex-none">Customers</TabsTrigger>
              <TabsTrigger value="vendors" className="flex-1 sm:flex-none">Vendors</TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm sm:text-base">
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{customer.name}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-1 space-y-1 sm:space-y-0">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span>{customer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          <div className="text-left sm:text-right">
                            <Badge variant={customer.status === "Active" ? "default" : "secondary"} className="mb-1">
                              {customer.status}
                            </Badge>
                            <p className="text-sm font-medium">{customer.balance}</p>
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                              onClick={() => handleEditContact(customer)}
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
                                  <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {customer.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteContact(customer)}>
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
            </TabsContent>

            <TabsContent value="vendors" className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm sm:text-base">
                              {vendor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{vendor.name}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-1 space-y-1 sm:space-y-0">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{vendor.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span>{vendor.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          <div className="text-left sm:text-right">
                            <Badge variant={vendor.status === "Active" ? "default" : "secondary"} className="mb-1">
                              {vendor.status}
                            </Badge>
                            <p className="text-sm font-medium">{vendor.balance}</p>
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                              onClick={() => handleEditContact(vendor)}
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
                                  <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {vendor.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteContact(vendor)}>
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
            </TabsContent>
          </Tabs>

          {/* Edit Contact Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update the contact information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">
                    Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value: "Customer" | "Vendor") => setFormData({...formData, type: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter contact name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-company" className="text-right">
                    Company
                  </Label>
                  <Input
                    id="edit-company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter company name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Phone *
                  </Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter address"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value: "Active" | "Inactive") => setFormData({...formData, status: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateContact}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Contact
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