package com.petprice.controller;

import com.petprice.dto.ProductRequestDTO;
import com.petprice.dto.ProductResponseDTO;
import com.petprice.dto.TransactionResponseDTO;
import com.petprice.entity.Transaction;
import com.petprice.entity.User;
import com.petprice.service.ProductService;
import com.petprice.service.TransactionService;
import com.petprice.util.FileStorageUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    private final TransactionService transactionService;

    public ProductController(ProductService productService, TransactionService transactionService) {
        this.productService = productService;
        this.transactionService = transactionService;
    }

    // 상품 생성
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(
            @ModelAttribute ProductRequestDTO dto,
            @RequestParam(required = false) MultipartFile image,
            HttpSession session) {
        User seller = (User) session.getAttribute("user");
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 이미지 파일 처리
        if (image != null && !image.isEmpty()) {
            String uploadDir = "C:/img";
            String imageUrl = FileStorageUtil.saveImage(image, uploadDir); // 이미지 저장
            dto.setImageUrl(imageUrl); // DTO에 저장된 경로 설정
        }

        // 상품 생성 및 응답 반환
        return ResponseEntity.ok(productService.createProduct(dto, seller));
    }

    // 전체 상품 조회
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // 사용자 상품 조회
    @GetMapping("/user")
    public ResponseEntity<List<ProductResponseDTO>> getUserProducts(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(productService.getProductsByUser(user));
    }

    // 특정 상품 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // 상태별 상품 조회
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(productService.getProductsByStatus(status));
    }

    // 카테고리별 상품 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    // 찜 토글
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        productService.toggleLike(id, user);
        return ResponseEntity.ok().build();
    }

    // 찜한 상품 조회
    @GetMapping("/liked")
    public ResponseEntity<List<ProductResponseDTO>> getLikedProducts(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(productService.getLikedProducts(user));
    }

    // 상품 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequestDTO dto,
            HttpSession session) {
        User seller = (User) session.getAttribute("user");
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(productService.updateProduct(id, dto, seller));
    }

    // 상품 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, HttpSession session) {
        User seller = (User) session.getAttribute("user");
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        productService.deleteProduct(id, seller);
        return ResponseEntity.noContent().build();
    }

    // 상품 구매
    @PostMapping("/{id}/purchase-request")
    public ResponseEntity<?> requestPurchase(@PathVariable Long id, HttpSession session) {
        User buyer = (User) session.getAttribute("user");
        if (buyer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            productService.requestPurchase(id, buyer);
            return ResponseEntity.ok("구매 요청이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("구매 요청 실패: " + e.getMessage());
        }
    }

    //상품 구매취소
    @PostMapping("/{transactionId}/cancel")
    public ResponseEntity<?> cancelPurchase(@PathVariable Long transactionId, HttpSession session) {
        User buyer = (User) session.getAttribute("user");
        if (buyer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            transactionService.cancelPurchase(transactionId, buyer);
            return ResponseEntity.ok("구매 신청이 취소되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("구매 취소 실패: " + e.getMessage());
        }
    }


    //판매 승인,거절
    @PostMapping("/{id}/purchase-response")
    public ResponseEntity<?> processPurchaseRequest(
            @PathVariable Long id,
            @RequestParam boolean approve,
            HttpSession session) {
        User seller = (User) session.getAttribute("user");
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        try {
            productService.processPurchaseRequest(id, approve, seller);
            return ResponseEntity.ok(approve ? "구매 요청이 승인되었습니다." : "구매 요청이 거절되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("구매 요청 처리 실패: " + e.getMessage());
        }
    }

    // 판매 내역 조회
    @GetMapping("/sales")
    public ResponseEntity<?> getSales(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            List<TransactionResponseDTO> sales = productService.getSalesHistory(user);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("판매 내역 조회 중 오류 발생: " + e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        List<Transaction> transactions = productService.getTransactions(user);
        return ResponseEntity.ok(transactions);
    }

}
