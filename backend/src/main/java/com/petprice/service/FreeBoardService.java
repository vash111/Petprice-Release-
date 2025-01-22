package com.petprice.service;

import com.petprice.dto.CommentDTO;
import com.petprice.dto.FreeBoardDTO;
import com.petprice.entity.Comment;
import com.petprice.entity.FreeBoard;
import com.petprice.entity.User;
import com.petprice.repository.CommentRepository;
import com.petprice.repository.FreeBoardRepository;
import com.petprice.util.FileStorageUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FreeBoardService {

    private final FreeBoardRepository freeBoardRepository;
    private final CommentRepository commentRepository;

    public FreeBoardService(FreeBoardRepository freeBoardRepository, CommentRepository commentRepository) {
        this.freeBoardRepository = freeBoardRepository;
        this.commentRepository = commentRepository;
    }

    // 게시글 작성
    @Transactional
    public FreeBoardDTO createPost(FreeBoardDTO dto, User user) {
        FreeBoard freeBoard = new FreeBoard();
        freeBoard.setTitle(dto.getTitle());
        freeBoard.setContent(dto.getContent());
        freeBoard.setCategory(dto.getCategory());
        freeBoard.setImageUrl(dto.getImageUrl()); // 이미지 경로 설정
        freeBoard.setAuthor(user);

        return convertToDTO(freeBoardRepository.save(freeBoard), user);
    }

    // 게시글 수정
    @Transactional
    public FreeBoardDTO updatePost(Long id, FreeBoardDTO dto, User user) {
        FreeBoard freeBoard = freeBoardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!freeBoard.getAuthor().getId().equals(user.getId())) {
            throw new SecurityException("작성자만 수정할 수 있습니다.");
        }

        freeBoard.setTitle(dto.getTitle());
        freeBoard.setContent(dto.getContent());
        freeBoard.setCategory(dto.getCategory());
        if (dto.getImageUrl() != null) {
            freeBoard.setImageUrl(dto.getImageUrl());
        }

        return convertToDTO(freeBoardRepository.save(freeBoard), user);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(Long id, User user) {
        FreeBoard freeBoard = freeBoardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!freeBoard.getAuthor().getId().equals(user.getId())) {
            throw new SecurityException("작성자만 삭제할 수 있습니다.");
        }

        freeBoardRepository.delete(freeBoard);
    }

    // 게시글 목록 가져오기
    @Transactional(readOnly = true)
    public List<FreeBoardDTO> getAllPosts(User currentUser) {
        return freeBoardRepository.findAll().stream()
                .map(post -> convertToDTO(post, currentUser))
                .collect(Collectors.toList());
    }

    // 특정 게시글 가져오기
    @Transactional(readOnly = true)
    public FreeBoardDTO getPostById(Long id, User currentUser) {
        FreeBoard freeBoard = freeBoardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        return convertToDTO(freeBoard, currentUser);
    }

    // 조회수 증가
    @Transactional
    public void increaseViews(Long id) {
        FreeBoard freeBoard = freeBoardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        freeBoard.setViews(freeBoard.getViews() + 1);
        freeBoardRepository.save(freeBoard);
    }

    // 좋아요 토글
    @Transactional
    public void toggleLike(Long postId, User user) {
        FreeBoard freeBoard = freeBoardRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (freeBoard.getLikedUsers().contains(user)) {
            // 좋아요 취소
            freeBoard.getLikedUsers().remove(user);
            freeBoard.setLikes(freeBoard.getLikes() - 1);
        } else {
            // 좋아요 추가
            freeBoard.getLikedUsers().add(user);
            freeBoard.setLikes(freeBoard.getLikes() + 1);
        }

        freeBoardRepository.save(freeBoard);
    }

    // 댓글 작성
    @Transactional
    public CommentDTO addComment(Long postId, CommentDTO dto, User author) {
        FreeBoard freeBoard = freeBoardRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setAuthor(author);
        comment.setFreeBoard(freeBoard);

        return convertToDTO(commentRepository.save(comment));
    }

    // 댓글 수정
    @Transactional
    public CommentDTO updateComment(Long postId, Long commentId, CommentDTO dto, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new SecurityException("작성자만 수정할 수 있습니다.");
        }

        comment.setContent(dto.getContent());
        return convertToDTO(commentRepository.save(comment));
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new SecurityException("작성자만 삭제할 수 있습니다.");
        }

        commentRepository.delete(comment);
    }

    // 댓글 목록 가져오기
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByPostId(Long id) {
        FreeBoard freeBoard = freeBoardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        return freeBoard.getComments().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 사용자가 작성한 게시글 가져오기
    @Transactional(readOnly = true)
    public List<FreeBoardDTO> getPostsByUserId(Long userId) {
        return freeBoardRepository.findByAuthorId(userId).stream()
                .map(post -> convertToDTO(post, null))
                .collect(Collectors.toList());
    }

    // 사용자가 작성한 댓글 가져오기
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByUserId(Long userId) {
        return commentRepository.findByAuthorId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 사용자가 좋아요 표시한 게시글 가져오기
    @Transactional(readOnly = true)
    public List<FreeBoardDTO> getLikedPostsByUserId(Long userId) {
        return freeBoardRepository.findAll().stream()
                .filter(post -> post.getLikedUsers().stream().anyMatch(user -> user.getId().equals(userId)))
                .map(post -> convertToDTO(post, null))
                .collect(Collectors.toList());
    }

    // 게시글 DTO 변환 메서드
    private FreeBoardDTO convertToDTO(FreeBoard freeBoard, User currentUser) {
        FreeBoardDTO dto = new FreeBoardDTO();
        dto.setId(freeBoard.getId());
        dto.setTitle(freeBoard.getTitle());
        dto.setContent(freeBoard.getContent());
        dto.setCategory(freeBoard.getCategory());
        dto.setViews(freeBoard.getViews());
        dto.setLikes(freeBoard.getLikes());
        dto.setImageUrl(freeBoard.getImageUrl());
        dto.setCreatedAt(freeBoard.getCreatedAt());
        dto.setRepliedAt(freeBoard.getRepliedAt());
        dto.setAuthorUsername(freeBoard.getAuthor().getUsername());
        dto.setLikedByUser(currentUser != null && freeBoard.getLikedUsers().contains(currentUser)); // Null 체크
        return dto;
    }

    // 게시글 댓글 DTO 변환 메서드
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setAuthorUsername(comment.getAuthor().getUsername());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setRepliedAt(comment.getRepliedAt());
        return dto;
    }
}
