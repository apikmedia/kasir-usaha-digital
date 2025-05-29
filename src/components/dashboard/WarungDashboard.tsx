
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ShoppingCart, Package, TrendingUp, Receipt, Minus, Trash2 } from "lucide-react";
import Navbar from '../layout/Navbar';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  paymentMethod: 'cash' | 'transfer';
}

const WarungDashboard = () => {
  const [products] = useState<Product[]>([
    { id: '1', name: 'Nasi Ayam', price: 15000, stock: 50, category: 'Makanan' },
    { id: '2', name: 'Mie Ayam', price: 12000, stock: 30, category: 'Makanan' },
    { id: '3', name: 'Es Teh', price: 3000, stock: 100, category: 'Minuman' },
    { id: '4', name: 'Kopi', price: 5000, stock: 80, category: 'Minuman' },
    { id: '5', name: 'Kerupuk', price: 2000, stock: 200, category: 'Snack' },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '001',
      items: [
        { product: products[0], quantity: 2 },
        { product: products[2], quantity: 1 }
      ],
      total: 33000,
      createdAt: '2024-01-15T10:30:00Z',
      paymentMethod: 'cash'
    }
  ]);

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processPayment = (paymentMethod: 'cash' | 'transfer') => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: (transactions.length + 1).toString().padStart(3, '0'),
      items: [...cart],
      total: getCartTotal(),
      createdAt: new Date().toISOString(),
      paymentMethod
    };

    setTransactions([transaction, ...transactions]);
    setCart([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Stats
  const todayRevenue = transactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.total, 0);

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <Navbar businessType="warung" userName="Admin Warung" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Warung</h1>
            <p className="text-gray-600 mt-1">Kelola penjualan dan inventori warung Anda</p>
          </div>
          <Button 
            onClick={() => setShowNewProduct(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Produk Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(todayRevenue)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stok Menipis</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transaksi Hari Ini</CardTitle>
              <Receipt className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {transactions.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products & Cart Section */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="cashier" className="space-y-6">
              <TabsList className="bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="cashier">Kasir</TabsTrigger>
                <TabsTrigger value="products">Produk</TabsTrigger>
                <TabsTrigger value="history">Riwayat</TabsTrigger>
              </TabsList>

              <TabsContent value="cashier" className="space-y-6">
                {/* Product Grid */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Pilih Produk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {products.map((product) => (
                        <Button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="h-auto p-4 bg-white border-2 border-green-200 hover:border-green-300 text-gray-900 hover:bg-green-50 flex flex-col items-start"
                          variant="outline"
                        >
                          <span className="font-semibold text-sm">{product.name}</span>
                          <span className="text-green-600 font-bold">{formatCurrency(product.price)}</span>
                          <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Manajemen Produk</CardTitle>
                    <CardDescription>
                      Kelola produk dan stok warung Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.category}</p>
                            <p className="text-green-600 font-bold">{formatCurrency(product.price)}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={product.stock < 10 ? "destructive" : "default"}>
                              Stok: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Riwayat Transaksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold">#{transaction.id}</span>
                            <span className="text-green-600 font-bold">{formatCurrency(transaction.total)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {transaction.items.map((item, idx) => (
                              <div key={idx}>
                                {item.product.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(transaction.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart Section */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Keranjang ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-gray-600">{formatCurrency(item.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(getCartTotal())}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={() => processPayment('cash')}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          Bayar Tunai
                        </Button>
                        <Button
                          onClick={() => processPayment('transfer')}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Bayar Transfer
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Product Modal */}
      {showNewProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Produk Baru</CardTitle>
              <CardDescription>
                Tambahkan produk baru ke inventori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nama Produk</Label>
                <Input
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Masukkan nama produk"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  placeholder="Contoh: Makanan, Minuman, Snack"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewProduct(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  disabled={!newProduct.name || !newProduct.price}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Tambah Produk
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WarungDashboard;
