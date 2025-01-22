import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Accordion, Modal } from 'react-bootstrap';
import apiClient from './../utils/apiClient'; // Axios 혹은 fetch 래퍼
import { UserContext } from '../App';
import '../components/styles/CustomerSupport.css';

function CustomerSupport() {
    const { isLoggedIn, userInfo } = useContext(UserContext);

    // 문의 작성 폼 상태
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: '일반 문의',
        inquiry: '',
    });

    // 사용자 문의 목록 (InquiryResponseDto)
    const [inquiries, setInquiries] = useState([]);

    // 모달 제어 상태
    const [showModal, setShowModal] = useState(false);
    // 모달에 표시할 "선택된 문의"
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    // ---------------------------
    // 1. 로그인 정보로 기본 폼 세팅
    // ---------------------------
    useEffect(() => {
        if (isLoggedIn && userInfo) {
            setFormData({
                name: userInfo.username || '',
                email: userInfo.email || '',
                category: '일반 문의',
                inquiry: '',
            });
        }
    }, [isLoggedIn, userInfo]);

    // ---------------------------
    // 2. 사용자 문의 목록 불러오기
    // ---------------------------
    useEffect(() => {
        if (isLoggedIn) {
            fetchUserInquiries();
        }
    }, [isLoggedIn]);

    const fetchUserInquiries = async () => {
        try {
            // /api/inquiries (유저 본인 문의 조회)
            const response = await apiClient.get('/api/inquiries');
            // 응답이 InquiryResponseDto[] 형태라고 가정
            setInquiries(response.data);
        } catch (error) {
            console.error('문의 내역 불러오기 실패:', error.response?.data || error.message);
        }
    };

    // ---------------------------
    // 3. 폼 입력 핸들러
    // ---------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ---------------------------
    // 4. 문의 등록 핸들러
    // ---------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!formData.inquiry.trim()) {
            alert('문의 내용을 입력하세요.');
            return;
        }

        try {
            // 문의 등록
            await apiClient.post('/api/inquiries', {
                category: formData.category,
                content: formData.inquiry,
            });
            alert('문의가 성공적으로 접수되었습니다.');

            // 폼 초기화
            setFormData((prev) => ({ ...prev, inquiry: '' }));

            // 등록 후 문의 목록 갱신
            fetchUserInquiries();
        } catch (error) {
            console.error('문의 등록 실패:', error.response?.data || error.message);
            alert('문의 등록에 실패했습니다.');
        }
    };

    // ---------------------------
    // 5. 모달 열기 / 닫기
    // ---------------------------
    const handleShowModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedInquiry(null);
        setShowModal(false);
    };

    return (
        <Container style={{ padding: '40px 20px', marginTop: '40px' }}>

            {/* 상단 안내 */}
            <Row className="mb-4">
                <Col>
                    <h1 style={{ color: '#4CAF50', fontWeight: 'bold' }}>고객센터</h1>
                    <p>
                        궁금하신 점이 있으시면 언제든 문의해주세요.
                        아래 FAQ를 참고하거나 문의 폼을 작성해 주세요.
                    </p>
                </Col>
            </Row>

            {/* FAQ */}
            <Row className="mb-5">
                <Col>
                    <div className="faq-section">
                        <h2 style={{ color: '#4CAF50' }}>자주 묻는 질문 (FAQ)</h2>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Q. 회원가입은 어떻게 하나요?</Accordion.Header>
                                <Accordion.Body>
                                    회원가입은 상단 네비게이션바의 '회원가입' 버튼을 클릭한 뒤,
                                    정보를 입력하여 진행하시면 됩니다.
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Q. ID/PW를 잊어버렸어요. 어떻게 찾을 수 있나요?</Accordion.Header>
                                <Accordion.Body>
                                    로그인 창에서 'ID/PW 찾기' 버튼을 클릭하면,
                                    등록된 이메일로 ID 또는 비밀번호 재설정 안내를 받을 수 있습니다.
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>Q. 봉사활동 관련 문의는 어떻게 하나요?</Accordion.Header>
                                <Accordion.Body>
                                    봉사활동 게시판에서 질문을 남기거나 고객센터로 문의 주시면 친절히 안내해드리겠습니다.
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </Col>
            </Row>

            {/* 문의하기 폼 */}
            <Row className="mb-4">
                <Col>
                    <div className="inquiry-section">
                        <h2 style={{ color: '#4CAF50' }}>문의하기</h2>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formCategory">
                                <Form.Label>문의 카테고리</Form.Label>
                                <Form.Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="일반 문의">일반 문의</option>
                                    <option value="회원 정보">회원 정보</option>
                                    <option value="봉사 활동">봉사 활동</option>
                                    <option value="기타">기타</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label>이름</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Label>이메일</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    readOnly
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formInquiry">
                                <Form.Label>문의 내용</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    name="inquiry"
                                    placeholder="문의 내용을 입력하세요"
                                    value={formData.inquiry}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Button variant="success" type="submit" className="w-100">
                                문의하기
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>

            {/* 내가 남긴 문의 내역 */}
            <Row className="mb-4">
                <Col>
                    <h2 style={{ color: '#4CAF50' }}>내 문의 내역</h2>
                    {inquiries.length === 0 ? (
                        <p>아직 등록된 문의가 없습니다.</p>
                    ) : (
                        <div>
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <p>
                                        <strong>카테고리:</strong> {inquiry.category}
                                    </p>
                                    <p>
                                        <strong>문의 내용:</strong> {inquiry.content}
                                    </p>
                                    {/* 상세보기 버튼 */}
                                    <Button
                                        variant="primary"
                                        onClick={() => handleShowModal(inquiry)}
                                    >
                                        상세보기
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>

            {/* 모달: 선택된 문의 상세 + 관리자 답변 */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>문의 상세 보기</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInquiry && (
                        <>
                            <p>
                                <strong>카테고리:</strong> {selectedInquiry.category}
                            </p>
                            <p>
                                <strong>문의 내용:</strong>
                            </p>
                            <div
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    marginBottom: '10px',
                                }}
                            >
                                {selectedInquiry.content}
                            </div>

                            <hr />
                            <p>
                                <strong>관리자 답변:</strong>
                            </p>
                            {selectedInquiry.reply ? (
                                <div
                                    style={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #dee2e6',
                                        padding: '10px',
                                        borderRadius: '4px',
                                    }}
                                >
                                    {selectedInquiry.reply}
                                </div>
                            ) : (
                                <p>아직 답변이 등록되지 않았습니다.</p>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default CustomerSupport;
