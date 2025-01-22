import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import '../components/styles/MyPage.css';
import apiClient from './../utils/apiClient';

function MyPage() {
  const [activeCategory, setActiveCategory] = useState('account'); // 기본 카테고리 설정
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [volunteerPosts, setVolunteerPosts] = useState([]);
  const [appliedVolunteers, setAppliedVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    phoneNumber: '',
    roadAddr: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPostcode, setShowPostcode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await apiClient.get('/api/users/session');
        setUserInfo(response.data);
      } catch (error) {
        console.error('사용자 세션 불러오기 실패:', error.response?.data || error.message);
      }
    };

    fetchUserSession();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let endpoint = '';
        switch (activeCategory) {
          case 'myPosts':
            endpoint = '/api/mypage/myposts';
            break;
          case 'myComments':
            endpoint = '/api/mypage/mycomments';
            break;
          case 'likedPosts':
            endpoint = '/api/mypage/likedposts';
            break;
          case 'volunteerPosts':
            endpoint = '/api/mypage/my';
            break;
          case 'appliedVolunteers':
            endpoint = '/api/mypage/applied';
            break;
          default:
            return;
        }
        const response = await apiClient.get(endpoint);
        if (activeCategory === 'myPosts') setMyPosts(response.data);
        else if (activeCategory === 'myComments') setMyComments(response.data);
        else if (activeCategory === 'likedPosts') setLikedPosts(response.data);
        else if (activeCategory === 'volunteerPosts') setVolunteerPosts(response.data);
        else if (activeCategory === 'appliedVolunteers') setAppliedVolunteers(response.data);
      } catch (error) {
        setError(error.response?.data || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]);

  const handleAccountDelete = async () => {
    const confirmDelete = window.confirm('정말로 회원 탈퇴를 진행하시겠습니까? 탈퇴 후에는 복구할 수 없습니다.');

    if (!confirmDelete) return;

    try {
      await apiClient.delete('/api/users/delete-account');
      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/'); // 탈퇴 후 메인 페이지로 리디렉션
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };


  const handlePasswordChange = async () => {
    const { newPassword, confirmPassword } = editFormData;

    if (!newPassword || !confirmPassword) {
      alert('비밀번호와 비밀번호 확인을 모두 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다. 다시 입력해주세요.');
      return;
    }

    try {
      await apiClient.post('/api/users/change-password', { newPassword });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setEditFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditFormData({
      username: userInfo?.username || '',
      phoneNumber: userInfo?.phoneNumber || '',
      roadAddr: userInfo?.roadAddr || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      const updatedData = {
        username: editFormData.username,
        phoneNumber: editFormData.phoneNumber,
        roadAddr: editFormData.roadAddr,
      };

      await apiClient.put('/api/users/update', updatedData);
      alert('정보가 성공적으로 수정되었습니다.');
      setEditMode(false);

      const response = await apiClient.get('/api/users/session');
      setUserInfo(response.data);
    } catch (error) {
      console.error('정보 수정 실패:', error);
      alert('정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handlePostcodeSelect = (data) => {
    setEditFormData((prev) => ({ ...prev, roadAddr: data.roadAddress }));
    setShowPostcode(false);
  };
  const renderContent = () => {
    if (loading) {
      return <p>로딩 중...</p>;
    }

    if (error) {
      return <p>오류: {error}</p>;
    }

    switch (activeCategory) {
      case 'account':
        return (
          <div className="account-section">
            <h2>내 정보</h2>
            <div className="user-info-card">
              {!editMode ? (
                <>
                  <p>
                    <strong>이름:</strong> {userInfo?.username}
                  </p>
                  <p>
                    <strong>이메일:</strong> {userInfo?.email}
                  </p>
                  <p>
                    <strong>전화번호:</strong> {userInfo?.phoneNumber}
                  </p>
                  <p>
                    <strong>주소:</strong> {userInfo?.roadAddr || '등록되지 않음'}
                  </p>
                  <button onClick={handleEditClick} className="primary-btn">
                    수정하기
                  </button>
                </>
              ) : (
                <div className="edit-form">
                  <div className="form-group">
                    <label>이름</label>
                    <input
                      type="text"
                      name="username"
                      value={editFormData.username}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>이메일</label>
                    <input
                      type="text"
                      name="email"
                      value={userInfo?.email}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>전화번호</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editFormData.phoneNumber}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>주소</label>
                    <input
                      type="text"
                      name="roadAddr"
                      value={editFormData.roadAddr}
                      onChange={handleEditChange}
                      readOnly
                    />
                    <button onClick={() => setShowPostcode(true)} className="secondary-btn">
                      🔍
                    </button>
                  </div>
                  {showPostcode && <DaumPostcode onComplete={handlePostcodeSelect} autoClose />}
                  <div className="button-group">
                    <button onClick={handleSaveClick} className="primary-btn">
                      저장하기
                    </button>
                    <button onClick={() => setEditMode(false)} className="secondary-btn">
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="password-change">
              <h3>비밀번호 변경</h3>
              <div className="form-group">
                <label>새 비밀번호</label>
                <input
                  type="password"
                  name="newPassword"
                  value={editFormData.newPassword}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editFormData.confirmPassword}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
              </div>
              <button onClick={handlePasswordChange} className="primary-btn">
                비밀번호 변경
              </button>
            </div>
            <div className="account-delete">
              <button onClick={handleAccountDelete} className="delete-btn">
                회원 탈퇴
              </button>
            </div>
          </div>
        );

      case 'myPosts':
      case 'myComments':
      case 'likedPosts':
        const items =
          activeCategory === 'myPosts'
            ? myPosts
            : activeCategory === 'myComments'
              ? myComments
              : likedPosts;

        return (
          <div>
            <h2>
              {activeCategory === 'myPosts'
                ? '내가 작성한 글'
                : activeCategory === 'myComments'
                  ? '댓글 단 글'
                  : '좋아요 표시한 글'}
            </h2>
            <div className="grid-container">
              {items.length === 0 ? (
                <p>목록이 비어 있습니다.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="grid-item"
                    onClick={() => navigate(`/freeboard/${item.postId || item.id}`)}
                  >
                    <div className="grid-item-title">{item.title || item.postTitle}</div>
                    <div className="grid-item-content">{item.content}</div>
                    <div className="grid-item-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'volunteerPosts':
        return (
          <div>
            <h2>봉사활동 모집 내역</h2>
            <div className="list-container">
              {volunteerPosts.length === 0 ? (
                <p>모집 내역이 없습니다.</p>
              ) : (
                volunteerPosts.map((post) => (
                  <div key={post.id} className="list-item">
                    <div className="list-item-title">{post.title}</div>
                    <div className="list-item-content">{post.content}</div>
                    <div className="list-item-date">
                      모집 기간: {post.startDate} ~ {post.endDate}
                    </div>
                    <button onClick={() => navigate(`/volunteer/${post.id}`)}>상세 보기</button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'appliedVolunteers':
        return (
          <div>
            <h2>나의 봉사 활동 내역</h2>
            <div className="list-container">
              {appliedVolunteers.length === 0 ? (
                <p>신청 내역이 없습니다.</p>
              ) : (
                appliedVolunteers.map((application) => (
                  <div key={application.id} className="list-item">
                    <div className="list-item-title">{application.title}</div>
                    <div className="list-item-content">{application.content}</div>
                    <div className="list-item-date">신청 상태: {application.status || '대기 중'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return <h2>잘못된 카테고리</h2>;
    }
  };

  return (
    <div className="mypage-container">
      <div className="sidebar">
        <div className="logo">My Page</div>
        <nav>
          <ul>
            <li>
              <button
                className={activeCategory === 'account' ? 'active' : ''}
                onClick={() => setActiveCategory('account')}
              >
                내 정보 관리
              </button>
            </li>
            <li>
              <button
                className={activeCategory === 'myPosts' ? 'active' : ''}
                onClick={() => setActiveCategory('myPosts')}
              >
                내가 작성한 글
              </button>
            </li>
            <li>
              <button
                className={activeCategory === 'myComments' ? 'active' : ''}
                onClick={() => setActiveCategory('myComments')}
              >
                내가 쓴 댓글 확인
              </button>
            </li>
            <li>
              <button
                className={activeCategory === 'likedPosts' ? 'active' : ''}
                onClick={() => setActiveCategory('likedPosts')}
              >
                좋아요 표시한 글
              </button>
            </li>
            <li>
              <button
                className={activeCategory === 'volunteerPosts' ? 'active' : ''}
                onClick={() => setActiveCategory('volunteerPosts')}
              >
                봉사활동 모집 내역
              </button>
            </li>
            <li>
              <button
                className={activeCategory === 'appliedVolunteers' ? 'active' : ''}
                onClick={() => setActiveCategory('appliedVolunteers')}
              >
                나의 봉사 활동 내역
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  );
}

export default MyPage;
