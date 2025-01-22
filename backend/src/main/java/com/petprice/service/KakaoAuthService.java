package com.petprice.service;

import com.petprice.dto.KakaoUser;
import com.petprice.entity.User;
import com.petprice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private final UserRepository userRepository;

    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";
    private static final String CLIENT_ID = System.getenv("KAKAO_CLIENT_ID");
    private static final String REDIRECT_URI = System.getenv("KAKAO_REDIRECT_URI");

    // 액세스 토큰 발급
    public String getAccessToken(String code) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", CLIENT_ID);
        params.add("redirect_uri", REDIRECT_URI);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(KAKAO_TOKEN_URL, request, Map.class);

        return (String) response.getBody().get("access_token");
    }

    // 카카오 사용자 정보 가져오기
    public KakaoUser getKakaoUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(KAKAO_USER_INFO_URL, HttpMethod.GET, request, Map.class);

        Map<String, Object> kakaoAccount = (Map<String, Object>) response.getBody().get("kakao_account");
        String email = (String) kakaoAccount.get("email");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        String nickname = (String) profile.get("nickname");
        String profileImage = (String) profile.get("profile_image_url");

        return new KakaoUser(email, nickname, profileImage);
    }

    public User findOrRegisterKakaoUser(KakaoUser kakaoUser) {
        // 이메일로 사용자 조회 (Optional 사용)
        Optional<User> existingUser = userRepository.findByEmail(kakaoUser.getEmail());

        if (existingUser.isPresent()) {
            // 기존 사용자가 있다면 반환
            return existingUser.get();
        } else {
            // 새로운 소셜 사용자 등록
            User newUser = UserService.createSocialUser(
                    kakaoUser.getEmail(),
                    kakaoUser.getNickname()
            );
            return userRepository.save(newUser);
        }
    }
}