import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Filter, ArrowUpDown, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { ProductCard } from '../components/ProductCard';

export function CategoryProducts() {
  const { categoryId, range } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('All Products');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-asc' | 'price-desc'

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = { pageSize: 50, status: 'active' };
        const isCustomGifts = categoryId === 'custom-gifts';
        let resolvedCategoryName = 'All Products';

        if (categoryId && categoryId !== 'all' && !isCustomGifts) {
          // If categoryId is a slug (e.g. 'men', 'gift') or mongo ObjectId, map to id
          try {
            const catRes = await api.getCategories();
            const cats = Array.isArray(catRes) ? catRes : catRes?.categories || [];
            const found = cats.find((c) => (c.id || c._id) === categoryId || c.slug === categoryId);
            if (found) {
              params.categoryId = found.id || found._id;
              resolvedCategoryName = found.name;
            } else {
              params.categoryId = categoryId;
            }
          } catch {
            params.categoryId = categoryId;
          }
        }

        if (searchQuery) {
          params.search = searchQuery;
          resolvedCategoryName = `Search results for "${searchQuery}"`;
        }

        // Dynamic price range handling (e.g. /price/under-99, /price/299, /price/under-499)
        const currentPath = window.location.pathname;
        if (range || currentPath.includes('/price/')) {
          const rawRange = range || currentPath.split('/price/')[1] || '';
          const match = rawRange.match(/\d+/);
          if (match) {
            const maxVal = Number(match[0]);
            params.maxPrice = maxVal;
            resolvedCategoryName = `Under ₹${maxVal} Deals`;
          }
        }

        const res = await api.getProducts(params);
        let list = res?.items || res?.products || (Array.isArray(res) ? res : []);

        // Strictly keep only active products
        list = list.filter((p) => p && (p.status === 'active' || !p.status));

        // Filter if custom-gifts route
        if (isCustomGifts) {
          list = list.filter(
            (p) =>
              p.requiresPersonalisation ||
              p.customizable ||
              p.category?.type === 'gift' ||
              p.categoryId === '6ab9f6bdc621778eec446524'
          );
          resolvedCategoryName = 'Personalized Custom Gifts';
        }

        // Additional client-side price filter to guarantee correctness
        if (params.maxPrice != null) {
          list = list.filter((p) => (p.effectivePrice ?? p.price) <= params.maxPrice);
        }

        setCategoryName(resolvedCategoryName);
        setProducts(list);
      } catch (err) {
        console.error('Failed to fetch category products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId, range, searchQuery, window.location.pathname]);

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.effectivePrice ?? a.price ?? 0;
    const priceB = b.effectivePrice ?? b.price ?? 0;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">{categoryName}</span>
      </div>

      {/* Header bar & Sort options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground">{categoryName}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Showing {sortedProducts.length} authentic products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground focus:border-accent focus:outline-none"
          >
            <option value="popular">Recommended / Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-card border border-border">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
            <ShoppingBag className="h-8 w-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No products found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            We couldn't find any products in this section right now. Try checking other categories or searching.
          </p>
          <Link
            to="/categories/all"
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-foreground transition-all"
          >
            Explore All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
