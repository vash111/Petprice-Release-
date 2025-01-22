package com.petprice.controller;

import com.petprice.dto.ReviewCommentDTO;
import com.petprice.dto.VolunteerResponseDTO;
import com.petprice.dto.VolunteerReviewDTO;
import com.petprice.dto.VolunteerReviewRequestDTO;
import com.petprice.entity.User;
import com.petprice.service.VolunteerReviewService;
import com.petprice.service.VolunteerService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.petprice.util.FileStorageUtil;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class VolunteerReviewController {

    private User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

    @Autowired
    private VolunteerReviewService reviewService;
    @Autowired
    private VolunteerService volunteerService;

    @GetMapping
    public ResponseEntity<Page<VolunteerReviewDTO>> getReviews(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getReviews(region, keyword, pageable));
    }


    @PostMapping("/create")
    public ResponseEntity<VolunteerReviewDTO> createReview(
            @ModelAttribute VolunteerReviewRequestDTO request,
            @RequestParam(required = false) MultipartFile image,
            HttpSession session
    ) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = "C:\\img"; // C:\img 경로로 수정
                String imageUrl = FileStorageUtil.saveImage(image, uploadDir);
                request.setImageUrl(imageUrl);
            } catch (RuntimeException e) {
                return ResponseEntity.status(500).body(null);
            }
        }
        return ResponseEntity.ok(reviewService.createReview(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VolunteerReviewDTO> updateReview(
            @PathVariable Long id,
            @RequestBody VolunteerReviewRequestDTO request,
            HttpSession session
    ) {
        User user = (User) session.getAttribute("user");
        return ResponseEntity.ok(reviewService.updateReview(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        reviewService.deleteReview(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{reviewId}/comments")
    public ResponseEntity<ReviewCommentDTO> addComment(
            @PathVariable Long reviewId,
            @RequestBody String content,
            HttpSession session
    ) {
        User user = (User) session.getAttribute("user");
        return ResponseEntity.ok(reviewService.addComment(reviewId, content, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VolunteerReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ReviewCommentDTO> updateComment(
            @PathVariable Long commentId,
            @RequestBody String content,
            HttpSession session
    ) {
        User user = (User) session.getAttribute("user");
        return ResponseEntity.ok(reviewService.updateComment(commentId, content, user));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        reviewService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/accepted-activities")
    public ResponseEntity<List<VolunteerResponseDTO>> getAcceptedVolunteerActivities(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<VolunteerResponseDTO> activities = volunteerService.getAcceptedVolunteerActivities(user);
        return ResponseEntity.ok(activities);
    }

}
