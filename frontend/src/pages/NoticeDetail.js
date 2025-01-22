import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from './../utils/apiClient';
import { Container } from 'react-bootstrap';

function NoticeDetail() {
    const { id } = useParams();
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await apiClient.get(`/api/public/notices/${id}`); // 템플릿 리터럴 사용
                setNotice(response.data);
            } catch (error) {
                console.error('공지사항 상세 데이터를 가져오는 중 오류 발생:', error.message);
            }
        };

        fetchNotice();
    }, [id]);

    return (
        <Container style={{ marginTop: '40px' }}>
            {notice ? (
                <div>
                    <h2 style={{ color: '#4CAF50' }}>{notice.title}</h2>
                    <p style={{ color: '#888', marginBottom: '20px' }}>
                        작성일: {new Date(notice.createdTime).toLocaleDateString()}
                    </p>
                    <p>{notice.content}</p>
                </div>
            ) : (
                <p>공지사항을 불러오는 중입니다...</p>
            )}
        </Container>
    );
}

export default NoticeDetail;
