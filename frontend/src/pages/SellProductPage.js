import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import '../components/styles/SellProductPage.css';

function SellProductPage() {
    const [activeTab, setActiveTab] = useState('sell'); // 현재 활성 탭 관리
    const navigate = useNavigate();
    const [products, setProducts] = useState([]); // 등록된 상품 관리
    const [editingProduct, setEditingProduct] = useState(null); // 수정 중인 상품 정보
    const [likedProducts, setLikedProducts] = useState([]); // 찜한 상품 관리
    const [selectedLikedProduct, setSelectedLikedProduct] = useState(null); // 선택한 찜한 상품 상세 보기
    const [transactions, setTransactions] = useState({ purchases: [], sales: [], pending: [] }); // 구매/판매 내역 관리

    // 상품 등록 상태
    const [productData, setProductData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        image: null,
    });

    // 탭 변경 처리
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedLikedProduct(null); // 탭 변경 시 선택한 찜한 상품 초기화
        setEditingProduct(null); // 수정 중인 상태 초기화
    };

    // 입력값 변경 처리
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setProductData((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    // 찜한 상품 상세 보기 처리
    const handleLikedProductClick = (product) => {
        setSelectedLikedProduct(product);
    };


    // 상품 등록 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('title', productData.title);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('category', productData.category);
            if (productData.image) {
                formData.append('image', productData.image);
            }

            await apiClient.post('/api/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('상품이 성공적으로 등록되었습니다.');
            setProductData({ title: '', description: '', price: '', category: '', image: null });
            fetchProducts();
        } catch (error) {
            console.error('상품 등록 중 오류 발생:', error);
            alert('상품 등록 중 문제가 발생했습니다.');
        }
    };

    // 등록된 상품 불러오기
    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/api/products/user');
            setProducts(response.data);
        } catch (error) {
            console.error('상품 불러오기 중 오류 발생:', error);
        }
    };

    //구매 취소
    const handleCancelPurchase = async (transactionId) => {
        try {
            const response = await apiClient.post(`/api/transactions/${transactionId}/cancel`);
            if (response.status === 200) {
                alert('구매 신청이 취소되었습니다.');
                fetchTransactions(); // 최신 거래 내역 갱신
            } else {
                alert('구매 취소에 실패했습니다.');
            }
        } catch (error) {
            console.error('구매 취소 중 오류 발생:', error);
            alert('구매 취소 중 오류가 발생했습니다.');
        }
    };


    // 찜한 상품 불러오기
    const fetchLikedProducts = async () => {
        try {
            const response = await apiClient.get('/api/products/liked');
            setLikedProducts(response.data);
        } catch (error) {
            console.error('찜한 상품 불러오기 중 오류 발생:', error);
        }
    };

    // 구매/신청/판매 내역 불러오기
    const fetchTransactions = async () => {
        try {
            // 구매 내역과 구매 신청 내역
            const transactionResponse = await apiClient.get('/api/transactions');
            const currentUserId = 1; // 실제 사용자 ID를 세션에서 가져오세요.
    
            let purchases = [];
            let pending = [];
            if (Array.isArray(transactionResponse.data)) {
                // 구매 완료 내역
                purchases = transactionResponse.data.filter((t) => t.buyer && t.status === '결제 완료');
    
                // 구매 신청 내역
                pending = transactionResponse.data.filter((t) => t.buyer && t.status === '구매 신청');
            } else {
                console.error('Unexpected response format for transactions:', transactionResponse.data);
            }
    
            // 판매 내역
            const salesResponse = await apiClient.get('/api/products/sales');
            let sales = [];
            if (Array.isArray(salesResponse.data)) {
                sales = salesResponse.data; // 판매 내역은 그대로 사용
            } else {
                console.error('Unexpected response format for sales:', salesResponse.data);
            }
    
            // 상태 업데이트
            setTransactions({ purchases, pending, sales });
        } catch (error) {
            console.error('구매/판매 내역 불러오기 중 오류 발생:', error);
        }
    };
    
    
    

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchLikedProducts();
        fetchTransactions();
    }, []);

    // 상품 상태 변경 처리
    const handleStatusChange = async (productId, newStatus) => {
        try {
            await apiClient.put(`/api/products/${productId}`, { status: newStatus });
            setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p)));
        } catch (error) {
            console.error('상품 상태 변경 오류:', error);
        }
    };

    // 상품 삭제 처리
    const handleDelete = async (productId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            await apiClient.delete(`/api/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch (error) {
            console.error('상품 삭제 중 오류 발생:', error);
        }
    };

    // 상품 수정 시작 처리
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setProductData({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            image: null,
        });
    };

    // 구매 신청 승인/거절 처리 함수
    const handleApprovePurchase = async (transactionId, approve) => {
        try {
            const response = await apiClient.post(`/api/transactions/${transactionId}/approve`, { approve });
            if (response.status === 200) {
                alert(approve ? '구매 요청이 승인되었습니다.' : '구매 요청이 거절되었습니다.');
                fetchTransactions(); // 최신 거래 내역 갱신
            } else {
                alert('구매 요청 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('구매 요청 처리 중 오류 발생:', error);
            alert('구매 요청 처리 중 오류가 발생했습니다.');
        }
    };

    // 상품 수정 제출 처리
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('title', productData.title);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('category', productData.category);
            if (productData.image) {
                formData.append('image', productData.image);
            }

            await apiClient.put(`/api/products/${editingProduct.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('상품이 성공적으로 수정되었습니다.');
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('상품 수정 중 오류 발생:', error);
            alert('상품 수정 중 문제가 발생했습니다.');
        }
    };

    return (
        <div className="product-management-page">
            <div className="tabs">
                <button onClick={() => handleTabChange('sell')} className={activeTab === 'sell' ? 'active' : ''}>상품 등록</button>
                <button onClick={() => handleTabChange('manage')} className={activeTab === 'manage' ? 'active' : ''}>상품 관리</button>
                <button onClick={() => handleTabChange('liked')} className={activeTab === 'liked' ? 'active' : ''}>찜한 상품</button>
                <button onClick={() => setActiveTab('transactions')} className={activeTab === 'transactions' ? 'active' : ''}>구매/판매 내역</button>
            </div>

            {activeTab === 'sell' && (
                <div className="sell-product-page">
                    <h1 className="page-title">상품 등록</h1>
                    <form className="sell-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">상품명</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="상품명을 입력하세요"
                                value={productData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">상품 설명</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="상품 설명을 입력하세요"
                                value={productData.description}
                                onChange={handleInputChange}
                                rows="4"
                                required
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">가격</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                placeholder="가격을 입력하세요 (원)"
                                value={productData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">카테고리</label>
                            <select
                                id="category"
                                name="category"
                                value={productData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">카테고리를 선택하세요</option>
                                <option value="사료">사료</option>
                                <option value="간식">간식</option>
                                <option value="장난감">장난감</option>
                                <option value="목줄 및 하네스">목줄 및 하네스</option>
                                <option value="배변 용품">배변 용품</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="image">상품 이미지</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            등록하기
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'manage' && (
                <div className="manage-products">
                    <h1 className="page-title">상품 관리</h1>
                    {products.length === 0 ? (
                        <p>등록된 상품이 없습니다.</p>
                    ) : (
                        <ul className="product-list">
                            {products.map((product) => (
                                <li key={product.id} className="product-item">
                                    <img src={product.imageUrl} alt={product.title} className="product-image" />
                                    <h3>{product.title}</h3>
                                    <p>가격: {product.price}원</p>
                                    <p>상태: {product.status}</p>

                                    <button onClick={() => handleEditClick(product)} className="edit-button">수정</button>
                                    <button onClick={() => handleDelete(product.id)} className="delete-button">삭제</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {editingProduct && (
                <div className="edit-product-page">
                    <h1 className="page-title">상품 수정</h1>
                    <form onSubmit={handleUpdate} className="edit-form">
                        <div className="form-group">
                            <label htmlFor="title">상품명</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="상품명을 입력하세요"
                                value={productData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">상품 설명</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="상품 설명을 입력하세요"
                                value={productData.description}
                                onChange={handleInputChange}
                                rows="4"
                                required
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">가격</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                placeholder="가격을 입력하세요 (원)"
                                value={productData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">카테고리</label>
                            <select
                                id="category"
                                name="category"
                                value={productData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="사료">사료</option>
                                <option value="간식">간식</option>
                                <option value="장난감">장난감</option>
                                <option value="목줄 및 하네스">목줄 및 하네스</option>
                                <option value="배변 용품">배변 용품</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="image">상품 이미지</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            수정하기
                        </button>
                        <button type="button" onClick={() => setEditingProduct(null)} className="cancel-button">
                            취소
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'liked' && (
                <div className="liked-products">
                    <h1 className="page-title">찜한 상품</h1>
                    {selectedLikedProduct ? (
                        <div className="liked-product-detail">
                            <img src={selectedLikedProduct.imageUrl} alt={selectedLikedProduct.title} className="liked-product-image" />
                            <h3>{selectedLikedProduct.title}</h3>
                            <p>가격: {selectedLikedProduct.price}원</p>
                            <p>상태: {selectedLikedProduct.status}</p>
                            <p>설명: {selectedLikedProduct.description}</p>
                            <button onClick={() => setSelectedLikedProduct(null)} className="back-button">뒤로가기</button>
                        </div>
                    ) : (
                        <ul className="liked-product-list">
                            {likedProducts.length === 0 ? (
                                <p>찜한 상품이 없습니다.</p>
                            ) : (
                                likedProducts.map((product) => (
                                    <li key={product.id} className="liked-product-item" onClick={() => handleLikedProductClick(product)}>
                                        <img src={product.imageUrl} alt={product.title} className="liked-product-image" />
                                        <h3>{product.title}</h3>
                                        <p>가격: {product.price}원</p>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="transaction-history">
                    <h1 className="page-title">구매/판매 내역</h1>
                    <div className="transactions-section">
                        <h2>구매 내역</h2>
                        {transactions.purchases.length === 0 ? (
                            <p>구매 내역이 없습니다.</p>
                        ) : (
                            <ul className="transaction-list">
                                {transactions.purchases.map((transaction) => (
                                    <li key={transaction.id} className="transaction-item">
                                        <p>상품명: {transaction.productTitle}</p>
                                        <p>가격: {transaction.price}원</p>
                                        <p>거래 상태: {transaction.status}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="transactions-section">
                        <h2>판매 내역</h2>
                        {transactions.sales.length === 0 ? (
                            <p>판매 내역이 없습니다.</p>
                        ) : (
                            <ul className="transaction-list">
                                {transactions.sales.map((transaction) => (
                                    <li key={transaction.id} className="transaction-item">
                                        <p>상품명: {transaction.productTitle}</p>
                                        <p>가격: {transaction.price}원</p>
                                        <p>구매자: {transaction.buyerName}</p>
                                        <p>거래 상태: {transaction.status}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="transactions-section">
                        <h2>구매 신청 내역</h2>
                        {transactions.pending.length === 0 ? (
                            <p>구매 신청 내역이 없습니다.</p>
                        ) : (
                            <ul className="transaction-list">
                                {transactions.pending.map((transaction) => (
                                    <li key={transaction.id} className="transaction-item">
                                        <p>상품명: {transaction.productTitle}</p>
                                        <p>가격: {transaction.price}원</p>
                                        <p>구매자: {transaction.buyerName}</p>
                                        <p>거래 상태: {transaction.status}</p>
                                        <button
                                            onClick={() => handleApprovePurchase(transaction.id, true)}
                                            className="approve-button"
                                        >
                                            승인
                                        </button>
                                        <button
                                            onClick={() => handleApprovePurchase(transaction.id, false)}
                                            className="reject-button"
                                        >
                                            거절
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default SellProductPage;
