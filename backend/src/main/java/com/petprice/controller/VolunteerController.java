package com.petprice.controller;

import com.petprice.dto.VolunteerParticipantDTO;
import com.petprice.dto.VolunteerRequestDTO;
import com.petprice.dto.VolunteerResponseDTO;
import com.petprice.entity.User;
import com.petprice.entity.VolunteerParticipant;
import com.petprice.service.VolunteerService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    private User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

    // 모집글 목록 조회
    @GetMapping
    public ResponseEntity<Page<VolunteerResponseDTO>> getVolunteers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) Long userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<VolunteerResponseDTO> volunteers = volunteerService.getVolunteers(pageRequest, region, date, userId);
        return ResponseEntity.ok(volunteers);
    }

    // 봉사자 모집글 작성
    @PostMapping("/create")
    public ResponseEntity<VolunteerResponseDTO> createVolunteer(
            @RequestBody VolunteerRequestDTO requestDTO,
            HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        VolunteerResponseDTO responseDTO = volunteerService.createVolunteer(requestDTO, user);
        return ResponseEntity.ok(responseDTO);
    }

    // 모집글 수정
    @PutMapping("/{id}")
    public ResponseEntity<VolunteerResponseDTO> updateVolunteer(
            @PathVariable Long id,
            @RequestBody VolunteerRequestDTO requestDTO,
            HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).build();
        }
        VolunteerResponseDTO responseDTO = volunteerService.updateVolunteer(id, requestDTO, user);
        return ResponseEntity.ok(responseDTO);
    }

    // 모집글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVolunteer(
            @PathVariable Long id,
            HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body("권한이 없습니다.");
        }
        volunteerService.deleteVolunteer(id, user);
        return ResponseEntity.ok("삭제되었습니다.");
    }

    // 봉사활동 참가 신청
    @PostMapping("/{id}/apply")
    public ResponseEntity<String> applyForVolunteer(
            @PathVariable Long id,
            HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        volunteerService.applyForVolunteer(id, user);
        return ResponseEntity.ok("참가 신청이 완료되었습니다.");
    }

    // 모집글 참가자 목록 조회
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<VolunteerParticipant>> getParticipants(
            @PathVariable Long id,
            HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).build();
        }
        List<VolunteerParticipant> participants = volunteerService.getParticipants(id, user);
        return ResponseEntity.ok(participants);
    }

    // 참가자 상태 변경 (수락/거절)
    @PatchMapping("/{id}/participants/{participantId}")
    public ResponseEntity<String> updateParticipantStatus(
            @PathVariable Long id,
            @PathVariable Long participantId,
            @RequestParam String status,
            HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body("권한이 없습니다.");
        }
        volunteerService.updateParticipantStatus(id, participantId, status, user);
        return ResponseEntity.ok("참가자 상태가 업데이트되었습니다.");
    }

    // 특정 봉사활동 정보 가져오기
    @GetMapping("/{id}")
    public ResponseEntity<VolunteerResponseDTO> getVolunteerById(
            HttpSession session,
            @PathVariable Long id) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).build();
        }
        VolunteerResponseDTO volunteer = volunteerService.findVolunteerById(id);
        return ResponseEntity.ok(volunteer);
    }

    // 참가자 상세 정보 조회
    @GetMapping("/{id}/participants/details")
    public ResponseEntity<List<VolunteerParticipantDTO>> getParticipantsDetails(
            HttpSession session,
            @PathVariable Long id) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).build();
        }
        List<VolunteerParticipantDTO> participants = volunteerService.getParticipantsAsDTO(id, user);
        return ResponseEntity.ok(participants);
    }

    // 참가자 상태 변경
    @PostMapping("/{volunteerId}/participants/{participantId}/action")
    public ResponseEntity<String> updateParticipantStatus(
            HttpSession session,
            @PathVariable Long volunteerId,
            @PathVariable Long participantId,
            @RequestParam String action) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body("로그인이 필요합니다.");
        }
        volunteerService.updateParticipantStatus(volunteerId, participantId, action, user);
        return ResponseEntity.ok("참가자 상태가 성공적으로 변경되었습니다.");
    }
}
