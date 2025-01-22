import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/styles/AnimalSearchPage.css';

function AnimalSearchPage() {
    const [animals, setAnimals] = useState([]);
    const [filters, setFilters] = useState({
        bgnde: '',
        endde: '',
        upkind: '',
        upr_cd: '',
        org_cd: '',
        state: '',
        neuter_yn: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAnimal, setSelectedAnimal] = useState(null); // 선택한 동물 정보
    const [modalVisible, setModalVisible] = useState(false); // 모달창 표시 여부

    const API_KEY = process.env.REACT_APP_ANIMAL_API_KEY; // 디코딩된 API 키
    const KAKAO_MAP_API_KEY = process.env.REACT_APP_KAKAO_MAP_API_KEY; // 카카오맵 API 키

    const handleSearch = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                serviceKey: API_KEY,
                bgnde: filters.bgnde?.replace(/-/g, '') || '',
                endde: filters.endde?.replace(/-/g, '') || '',
                upkind: filters.upkind || '',
                upr_cd: filters.upr_cd || '',
                org_cd: filters.org_cd || '',
                state: filters.state || '',
                neuter_yn: filters.neuter_yn || '',
                _type: 'json',
                pageNo: 1,
                numOfRows: 5, // 초기 10개로 설정했지만 로딩(페이지,카카오맵)이 너무 느려서 5개로 줄임
            };

            const response = await axios.get(
                'http://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic',
                { params }
            );

            const body = response?.data?.response?.body;
            if (body?.items?.item) {
                setAnimals(body.items.item);
            } else {
                setAnimals([]);
                setError('데이터가 없습니다.');
            }
        } catch (err) {
            console.error('데이터를 가져오는 중 오류 발생:', err);
            setError('데이터를 가져오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleAnimalClick = (animal) => {
        setSelectedAnimal(animal); // 선택된 동물 정보 저장
        setModalVisible(true); // 모달창 표시
    };

    const handleModalClose = () => {
        setModalVisible(false);
    };

    useEffect(() => {
        if (modalVisible && selectedAnimal) {
            // 카카오맵 API 스크립트를 동적으로 로드
            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
            script.async = true;

            script.onload = () => {
                window.kakao.maps.load(() => {
                    const container = document.getElementById('map');
                    const options = {
                        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                        level: 3,
                    };

                    const map = new window.kakao.maps.Map(container, options);

                    const geocoder = new window.kakao.maps.services.Geocoder();

                    // 보호소 주소를 좌표로 변환
                    geocoder.addressSearch(selectedAnimal.careAddr, (result, status) => {
                        if (status === window.kakao.maps.services.Status.OK) {
                            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

                            // 지도 중심 이동
                            map.setCenter(coords);

                            // 마커 생성
                            new window.kakao.maps.Marker({
                                map,
                                position: coords,
                            });
                        }
                    });
                });
            };

            document.head.appendChild(script);
        }
    }, [modalVisible, selectedAnimal]);

    return (
        <div className="animal-search-page">
            <h1>유기동물 조회</h1>

            {/* 검색 필터 */}
            <div className="search-bar">
                <input type="date" name="bgnde" onChange={handleInputChange} placeholder="검색 시작일" />
                <input type="date" name="endde" onChange={handleInputChange} placeholder="검색 종료일" />
                <select name="upkind" onChange={handleInputChange}>
                    <option value="">종류</option>
                    <option value="417000">강아지</option>
                    <option value="422400">고양이</option>
                    <option value="429900">기타</option>
                </select>
                {/* 모든 시도, 시군구를 추가하려는데 너무 많아서 일부만 추가 */}
                <select name="upr_cd" onChange={handleInputChange}>
                    <option value="">시도 선택</option>
                    <option value="6110000">서울특별시</option>
                    <option value="6260000">부산광역시</option>
                    <option value="6270000">대구광역시</option>
                </select>
                <select name="state" onChange={handleInputChange}>
                    <option value="">상태</option>
                    <option value="notice">공고중</option>
                    <option value="protect">보호중</option>
                </select>
                <select name="neuter_yn" onChange={handleInputChange}>
                    <option value="">중성화 여부</option>
                    <option value="Y">예</option>
                    <option value="N">아니오</option>
                    <option value="U">미상</option>
                </select>
                <button onClick={handleSearch}>검색</button>
            </div>

            {/* 로딩 상태 */}
            {loading && <p>로딩 중...</p>}

            {/* 에러 메시지 */}
            {error && <p className="error">{error}</p>}

            {/* 유기동물 목록 */}
            <div className="animal-list">
                {animals.map((animal) => (
                    <div key={animal.desertionNo} className="animal-item" onClick={() => handleAnimalClick(animal)}>
                        <img src={animal.popfile} alt={animal.kindCd} className="animal-image" />
                        <div className="animal-info">
                            <h3>{animal.kindCd}</h3>
                            <p>발견 장소: {animal.happenPlace}</p>
                            <p>접수일: {animal.happenDt}</p>
                            <p>보호소: {animal.careNm}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 모달 */}
            {modalVisible && selectedAnimal && (
    <div className="modal">
        <div className="modal-content">
            <span className="close" onClick={handleModalClose}>
                &times;
            </span>
            <div className="modal-body">
                {/* 유기견 정보 */}
                <div className="modal-left">
                    <div className="animal-details-container">
                        <img
                            src={selectedAnimal.popfile}
                            alt={selectedAnimal.kindCd}
                            className="modal-animal-image"
                        />
                        <div className="animal-details">
                            <p><strong>공고번호:</strong> {selectedAnimal.desertionNo}</p>
                            <p><strong>접수 일시:</strong> {selectedAnimal.happenDt}</p>
                            <p><strong>발견 장소:</strong> {selectedAnimal.happenPlace}</p>
                        </div>
                    </div>
                </div>
                {/* 보호소 정보 */}
                <div className="modal-right">
                    <div className="section-title">유기견 정보</div>
                    <p><strong>품종:</strong> {selectedAnimal.kindCd}</p>
                    <p><strong>나이:</strong> {selectedAnimal.age}</p>
                    <p><strong>몸무게:</strong> {selectedAnimal.weight}</p>
                    <p><strong>성별:</strong> {selectedAnimal.sexCd}</p>
                    <p><strong>중성화 여부:</strong> {selectedAnimal.neuter_yn}</p>
                    <p><strong>색상:</strong> {selectedAnimal.colorCd}</p>
                    <p><strong>특징:</strong> {selectedAnimal.specialMark}</p>

                    <div className="section-title">보호소 정보</div>
                    <p><strong>보호소 이름:</strong> {selectedAnimal.careNm}</p>
                    <p><strong>보호소 주소:</strong> {selectedAnimal.careAddr}</p>
                    <p><strong>연락처:</strong> {selectedAnimal.careTel}</p>
                </div>
            </div>
            <div id="map" style={{ width: '100%', height: '300px' }}></div>
        </div>
    </div>
)}


        </div>
    );
}

export default AnimalSearchPage;
