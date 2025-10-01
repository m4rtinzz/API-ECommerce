import { useState, useEffect } from 'react'
import './App.css'

// --- Tipos ---
// Tipo completo do produto, usado em ambas as páginas
type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

// --- Componente da Página de Catálogo ---
function ProductCatalog({ onProductClick }: { onProductClick: (id: number) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <p className="loading-message">Carregando produtos...</p>;
  if (error) return <p className="error-message">Erro ao carregar produtos: {error}</p>;

  return (
    <div className="catalog-container">
      {products.map((product) => (
        <div key={product.id} className="card-link" onClick={() => onProductClick(product.id)}>
          <div className="card">
            <img src={product.image} alt={product.title} className="card-image" />
            <div className="card-body">
              <h3 className="card-title">{product.title}</h3>
              <p className="card-price">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="card-rating">Avaliação: {product.rating.rate} ⭐</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Componente da Página de Detalhes ---
function ProductDetail({ productId, onBackClick }: { productId: number; onBackClick: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    async function fetchProduct() {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProduct(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) return <p className="loading-message">Carregando produto...</p>;
  if (error) return <p className="error-message">Erro ao carregar produto: {error}</p>;
  if (!product) return <p className="error-message">Produto não encontrado.</p>;

  return (
    <div className="product-detail-container">
      <button onClick={onBackClick} className="back-button" type="button">← Voltar ao catálogo</button>
      <div className="product-detail-content">
        <img src={product.image} alt={product.title} className="product-detail-image" />
        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.title}</h1>
          <p className="product-detail-category">{product.category}</p>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-detail-rating">
            Avaliação: {product.rating.rate} ⭐ ({product.rating.count} avaliações)
          </p>
          <p className="product-detail-price">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal (Layout e Gerenciador de Visualização) ---
function App() {
  // Este estado controla qual visualização é mostrada
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  return (
    <>
      <header className="app-header">
        <h1 onClick={() => setSelectedProductId(null)} style={{ cursor: 'pointer' }}>
          Meu E-commerce
        </h1>
      </header>
      <main>
        {selectedProductId === null ? (
          // Se nenhum produto estiver selecionado, mostra o catálogo
          <ProductCatalog onProductClick={setSelectedProductId} />
        ) : (
          // Se um produto estiver selecionado, mostra os detalhes
          <ProductDetail productId={selectedProductId} onBackClick={() => setSelectedProductId(null)} />
        )}
      </main>
    </>
  );
}

export default App
