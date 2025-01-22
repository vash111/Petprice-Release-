import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CustomerSupport from './pages/CustomerSupport';
import MyPage from './pages/Mypage';
import AnimalSearchPage from './pages/AnimalSearchPage';
import VolunteerSearchPage from './pages/VolunteerSearchPage';
import VolunteerCreatePage from './pages/VolunteerCreatePage';
import ReviewBoard from './pages/ReviewBoard';
import ReviewDetail from './pages/ReviewDetail';
import FreeBoardPage from './pages/FreeBoardPage';
import FreeBoardDetailPage from './pages/FreeBoardDetailPage'
import AdminPage from './pages/AdminPage';
import NoticeBoard from './pages/NoticeBoard';
import NoticeDetail from './pages/NoticeDetail';
import VolunteerDetail from './pages/VolunteerDetail';
import ProductPage from './pages/ProductPage';
import SellProductPage from './pages/SellProductPage';
import PaymentPage from './pages/PaymentPage';
import ChatRoom from './pages/ChatRoom';

import apiClient, { setupInterceptors } from './utils/apiClient';

// UserContext
export const UserContext = React.createContext({
    isLoggedIn: false,
    userInfo: null,
});

function AppRouter({ isLoggedIn }) {
    return (
        <>
            <Header />
            <main style={{ minHeight: '80vh', padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/AboutPage" element={<AboutPage />} />
                    <Route path="/customersupport" element={<CustomerSupport />} />
                    <Route path="/Mypage" element={isLoggedIn ? <MyPage /> : <HomePage />} />
                    <Route path="/animalsearch" element={<AnimalSearchPage />} />
                    <Route path="/VolunteerSearchPage" element={<VolunteerSearchPage />} />
                    <Route path="/VolunteerCreatePage" element={isLoggedIn ? <VolunteerCreatePage /> : <HomePage />} />
                    <Route path="/ReviewBoard" element={<ReviewBoard />} />
                    <Route path="/reviews/:id" element={<ReviewDetail />} />
                    <Route path="/FreeBoardPage" element={<FreeBoardPage />} />
                    <Route path="/freeboard/:id" element={<FreeBoardDetailPage />} />
                    <Route path="/AdminPage" element={isLoggedIn ? <AdminPage /> : <HomePage />} />
                    <Route path="/notice-board" element={<NoticeBoard />} />
                    <Route path="/notice-detail/:id" element={<NoticeDetail />} />
                    <Route path="/volunteer/:id" element={<VolunteerDetail />} />
                    <Route path="/ProductPage" element={<ProductPage />} />
                    <Route path="/sell-product" element={<SellProductPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/chat/:roomKey" element={<ChatRoom />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const response = await apiClient.get('/api/users/session');
                setIsLoggedIn(true);
                setUserInfo(response.data);
                console.log('세션 확인 성공:', response.data);
            } catch (error) {
                setIsLoggedIn(false);
                setUserInfo(null);
            }
        };

        fetchUserSession();
    }, []);

    return (
        <UserContext.Provider value={{ isLoggedIn, userInfo }}>
            <Router>
                <AppRouter isLoggedIn={isLoggedIn} />
            </Router>
        </UserContext.Provider>
    );
}

export default App;
