import React from 'react';
import Header from './Header'; // Header import
import Footer from './Footer'; // 올바른 경로


function MainLayout({ children }) {
  return (
    <div>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main style={{ padding: '20px' }}>
        {children}
      </main>
      
      {/* Footer (옵션) */}
      <Footer />
    </div>
  );
}

export default MainLayout;
