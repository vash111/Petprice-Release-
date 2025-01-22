import React, { useState } from 'react';
import '../components/styles/VolunteerCreatePage.css'; // 스타일 파일 추가
import axios from 'axios';

function VolunteerCreatePage() {
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
        region: '',
        contact: '',
        maxParticipants: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPost((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('New Post Data:', newPost); // 디버깅용 데이터 출력

        if (
            !newPost.title ||
            !newPost.content ||
            !newPost.startDate ||
            !newPost.endDate ||
            !newPost.region ||
            !newPost.contact ||
            !newPost.maxParticipants
        ) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(newPost.contact)) {
            alert('유효한 연락처를 입력해주세요. 예: 010-1234-5678');
            return;
        }

        const maxParticipants = parseInt(newPost.maxParticipants, 10);
        if (isNaN(maxParticipants) || maxParticipants <= 0) {
            alert('신청받을 인원은 양의 정수로 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post('/api/volunteer/create', newPost, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            alert('모집글이 성공적으로 저장되었습니다!');
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="volunteer-create-page">
            <h1 className="title">봉사자 모집글 작성</h1>
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="제목을 입력하세요"
                        value={newPost.title}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        name="content"
                        placeholder="내용을 입력하세요"
                        value={newPost.content}
                        onChange={handleInputChange}
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label>봉사자 모집 기간</label>
                    <div className="date-group">
                        <input
                            type="date"
                            name="startDate"
                            value={newPost.startDate}
                            onChange={handleInputChange}
                        />
                        <span>~</span>
                        <input
                            type="date"
                            name="endDate"
                            value={newPost.endDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="region">지역</label>
                    <select id="region" name="region" value={newPost.region} onChange={handleInputChange}>
                        <option value="">지역 선택</option>
                        <option value="서울특별시">서울특별시</option>
                        <option value="부산광역시">부산광역시</option>
                        <option value="대구광역시">대구광역시</option>
                        <option value="인천광역시">인천광역시</option>
                        <option value="광주광역시">광주광역시</option>
                        <option value="대전광역시">대전광역시</option>
                        <option value="울산광역시">울산광역시</option>
                        <option value="세종특별자치시">세종특별자치시</option>
                        <option value="경기도">경기도</option>
                        <option value="강원도">강원도</option>
                        <option value="충청북도">충청북도</option>
                        <option value="충청남도">충청남도</option>
                        <option value="전라북도">전라북도</option>
                        <option value="전라남도">전라남도</option>
                        <option value="경상북도">경상북도</option>
                        <option value="경상남도">경상남도</option>
                        <option value="제주특별자치도">제주특별자치도</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="contact">연락처</label>
                    <input
                        type="text"
                        id="contact"
                        name="contact"
                        placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
                        value={newPost.contact}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="maxParticipants">신청받을 인원</label>
                    <input
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        placeholder="신청받을 인원을 입력하세요"
                        value={newPost.maxParticipants}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="submit-button">저장</button>
            </form>
        </div>
    );
}

export default VolunteerCreatePage;
