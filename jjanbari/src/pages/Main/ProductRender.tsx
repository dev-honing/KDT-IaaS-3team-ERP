// src/pages/Main/ProductRender.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../Layout/Header/User/HeaderPages/LoginStatus/isLoggedIn';
import { Product } from '../interface/interface';
import handleAddToCart from './function/handleAddToCart';

const ProductRender = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/products')
      .then((response) => response.json())
      .then((data) => setProducts(data));
  }, []);

  const handleBuy = async (product: Product) => {
    const selectedQuantity = Number((document.getElementById(`quantity-${product.product_id}`) as HTMLInputElement).value);
    const selectedProduct = { ...product, quantity: selectedQuantity };

    if (isLoggedIn()) {
      // 결제 페이지로 이동할 때 선택한 상품 정보를 함께 전달
      navigate('/payment', { state: { cartItems: [selectedProduct] } });
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="product-container">
      {products.length > 0 &&
        products.map((product) => (
          <div className="product-item" key={product.product_id}>
            <img src={product.img} alt={product.name} />
            <div className="product-details">
              <h3>{product.name}</h3>
              <br></br>
              <p>가격: {product.price}</p>
              <p>수량: {product.quantity}</p>
              <input type="number" id={`quantity-${product.product_id}`} min="1" max={product.quantity} />
              <button onClick={() => handleAddToCart(product, navigate)}>장바구니</button>
              <button>좋아요</button>
              <button onClick={() => handleBuy(product)}>구매</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ProductRender;
