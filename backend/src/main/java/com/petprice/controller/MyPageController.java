package com.petprice.controller;

import com.petprice.dto.CommentDTO;
import com.petprice.dto.FreeBoardDTO;
import com.petprice.dto.VolunteerParticipantDTO;
import com.petprice.dto.VolunteerResponseDTO;
import com.petprice.entity.User;
import com.petprice.service.FreeBoardService;
import com.petprice.service.VolunteerService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mypage")
public class MyPageController {

    private final FreeBoardService freeBoardService;
    private final VolunteerService volunteerService;

    public MyPageController(FreeBoardService freeBoardService, VolunteerService volunteerService) {
        this.freeBoardService = freeBoardService;
        this.volunteerService = volunteerService;
    }

    // 사용자 세션에서 User 객체 가져오기
    private User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

    // 마이페이지 기본 데이터
    @GetMapping
    public ResponseEntity<String> getMyPage(HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body("권한이 없습니다. 로그인이 필요합니다.");
        }

        return ResponseEntity.ok("마이페이지 데이터");
    }

    // 내가 작성한 글 가져오기
    @GetMapping("/myposts")
    public ResponseEntity<List<FreeBoardDTO>> getMyPosts(HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body(null);
        }

        List<FreeBoardDTO> posts = freeBoardService.getPostsByUserId(user.getId());
        return ResponseEntity.ok(posts);
    }

    // 내가 댓글 단 글 가져오기
    @GetMapping("/mycomments")
    public ResponseEntity<List<CommentDTO>> getMyComments(HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body(null);
        }

        List<CommentDTO> comments = freeBoardService.getCommentsByUserId(user.getId());
        return ResponseEntity.ok(comments);
    }

    // 좋아요 표시한 글 가져오기
    @GetMapping("/likedposts")
    public ResponseEntity<List<FreeBoardDTO>> getLikedPosts(HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body(null);
        }

        List<FreeBoardDTO> likedPosts = freeBoardService.getLikedPostsByUserId(user.getId());
        return ResponseEntity.ok(likedPosts);
    }

    // 내가 작성한 봉사활동 모집글 조회
    @GetMapping("/my")
    public ResponseEntity<List<VolunteerResponseDTO>> getMyVolunteerPosts(HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(401).body(null); // 로그인되지 않은 경우
        }

        List<VolunteerResponseDTO> posts = volunteerService.getMyVolunteerPosts(user);
        return ResponseEntity.ok(posts);
    }

    // 내가 신청한 봉사활동 내역 조회
    @GetMapping("/applied")
    public ResponseEntity<List<VolunteerResponseDTO>> getAppliedVolunteers(HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(401).body(null); // 로그인되지 않은 경우
        }
        List<VolunteerResponseDTO> appliedVolunteers = volunteerService.getAppliedVolunteers(user);
        return ResponseEntity.ok(appliedVolunteers);
    }

    // 특정 봉사활동 정보 가져오기
    @GetMapping("/volunteer/{id}")
    public ResponseEntity<VolunteerResponseDTO> getVolunteerById(HttpSession session, @PathVariable Long id) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).build();
        }
        VolunteerResponseDTO volunteer = volunteerService.findVolunteerById(id);
        return ResponseEntity.ok(volunteer);
    }

    // 봉사활동 참가자 목록 가져오기
    @GetMapping("/volunteer/{id}/participants")
    public ResponseEntity<List<VolunteerParticipantDTO>> getParticipants(HttpSession session, @PathVariable Long id) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).build();
        }

        try {
            List<VolunteerParticipantDTO> participants = volunteerService.getParticipantsAsDTO(id, user);
            return ResponseEntity.ok(participants);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(null);
        }
    }

    // 참가자 상태 변경
    @PostMapping("/volunteer/{volunteerId}/participants/{participantId}/action")
    public ResponseEntity<String> updateParticipantStatus(HttpSession session, @PathVariable Long volunteerId, @PathVariable Long participantId, @RequestParam String action) {
        User user = getSessionUser(session);
        if (user == null) {
            return ResponseEntity.status(403).body("로그인이 필요합니다.");
        }

        try {
            volunteerService.updateParticipantStatus(volunteerId, participantId, action, user);
            return ResponseEntity.ok("참가자 상태가 성공적으로 변경되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
