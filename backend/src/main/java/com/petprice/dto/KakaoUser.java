package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class KakaoUser {
    private String email;
    private String nickname;
    private String profileImage;

    public KakaoUser(String email, String nickname, String profileImage) {
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }
}