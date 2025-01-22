import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import '../components/styles/ReviewBoard.css';
import apiClient from '../utils/apiClient';

function ReviewBoard() {
    const { isLoggedIn, userInfo } = useContext(UserContext);
    const [reviews, setReviews] = useState([]);
    const [volunteerActivities, setVolunteerActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // 이미지 첨부 추가
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, [currentPage]);

    const fetchReviews = async () => {
        try {
            const response = await apiClient.get('/api/reviews', {
                params: {
                    region: regionFilter || null, // regionFilter가 비어 있으면 null로 설정
                    keyword: searchTerm || null, // searchTerm이 비어 있으면 null로 설정
                    page: currentPage - 1,
                    size: itemsPerPage,
                },
            });
            setReviews(response.data.content);
            console.log('Fetched reviews:', response.data);
        } catch (error) {
            console.error('리뷰를 가져오는 중 오류 발생:', error);
        }
    };


    const handleViewReview = async (id) => {
        try {
            const response = await apiClient.get(`/api/reviews/${id}`);
            console.log('Review details:', response.data);
            navigate(`/reviews/${id}`, { state: { review: response.data } });
        } catch (error) {
            console.error('리뷰 상세 조회 중 오류 발생:', error);
        }
    };


    const fetchVolunteerActivities = async () => {
        try {
            const response = await apiClient.get('/api/reviews/accepted-activities');
            setVolunteerActivities(response.data); // 수락된 봉사활동만 저장
        } catch (error) {
            console.error('수락된 봉사활동 목록 가져오기 실패:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRegionChange = (e) => {
        setRegionFilter(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (review = null) => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!isEditMode) {
            fetchVolunteerActivities();
        }

        if (review) {
            setIsEditMode(true);
            setCurrentReview(review);
        } else {
            setIsEditMode(false);
            setCurrentReview({
                title: '',
                content: '',
                region: '',
                volunteerId: '',
                imageUrl: '', // 이미지 URL 필드 추가
            });
            setSelectedImage(null); // 이미지 초기화
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentReview(null);
        setSelectedImage(null); // 이미지 초기화
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentReview((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    const handleSaveReview = async () => {
        if (!currentReview.title.trim() || !currentReview.content.trim()) {
            alert('제목과 내용을 모두 입력하세요.');
            return;
        }

        if (!currentReview.volunteerId) {
            alert('봉사활동을 선택하세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', currentReview.title);
        formData.append('content', currentReview.content);
        formData.append('region', currentReview.region);
        formData.append('volunteerId', currentReview.volunteerId);
        if (selectedImage) {
            formData.append('image', selectedImage); // 이미지 파일 추가
        }

        try {
            if (isEditMode) {
                await apiClient.put(`/api/reviews/${currentReview.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await apiClient.post(`/api/reviews/create`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            fetchReviews();
            handleCloseModal();
        } catch (error) {
            console.error('리뷰 저장 중 오류 발생:', error);
            if (error.response?.status === 403) {
                alert('리뷰를 작성할 권한이 없습니다.');
            } else {
                alert('리뷰 저장 중 문제가 발생했습니다.');
            }
        }
    };

    const filteredReviews = reviews.filter((review) =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    return (
        <div className="review-board-page">
            <h1 className="centered">봉사활동 후기 게시판</h1>
            <div className="top-bar">
                <input
                    type="text"
                    placeholder="제목으로 검색하세요."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <select
                    value={regionFilter}
                    onChange={handleRegionChange}
                    className="region-select"
                >
                    <option value="">지역 필터</option>
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
                <button className="search-button" onClick={fetchReviews}>검색</button>
                <button onClick={() => handleOpenModal()} className="create-button">
                    후기 작성
                </button>
            </div>
            <table className="board-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>지역</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>조회수</th>
                        <th>댓글</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReviews.map((review, index) => (
                        <tr key={review.id}>
                            <td>{index + 1}</td>
                            <td onClick={() => handleViewReview(review.id)}>{review.title}</td>
                            <td>{review.region || '미지정'}</td>
                            <td>{review.username}</td>
                            <td>{new Date(review.createdAt).toLocaleString()}</td>
                            <td>{review.views || 0}</td>
                            <td>{review.commentsCount || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isEditMode ? '후기 수정' : '후기 작성'}</h2>
                        <input
                            type="text"
                            name="title"
                            placeholder="제목"
                            value={currentReview.title}
                            onChange={handleInputChange}
                        />
                        <select
                            name="region"
                            value={currentReview.region}
                            onChange={handleInputChange}
                            className="region-select"
                        >
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
                        {!isEditMode && (
                            <select
                                name="volunteerId"
                                value={currentReview.volunteerId}
                                onChange={handleInputChange}
                                className="volunteer-select"
                            >
                                <option value="" disabled>봉사활동을 선택하세요</option>
                                {volunteerActivities.map((activity) => (
                                    <option key={activity.id} value={activity.id}>{activity.title}</option>
                                ))}
                            </select>
                        )}
                        <textarea
                            name="content"
                            placeholder="내용을 입력하세요."
                            value={currentReview.content}
                            onChange={handleInputChange}
                            rows="5"
                        ></textarea>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <button onClick={handleSaveReview}>저장</button>
                        <button onClick={handleCloseModal}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewBoard;