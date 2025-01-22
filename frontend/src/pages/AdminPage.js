import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import '../components/styles/AdminPage.css';
import { Container, Row, Col, Button, Table, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('inquiries'); // 기본 활성화된 탭: 문의 관리
    const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태
    const navigate = useNavigate();

    // 문의 데이터 상태
    const [inquiries, setInquiries] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [editingReplyId, setEditingReplyId] = useState(null);

    // 공지사항 데이터 상태
    const [notices, setNotices] = useState([]);
    const [newNotice, setNewNotice] = useState({ title: '', content: '' });
    const [editingNotice, setEditingNotice] = useState(null);

    // 관리자인지 확인
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await apiClient.get('/api/users/session');
                const user = response.data;
                if (user.role === 'ADMIN') {
                    setIsAdmin(true);
                } else {
                    alert('접근 권한이 없습니다.');
                    navigate('/');
                }
            } catch (error) {
                console.error('관리자 확인 실패:', error);
                alert('관리자 권한이 필요합니다.');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [navigate]);

    // 문의 데이터 가져오기
    useEffect(() => {
        if (isAdmin && activeTab === 'inquiries') fetchInquiries();
        if (isAdmin && activeTab === 'notices') fetchNotices();
    }, [isAdmin, activeTab]);

    const fetchInquiries = async () => {
        try {
            const response = await apiClient.get('/api/admin/inquiries');
            setInquiries(response.data);
        } catch (error) {
            console.error('문의 데이터를 가져오는 데 실패했습니다:', error);
        }
    };

    const fetchNotices = async () => {
        try {
            const response = await apiClient.get('/api/admin/notices');
            setNotices(response.data);
        } catch (error) {
            console.error('공지사항 데이터를 가져오는 데 실패했습니다:', error);
        }
    };

    // 문의 답글 작성/수정
    const handleReply = async (inquiryId, isEdit = false) => {
        try {
            const endpoint = isEdit
                ? `/api/admin/inquiries/${inquiryId}/edit-reply`
                : `/api/admin/inquiries/${inquiryId}/reply`;

            const response = await apiClient.post(endpoint, { reply: replyContent }, {
                headers: { 'Content-Type': 'application/json' },
            });

            alert(isEdit ? '답글이 수정되었습니다.' : '답글이 추가되었습니다.');
            setReplyContent('');
            setEditingReplyId(null);
            fetchInquiries(); // 리스트 새로고침
        } catch (error) {
            console.error('답글 처리에 실패했습니다:', error.response || error);
            alert('답글 처리에 실패했습니다.');
        }
    };

    // 공지사항 추가
    const handleAddNotice = async () => {
        try {
            const response = await apiClient.post('/api/admin/notices', newNotice);
            setNotices([...notices, response.data]);
            setNewNotice({ title: '', content: '' });
            alert('공지사항이 추가되었습니다.');
        } catch (error) {
            console.error('공지사항 추가에 실패했습니다:', error);
            alert('공지사항 추가에 실패했습니다.');
        }
    };

    // 공지사항 삭제
    const handleDeleteNotice = async (noticeId) => {
        try {
            await apiClient.delete(`/api/admin/notices/${noticeId}`);
            setNotices(notices.filter((notice) => notice.id !== noticeId));
            alert('공지사항이 삭제되었습니다.');
        } catch (error) {
            console.error('공지사항 삭제에 실패했습니다:', error);
            alert('공지사항 삭제에 실패했습니다.');
        }
    };

    // 공지사항 수정
    const handleEditNotice = async () => {
        try {
            await apiClient.put(`/api/admin/notices/${editingNotice.id}`, editingNotice);
            setNotices(
                notices.map((notice) =>
                    notice.id === editingNotice.id ? editingNotice : notice
                )
            );
            setEditingNotice(null);
            alert('공지사항이 수정되었습니다.');
        } catch (error) {
            console.error('공지사항 수정에 실패했습니다:', error);
            alert('공지사항 수정에 실패했습니다.');
        }
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <Container className="admin-page">
            <Row className="mb-4">
                <Col>
                    <h1 className="admin-title">관리자 게시판</h1>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <div className="tab-buttons">
                        <Button
                            variant={activeTab === 'inquiries' ? 'primary' : 'outline-primary'}
                            onClick={() => setActiveTab('inquiries')}
                        >
                            문의 내역 관리
                        </Button>
                        <Button
                            variant={activeTab === 'notices' ? 'primary' : 'outline-primary'}
                            onClick={() => setActiveTab('notices')}
                            className="ms-2"
                        >
                            공지사항 관리
                        </Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    {activeTab === 'inquiries' && (
                        <div className="tab-content">
                            <h2 className="tab-title">문의 내역 관리</h2>
                            <Table striped bordered hover responsive className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>작성자</th>
                                        <th>내용</th>
                                        <th>카테고리</th>
                                        <th>상태</th>
                                        <th>답변 작성</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiries.map((inquiry) => (
                                        <tr key={inquiry.id}>
                                            <td>{inquiry.id}</td>
                                            <td>{inquiry.name}</td>
                                            <td>{inquiry.content}</td>
                                            <td>{inquiry.category}</td>
                                            <td>{inquiry.reply ? '답변 완료' : '미답변'}</td>
                                            <td>
                                                {editingReplyId === inquiry.id ? (
                                                    <Form>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                        />
                                                        <Button
                                                            className="mt-2"
                                                            variant="success"
                                                            onClick={() => handleReply(inquiry.id)}
                                                        >
                                                            제출
                                                        </Button>
                                                    </Form>
                                                ) : (
                                                    <>
                                                        {inquiry.reply ? (
                                                            <Button
                                                                className="ms-2"
                                                                variant="warning"
                                                                onClick={() => {
                                                                    setEditingReplyId(inquiry.id);
                                                                    setReplyContent(inquiry.reply); // 기존 답변 내용을 수정 필드에 표시
                                                                }}
                                                            >
                                                                수정
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => {
                                                                    setEditingReplyId(inquiry.id);
                                                                    setReplyContent(''); // 작성 시 빈 입력 필드
                                                                }}
                                                            >
                                                                작성
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>


                            </Table>
                        </div>
                    )}
                    {activeTab === 'notices' && (
                        <div className="tab-content">
                            <h2 className="tab-title">공지사항 관리</h2>
                            <Form>
                                <Form.Group controlId="noticeTitle">
                                    <Form.Label>제목</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="제목을 입력하세요"
                                        value={newNotice.title}
                                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group controlId="noticeContent" className="mt-3">
                                    <Form.Label>내용</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="내용을 입력하세요"
                                        value={newNotice.content}
                                        onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                    />
                                </Form.Group>
                                <Button variant="success" className="mt-3" onClick={handleAddNotice}>
                                    공지사항 추가
                                </Button>
                            </Form>
                            <Table striped bordered hover responsive className="mt-4">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>제목</th>
                                        <th>내용</th>
                                        <th>수정</th>
                                        <th>삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notices.map((notice) => (
                                        <tr key={notice.id}>
                                            <td>{notice.id}</td>
                                            <td>
                                                {editingNotice && editingNotice.id === notice.id ? (
                                                    <Form.Control
                                                        value={editingNotice.title}
                                                        onChange={(e) =>
                                                            setEditingNotice({
                                                                ...editingNotice,
                                                                title: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    notice.title
                                                )}
                                            </td>
                                            <td>
                                                {editingNotice && editingNotice.id === notice.id ? (
                                                    <Form.Control
                                                        as="textarea"
                                                        value={editingNotice.content}
                                                        onChange={(e) =>
                                                            setEditingNotice({
                                                                ...editingNotice,
                                                                content: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    notice.content
                                                )}
                                            </td>
                                            <td>
                                                {editingNotice && editingNotice.id === notice.id ? (
                                                    <Button
                                                        variant="success"
                                                        onClick={handleEditNotice}
                                                    >
                                                        저장
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="warning"
                                                        onClick={() => setEditingNotice(notice)}
                                                    >
                                                        수정
                                                    </Button>
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteNotice(notice.id)}
                                                >
                                                    삭제
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default AdminPage;
