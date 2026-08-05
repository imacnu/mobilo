'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag, Plus, Trash2, ImagePlus, Pencil, Lock, ArrowLeft } from 'lucide-react';
import { loginAdmin, logoutAdmin, checkAdminAuth } from '@/app/actions/auth';
import {
  getAdminProducts,
  getAdminOrders,
  saveProduct,
  deleteProduct,
  updateOrderStatus,
  updateProductStock,
  uploadProductImage,
  deleteOrder,
} from '@/app/actions/admin';
import { PRODUCT_CATEGORIES } from '@/lib/categories';
import { refreshCatalog } from '@/lib/catalog-events';
import ProductImage from '@/components/ProductImage';
import type { Product, Order } from '@/lib/types';
import styles from './page.module.css';

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  price: '',
  category: 'muebles',
  stock: '1',
  imageFiles: [] as File[],
  imageUrls: [] as string[],
  charMaterial: '',
  charColor: '',
  charDimensions: '',
  charWeight: '',
  charOther: '',
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth().then((auth) => {
      setIsAuthenticated(auth);
      if (auth) loadOrders();
    });
  }, [loadOrders]);

  const switchTab = (tab: 'products' | 'orders') => {
    setActiveTab(tab);
    if (tab === 'products') loadProducts();
    else loadOrders();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const result = await loginAdmin(password);
      if (result.success) {
        setIsAuthenticated(true);
        setPassword('');
        loadOrders();
      } else {
        setLoginError(result.error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_BYTES = 8 * 1024 * 1024;
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        rejected.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
      } else {
        accepted.push(file);
      }
    }

    if (rejected.length > 0) {
      alert(
        `Estas imágenes superan el límite de 8 MB y no se han añadido:\n${rejected.join('\n')}`
      );
    }

    if (accepted.length === 0) {
      e.target.value = '';
      return;
    }

    const newUrls = accepted.map((file) => URL.createObjectURL(file));
    setNewProduct((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...accepted],
      imageUrls: [...prev.imageUrls, ...newUrls],
    }));
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setNewProduct((prev) => {
      const url = prev.imageUrls[index];
      const isBlob = url.startsWith('blob:');
      const blobIndex = isBlob
        ? prev.imageUrls.slice(0, index).filter((u) => u.startsWith('blob:')).length
        : -1;

      return {
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        imageFiles:
          isBlob && blobIndex >= 0
            ? prev.imageFiles.filter((_, i) => i !== blobIndex)
            : prev.imageFiles,
      };
    });
  };

  const openNewProductForm = () => {
    handleCancelEdit();
    setShowForm(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of newProduct.imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadProductImage(formData);
        if (!result.success) {
          alert(`Error al subir "${file.name}": ${result.error}`);
          return;
        }
        uploadedUrls.push(result.url);
      }

      const existingUrls = newProduct.imageUrls.filter(
        (url) => !url.startsWith('blob:')
      );
      const images =
        uploadedUrls.length > 0
          ? [...existingUrls, ...uploadedUrls]
          : existingUrls.length > 0
            ? existingUrls
            : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'];

      const characteristics: Record<string, string> = {};
      if (newProduct.charMaterial) characteristics['Material'] = newProduct.charMaterial;
      if (newProduct.charColor) characteristics['Color'] = newProduct.charColor;
      if (newProduct.charDimensions) characteristics['Dimensiones'] = newProduct.charDimensions;
      if (newProduct.charWeight) characteristics['Peso'] = newProduct.charWeight;
      if (newProduct.charOther) characteristics['Otros'] = newProduct.charOther;

      const result = await saveProduct(
        {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock) || 1,
          image_url: images[0],
          image_urls: images,
          characteristics,
        },
        isEditing && editingProductId ? editingProductId : undefined
      );

      if (!result.success) {
        alert(result.error);
        return;
      }

      const wasEditing = isEditing;
      handleCancelEdit();
      loadProducts();
      refreshCatalog();
      alert(wasEditing ? 'Producto actualizado correctamente' : 'Producto añadido correctamente');
    } catch (error) {
      console.error('Error saving product:', error);
      const message =
        error instanceof Error ? error.message : 'Error al guardar producto';
      alert(
        message.includes('Body exceeded') || message.includes('too large')
          ? 'La imagen es demasiado grande. Usa una de menos de 8 MB.'
          : message || 'Error al guardar producto'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    const result = await deleteProduct(productId);
    if (result.success) {
      loadProducts();
      refreshCatalog();
    } else {
      alert(result.error);
    }
  };

  const handleEditProduct = (product: Product) => {
    const chars = product.characteristics || {};
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: (product.stock || 1).toString(),
      imageFiles: [],
      imageUrls: product.image_urls || [product.image_url],
      charMaterial: chars['Material'] || '',
      charColor: chars['Color'] || '',
      charDimensions: chars['Dimensiones'] || '',
      charWeight: chars['Peso'] || '',
      charOther: chars['Otros'] || '',
    });
    setEditingProductId(product.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setShowForm(false);
    setNewProduct(EMPTY_PRODUCT);
  };

  const handleUpdateStock = async (productId: string, stockValue: string) => {
    const stock = parseInt(stockValue, 10);
    if (Number.isNaN(stock) || stock < 0) {
      alert('Introduce un stock válido (0 o más)');
      return;
    }

    const result = await updateProductStock(productId, stock);
    if (result.success) {
      loadProducts();
      refreshCatalog();
    } else {
      alert(result.error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const result = await updateOrderStatus(orderId, status);
    if (result.success) {
      loadOrders();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
    const result = await deleteOrder(orderId);
    if (result.success) {
      loadOrders();
    } else {
      alert(result.error);
    }
  };

  if (isAuthenticated === null) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.login}>
        <div className={styles.loginCard}>
          <Link href="/" className={styles.loginBack}>
            <ArrowLeft size={16} />
            Volver a la tienda
          </Link>

          <div className={styles.loginBrand}>
            <div className={styles.loginIcon}>
              <Lock size={28} />
            </div>
            <h1>Maria Amor 11B</h1>
            <p>Panel de administración</p>
          </div>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <label className={styles.loginField}>
              <span>Contraseña</span>
              <input
                type="password"
                placeholder="Introduce tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError && <p className={styles.loginError}>{loginError}</p>}
            <button
              type="submit"
              className={`btn btn-primary ${styles.loginSubmit}`}
              disabled={isLoggingIn || !password.trim()}
            >
              {isLoggingIn ? 'Accediendo...' : 'Entrar'}
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => router.push('/')} className="btn btn-outline">
            Ver tienda
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => switchTab('orders')}
        >
          <ShoppingBag size={20} />
          Pedidos
          {orders.filter((o) => o.status === 'pending').length > 0 && (
            <span className={styles.badge}>
              {orders.filter((o) => o.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => switchTab('products')}
        >
          <Package size={20} />
          Productos
        </button>
      </div>

      {activeTab === 'products' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Gestión de Productos</h2>
            <button onClick={openNewProductForm} className="btn btn-primary">
              <Plus size={18} />
              Añadir Producto
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddProduct} className={styles.form}>
              <h3 className={styles.formTitle}>
                {isEditing ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Nombre *</span>
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>Categoría</span>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Precio (€) *</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    step="0.01"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>Stock disponible *</span>
                  <input
                    type="number"
                    placeholder="Unidades en stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    min="0"
                    required
                  />
                </label>
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
                        <ProductImage src={url} alt={`Preview ${index + 1}`} width={100} height={100} />
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
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={3}
              />

              <div className={styles.characteristicsGrid}>
                <input
                  type="text"
                  placeholder="Material (ej: Madera, Metal, Tela)"
                  value={newProduct.charMaterial}
                  onChange={(e) => setNewProduct({ ...newProduct, charMaterial: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Color (ej: Negro, Blanco, Rojo)"
                  value={newProduct.charColor}
                  onChange={(e) => setNewProduct({ ...newProduct, charColor: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Dimensiones (ej: 200x100x80cm)"
                  value={newProduct.charDimensions}
                  onChange={(e) => setNewProduct({ ...newProduct, charDimensions: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Peso (ej: 25kg)"
                  value={newProduct.charWeight}
                  onChange={(e) => setNewProduct({ ...newProduct, charWeight: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Otros datos adicionales"
                  value={newProduct.charOther}
                  onChange={(e) => setNewProduct({ ...newProduct, charOther: e.target.value })}
                  className={styles.fullWidth}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={handleCancelEdit} className="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading
                    ? 'Subiendo imágenes...'
                    : isEditing
                      ? 'Actualizar Producto'
                      : 'Guardar Producto'}
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
                <span>Stock</span>
                <span>Acciones</span>
              </div>
              {products.map((product) => (
                <div key={product.id} className={styles.tableRow}>
                  <div className={styles.productCell}>
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      width={48}
                      height={48}
                    />
                    <span>{product.name}</span>
                  </div>
                  <span>{product.category}</span>
                  <span>{product.price.toFixed(2)} €</span>
                  <div className={styles.stockCell}>
                    <input
                      type="number"
                      className={styles.stockInput}
                      defaultValue={product.stock ?? 0}
                      min="0"
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value !== String(product.stock ?? 0)) {
                          handleUpdateStock(product.id, value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      aria-label={`Stock de ${product.name}`}
                    />
                  </div>
                  <div className={styles.actionsCell}>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className={styles.editBtn}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className={styles.deleteBtn}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
              {orders.map((order) => (
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
                          minute: '2-digit',
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
                        <span>
                          {item.name} x{item.quantity}
                        </span>
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
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className={styles.deleteOrderBtn}
                      title="Eliminar pedido"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
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
