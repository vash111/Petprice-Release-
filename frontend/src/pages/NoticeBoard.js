import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from './../utils/apiClient';

function NoticeBoard() {
    const [notices, setNotices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // 공지사항 데이터 로드
        const fetchNotices = async () => {
            try {
                const response = await apiClient.get('/api/public/notices?limit=3'); // 전체 공지사항 API 호출
                const noticesData = Array.isArray(response.data) ? response.data : [];
                setNotices(noticesData);
            } catch (error) {
                console.error('공지사항 데이터를 가져오는 중 오류 발생:', error.message);
                setNotices([]);
            }
        };

        fetchNotices();
    }, []);

    const handleDetailClick = (id) => {
        navigate(`/notice-detail/${id}`); // 공지사항 상세 페이지로 이동
    };

    return (
        <Container style={{ marginTop: '40px' }}>
            <h2 className="text-center mb-4" style={{ color: '#4CAF50' }}>
                공지사항
            </h2>
            {notices.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>제목</th>
                            <th>작성일</th>
                            <th>상세보기</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map((notice) => (
                            <tr key={notice.id}>
                                <td>{notice.id}</td>
                                <td>{notice.title}</td>
                                <td>{new Date(notice.createdTime).toLocaleDateString()}</td>
                                <td>
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleDetailClick(notice.id)}
                                    >
                                        보기
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="text-center">공지사항이 없습니다.</p>
            )}
        </Container>
    );
}

export default NoticeBoard;
