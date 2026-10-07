const CUSTOMER_TOKEN_KEY = 'yoventra_customer_token';
const CUSTOMER_DATA_KEY = 'yoventra_customer_data';

export const customerTokenStorage = {
  getToken() {
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token) {
    try {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    } catch {}
  },
  getCustomer() {
    try {
      const data = localStorage.getItem(CUSTOMER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setCustomer(customer) {
    try {
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(customer));
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_DATA_KEY);
    } catch {}
  },
};

export class ApiError extends Error {
  constructor(status, message, code = null, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request(path, { method = 'GET', body, isFormData = false, auth = false } = {}) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = customerTokenStorage.getToken();
  if (token && (auth || auth === undefined)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init = { method, headers };
  if (body !== undefined) {
    init.body = isFormData ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`/api${path}`, init);
  } catch (err) {
    throw new ApiError(0, 'Unable to connect to Yoventra server. Please check your internet connection.');
  }

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let message = data?.message || data?.error;
    if (data?.issues && Array.isArray(data.issues) && data.issues.length > 0) {
      const firstIssue = data.issues[0];
      const field = firstIssue.path ? firstIssue.path.join('.') : '';
      message = field ? `${field}: ${firstIssue.message}` : firstIssue.message;
    }
    message = message || `Request failed with status ${res.status}`;
    const code = data?.code || null;
    throw new ApiError(res.status, message, code, data);
  }

  return data;
}

export function normalizeProduct(p) {
  if (!p) return null;
  // Filter out blocked, paused, or pending products for customer-facing website
  const rawStatus = (p.status || 'active').toLowerCase();
  if (rawStatus !== 'active') {
    return null;
  }
  const id = p.id || p._id;
  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images.map((img) => (typeof img === 'string' ? img : img?.url || ''))
    : (p.imageUrl ? [p.imageUrl] : []);
  const imageUrl = images[0] || p.imageUrl || '/logo.png';
  const effectivePrice = Number(p.sellingPrice ?? p.price ?? 0);
  const originalPrice = Number(p.price ?? p.mrp ?? effectivePrice);
  const discountPercent = p.discountPercent != null
    ? Math.round(Number(p.discountPercent))
    : (originalPrice > effectivePrice
        ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
        : 0);

  const requiresPersonalisation = Boolean(
    p.customizable ||
    p.requiresPersonalisation ||
    p.customization?.minImages > 0 ||
    p.customization?.textFields?.length > 0
  );

  return {
    ...p,
    id,
    _id: id,
    title: p.title || 'Product',
    images: images.length > 0 ? images : [imageUrl],
    imageUrl,
    effectivePrice,
    sellingPrice: effectivePrice,
    price: effectivePrice,
    originalPrice,
    mrp: originalPrice,
    discountPercent,
    requiresPersonalisation,
    customizable: requiresPersonalisation,
    personalisationMinPhotos: p.personalisationMinPhotos ?? p.customization?.minImages ?? 1,
    personalisationMaxPhotos: p.personalisationMaxPhotos ?? p.customization?.maxImages ?? 10,
    personalisationRequiresText: p.personalisationRequiresText ?? ((p.customization?.textFields?.length || 0) > 0),
    seller: p.seller || 'Yoventra',
    rating: p.rating || 4.8,
    ratingCount: p.reviews || p.ratingCount || 0,
    stock: p.stock ?? 999,
  };
}

export function normalizeOrder(o) {
  if (!o) return null;
  const id = o.id || o._id;
  const orderNumber = o.orderNumber || (id ? `ORD-${String(id).slice(-4).toUpperCase()}` : 'ORD-NEW');
  const rawStatus = String(o.orderStatus || o.status || 'placed').toLowerCase();

  let status = 'placed';
  if (rawStatus === 'neworder' || rawStatus === 'placed' || rawStatus === 'pending') {
    status = 'placed';
  } else if (rawStatus === 'confirmed') {
    status = 'confirmed';
  } else if (rawStatus === 'processing') {
    status = 'processing';
  } else if (rawStatus === 'shipped') {
    status = 'shipped';
  } else if (rawStatus === 'delivered') {
    status = 'delivered';
  } else if (rawStatus === 'cancelled') {
    status = 'cancelled';
  } else if (rawStatus === 'returned') {
    status = 'returned';
  } else if (rawStatus === 'disputed') {
    status = 'disputed';
  }

  const address = {
    name: o.addressName || o.address?.name || 'Customer',
    line: o.addressLine || o.address?.line || '',
    city: o.addressCity || o.address?.city || '',
    state: o.addressState || o.address?.state || '',
    pin: o.addressPin || o.address?.pin || '',
    phone: o.addressPhone || o.address?.phone || '',
  };

  const items = (o.items || []).map((item) => {
    const itemImg =
      item.image ||
      item.imageUrl ||
      item.product?.imageUrl ||
      (Array.isArray(item.product?.images) && item.product.images[0]) ||
      '/logo.png';
    return {
      id: item.id || item._id,
      productId: item.productId || item.product?._id || item.product?.id,
      title: item.title || item.product?.title || 'Product Item',
      image: itemImg,
      qty: Number(item.qty || 1),
      price: Number(item.price ?? item.sellingPrice ?? 0),
      size: item.size || null,
      customization: item.customization || null,
      freeGift: item.freeGift || null,
      seller: item.seller || 'Yoventra',
    };
  });

  const total = Number(o.total ?? o.amount ?? 0);
  const subtotal = o.subtotal != null ? Number(o.subtotal) : total;
  const discountAmount = Number(o.discountAmount || 0);
  const shippingCost = Number(o.shippingCost || 0);

  let expectedDeliveryDate = o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate) : null;
  if (!expectedDeliveryDate && status !== 'cancelled' && status !== 'delivered') {
    const base = o.placedAt || o.createdAt ? new Date(o.placedAt || o.createdAt) : new Date();
    expectedDeliveryDate = new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000);
  }

  return {
    ...o,
    id,
    _id: id,
    orderNumber,
    status,
    rawStatus,
    address,
    items,
    total,
    subtotal,
    discountAmount,
    shippingCost,
    placedAt: o.placedAt || o.createdAt,
    confirmedAt: o.confirmedAt,
    shippedAt: o.shippedAt,
    outForDeliveryAt: o.outForDeliveryAt,
    deliveredAt: o.deliveredAt,
    expectedDeliveryDate,
    trackingNumber: o.trackingNumber || o.waybill || null,
    courierStatus: o.courierStatus || null,
    courierInstruction: o.courierInstruction || null,
    paymentMode: o.paymentMode || (o.paymentMethod === 'online' ? 'Prepaid' : 'COD'),
    paymentMethod: o.paymentMethod || (o.paymentMode === 'Prepaid' ? 'online' : 'cod'),
    paymentStatus: o.paymentStatus || 'pending',
    cancelReason: o.cancelReason || null,
    cancellationStatus: o.cancellationStatus || null,
  };
}

