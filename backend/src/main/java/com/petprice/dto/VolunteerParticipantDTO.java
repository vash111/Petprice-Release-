package com.petprice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerParticipantDTO {
    private Long id;          // 참가자 ID
    private String username;  // 참가자 이름
    private String phoneNumber; // 참가자 전화번호
    private String status;    // 참가 상태 (수락/거절 등)
}
