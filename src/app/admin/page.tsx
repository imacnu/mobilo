'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag, Plus, Trash2, ImagePlus } from 'lucide-react';
import { supabase, Product, Order, uploadImage } from '@/lib/supabase';
import styles from './page.module.css';

const ADMIN_PASSWORD = 'mobilo2024';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'muebles',
    imageFiles: [] as File[],
    imageUrls: [] as string[],
    characteristics: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const loadData = () => {
    setLoading(true);
    if (activeTab === 'products') {
      loadProducts();
    } else {
      loadOrders();
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));

    setNewProduct(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
      imageUrls: [...prev.imageUrls, ...newUrls]
    }));
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of newProduct.imageFiles) {
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      const images = uploadedUrls.length > 0 
        ? uploadedUrls 
        : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'];

      const characteristics = newProduct.characteristics
        ? JSON.parse(newProduct.characteristics)
        : {};

      const { error } = await supabase.from('products').insert({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image_url: images[0],
        image_urls: images,
        characteristics,
        available: true
      });

      if (error) throw error;

      console.log('=== NUEVO PRODUCTO AÑADIDO ===');
      console.log('Nombre:', newProduct.name);
      console.log('Precio:', newProduct.price, '€');
      console.log('Categoría:', newProduct.category);
      console.log('Imágenes:', images.length);
      console.log('================================');

      setShowForm(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'muebles',
        imageFiles: [],
        imageUrls: [],
        characteristics: ''
      });

      loadProducts();
      alert('Producto añadido correctamente');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error al añadir producto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar producto');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.login}>
        <div className={styles.loginBox}>
          <h1>Admin Malco</h1>
          <p>Ingresa la contraseña para acceder</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1>Panel de Administración</h1>
        <button 
          onClick={() => router.push('/')}
          className="btn btn-outline"
        >
          Ver tienda
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={20} />
          Pedidos
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <span className={styles.badge}>
              {orders.filter(o => o.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={20} />
          Productos
        </button>
      </div>

      {activeTab === 'products' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Gestión de Productos</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Añadir Producto
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddProduct} className={styles.form}>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  placeholder="Nombre del producto *"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="muebles">Muebles</option>
                  <option value="decoracion">Decoración</option>
                  <option value="iluminacion">Iluminación</option>
                  <option value="textil">Textil</option>
                  <option value="cocina">Cocina</option>
                  <option value="electronica">Electrónica</option>
                </select>
                <input
                  type="number"
                  placeholder="Precio (€) *"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  step="0.01"
                  required
                />
              </div>

              <div className={styles.imageUploadSection}>
                <label>Imágenes del producto</label>
                <div className={styles.imageUploadBox}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className={styles.fileInput}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadBtn}
                  >
                    <ImagePlus size={24} />
                    <span>Seleccionar imágenes</span>
                  </button>
                </div>
                {newProduct.imageUrls.length > 0 && (
                  <div className={styles.imagePreviewGrid}>
                    {newProduct.imageUrls.map((url, index) => (
                      <div key={index} className={styles.imagePreview}>
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className={styles.removeImageBtn}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                placeholder="Descripción"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                rows={3}
              />
              <textarea
                placeholder='Características (JSON formato: {"Material": "Madera", "Color": "Negro"})'
                value={newProduct.characteristics}
                onChange={(e) => setNewProduct({...newProduct, characteristics: e.target.value})}
                rows={2}
              />
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? 'Subiendo imágenes...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className={styles.loading}>Cargando...</div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>No hay productos. Añade el primero.</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>Producto</span>
                <span>Categoría</span>
                <span>Precio</span>
                <span>Imágenes</span>
                <span>Acciones</span>
              </div>
              {products.map(product => (
                <div key={product.id} className={styles.tableRow}>
                  <div className={styles.productCell}>
                    <img src={product.image_url} alt={product.name} />
                    <span>{product.name}</span>
                  </div>
                  <span>{product.category}</span>
                  <span>{product.price.toFixed(2)} €</span>
                  <span>{(product.image_urls || [product.image_url]).length}</span>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className={styles.section}>
          <h2>Pedidos Recientes</h2>
          
          {loading ? (
            <div className={styles.loading}>Cargando...</div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>No hay pedidos todavía</div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                      <span className={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                      {order.status === 'pending' && 'Pendiente'}
                      {order.status === 'confirmed' && 'Confirmado'}
                      {order.status === 'shipped' && 'Enviado'}
                      {order.status === 'delivered' && 'Entregado'}
                    </span>
                  </div>

                  <div className={styles.orderCustomer}>
                    <strong>{order.customer_name}</strong>
                    <span>{order.customer_email}</span>
                    {order.customer_phone && <span>{order.customer_phone}</span>}
                  </div>

                  <div className={styles.orderItems}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className={styles.orderItem}>
                        <span>{item.name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderTotal}>
                    <div className={styles.totalsRow}>
                      <span>Subtotal:</span>
                      <span>{order.subtotal.toFixed(2)} €</span>
                    </div>
                    {order.discount > 0 && (
                      <div className={styles.totalsRow}>
                        <span>Descuento:</span>
                        <span>-{order.discount.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className={styles.totalsRow}>
                      <strong>Total:</strong>
                      <strong>{order.total.toFixed(2)} €</strong>
                    </div>
                  </div>

                  <div className={styles.orderActions}>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                        className={styles.actionBtn}
                      >
                        Confirmar pedido
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button 
                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                        className={styles.actionBtn}
                      >
                        Marcar como enviado
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button 
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        className={styles.actionBtn}
                      >
                        Marcar como entregado
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <span className={styles.completedLabel}>✓ Completado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}