import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../components/styles/ReviewDetail.css';
import apiClient from '../utils/apiClient';

function ReviewDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [editedReview, setEditedReview] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');
    const [currentUser, setCurrentUser] = useState({ id: null, username: '' });

    useEffect(() => {
        fetchReviewDetail();
        fetchCurrentUser();
    }, []);

    const fetchReviewDetail = async () => {
        try {
            const response = await apiClient.get(`/api/reviews/${id}`);
            console.log('Review Data:', response.data);
            setReview(response.data);
            setComments(response.data.comments);
        } catch (error) {
            console.error('리뷰 상세 조회 중 오류 발생:', error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await apiClient.get('/api/users/session'); // 현재 로그인 사용자 정보 가져오기
            setCurrentUser(response.data);
        } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
        }
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleCommentSubmit = async () => {
        if (!comment.trim()) {
            alert('댓글 내용을 입력하세요.');
            return;
        }

        try {
            const response = await apiClient.post(`/api/reviews/${id}/comments`, comment, {
                headers: { 'Content-Type': 'text/plain' },
            });
            setComments([...comments, response.data]);
            setComment('');
        } catch (error) {
            console.error('댓글 작성 중 오류 발생:', error);
        }
    };

    const handleEditReview = () => {
        setIsEditingReview(true);
        setEditedReview({ ...review });
    };

    const handleEditReviewChange = (e) => {
        const { name, value } = e.target;
        setEditedReview((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveReview = async () => {
        try {
            await apiClient.put(`/api/reviews/${id}`, editedReview);
            setReview(editedReview);
            setIsEditingReview(false);
        } catch (error) {
            console.error('글 수정 중 오류 발생:', error);
        }
    };

    const handleDeleteReview = async () => {
        if (window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
            try {
                await apiClient.delete(`/api/reviews/${id}`);
                alert('글이 삭제되었습니다.');
                navigate('/reviews');
            } catch (error) {
                console.error('글 삭제 중 오류 발생:', error);
            }
        }
    };

    const handleEditComment = (commentId, content) => {
        setEditingCommentId(commentId);
        setEditedCommentContent(content);
    };

    const handleSaveComment = async () => {
        try {
            await apiClient.put(`/api/reviews/comments/${editingCommentId}`, editedCommentContent, {
                headers: { 'Content-Type': 'text/plain' },
            });
            setComments((prev) =>
                prev.map((comment) =>
                    comment.id === editingCommentId
                        ? { ...comment, content: editedCommentContent }
                        : comment
                )
            );
            setEditingCommentId(null);
            setEditedCommentContent('');
        } catch (error) {
            console.error('댓글 수정 중 오류 발생:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            try {
                await apiClient.delete(`/api/reviews/comments/${commentId}`);
                setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            } catch (error) {
                console.error('댓글 삭제 중 오류 발생:', error);
            }
        }
    };

    return (
        <div className="review-detail-page">
            <button onClick={() => navigate(-1)} className="back-button">← 뒤로가기</button>
            {review ? (
                <div className="review-detail">
                    {isEditingReview ? (
                        <div className="edit-review-form">
                            <input
                                type="text"
                                name="title"
                                value={editedReview.title}
                                onChange={handleEditReviewChange}
                                className="edit-input"
                                placeholder="제목을 입력하세요."
                            />
                            <textarea
                                name="content"
                                value={editedReview.content}
                                onChange={handleEditReviewChange}
                                className="edit-textarea"
                                placeholder="내용을 입력하세요."
                            ></textarea>
                            <button onClick={handleSaveReview} className="save-button">저장</button>
                            <button onClick={() => setIsEditingReview(false)} className="cancel-button">취소</button>
                        </div>
                    ) : (
                        <div>
                            <h1 className="review-title">{review.title}</h1>
                            <p className="review-content">{review.content}</p>

                            {review.imageUrl && (
                                <div className="review-image-container">
                                    <img
                                        src={review.imageUrl}
                                        alt="Review Image"
                                        className="review-image"
                                    />
                                </div>
                            )}

                            {currentUser.id === review.userId && (
                                <div className="action-buttons">
                                    <button onClick={handleEditReview} className="edit-button">수정</button>
                                    <button onClick={handleDeleteReview} className="delete-button">삭제</button>
                                </div>
                            )}
                        </div>
                    )}

                    <h2 className="comments-title">댓글</h2>
                    <ul className="comments-list">
                        {comments.map((comment) => (
                            <li key={comment.id} className="comment-item">
                                {editingCommentId === comment.id ? (
                                    <div>
                                        <textarea
                                            value={editedCommentContent}
                                            onChange={(e) => setEditedCommentContent(e.target.value)}
                                            className="comment-input"
                                        ></textarea>
                                        <button onClick={handleSaveComment} className="save-comment-button">저장</button>
                                        <button onClick={() => setEditingCommentId(null)} className="cancel-comment-button">취소</button>
                                    </div>
                                ) : (
                                    <div>
                                        <strong className="comment-author">{comment.username}:</strong>
                                        <span className="comment-content">{comment.content}</span>
                                        {currentUser.id === comment.userId && ( // 자신의 댓글인지 확인
                                            <div className="comment-actions">
                                                <button onClick={() => handleEditComment(comment.id, comment.content)} className="edit-comment-button">수정</button>
                                                <button onClick={() => handleDeleteComment(comment.id)} className="delete-comment-button">삭제</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="comment-form">
                        <textarea
                            value={comment}
                            onChange={handleCommentChange}
                            placeholder="댓글을 입력하세요."
                            className="comment-input"
                        />
                        <button onClick={handleCommentSubmit} className="submit-comment-button">
                            댓글 작성
                        </button>
                    </div>
                </div>
            ) : (
                <p>로딩 중...</p>
            )}
        </div>
    );
}

export default ReviewDetail;