export const api = {
  // Auth
  sendOtp: (phoneNumber) => request('/auth/customer/send-otp', { method: 'POST', body: { phoneNumber } }),
  verifyOtp: (phoneNumber, code) => request('/auth/customer/verify-otp', { method: 'POST', body: { phoneNumber, code } }),
  registerCustomer: (name, email) => request('/auth/customer/register', { method: 'POST', body: { name, email }, auth: true }),
  getMe: () => request('/auth/customer/me', { auth: true }),

  // Catalog
  getCategories: () => request('/categories'),
  getBanners: () => request('/banners'),
  getPriceSections: () => request('/price-sections'),
  getProducts: async (params = {}) => {
    const q = new URLSearchParams();
    const queryParams = { ...params };
    if (!queryParams.status) {
      queryParams.status = 'active';
    }
    if (queryParams.limit && !queryParams.pageSize) {
      queryParams.pageSize = queryParams.limit;
      delete queryParams.limit;
    }
    if (!queryParams.pageSize) {
      queryParams.pageSize = 50;
    }

    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, v);
    });
    const qs = q.toString();
    const data = await request(`/products${qs ? `?${qs}` : ''}`);
    const rawList = data?.items || data?.products || (Array.isArray(data) ? data : []);
    const items = rawList.map(normalizeProduct).filter(Boolean);
    return {
      items,
      products: items,
      total: data?.total ?? items.length,
      page: data?.page ?? 1,
      pageSize: data?.pageSize ?? items.length,
    };
  },
  getProduct: async (id) => {
    const data = await request(`/products/${id}`);
    const rawProd = data?.product || data;
    const normalized = normalizeProduct(rawProd);
    if (!normalized) {
      throw new ApiError(404, 'This product is currently unavailable or has been discontinued.');
    }
    return normalized;
  },

  // Reviews
  getProductReviews: (productId) => request(`/reviews/product/${productId}`),
  createReview: (payload) => request('/reviews', { method: 'POST', body: payload, auth: true }),

  // Delivery & Shipping
  checkPincodeServiceability: (pincode) => request(`/shipping/serviceability?pincode=${encodeURIComponent(pincode)}`),

  // Coupons
  getCoupons: () => request('/coupons'),
  getCheckoutTotals: (payload) => request('/orders/checkout-totals', { method: 'POST', body: payload, auth: true }),

  // Addresses
  getAddresses: async () => {
    const data = await request('/addresses', { auth: true });
    return data?.items || data?.addresses || (Array.isArray(data) ? data : []);
  },
  addAddress: (address) => request('/addresses', { method: 'POST', body: address, auth: true }),
  updateAddress: (id, address) => request(`/addresses/${id}`, { method: 'PATCH', body: address, auth: true }),
  deleteAddress: (id) => request(`/addresses/${id}`, { method: 'DELETE', auth: true }),
  setDefaultAddress: (id) => request(`/addresses/${id}/default`, { method: 'POST', auth: true }),

  // Orders
  placeCodOrder: (payload) => request('/orders', { method: 'POST', body: { ...payload, paymentMode: 'COD' }, auth: true }),
  createRazorpayCheckout: (payload) => request('/orders/razorpay/checkout', { method: 'POST', body: payload, auth: true }),
  verifyRazorpayPayment: (payload) => request('/orders/razorpay/verify', { method: 'POST', body: payload, auth: true }),
  releaseRazorpayCheckout: (razorpayOrderId) => request('/orders/razorpay/release', { method: 'POST', body: { razorpayOrderId }, auth: true }),
  getMyOrders: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const data = await request(`/orders/mine${q ? `?${q}` : ''}`, { auth: true });
    const rawList = data?.items || data?.orders || (Array.isArray(data) ? data : []);
    const items = rawList.map(normalizeOrder).filter(Boolean);
    return {
      items,
      orders: items,
      total: data?.total ?? items.length,
      page: data?.page ?? 1,
      pageSize: data?.pageSize ?? items.length,
    };
  },
  getMyOrder: async (id) => {
    const data = await request(`/orders/mine/${id}`, { auth: true });
    const rawOrder = data?.order || data;
    return normalizeOrder(rawOrder);
  },
  cancelMyOrder: async (id, reason) => {
    const res = await request(`/orders/mine/${id}/cancel`, {
      method: 'POST',
      body: { reason, cancelReason: reason },
      auth: true,
    });
    return res;
  },
  getMyOrderTracking: (id) => request(`/orders/mine/${id}/tracking`, { auth: true }),

  // Uploads (Photo customization)
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/uploads', { method: 'POST', body: formData, isFormData: true, auth: true });
  },
};
