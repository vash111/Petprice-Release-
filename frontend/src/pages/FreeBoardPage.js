import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import '../components/styles/FreeBoardPage.css';
import apiClient from '../utils/apiClient';

function FreeBoardPage() {
    const { isLoggedIn, userInfo } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // 이미지 상태 추가
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await apiClient.get('/api/freeboard');
            const sortedPosts = response.data.sort((a, b) => b.id - a.id);
            setPosts(sortedPosts);
        } catch (error) {
            console.error('게시글을 가져오는 중 오류 발생:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePostClick = async (postId) => {
        try {
            await apiClient.post(`/api/freeboard/${postId}/view`);
            navigate(`/freeboard/${postId}`);
        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const updatedPosts = posts.map((post) => {
                if (post.id === postId) {
                    const wasLiked = post.likedByUser;
                    return {
                        ...post,
                        likes: wasLiked ? post.likes - 1 : post.likes + 1,
                        likedByUser: !wasLiked,
                    };
                }
                return post;
            });

            setPosts(updatedPosts);

            await apiClient.post(`/api/freeboard/${postId}/like`);
        } catch (error) {
            console.error('좋아요 토글 실패:', error);
        }
    };

    const handleOpenModal = (post = null) => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (post) {
            setIsEditMode(true);
            setCurrentPost(post);
        } else {
            setIsEditMode(false);
            setCurrentPost({
                title: '',
                category: '잡담',
                content: '',
                authorUsername: userInfo?.username,
                createdAt: new Date().toISOString(),
            });
        }
        setSelectedImage(null); // 이미지 초기화
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPost(null);
        setSelectedImage(null); // 이미지 초기화
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPost((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setSelectedImage(e.target.files[0]);
    };

    const handleSavePost = async () => {
        if (!currentPost.title.trim() || !currentPost.content.trim()) {
            alert('제목과 내용을 모두 입력하세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', currentPost.title);
            formData.append('category', currentPost.category);
            formData.append('content', currentPost.content);
            if (selectedImage) {
                formData.append('image', selectedImage); // 이미지 파일 추가
            }

            if (isEditMode) {
                await apiClient.put(`/api/freeboard/${currentPost.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await apiClient.post('/api/freeboard', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            fetchPosts();
            handleCloseModal();
        } catch (error) {
            console.error('게시글 저장 중 오류 발생:', error);
        }
    };

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

    return (
        <div className="free-board-page">
            <h1 className="centered">자유게시판</h1>
            <div className="top-bar">
                <input
                    type="text"
                    placeholder="제목으로 검색해주세요."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <button className="search-button">검색</button>
                <button
                    onClick={() => handleOpenModal()}
                    className="create-button"
                >
                    글 작성
                </button>
            </div>
            <table className="board-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>카테고리</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>조회수</th>
                        <th>추천</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPosts.map((post, index) => (
                        <tr key={post.id}>
                            <td>{startIndex + index + 1}</td>
                            <td onClick={() => handlePostClick(post.id)}>{post.title}</td>
                            <td>{post.category || '미지정'}</td>
                            <td>{post.authorUsername}</td>
                            <td>{new Date(post.createdAt).toLocaleString()}</td>
                            <td>{post.views}</td>
                            <td>
                                <button onClick={() => handleLikePost(post.id)}>
                                    👍 {post.likes || 0}
                                </button>
                            </td>
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
                        <h2>{isEditMode ? '글 수정' : '글 작성'}</h2>
                        <input
                            type="text"
                            name="title"
                            placeholder="제목"
                            value={currentPost.title}
                            onChange={handleInputChange}
                        />
                        <select
                            name="category"
                            value={currentPost.category}
                            onChange={handleInputChange}
                        >
                            <option value="잡담">잡담</option>
                            <option value="질문">질문</option>
                            <option value="정보">정보</option>
                        </select>
                        <textarea
                            name="content"
                            placeholder="내용을 입력하세요."
                            value={currentPost.content}
                            onChange={handleInputChange}
                            rows="5"
                        ></textarea>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        <button onClick={handleSavePost}>저장</button>
                        <button onClick={handleCloseModal}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FreeBoardPage;
