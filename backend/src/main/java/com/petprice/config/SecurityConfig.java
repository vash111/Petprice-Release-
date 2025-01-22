package com.petprice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import jakarta.servlet.http.HttpSession;

@Configuration
public class SecurityConfig {

    private final HttpSession httpSession;

    @Autowired
    public SecurityConfig(HttpSession httpSession) {
        this.httpSession = httpSession;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // 필요에 따라 CSRF 비활성화
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 필요한 경우 세션 생성
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/images/**",
                                "/api/cart/**",
                                "/api/wishlist/**",
                                "/api/animal/**",
                                "/api/users/session",
                                "/api/users/**",
                                "/api/users/login",
                                "/api/public/**",
                                "/api/inquiries/**",
                                "/api/regions/**",
                                "/api/reviews/**",
                                "/api/volunteer/**",
                                "/static/**",
                                "/index.html",
                                "/AboutPage",
                                "/CustomerSupport",
                                "/FreeBoardPage",
                                "/animalsearch",
                                "/VolunteerSearchPage",
                                "/notice-board",
                                "/notice-detail/**",
                                "/api/freeboard/**",
                                "/ProductPage",
                                "/api/products/**",
                                "/reviews/**",
                                "/api/payment",
                                "/api/chats/**"

                        ).permitAll() // 허용된 경로
                        .requestMatchers("/AdminPage", "/Admin/**").hasRole("ADMIN") // 관리자 권한 필요
                        .anyRequest().authenticated() // 기타 요청은 인증 필요
                )
                .logout(logout -> logout
                        .logoutUrl("/api/users/logout")
                        .logoutSuccessUrl("/")
                        .permitAll()
                )
                .securityContext(security -> security
                        .securityContextRepository(securityContextRepository()) // SecurityContext와 세션 동기화
                );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider customAuthenticationProvider() {
        return new CustomAuthenticationProvider(httpSession);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        // SecurityContext를 HttpSession에 저장하여 동기화
        return new HttpSessionSecurityContextRepository();
    }
}
