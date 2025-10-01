import { useState, useEffect } from 'react'
import './App.css'

// Definindo o tipo do produto diretamente aqui
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

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Ocorreu um erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []); // O array vazio garante que o efeito rode apenas uma vez

  return (
    <>
      <header className="app-header">
        <h1>Meu E-commerce</h1>
      </header>
      <main>
        {loading && <p className="loading-message">Carregando produtos...</p>}
        {error && <p className="error-message">Erro ao carregar produtos: {error}</p>}
        <div className="catalog-container">
          {products.map((product) => (
            <div key={product.id} className="card">
              <img src={product.image} alt={product.title} className="card-image" />
              <div className="card-body">
                <h3 className="card-title">{product.title}</h3>
                <p className="card-price">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="card-rating">
                  Avaliação: {product.rating.rate} ⭐ ({product.rating.count} avaliações)
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default App
