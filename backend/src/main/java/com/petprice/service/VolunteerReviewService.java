package com.petprice.service;
import com.petprice.dto.ReviewCommentDTO;
import com.petprice.dto.VolunteerReviewDTO;
import com.petprice.dto.VolunteerReviewRequestDTO;
import com.petprice.entity.ReviewComment;
import com.petprice.entity.VolunteerReview;
import com.petprice.repository.ReviewCommentRepository;
import com.petprice.repository.VolunteerParticipantRepository;
import com.petprice.repository.VolunteerReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import com.petprice.entity.User;

import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;


@Service
public class VolunteerReviewService {

    @Autowired
    private VolunteerReviewRepository reviewRepository;

    @Autowired
    private ReviewCommentRepository commentRepository;

    @Autowired
    private VolunteerParticipantRepository participantRepository;

    @Transactional
    public Page<VolunteerReviewDTO> getReviews(String region, String keyword, Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<VolunteerReview> reviews = reviewRepository.findByRegionAndKeyword(region, keyword, sortedPageable);
        return reviews.map(this::convertToDTO);
    }

    // 리뷰 생성
    @Transactional
    public VolunteerReviewDTO createReview(VolunteerReviewRequestDTO request, User user) {

        participantRepository.findAcceptedParticipation(request.getVolunteerId(), user.getId())
                .orElseThrow(() -> new RuntimeException("리뷰를 작성할 권한이 없습니다."));

        VolunteerReview review = new VolunteerReview();
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        review.setRegion(request.getRegion());
        review.setImageUrl(request.getImageUrl());
        review.setUser(user);

        return convertToDTO(reviewRepository.save(review));
    }

    @Transactional
    public VolunteerReviewDTO updateReview(Long id, VolunteerReviewRequestDTO request, User user) {
        VolunteerReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 후기를 찾을 수 없습니다."));
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        review.setRegion(request.getRegion());
        review.setImageUrl(request.getImageUrl());
        return convertToDTO(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id, User user) {
        VolunteerReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 후기를 찾을 수 없습니다."));
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        reviewRepository.delete(review);
    }

    @Transactional
    public VolunteerReviewDTO getReviewById(Long id) {
        VolunteerReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 후기를 찾을 수 없습니다."));

        // 조회수 증가
        review.setViews(review.getViews() + 1);
        reviewRepository.save(review);

        return convertToDTO(review);
    }

    @Transactional
    public ReviewCommentDTO addComment(Long reviewId, String content, User user) {
        VolunteerReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("후기를 찾을 수 없습니다."));
        ReviewComment comment = new ReviewComment();
        comment.setReview(review);
        comment.setContent(content);
        comment.setUser(user);
        return convertToCommentDTO(commentRepository.save(comment));
    }

    @Transactional
    public ReviewCommentDTO updateComment(Long commentId, String content, User user) {
        ReviewComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }
        comment.setContent(content);
        return convertToCommentDTO(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        ReviewComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        commentRepository.delete(comment);
    }

    private VolunteerReviewDTO convertToDTO(VolunteerReview review) {
        return new VolunteerReviewDTO(
                review.getId(),
                review.getTitle(),
                review.getContent(),
                review.getImageUrl(),
                review.getRegion(),
                review.getViews(),
                review.getUser().getUsername(),
                review.getUser().getId(),
                review.getCreatedAt(),
                review.getComments().stream().map(this::convertToCommentDTO).collect(Collectors.toList())
        );
    }

    private ReviewCommentDTO convertToCommentDTO(ReviewComment comment) {
        return new ReviewCommentDTO(
                comment.getId(),
                comment.getReview().getId(),
                comment.getUser().getUsername(),
                comment.getContent(), // username 뒤에 content가 위치
                comment.getUser().getId(), // content 뒤에 userId
                comment.getCreatedAt()
        );
    }


}
