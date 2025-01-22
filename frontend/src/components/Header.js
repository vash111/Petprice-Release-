import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import DaumPostcode from 'react-daum-postcode';
import './styles/Header.css';
import apiClient from './../utils/apiClient';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState({
    volunteers: false,
    rescueStories: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    phoneNumber: '',
    role: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    address: '',
  });
  const [showPostcode, setShowPostcode] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const handleModalOpen = (tab) => {
    setCurrentTab(tab);
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiClient.get('/api/users/session');
        setIsLoggedIn(true);
        setUserInfo(response.data);
      } catch (error) {
        console.log('로그인 상태 확인 실패:', error.message);

        const noAuthPaths = [
          '/',
          '/animalsearch',
          '/VolunteerSearchPage',
          '/FreeBoardPage',
          '/ReviewBoardPage',
          '/CustomerSupport',
          '/notice-board',
          '/AboutPage',
          '/ProductPage',
          '/ReviewBoard',
          '/ProductPage',
        ];

        const dynamicPaths = [/^\/notice-detail\/\d+$/]; // 동적 경로 정규식 추가

        const isPathAllowed =
          noAuthPaths.includes(location.pathname) ||
          dynamicPaths.some((regex) => regex.test(location.pathname));

        if (!isPathAllowed) {
          alert('인증이 필요합니다. 다시 로그인해주세요.');
          navigate('/');
        }

        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    checkSession();
  }, [location.pathname, navigate]);

  const toggleDropdown = (menu, show) => {
    setShowDropdown((prev) => ({
      ...prev,
      [menu]: show,
    }));
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/users/forgot-password', {
        email: formData.email,
        name: formData.name,
      });
      console.log('비밀번호 찾기 요청 성공:', response.data);
      alert('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
      setCurrentTab('login'); // 완료 후 로그인 화면으로 이동
    } catch (error) {
      console.error('비밀번호 찾기 요청 실패:', error.response?.data?.message || error.message);
      alert('비밀번호 찾기에 실패했습니다. 다시 시도해주세요.');
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password' || name === 'confirmPassword') {
      // 둘 다 비어있으면 메시지 숨김
      if (!formData.password && !formData.confirmPassword && value === '') {
        setPasswordMatch(null); // null로 설정하여 메시지 숨김
      } else {
        // 입력된 값이 있을 경우 일치 여부 확인
        setPasswordMatch(
          name === 'password'
            ? value === formData.confirmPassword
            : value === formData.password
        );
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/users/login', {
        email: formData.email,
        password: formData.password,
      });
      console.log('로그인 성공:', response.data);
      setIsLoggedIn(true);
      setUserInfo(response.data);
      setShowModal(false);
      navigate('/Mypage'); // 로그인 후 메인 페이지로 이동
    } catch (error) {
      console.error('로그인 실패:', error.response?.data?.message || error.message);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const response = await apiClient.post('/api/users/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        roadAddr: formData.roadAddr,
        jibunAddr: formData.jibunAddr,
        zipNo: formData.zipNo, 
      });
      console.log('회원가입 성공:', response.data);
      alert('회원가입 성공! 로그인 해주세요.');
      setCurrentTab('login');
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data?.message || error.message);
      alert(`회원가입 실패: ${error.response?.data?.message || '서버와 통신할 수 없습니다.'}`);
    }
  };

  const handleAddressSelect = (data) => {
    console.log("Selected Address:", data);
    setFormData((prev) => ({
      ...prev,
      roadAddr: data.roadAddress, // 도로명 주소
      jibunAddr: data.jibunAddress, // 지번 주소
      zipNo: data.zonecode, // 우편번호
    }));
    alert(`주소가 입력되었습니다:\n도로명 주소: ${data.roadAddress}\n지번 주소: ${data.jibunAddress}\n우편번호: ${data.zonecode}`);
    setShowPostcode(false);
  };

  const handleKakaoLogin = () => {
    const CLIENT_ID = process.env.REACT_APP_KAKAO_CLIENT_ID;
    const REDIRECT_URI = 'http://localhost:8080';

    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/users/logout');
      setIsLoggedIn(false);
      setUserInfo(null);
      alert('로그아웃 되었습니다.');
      navigate('/'); // 로그아웃 후 메인 페이지로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error.response?.data?.message || error.message);
      alert('로그아웃에 실패했습니다.');
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className={isHomePage ? 'header-main' : 'header-default'}>
      <Navbar collapseOnSelect expand="lg" className={isHomePage ? 'navbar-transparent' : 'navbar-default'}>
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img
              src="https://image.rocketpunch.com/company/113155/procyon-1_logo_1580259024.png?s=400x400&t=inside"
              alt="Procyon Logo"
              width="100"
              height="100"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mx-auto" style={{ gap: '20px' }}>
              <Nav.Link href="/animalsearch">유기동물 조회</Nav.Link>
              <NavDropdown
                title="봉사활동"
                id="volunteers-dropdown"
                show={showDropdown.volunteers}
                onMouseEnter={() => toggleDropdown('volunteers', true)}
                onMouseLeave={() => toggleDropdown('volunteers', false)}
              >
                <NavDropdown.Item href="/VolunteerSearchPage">찾아보기</NavDropdown.Item>
                <NavDropdown.Item href="/VolunteerCreatePage">봉사자 모집하기</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/ProductPage">중고장터</Nav.Link>
              <NavDropdown
                title="커뮤니티"
                id="rescue-dropdown"
                show={showDropdown.rescueStories}
                onMouseEnter={() => toggleDropdown('rescueStories', true)}
                onMouseLeave={() => toggleDropdown('rescueStories', false)}
              >
                <NavDropdown.Item href="/FreeBoardPage">자유 게시판</NavDropdown.Item>
                <NavDropdown.Item href="/ReviewBoard">후기 게시판</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/CustomerSupport">고객 센터</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              {isLoggedIn && userInfo ? (
                <>
                  {userInfo.role === 'ADMIN' ? (
                    <Nav.Link href="/AdminPage" style={{ fontWeight: 'bold' }}>
                      어드민 페이지
                    </Nav.Link>
                  ) : (
                    <Nav.Link href="/Mypage" style={{ fontWeight: 'bold' }}>
                      마이페이지
                    </Nav.Link>
                  )}
                  <Nav.Link onClick={handleLogout} style={{ color: '#FF0000', fontWeight: 'bold' }}>
                    로그아웃
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={() => handleModalOpen('login')} style={{ fontSize: '24px', color: '#4CAF50' }}>
                  <FaUser />
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static" keyboard={true}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentTab === 'login' && '로그인'}
            {currentTab === 'signup' && '회원 가입'}
            {currentTab === 'forgot-password' && '비밀번호 찾기'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

        {currentTab === 'login' && (
            <Form onSubmit={handleLogin} noValidate>
              <Form.Group controlId="formLoginEmail" className="mb-3">
                <Form.Label className="text-start d-block">이메일</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formLoginPassword" className="mb-3">
                <Form.Label className="text-start d-block">비밀번호</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button variant="success" type="submit" className="w-100 mb-3">
                로그인
              </Button>
              <Button variant="warning" className="w-100 mb-3" onClick={handleKakaoLogin}>
                카카오톡 로그인
              </Button>
              <div className="text-center">
                <a href="#signup" onClick={() => setCurrentTab('signup')} style={{ marginRight: '10px' }}>
                  회원가입
                </a>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Forgot Password Clicked');
                    setCurrentTab('forgot-password');
                  }}
                >
                  PW 찾기
                </a>
              </div>
            </Form>
          )}
             {currentTab === 'signup' && (
            <Form onSubmit={handleSignup} noValidate>
              <Form.Group controlId="formSignupEmail" className="mb-3">
                <Form.Label className="text-start d-block">이메일</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formSignupPassword" className="mb-3">
                <Form.Label className="text-start d-block">비밀번호</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formSignupPasswordConfirm" className="mb-3">
                <Form.Label className="text-start d-block">비밀번호 확인</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {/* 비밀번호 일치 여부 메시지 */}
                {passwordMatch !== null && (
                  <small
                    style={{
                      color: passwordMatch ? 'green' : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    {passwordMatch
                      ? '비밀번호가 일치합니다.'
                      : '비밀번호가 일치하지 않습니다.'}
                  </small>
                )}
              </Form.Group>
              <Form.Group controlId="formSignupName" className="mb-3">
                <Form.Label className="text-start d-block">이름</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formSignupPhoneNumber" className="mb-3">
                <Form.Label className="text-start d-block">전화번호</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  placeholder="전화번호를 입력하세요"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formSignupAddress" className="mb-3">
                <Form.Label className="text-start d-block">주소</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="주소를 검색하세요"
                    value={formData.address}
                    readOnly
                    required
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setShowPostcode(true)}
                    className="ms-2"
                  >
                    검색
                  </Button>
                </div>
              </Form.Group>
              {showPostcode && (
                <div className="postcode-popup">
                  <DaumPostcode
                    onComplete={handleAddressSelect}
                    autoClose
                  />
                </div>
              )}
              <Button variant="success" type="submit" className="w-100">
                회원 가입
              </Button>
            </Form>
          )}

          {currentTab === 'forgot-password' && (
            <Form onSubmit={handlePasswordReset} noValidate>
              <Form.Group controlId="formForgotName" className="mb-3">
                <Form.Label>이름</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formForgotEmail" className="mb-3">
                <Form.Label>이메일</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="비밀번호를 찾을 이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                비밀번호 찾기
              </Button>
              <div className="text-center mt-3">
                <a href="#login" onClick={(e) => { e.preventDefault(); setCurrentTab('login'); }}>
                  로그인으로 돌아가기
                </a>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </header>
  );
}

export default Header;
