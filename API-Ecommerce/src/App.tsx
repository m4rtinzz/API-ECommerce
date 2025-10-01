import { useState, useEffect, useMemo } from 'react'
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

type User = {
  id: number;
  name: {
    firstname: string;
    lastname: string;
  };
  username: string;
};

type Cart = {
  id: number;
  userId: number;
  products: CartProduct[];
};

// --- Componente da Página de Catálogo ---
function ProductCatalog({ onProductClick }: { onProductClick: (id: number) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', order: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const filteredAndSortedProducts = products
    .filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.key === 'price') {
        return sortConfig.order === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sortConfig.key === 'rating') {
        return sortConfig.order === 'asc' ? a.rating.rate - b.rating.rate : b.rating.rate - a.rating.rate;
      }
      // Por padrão, ordena por título
      return sortConfig.order === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    });

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, order] = e.target.value.split('-');
    setSortConfig({ key, order });
    setCurrentPage(1); // Reseta para a primeira página ao ordenar
  };

  return (
    <div className="catalog-page">
      <div className="controls-container">
        <input
          type="text"
          placeholder="Buscar produtos..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reseta para a primeira página ao buscar
          }}
        />
        <select className="sort-select" onChange={handleSortChange} defaultValue="title-asc">
          <option value="title-asc">Ordenar por: Título (A-Z)</option>
          <option value="title-desc">Ordenar por: Título (Z-A)</option>
          <option value="price-asc">Ordenar por: Preço (Menor)</option>
          <option value="price-desc">Ordenar por: Preço (Maior)</option>
          <option value="rating-desc">Ordenar por: Avaliação (Melhor)</option>
        </select>
      </div>
      <div className="catalog-container">
        {paginatedProducts.map((product) => (
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
      <div className="pagination-container">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
      </div>
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

// --- Componente da Página de Login ---
function LoginPage({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [username, setUsername] = useState('mor_2314'); // Usuário de exemplo da API
  const [password, setPassword] = useState('83r5^_'); // Senha de exemplo da API
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://fakestoreapi.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas. Por favor, tente novamente.');
      }

      const data = await response.json();
      onLoginSuccess(data.token);

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// --- Componente do Carrinho ---
function ShoppingCart({
  cart,
  products,
  onProductClick
}: {
  cart: Cart | null;
  products: Product[];
  onProductClick: (id: number) => void;
}) {
  if (!cart || cart.products.length === 0) {
    return <div className="cart-info">🛒 Carrinho vazio</div>;
  }

  // Função para encontrar o título do produto pelo ID
  const getProductTitle = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.title : `Produto ${productId}`;
  };

  return (
    <div className="cart-info">
      <span>🛒 {cart.products.length} item(s)</span>
      <div className="cart-dropdown">
        <h4>Seu Carrinho</h4>
        <ul>
          {cart.products.map((item) => (
            <li key={item.productId} onClick={() => onProductClick(item.productId)}>
              {getProductTitle(item.productId)} (x{item.quantity})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Componente Principal (Layout e Gerenciador de Visualização) ---
function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Efeito para buscar dados do usuário e carrinho após o login
  useEffect(() => {
    if (!token) return;

    // Simulação: A API não retorna o ID do usuário no login.
    // Vamos buscar os dados do usuário com ID 2 e seu carrinho.
    const userId = 2;

    const fetchUserData = async () => {
      // Buscamos todos os dados em paralelo para otimizar
      const [userResponse, cartResponse, productsResponse] = await Promise.all([
        fetch(`https://fakestoreapi.com/users/${userId}`),
        fetch(`https://fakestoreapi.com/carts/user/${userId}`),
        fetch('https://fakestoreapi.com/products')
      ]);
      const userData = await userResponse.json();
      const cartData = await cartResponse.json();
      const productsData = await productsResponse.json();

      setUser(userData);
      setCart(cartData[0]); // A API retorna um array de carrinhos
      setAllProducts(productsData);
    };

    fetchUserData();
  }, [token]);

  // Se não houver token, mostra a página de login
  if (!token) {
    return <LoginPage onLoginSuccess={setToken} />;
  }

  return (
    <>
      <header className="app-header">
        <h1 onClick={() => setSelectedProductId(null)}>
          Meu E-commerce
        </h1>
        <div className="header-user-info">
          <span>
            Olá,{' '}
            {user?.name.firstname &&
              user.name.firstname.charAt(0).toUpperCase() + user.name.firstname.slice(1)}
          </span>
          <ShoppingCart cart={cart} products={allProducts} onProductClick={setSelectedProductId} />
        </div>
      </header>
      <main>
        {selectedProductId === null ? (
          <ProductCatalog onProductClick={setSelectedProductId} /> // Poderíamos passar allProducts aqui para evitar uma busca duplicada
        ) : (
          <ProductDetail productId={selectedProductId} onBackClick={() => setSelectedProductId(null)} />
        )}
      </main>
    </>
  );
}

export default App
