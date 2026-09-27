import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Power,
  X,
  RefreshCw,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  category_id: '',
  price: '',
  original_price: '',
  stock_quantity: '',
  badge: '',
  is_active: true
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES_PER_PRODUCT = 5;
const STORAGE_BUCKET = 'products';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [productImages, setProductImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          category_id,
          name,
          slug,
          description,
          price,
          original_price,
          stock_quantity,
          is_active,
          badge,
          created_at,
          updated_at,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('ADMIN PRODUCTS ERROR:', error);
      alert(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, is_active')
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('ADMIN CATEGORIES ERROR:', error);
      alert(error.message || 'Failed to load categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (event) => {
    const value = event.target.value;

    setForm(prev => ({
      ...prev,
      name: value,
      slug: editingProduct
        ? prev.slug
        : generateSlug(value)
    }));
  };

  const resetImages = () => {
    newImageFiles.forEach(item => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    setProductImages([]);
    setNewImageFiles([]);
  };

  const openAddForm = () => {
    resetImages();
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const fetchProductImages = async (productId) => {
    try {
      setImageLoading(true);

      const { data, error } = await supabase
        .from('product_images')
        .select('id, product_id, image_url, is_primary, sort_order, created_at')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      setProductImages(data || []);
    } catch (error) {
      console.error('PRODUCT IMAGES ERROR:', error);
      alert(error.message || 'Failed to load product images');
      setProductImages([]);
    } finally {
      setImageLoading(false);
    }
  };

  const openEditForm = async (product) => {
    resetImages();

    setEditingProduct(product);

    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price ?? '',
      original_price: product.original_price ?? '',
      stock_quantity: product.stock_quantity ?? '',
      badge: product.badge || '',
      is_active: product.is_active ?? true
    });

    setShowForm(true);
    await fetchProductImages(product.id);
  };

  const closeForm = () => {
    if (actionLoading) return;

    resetImages();
    setShowForm(false);
    setEditingProduct(null);
    setForm({ ...emptyForm });
  };

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    const remainingSlots =
      MAX_IMAGES_PER_PRODUCT -
      productImages.length -
      newImageFiles.length;

    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product.`);
      event.target.value = '';
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      alert(
        `Only ${remainingSlots} image(s) can be added. Maximum ${MAX_IMAGES_PER_PRODUCT} images per product.`
      );
    }

    const invalidFiles = filesToAdd.filter(file => {
      return (
        !file.type.startsWith('image/') ||
        file.size > MAX_IMAGE_SIZE
      );
    });

    if (invalidFiles.length > 0) {
      alert('Only image files up to 5 MB are allowed.');
      event.target.value = '';
      return;
    }

    const preparedFiles = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setNewImageFiles(prev => [...prev, ...preparedFiles]);

    event.target.value = '';
  };

  const removeSelectedNewImage = (index) => {
    setNewImageFiles(prev => {
      const item = prev[index];

      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const getStoragePathFromUrl = (imageUrl) => {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    if (!imageUrl || !imageUrl.includes(marker)) {
      return null;
    }

    return decodeURIComponent(
      imageUrl.split(marker)[1]
    );
  };

  const deleteProductImage = async (image) => {
    const confirmed = window.confirm(
      'Delete this product image? This cannot be undone.'
    );

    if (!confirmed) return;

    setActionLoading(`delete-image-${image.id}`);

    try {
      const storagePath = getStoragePathFromUrl(image.image_url);

      if (storagePath) {
        const { error: storageError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .remove([storagePath]);

        if (storageError) {
          console.warn(
            'STORAGE IMAGE DELETE WARNING:',
            storageError
          );
        }
      }

      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      setProductImages(prev =>
        prev.filter(item => item.id !== image.id)
      );

      alert('Product image deleted successfully.');
    } catch (error) {
      console.error('PRODUCT IMAGE DELETE ERROR:', error);
      alert(error.message || 'Failed to delete product image');
    } finally {
      setActionLoading(null);
    }
  };

  const uploadImagesForProduct = async (productId) => {
    if (!newImageFiles.length) return;

    const uploadedRows = [];

    try {
      setImageLoading(true);

      const startingSortOrder = productImages.length;

      for (let index = 0; index < newImageFiles.length; index += 1) {
        const item = newImageFiles[index];
        const file = item.file;

        const safeFileName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9.-]/g, '-')
          .replace(/-+/g, '-');

        const filePath =
          `${productId}/${Date.now()}-${index}-${safeFileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase
          .storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        const imageUrl = publicUrlData?.publicUrl;

        if (!imageUrl) {
          throw new Error('Could not generate public image URL.');
        }

        uploadedRows.push({
          product_id: productId,
          image_url: imageUrl,
          is_primary:
            productImages.length === 0 &&
            index === 0,
          sort_order: startingSortOrder + index
        });
      }

      const { data, error: imageInsertError } = await supabase
        .from('product_images')
        .insert(uploadedRows)
        .select('id, product_id, image_url, is_primary, sort_order, created_at');

      if (imageInsertError) throw imageInsertError;

      setProductImages(prev => [
        ...prev,
        ...(data || [])
      ]);

      setNewImageFiles(prev => {
        prev.forEach(item => {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });

        return [];
      });
    } catch (error) {
      console.error('PRODUCT IMAGE UPLOAD ERROR:', error);
      throw error;
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert('Product name is required.');
      return;
    }

    if (!form.slug.trim()) {
      alert('Product slug is required.');
      return;
    }

    if (form.price === '' || Number(form.price) < 0) {
      alert('Please enter a valid product price.');
      return;
    }

    if (
      form.stock_quantity === '' ||
      Number(form.stock_quantity) < 0
    ) {
      alert('Please enter a valid stock quantity.');
      return;
    }

    if (
      Number(form.original_price) < 0
    ) {
      alert('Please enter a valid original price.');
      return;
    }

    setActionLoading(
      editingProduct
        ? `edit-${editingProduct.id}`
        : 'create-product'
    );

    try {
      const productPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        price: Number(form.price),
        original_price:
          form.original_price === ''
            ? null
            : Number(form.original_price),
        stock_quantity: Number(form.stock_quantity),
        badge: form.badge.trim() || null,
        is_active: Boolean(form.is_active),
        updated_at: new Date().toISOString()
      };

      let productId;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (error) throw error;

        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select('id')
          .single();

        if (error) throw error;

        productId = data.id;
      }

      if (newImageFiles.length > 0) {
        await uploadImagesForProduct(productId);
      }

      alert(
        editingProduct
          ? 'Product updated successfully.'
          : 'Product created successfully.'
      );

      closeForm();
      await fetchProducts();
    } catch (error) {
      console.error('PRODUCT SAVE ERROR:', error);
      alert(
        error.message ||
        'Product was saved, but something went wrong while handling the image.'
      );
    } finally {
      setActionLoading(null);
      setImageLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently?\n\nThis will delete the product and its product images. This cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(`delete-${product.id}`);

    try {
      // 1. Get image rows first so we can remove their Storage objects too.
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('id, image_url')
        .eq('product_id', product.id);

      if (imagesError) throw imagesError;

      // 2. Remove files from Supabase Storage when they belong to our
      //    public products bucket.
      const storagePaths = (images || [])
        .map(image => getStoragePathFromUrl(image.image_url))
        .filter(Boolean);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .remove(storagePaths);

        if (storageError) {
          console.warn(
            'PRODUCT STORAGE DELETE WARNING:',
            storageError
          );
        }
      }

      // 3. Delete image rows.
      if ((images || []).length > 0) {
        const { error: imageDeleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', product.id);

        if (imageDeleteError) throw imageDeleteError;
      }

      // 4. Delete the product itself.
      const { error: productDeleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (productDeleteError) throw productDeleteError;

      setProducts(prev =>
        prev.filter(item => item.id !== product.id)
      );

      alert('Product deleted successfully.');
    } catch (error) {
      console.error('PRODUCT DELETE ERROR:', error);
      alert(
        error.message ||
        'Failed to delete product. Check the database policies and try again.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (product) => {
    const nextStatus = !product.is_active;

    const confirmed = window.confirm(
      `${nextStatus ? 'Activate' : 'Deactivate'} "${product.name}"?`
    );

    if (!confirmed) return;

    setActionLoading(`toggle-${product.id}`);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_active: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, is_active: nextStatus }
            : item
        )
      );

      alert(
        nextStatus
          ? 'Product activated successfully.'
          : 'Product deactivated successfully.'
      );
    } catch (error) {
      console.error('PRODUCT STATUS ERROR:', error);
      alert(error.message || 'Failed to update product status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="loader"></div>
        <p>Loading product inventory...</p>
      </div>
    );
  }

  return (
    <div className="products-tab-content fade-in">
      <div
        className="reviews-admin-header"
        style={{ marginBottom: '1.5rem' }}
      >
        <div>
          <h2 className="section-title">Product Management</h2>
          <p className="admin-subtitle">
            Create, edit and manage VERZ products.
          </p>
        </div>

        <div className="actions-cell">
          <button
            className="btn-secondary"
            onClick={fetchProducts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="btn-primary"
            onClick={openAddForm}
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="glass"
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}
          >
            <h2 className="section-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <button
              className="btn-table-action demote"
              onClick={closeForm}
              disabled={Boolean(actionLoading)}
            >
              <X size={16} />
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem'
              }}
            >
              <div>
                <label>Product Name</label>
                <input
                  className="admin-select"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="Product name"
                  required
                />
              </div>

              <div>
                <label>Slug</label>
                <input
                  className="admin-select"
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleInputChange}
                  placeholder="product-slug"
                  required
                />
              </div>

              <div>
                <label>Category</label>
                <select
                  className="admin-select"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">No Category</option>
                  {categories
                    .filter(category => category.is_active)
                    .map(category => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label>Price</label>
                <input
                  className="admin-select"
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="499"
                  required
                />
              </div>

              <div>
                <label>Original Price</label>
                <input
                  className="admin-select"
                  type="number"
                  min="0"
                  step="0.01"
                  name="original_price"
                  value={form.original_price}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label>Stock Quantity</label>
                <input
                  className="admin-select"
                  type="number"
                  min="0"
                  step="1"
                  name="stock_quantity"
                  value={form.stock_quantity}
                  onChange={handleInputChange}
                  placeholder="20"
                  required
                />
              </div>

              <div>
                <label>Badge</label>
                <input
                  className="admin-select"
                  type="text"
                  name="badge"
                  value={form.badge}
                  onChange={handleInputChange}
                  placeholder="New / Sale / Bestseller"
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Description</label>
              <textarea
                className="admin-select"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Product description"
                rows="4"
              />
            </div>

            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.75rem'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <ImageIcon size={17} />
                    Product Images
                  </label>

                  <p
                    className="admin-subtitle"
                    style={{ marginTop: '0.25rem' }}
                  >
                    Up to {MAX_IMAGES_PER_PRODUCT} images, maximum 5 MB each.
                  </p>
                </div>

                <label
                  className="btn-secondary"
                  style={{
                    cursor:
                      productImages.length + newImageFiles.length >=
                      MAX_IMAGES_PER_PRODUCT
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      productImages.length + newImageFiles.length >=
                      MAX_IMAGES_PER_PRODUCT
                        ? 0.5
                        : 1
                  }}
                >
                  <Upload size={16} />
                  Choose Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    disabled={
                      productImages.length + newImageFiles.length >=
                      MAX_IMAGES_PER_PRODUCT
                    }
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {imageLoading && (
                <p className="admin-subtitle">
                  Processing images...
                </p>
              )}

              {productImages.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1rem'
                  }}
                >
                  {productImages.map(image => (
                    <div
                      key={image.id}
                      style={{
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#111'
                      }}
                    >
                      <img
                        src={image.image_url}
                        alt={form.name || 'Product'}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(event) => {
                          event.currentTarget.style.opacity = '0.35';
                        }}
                      />

                      {image.is_primary && (
                        <span
                          style={{
                            position: 'absolute',
                            left: '6px',
                            top: '6px',
                            background: '#fff',
                            color: '#000',
                            borderRadius: '5px',
                            padding: '3px 6px',
                            fontSize: '10px',
                            fontWeight: 700
                          }}
                        >
                          PRIMARY
                        </span>
                      )}

                      <button
                        type="button"
                        className="btn-table-action demote"
                        onClick={() => deleteProductImage(image)}
                        disabled={
                          actionLoading ===
                          `delete-image-${image.id}`
                        }
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '6px',
                          padding: '5px'
                        }}
                        title="Delete image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {newImageFiles.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1rem'
                  }}
                >
                  {newImageFiles.map((item, index) => (
                    <div
                      key={`${item.file.name}-${index}`}
                      style={{
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#111'
                      }}
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />

                      <button
                        type="button"
                        className="btn-table-action demote"
                        onClick={() => removeSelectedNewImage(index)}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '6px',
                          padding: '5px'
                        }}
                        title="Remove selected image"
                      >
                        <X size={14} />
                      </button>

                      <span
                        style={{
                          display: 'block',
                          padding: '6px',
                          fontSize: '10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={item.file.name}
                      >
                        {item.file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!productImages.length && !newImageFiles.length && (
                <p
                  className="empty-message"
                  style={{ marginTop: '1rem' }}
                >
                  No images added yet.
                </p>
              )}
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleInputChange}
                id="product-active"
              />
              <label htmlFor="product-active">
                Product is active
              </label>
            </div>

            <div
              className="actions-cell"
              style={{ marginTop: '1.5rem' }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={closeForm}
                disabled={Boolean(actionLoading)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={Boolean(actionLoading)}
              >
                {editingProduct
                  ? 'Update Product'
                  : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass">
        {products.length > 0 ? (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="order-details-cell">
                        <span className="font-semibold">
                          {product.name}
                        </span>

                        <span className="font-mono text-cyan text-xs">
                          {product.slug}
                        </span>

                        {product.badge && (
                          <span className="text-xs">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {product.categories?.name ||
                        'Uncategorized'}
                    </td>

                    <td>
                      <div>
                        ₹
                        {Number(product.price || 0).toFixed(2)}
                      </div>

                      {product.original_price && (
                        <span className="text-gray text-xs">
                          Original: ₹
                          {Number(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td>{product.stock_quantity}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          product.is_active
                            ? 'Delivered'
                            : 'Processing'
                        }`}
                      >
                        {product.is_active
                          ? 'ACTIVE'
                          : 'INACTIVE'}
                      </span>
                    </td>

                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn-table-action promote"
                          onClick={() =>
                            openEditForm(product)
                          }
                          disabled={
                            actionLoading ===
                            `edit-${product.id}`
                          }
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          className={`btn-table-action ${
                            product.is_active
                              ? 'demote'
                              : 'promote'
                          }`}
                          onClick={() =>
                            handleToggleActive(product)
                          }
                          disabled={
                            actionLoading ===
                            `toggle-${product.id}`
                          }
                        >
                          <Power size={14} />
                          {product.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                        <button
                          className="btn-table-action demote"
                          onClick={() =>
                            handleDeleteProduct(product)
                          }
                          disabled={
                            actionLoading ===
                            `delete-${product.id}`
                          }
                          title="Delete product permanently"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminProductManager;
