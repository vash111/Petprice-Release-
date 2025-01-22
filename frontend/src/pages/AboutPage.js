import React, { useEffect } from 'react';
import '../components/styles/AboutPage.css';

function AboutPage() {
  useEffect(() => {
    // 카카오 지도 API 스크립트를 동적으로 불러옵니다.
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      // Kakao 지도 API를 로드합니다.
      window.kakao.maps.load(() => {
        const container = document.getElementById('map'); // 지도를 표시할 div
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 초기 지도 중심 좌표 (서울)
          level: 3, // 지도 확대 레벨
        };

        // 지도 객체 생성
        const map = new window.kakao.maps.Map(container, options);

        // 마커 생성
        const markerPosition = new window.kakao.maps.LatLng(37.5665, 126.9780); // 마커 좌표
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });

        // 마커를 지도 위에 표시
        marker.setMap(map);

        // 인포윈도우 생성
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: '<div style="padding:5px;">PetPrice 위치</div>', // 인포윈도우 내용
        });

        // 마커 클릭 이벤트 추가
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker); // 마커 위에 인포윈도우 표시
        });
      });
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div>
      <div className="header-image">
        <div className="header-text">
          <h1>PET PRICE</h1>
          <h2>유기동물에게 새로운 삶을, PetPrice와 함께.</h2>
        </div>
      </div>
      <div className="content">
        <h2>소개글</h2>
        <p>
          PetPrice는 유기동물들에게 따뜻한 집을 찾아주고, 새로운 희망을 선물하기 위해 설립된 플랫폼입니다.
          우리는 유기동물의 삶을 더 나은 방향으로 변화시키고, 사람들과 반려동물 사이에 특별한 연결을
          만들어갑니다.
        </p>
        <p>
          우리의 사명은 단순히 정보를 제공하는 데 그치지 않고, 유기동물을 입양하고 돌보는 과정을 더욱
          쉽게 만들어 모든 이들이 참여할 수 있도록 돕는 것입니다. 또한, 유기동물에 대한 인식을 높이고,
          그들에게 필요한 지원과 사랑을 제공하기 위해 끊임없이 노력하고 있습니다.
        </p>
        <p>
          PetPrice는 유기동물에게 두 번째 기회를, 그리고 사람들에게 새로운 가족을 만날 수 있는 기회를
          제공합니다. 반려동물과 사람이 함께하는 세상을 꿈꾸며, 따뜻한 마음으로 더 많은 삶을
          변화시키겠습니다.
        </p>
        <span className="highlight">유기동물에게 희망을, 그리고 사람들에게 새로운 가족을.</span>
      </div>
      <div className="content">
        <h2>지도</h2>
        <div id="map" style={{ width: '100%', height: '400px', marginTop: '20px' }}></div>
      </div>
    </div>
  );
}

export default AboutPage;
