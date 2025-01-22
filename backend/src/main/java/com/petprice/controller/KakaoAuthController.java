package com.petprice.controller;

import com.petprice.dto.KakaoUser;
import com.petprice.entity.User;
import com.petprice.service.KakaoAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth/kakao")
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;

    @GetMapping("/callback")
    public ResponseEntity<?> kakaoCallback(@RequestParam String code) {
        try {
            // 액세스 토큰 발급
            String accessToken = kakaoAuthService.getAccessToken(code);

            // 카카오 사용자 정보 가져오기
            KakaoUser kakaoUser = kakaoAuthService.getKakaoUserInfo(accessToken);

            // 사용자 등록 또는 조회
            User user = kakaoAuthService.findOrRegisterKakaoUser(kakaoUser);

            return ResponseEntity.ok().body(user); // 사용자 정보 반환
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("카카오 로그인 중 오류 발생: " + e.getMessage());
        }
    }
}