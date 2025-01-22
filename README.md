## 🐱‍👓 유기동물과 사람, PETPRICE

![readme_mockup2](https://github.com/user-attachments/assets/0e0a1f79-abe8-4913-9341-36bf2986a80f)

<br>

## 👤 INFO

| **이성준** |
| :------: |
| [<img src="https://github.com/user-attachments/assets/67cf5487-5624-4643-a98f-290575ed1f70" height=150 width=150> <br/> @vash111](https://github.com/vash111)
Email :  fltmdlqslek2414@gmail.com 
Phone : 010-2760-5273| 

## 📖 프로젝트 소개

 - <h4>주제 선정 배경</h4>

    - <b>유기동물 문제의 심각성</b> : 최근 반려동물을 키우는 인구가 증가함에 따라, 불가피하게 발생하는 유기동물의 수 역시 꾸준히 늘어나고 있습니다. 보호소의 수용 능력이 한계에 다다르고, 적절한 보살핌과 입양 절차가 원활히 진행되지 않는 경우가 많아, 유기동물 문제는 사회적·윤리적 과제로 부상하고 있습니다. 이러한 문제는 단순히 동물 복지의 차원뿐만 아니라, 지역 사회의 위생과 안전 측면에서도 점차 중요한 이슈가 되고 있습니다.

   - <b>봉사활동의 필요성과 의의</b> : 유기동물을 구조·보호하고, 새 주인을 찾는 활동은 행정 및 보호단체의 노력만으로는 한계가 있습니다. 개인과 단체가 자발적으로 참여하는 봉사활동은, 유기동물들의 생활 환경을 개선하고 새로운 가정을 찾는 데 큰 도움을 줍니다. 단순히 동물을 돕는 것을 넘어, 봉사 과정에서 생명 존중과 책임 의식을 기를 수 있으며, 사회적 연대감도 높아집니다.

  
- <h4>기획 의도

![readme_mockup2](https://github.com/user-attachments/assets/586d2f4e-ba27-47e4-9974-3362d3deee51)

<br>



## 1. 개발 환경

![readme_mockup2](https://github.com/user-attachments/assets/16707b76-12ad-4929-ab7b-0d714b9e9f12)
<br>

## 2. 채택한 개발 기술

### Spring Security + Session
  - Spring Security과 Session을 동기화후 Spring Security에서는 인증/인과 처리 Session에서는 유저 정보를 손쉽게 제공 받을수있도록 설계하였습니다.

### Spring Data JPA
 - JpaRepository를 상속받아 기본적인 CRUD의 반복적인 작업을 간소화하였습니다.
- 서비스별 Repository에서 JPQL을 이용한 커스텀 쿼리로 데이터베이스 성능 최적화,동적쿼리,재사용성과 유지보수성 향상을 모두 챙길수있었습니다.
- Service에서 @Transactional 어노테이션의 readOnly 속성을 명시하여 최적화와 안정이 보장된 실행 계획을 수립할 수 있었습니다

### API
 - API를 활용한 서비스 구현으로 편의성과 확장성을 얻을수있었습니다.
 - 많은 양의 데이터를 손쉽게 처리할수있어 이를 활용하여 사용자가 원하는 데이터와 서비스를 제공할수있었습니다.
- KAKAO MAP API와 공공데이터 API를 사용하여 유기동물 데이터와 보호중인 보호소의 위치정보를 함께 시각적으로 제공할수있었습니다. 
- KAKAOLOGIN API를 활용하여 사용자에게 로그인 편의성을 제공했습니다.


### React,Axios,Bootstrap

- React
    - 컴포넌트화를 통해 추후 유지보수와 재사용성을 고려했습니다.
    - 유저 배너, 상단과 하단 배너 등 중복되어 사용되는 부분이 많아 컴포넌트화를 통해 리소스 절약이 가능했습니다.
 - Axios
   - Axios를 이용한 BOOT와 비동기 통신으로 프론트와 서버간의 즉각적인 피드백을 확인 할수있어 개발 기간을 획기적으로 절약할수있었습니다.
- Bootstrap
   - 개인 프로젝트에서 기능 구현 다음으로 고민되었던게 디자인적 요소였습니다 기본적인 Bootstrap을 약간의 변형하여 코드 간소화와 사용자 친화적 구현할수있었습니다.
      

### prettier

- 정해진 규칙에 따라 자동적으로 코드 스타일을 정리해 코드의 일관성을 유지하고자 했습니다.


<br>

## 3. 데이터 베이스 모델링과 설계
<BR>
<center>플로우 차트</center>
<BR>

![readme_mockup2](https://github.com/user-attachments/assets/77609395-6678-411e-947a-07f71b831265)
<BR>
<center>ERD</center>
<BR>

![readme_mockup2](https://github.com/user-attachments/assets/41d5740c-55e8-4358-a67c-cb1ad01c521e)

<BR>
<center>엔티티 관계도</center>
<BR>

![readme_mockup2](https://github.com/user-attachments/assets/5aa3f206-a2ca-4bc8-a7bf-333cf8bfe97a)

<details><summary>엔티티 관계도 설명</summary>

- Comment ↔ FreeBoard

  - 하나의 FreeBoard(게시글)에 여러 Comment(댓글)가 달릴 수 있음 → 다대일 (Comment가 다수, FreeBoard는 하나)
Comment.freeBoard_id 필드를 통해 FreeBoard와 연결

- Comment ↔ User

  - 하나의 User(작성자)가 여러 Comment를 쓸 수 있음 → 다대일 (Comment가 다수, User는 하나)
  - Comment.author_id 필드를 통해 User와 연결

- FreeBoard ↔ User

  - 작성자 관계(author): FreeBoard 여러 개가 한 User(작성자)를 가리킴 → 다대일
  - 좋아요 관계(likedUsers): FreeBoard와 User가 서로 다대다로 연결(별도 조인 테이블 이용)

 - Product ↔ User

   - 판매자(seller), 구매자(buyer) 각각 다대일 관계
     - 하나의 User가 여러 Product를 판매(혹은 구매)할 수 있지만, 하나의 Product는 한 명의 판매자(또는 구매자)만 가짐
   - 찜(likedUsers): Product와 User 간 다대다 (별도 조인 테이블)

 - Transaction ↔ Product

   - 하나 Product(상품)와 관련된 여러 Transaction(거래)이 있을 수 있음 → 다대일 (Transaction이 다수, Product는 하나)

 - Transaction ↔ User

   - Transaction마다 구매자(buyer), 판매자(seller)가 존재 → 각각 다대일 관계

 - Volunteer ↔ User

   - Volunteer(봉사 글)의 작성자는 한 명(User) → 다대일
한 User가 여러 Volunteer(봉사 글)를 작성할 수 있음

 - VolunteerParticipant ↔ Volunteer

   - 하나의 Volunteer(봉사 글)에 여러 Participant(참가자)가 신청 → 1:N 구조(Volunteer 1, Participant 여러 개)
VolunteerParticipant ↔ User

   - 하나의 User가 여러 VolunteerParticipant(참가) 기록을 가질 수 있음 → 다대일 (Participant가 다수, User는 하나)

 - VolunteerReview ↔ User

   - 하나 User가 여러 봉사후기(Review)를 작성할 수 있음 → 다대일 (Review가 다수, User는 하나)

- VolunteerReview ↔ ReviewComment

   - 하나의 VolunteerReview(후기)에 여러 ReviewComment(댓글)가 달릴 수 있음 → 1:N

- ReviewComment ↔ User

   - ReviewComment(댓글)를 작성하는 User는 하나, User는 여러 댓글 작성 가능 → 다대일 (Comment가 다수, User는 하나)

- Inquiry, Notice

  - 외래 키(FK)가 없는 독립 엔티티. 다른 테이블과 직접적인 관계 없음 
</details>


<br>


## 4. 개발 기간 및 작업 관리

### 개발 기간

- 전체 개발 기간 : 2024-12-24 ~ 2025-01-15
- UI 구현 : 2024-12-24 ~ 2025-01-10
- 기능 구현 : 2024-12-24 ~ 2022-01-14


<br>

## 5. 주요 기능 요약

![splash](https://github.com/user-attachments/assets/a404e431-34ec-4855-bced-6a25060ad4bc)

<br>

## 6. 페이지별 기능



| 메인 화면 |
|----------|
|![splash](https://github.com/user-attachments/assets/01ccaf2b-87a3-46d4-9fa1-b4179615f945)|

<br>

### [회원가입]

- 비밀번호 입력시 비밀번호 유효성 검사를 통과해야 회원 가입이 가능합니다.
- 주소입력 같은 경우 검색을 통해 간편하게 입력 받습니다

| 회원가입 |
|----------|
|![join](https://github.com/user-attachments/assets/6419f747-0153-44d0-949c-f5920d450b9b)

<br>


### [로그인 & 로그아웃]

- 회원 가입이 완료되면 로그인 창으로 넘어가고 회원가입시 입력한 이메일과 비밀번호가 자동으로 입력됩니다.
- 로그인 버튼 클릭 시 이메일 주소 또는 비밀번호가 일치하지 않을 경우에는 경고 문구가 나타나며, 로그인에 성공하면 홈 화면으로 이동합니다.

| 로그인 & 로그아웃 |
|----------|
|![login](https://github.com/user-attachments/assets/3a1bf2d4-1582-45c7-b1c2-8e1eb05cfe45)|

<br>


### [유기동물 조회]
- 헤더 카테고리의 유기동물 조회 클릭시 이동할수있습니다
 - 조회시 최신 데이터로 5개를 불러옵니다
- 날짜,종류,시도,상태(보호중,공고중),중성화 여부를 설정하여 검색할수있습니다.
- 클릭시 유기동물의 정보 보호센터의 정보를 모달창으로 확인할수있습니다.

| 유기동물 조회 |
|----------|
|![tab](https://github.com/user-attachments/assets/52615daa-ac1f-4c98-857e-d7784f4b34ac)|

<br>

### [봉사활동]
- 찾아보기에서는 다른 유저와 내가 작성한 봉사활동 모집글을 볼수있습니다.
- 봉사자 모집하기에서는 모집글을 작성할수있습니다.
- 봉사활동 찾아보기에서는 참가버튼으로 손쉽게 참가를 할수있습니다
- 모집글을 작성한 작성자는 마이페이지 화면에서 참가자들의 이름,전화번호를 확인할수있고 참가 신청을 수락/거절할수있습니다


| 봉사활동 찾아보기 |
|----------|
|![tab](https://github.com/user-attachments/assets/bff843fe-204e-43f3-b34f-981307d955bf)|

| 봉사활동 모집하기 |
|----------|
|![tab](https://github.com/user-attachments/assets/95940bbe-3547-406f-a2fa-60b367f54c24)|

| 봉사활동 신청 내역 상태 확인 |
|----------|
|![tab](https://github.com/user-attachments/assets/e8623d01-c1a3-4428-899c-e18e6398f3fd)|

| 봉사활동 신청자 관리 |
|----------|
|![tab](https://github.com/user-attachments/assets/9e601b01-5c76-4b63-8a6a-14e5b13907f6)|

<br>

### [봉사활동 후기 게시판]
- 봉사활동 신청상태가 "Accepted" 사용자만 봉사활동 후기를 작성할수있습니다.
- 봉사활동 후기 글을 작성시 참가했던 봉사활동들의 목록이 표시됩니다.

| 봉사활동 후기 게시판 |
|----------|
|![search](https://github.com/user-attachments/assets/a860b92c-8d7d-459e-9023-6a6bd67de886)|

<br>

### [자유게시판]

 - 유저들간의 자유로운 커뮤니케이션 공간입니다 
- 좋아요 버튼을 구현하였습니다 좋아요 버튼 클릭시 마이페이지에서 좋아요했던 글들을 모아서 볼수있습니다(스크랩 기능)
- 최근에 작성된 글 순서대로 10개 표시되고 페이징 기능을 지원합니다.

| 자유게시판 |
|----------|
|![search](https://github.com/user-attachments/assets/cd895d97-025e-4a82-84ee-7a69efed94ed)|

<br>

### [중고장터]

- 유저들간의 개인 중고거래 공간입니다
- portone api를 이용해 바로 결제를 지원합니다 구매자는 간편히 결제를 할수있습니다
- 최근에 작성된 글 순서대로 10개 표시되고 페이징 기능을 지원합니다.
- 내상점 버튼을 클릭하면 판매 상품 등록, 판매 상품 수정, 판매 상품 상태를 확인할수있습니다 

| 중고장터 상품등록 |
|----------|
|![search](https://github.com/user-attachments/assets/f0b084c6-c9df-46c5-8ba5-09f2ffafcd79)|

| 중고장터 상품등록 |
|----------|
|![search](https://github.com/user-attachments/assets/f0b084c6-c9df-46c5-8ba5-09f2ffafcd79)

| 중고장터 상품결제 |
|----------|
|![search](https://github.com/user-attachments/assets/66e7a2d3-6670-461f-9ca8-df068d23dd24)

| 중고장터 상품관리 |
|----------|
|![search](https://github.com/user-attachments/assets/b9b5b010-1c13-4494-b733-21b97cc3671f)

<br>

### [고객센터]

- 문의하기 페이지에 들어가면 사용자의 이름,이메일을 가져옵니다
- 문의하기 버튼 밑으로는 내가 작성한 문의글들의 상세보기를 제공합니다
- 관리자 페이지에서 문의 사항들을 조회,답변을 제공합니다

| 고객센터 |
|----------|
|![search](https://github.com/user-attachments/assets/0188e9fa-98f4-40a3-8173-024a547efcc4)|

<br>


### [마이페이지]

- 내 정보 관리 탭에서는 내 정보 수정과 비밀번호 변경 회원탈퇴를 제공합니다
- 내가 작성한 글 내가 쓴 댓글 좋아요 표시한 글 등을 조회할수있습니다
- 봉사활동 관련 조회,수정,수락,삭제도 지원합니다

| 마이페이지 |
|----------|
|![search](https://github.com/user-attachments/assets/6a75b63e-316c-4c2c-b258-946601f61e1e)|

<br>

### [어바웃 페이지]

- 회사의 간단한 소개글과 kakao api를 이용한 회사 위치 정보를 제공합니다

| 어바웃 페이지 |
|----------|
|![readme_mockup2](https://github.com/user-attachments/assets/41c13fca-68fe-412c-b1da-bd31067e4e03)|

<br>

## 7. 트러블 슈팅

- 공공 데이터 API 활용
    -  불명확한 문서화
일부 공공 데이터 포털에서 제공하는 문서(매뉴얼)가 최신 버전과 맞지 않아, 실제 응답 형식(JSON/XML)이 다르게 오는 경우가 있었습니다.

  - API 한계
초당 호출 제한, 전체 건수 제한 등 API 사용량 제한(쿼터)이 있어, 대량 데이터를 가져와야 할 때 속도나 정확도 문제가 발생했습니다. 
특히 개발 초기 유기동물 데이터를 받아올때 10개정도 받아올 예정이였지만 속도적인 측면에서 5개로 타협했습니다 

- LazyInitializationException
   - LAZY 설정된 연관 엔티티에 세션이 종료된 후 접근하면 LazyInitializationException이 터지는 것을 보고, 트랜잭션 범위와 영속성 컨텍스트 개념을 다시금 학습해야 했습니다.

  - 단순히 “EAGER로 바꾸자”라는 식으로 접근하면 N+1이나 퍼포먼스 이슈로 이어지므로, 설계 시 신중해야 함을 절감했습니다.

  -   V2 방식을 채택  엔티티 자체로 반환하지 않고 DTO로 변환 시킨후 반환하여 해결


<br>

## 8. 개선 목표

- 현재 구현된 유기동물 조회 기능을 확장하여 회원 가입때 입력받은 주소 기반으로 내 주변 유기동물 찾기 서비스를 구현해보려합니다 geocoder를 사용하여 위도와 경도 정보를 이용해보면 될거같습니다. 또한 유기동물api는 현재 시도 코드로 (001000) 식의 지역 정보를 검색 기능을 구현했는데 이에 맞는 CSV 자료를 찾아 매칭시키면 구현 가능할걸로 보입니다.

- 아직 구현만 완료한 상태여서 도커를 이용한 이미지 관리를 해보고싶습니다.

- 개발 일정때문에 디테일한 부분들이 놓친게 많아 보완해나가겠습니다.
    
<br>

## 9. 프로젝트 후기

### 🐱아쉬운 점
   한 달이라는 기간이 생각보다 짧게 느껴졌습니다. 개발 초기에는 다양한 서비스를 기획했지만, 시간이 흐를수록 부족함을 실감하게 되었습니다. 만약 기간이 조금 더 길었다면, 초기 기획했던 서비스를 모두 구현하고 다양한 라이브러리를 활용해볼 수 있었을 텐데 하는 아쉬움이 남습니다.
### 🐶 느낀점

이번 프로젝트를 통해 기획부터 구현까지의 과정을 직접 경험하며 많은 것을 배울 수 있었습니다. 특히 예상치 못한 문제를 해결하는 과정에서 개발자로서의 성장과 팀원의 중요성을 깊이 깨닫게 되었습니다. 앞으로는 더 효율적인 방식으로 프로젝트를 계획하고 실행할 수 있을 것 같아 기대됩니다.
