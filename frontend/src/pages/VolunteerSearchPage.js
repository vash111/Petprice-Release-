import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/VolunteerSearchPage.css';
import apiClient from './../utils/apiClient';

function VolunteerSearchPage() {
    const [filters, setFilters] = useState({ region: null, date: null });
    const [volunteerPosts, setVolunteerPosts] = useState([]);
    const [viewMyPosts, setViewMyPosts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    const userId = 1; // 로그인된 사용자 ID (예시)
    const navigate = useNavigate();

    useEffect(() => {
        fetchVolunteerPosts();
    }, [currentPage, filters, viewMyPosts]);

    const fetchVolunteerPosts = async () => {
        try {
            const response = await apiClient.get('/api/volunteer', {
                params: {
                    page: currentPage,
                    size: itemsPerPage,
                    region: filters.region || null,
                    date: filters.date || null,
                    userId: viewMyPosts ? userId : null,
                },
            });
            setVolunteerPosts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching volunteer posts:', error);
            alert('봉사활동 글을 불러오는 중 오류가 발생했습니다.');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value ? value : null }));
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleViewMyPosts = () => {
        setViewMyPosts(!viewMyPosts);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleApply = async (volunteerId, authorId, alreadyApplied) => {
        if (authorId === userId) {
            alert("작성자는 자신의 글에 참가할 수 없습니다.");
            return;
        }

        if (alreadyApplied) {
            alert("이미 참가 신청을 했습니다.");
            return;
        }

        try {
            await apiClient.post(`/api/volunteer/${volunteerId}/apply`);
            alert("참가 신청이 완료되었습니다.");
            fetchVolunteerPosts(); // 참가 상태 갱신
        } catch (error) {
            console.error("Error applying for volunteer:", error);
            alert(error.response?.data?.message || "참가 신청 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="volunteer-search-page">
            <h1 className="title">봉사활동 찾아보기</h1>

            {/* 검색창 */}
            <div className="search-bar">
                <select className="select-input" name="region" onChange={handleFilterChange}>
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
                <input className="date-input" type="date" name="date" onChange={handleFilterChange} />
                <button className="action-button" onClick={handleSearch}>
                    검색
                </button>
                <button className="action-button" onClick={() => navigate('/VolunteerCreatePage')}>
                    모집글 작성
                </button>
                <button className="action-button" onClick={handleViewMyPosts}>
                    {viewMyPosts ? '모든 글 보기' : '내가 작성한 글'}
                </button>
            </div>

            {/* 글 목록 */}
            <div className="volunteer-list">
                {volunteerPosts.length > 0 ? (
                    volunteerPosts.map((post) => (
                        <div key={post.id} className="volunteer-item">
                            <h3 className="item-title">{post.title}</h3>
                            <p>{post.content}</p>
                            <p>봉사 기간: {post.startDate} ~ {post.endDate}</p>
                            <p>지역: {post.region}</p>
                            <p>
                                참가 인원: {post.currentParticipants}/{post.maxParticipants}
                            </p>
                            <button
                                className="apply-button"
                                onClick={() => handleApply(post.id, post.authorId, post.alreadyApplied)}
                                disabled={
                                    (post.maxParticipants > 0 && post.currentParticipants >= post.maxParticipants) ||
                                    post.alreadyApplied
                                }
                            >
                                {post.alreadyApplied ? "신청완료" : "참가"}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-data">표시할 글이 없습니다.</p>
                )}
            </div>

            {/* 페이징 */}
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default VolunteerSearchPage;
