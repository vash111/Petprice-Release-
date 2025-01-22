package com.petprice.controller;

import com.petprice.dto.CommentDTO;
import com.petprice.dto.FreeBoardDTO;
import com.petprice.entity.FreeBoard;
import com.petprice.entity.User;
import com.petprice.service.FreeBoardService;
import com.petprice.util.FileStorageUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/freeboard")
public class FreeBoardController {

    private final FreeBoardService freeBoardService;

    public FreeBoardController(FreeBoardService freeBoardService) {
        this.freeBoardService = freeBoardService;
    }

    // 게시글 목록 가져오기
    @GetMapping
    public ResponseEntity<List<FreeBoardDTO>> getAllPosts(HttpSession session) {
        User user = (User) session.getAttribute("user");
        return ResponseEntity.ok(freeBoardService.getAllPosts(user));
    }

    // 특정 게시글 가져오기
    @GetMapping("/{id}")
    public ResponseEntity<FreeBoardDTO> getPostById(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        return ResponseEntity.ok(freeBoardService.getPostById(id, user));
    }

    // 게시글 작성
    @PostMapping
    public ResponseEntity<FreeBoardDTO> createPost(
            @ModelAttribute FreeBoardDTO dto,
            @RequestParam(required = false) MultipartFile image,
            HttpSession session
    ) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 이미지 저장
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String uploadDir = "C:/img"; // 저장 디렉토리
            imageUrl = FileStorageUtil.saveImage(image, uploadDir);
            dto.setImageUrl(imageUrl); // DTO에 이미지 경로 설정
        }

        // 게시글 저장
        FreeBoardDTO newPost = freeBoardService.createPost(dto, user);
        return ResponseEntity.ok(newPost);
    }


    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<FreeBoardDTO> updatePost(@PathVariable Long id, @RequestBody FreeBoardDTO dto, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(freeBoardService.updatePost(id, dto, user));
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        freeBoardService.deletePost(id, user);
        return ResponseEntity.noContent().build();
    }

    // 조회수 증가
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> increaseViews(@PathVariable Long id) {
        freeBoardService.increaseViews(id);
        return ResponseEntity.ok().build();
    }

    // 좋아요 토글
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        freeBoardService.toggleLike(id, user);
        return ResponseEntity.ok().build();
    }

    // 댓글 작성
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id, @RequestBody CommentDTO dto, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(freeBoardService.addComment(id, dto, user));
    }

    // 댓글 수정
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestBody CommentDTO dto,
            HttpSession session
    ) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(freeBoardService.updateComment(id, commentId, dto, user));
    }

    // 댓글 삭제
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @PathVariable Long commentId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        freeBoardService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }

    // 댓글 목록 가져오기
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(freeBoardService.getCommentsByPostId(id));
    }
}
