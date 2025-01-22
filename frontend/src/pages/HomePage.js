import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import '../components/styles/HomePage.css';
import { useNavigate } from 'react-router-dom';
import apiClient from './../utils/apiClient';

function HomePage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [feedRecommendations, setFeedRecommendations] = useState([]);

  useEffect(() => {
    // 봉사활동 후기 데이터 로드
    const fetchReviews = async () => {
      try {
        const response = await apiClient.get('/api/reviews?limit=3');
        setReviews(response.data.content || []);
      } catch (error) {
        console.error('봉사활동 후기 데이터를 가져오는 중 오류 발생:', error.message);
        setReviews([]);
      }
    };

    // 공지사항 데이터 로드
    const fetchNotices = async () => {
      try {
        const response = await apiClient.get('/api/public/notices?limit=3');
        const noticesData = Array.isArray(response.data) ? response.data : [];
        setNotices(noticesData);
      } catch (error) {
        console.error('공지사항 데이터를 가져오는 중 오류 발생:', error.message);
        setNotices([]);
      }
    };

    // AI 사료 추천 데이터 로드
    const fetchFeedRecommendations = async () => {
      try {
        const response = await apiClient.get('/api/feeds?limit=3');
        const feedData = Array.isArray(response.data) ? response.data : [];
        setFeedRecommendations(feedData);
      } catch (error) {
        console.error('사료 추천 데이터를 가져오는 중 오류 발생:', error.message);
        setFeedRecommendations([]);
      }
    };

    fetchReviews();
    fetchNotices();
    fetchFeedRecommendations();
  }, []);

  const handleMoreClick = (path) => {
    navigate(path);
  };

  return (
    <div>
      {/* 슬라이더 */}
      <Carousel interval={3000} pause="false" controls={false}>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1200x400?text=First+Slide"
            alt="First slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1200x400?text=Second+Slide"
            alt="Second slide"
          />
        </Carousel.Item>
      </Carousel>

           {/* 봉사활동 후기 섹션 */}
      <div className="volunteer-section" style={{ padding: '40px 20px', marginTop: '40px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ marginBottom: 0 }}>
            <span style={{ color: '#4CAF50' }}>봉사</span>활동 후기
          </h2>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleMoreClick('/volunteer-board')}
            style={{
              color: '#4CAF50',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            더보기
          </Button>
        </div>
        <div className="d-flex justify-content-between">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} style={{ width: '30%' }}>
                <Card.Img
                  variant="top"
                  src={review.imageUrl?.startsWith('http')
                    ? review.imageUrl
                    : 'https://via.placeholder.com/300x200'}
                  alt={review.title}
                />
                <Card.Body>
                  <Card.Title>{review.title}</Card.Title>
                  <Card.Text>
                    작성자: {review.username} <br />
                    지역: {review.region} <br />
                    작성일: {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>봉사활동 후기가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 공지사항 섹션 */}
      <div className="notice-section" style={{ padding: '40px 20px', marginTop: '40px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ marginBottom: 0 }}>
            <span style={{ color: '#4CAF50' }}>공지</span>사항
          </h2>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleMoreClick('/notice-board')}
            style={{
              color: '#4CAF50',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            더보기
          </Button>
        </div>
        <ul className="notice-list">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <li key={notice.id} className="notice-item">
                <a href={`/notice-detail/${notice.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="notice-number" style={{ color: '#4CAF50', fontWeight: 'bold' }}>{notice.id}</span>
                  <span className="notice-title" style={{ marginLeft: '10px' }}>{notice.title}</span>
                  <span className="notice-date" style={{ float: 'right', color: '#888' }}>{notice.date}</span>
                </a>
              </li>
            ))
          ) : (
            <p>공지사항이 없습니다.</p>
          )}
        </ul>
      </div>

      {/* AI 맞춤형 사료 추천 섹션 */}
      <div className="ai-recommendation-section" style={{ padding: '40px 20px', marginTop: '40px' }}>
        <h2 style={{ color: '#4CAF50' }}>AI 맞춤형 사료 추천</h2>
        <div className="d-flex justify-content-between">
          {feedRecommendations.length > 0 ? (
            feedRecommendations.map((feed) => (
              <Card key={feed.id} style={{ width: '30%' }}>
                <Card.Img variant="top" src={feed.image || 'https://via.placeholder.com/300x200'} />
                <Card.Body>
                  <Card.Title>{feed.name}</Card.Title>
                  <Card.Text>{feed.description}</Card.Text>
                  <Button variant="outline-success" size="sm">자세히 보기</Button>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>추천 사료 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
