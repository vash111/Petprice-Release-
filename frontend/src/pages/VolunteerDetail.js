import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from './../utils/apiClient';
import '../components/styles/VolunteerDetail.css';

function VolunteerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [volunteer, setVolunteer] = useState(null); // 봉사활동 정보
    const [participantDetails, setParticipantDetails] = useState([]); // 참가자 상세 정보
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
    const [form, setForm] = useState({}); // 수정 폼 데이터
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVolunteerData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 봉사활동 정보 가져오기
                const response = await apiClient.get(`/api/volunteer/${id}`);
                setVolunteer(response.data);
                setForm(response.data); // 수정 폼에 초기값 설정

                // 참가자 상세 정보 가져오기
                const participantsResponse = await apiClient.get(`/api/volunteer/${id}/participants/details`);
                setParticipantDetails(participantsResponse.data || []);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                    navigate('/');
                } else {
                    setError(err.response?.data || '봉사활동 정보를 불러오는 데 실패했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVolunteerData();
    }, [id, navigate]);

    const handleParticipantAction = async (participantId, action) => {
        try {
            await apiClient.post(
                `/api/volunteer/${id}/participants/${participantId}/action`,
                null,
                { params: { action } }
            );

            // 참가자 상태 업데이트
            setParticipantDetails((prev) =>
                prev.map((participant) =>
                    participant.id === participantId ? { ...participant, status: action } : participant
                )
            );
        } catch (err) {
            alert(err.response?.data || '참가자 상태를 변경하는 데 실패했습니다.');
        }
    };

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
        try {
            await apiClient.put(`/api/volunteer/${id}`, form);
            alert('수정되었습니다.');
            setVolunteer(form); // 수정된 정보 반영
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data || '수정에 실패했습니다.');
        }
    };

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/api/volunteer/${id}`);
            alert('봉사활동 모집글이 삭제되었습니다.');
            navigate('/mypage'); // 리디렉션
        } catch (err) {
            alert(err.response?.data || '모집글 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (error) {
        return <p>오류: {error}</p>;
    }

    if (!volunteer) {
        return <p>봉사활동 정보를 찾을 수 없습니다.</p>;
    }

    return (
        <div className="volunteer-detail-container">
            {isEditing ? (
                <div className="edit-form">
                    <h2>모집글 수정</h2>
                    <label>
                        제목:
                        <input
                            type="text"
                            name="title"
                            value={form.title || ''}
                            onChange={handleFormChange}
                        />
                    </label>
                    <label>
                        내용:
                        <textarea
                            name="content"
                            value={form.content || ''}
                            onChange={handleFormChange}
                        />
                    </label>
                    <label>
                        지역:
                        <input
                            type="text"
                            name="region"
                            value={form.region || ''}
                            onChange={handleFormChange}
                        />
                    </label>
                    <label>
                        연락처:
                        <input
                            type="text"
                            name="contact"
                            value={form.contact || ''}
                            onChange={handleFormChange}
                        />
                    </label>
                    <label>
                        모집 기간:
                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate || ''}
                            onChange={handleFormChange}
                        />
                        ~
                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate || ''}
                            onChange={handleFormChange}
                        />
                    </label>
                    <button onClick={handleFormSubmit} className="save-button">저장</button>
                    <button onClick={handleEditToggle} className="cancel-button">취소</button>
                </div>
            ) : (
                <>
                    <div className="volunteer-header">
                        <h1>{volunteer.title}</h1>
                        <div className="action-buttons">
                            <button onClick={handleEditToggle} className="edit-button">수정</button>
                            <button onClick={handleDelete} className="delete-button">삭제</button>
                        </div>
                    </div>
                    <div className="volunteer-info">
                        <p><strong>내용:</strong> {volunteer.content}</p>
                        <p><strong>지역:</strong> {volunteer.region}</p>
                        <p><strong>연락처:</strong> {volunteer.contact}</p>
                        <p><strong>모집 기간:</strong> {volunteer.startDate} ~ {volunteer.endDate}</p>
                        <p><strong>최대 참가자:</strong> {volunteer.currentParticipants}</p>
                        <p><strong>현재 참가자 수:</strong> {volunteer.maxParticipants}</p>
                    </div>
                    <h2>참가자 상세 정보</h2>
                    {participantDetails.length === 0 ? (
                        <p>참가자 상세 정보가 없습니다.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>전화번호</th>
                                    <th>상태</th>
                                    <th>응답</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participantDetails.map((participant) => (
                                    <tr key={participant.id}>
                                        <td>{participant.username}</td>
                                        <td>{participant.phoneNumber}</td>
                                        <td>{participant.status || '대기 중'}</td>
                                        <td>
                                            {participant.status !== '수락' && (
                                                <button
                                                    onClick={() => handleParticipantAction(participant.id, 'Accepted')}
                                                >
                                                    수락
                                                </button>
                                            )}
                                            {participant.status !== '거절' && (
                                                <button
                                                    onClick={() => handleParticipantAction(participant.id, 'Rejected')}
                                                >
                                                    거절
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}

export default VolunteerDetail;
