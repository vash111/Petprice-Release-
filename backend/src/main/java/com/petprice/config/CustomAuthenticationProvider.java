package com.petprice.config;

import com.petprice.entity.User;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import jakarta.servlet.http.HttpSession;
import java.util.Collections;

public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final HttpSession httpSession;

    public CustomAuthenticationProvider(HttpSession httpSession) {
        this.httpSession = httpSession;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        // 세션에서 사용자 정보 가져오기
        Object userObject = httpSession.getAttribute("user");
        if (userObject instanceof User) {
            User user = (User) userObject;

            // 사용자의 권한(Role)에 따라 인증 생성
            if ("ADMIN".equals(user.getRole())) {
                return new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                );
            } else {
                return new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
            }
        }

        throw new RuntimeException("사용자 인증 실패 또는 세션이 유효하지 않음");
    }

    @Override
    public boolean supports(Class<?> authentication) {
        // Authentication 타입이 지원되는지 확인
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}