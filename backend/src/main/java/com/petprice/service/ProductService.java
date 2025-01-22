package com.petprice.service;

import com.petprice.dto.ProductRequestDTO;
import com.petprice.dto.ProductResponseDTO;
import com.petprice.dto.TransactionResponseDTO;
import com.petprice.entity.Product;
import com.petprice.entity.Transaction;
import com.petprice.entity.User;
import com.petprice.repository.ProductRepository;
import com.petprice.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;

    public ProductService(ProductRepository productRepository, TransactionRepository transactionRepository) {
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO dto, User seller) {
        Product product = new Product();
        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(dto.getCategory());
        product.setSeller(seller);

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct, seller);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(product -> convertToDTO(product, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByUser(User user) {
        return productRepository.findBySellerId(user.getId()).stream()
                .map(product -> convertToDTO(product, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByStatus(String status) {
        return productRepository.findByStatus(status).stream()
                .map(product -> convertToDTO(product, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(product -> convertToDTO(product, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getSalesHistory(User seller) {
        List<Product> products = productRepository.findBySellerIdAndStatuses(seller.getId(), List.of("결제 완료", "판매 완료"));

        return products.stream()
                .map(product -> {
                    TransactionResponseDTO dto = new TransactionResponseDTO();
                    dto.setId(product.getId());
                    dto.setProductTitle(product.getTitle());
                    dto.setPrice(product.getPrice());
                    dto.setStatus(product.getStatus());
                    dto.setBuyerName(product.getBuyer() != null ? product.getBuyer().getUsername() : "정보 없음");
                    dto.setSellerName(product.getSeller().getUsername());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    @Transactional
    public void toggleLike(Long productId, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (product.getLikedUsers().contains(user)) {
            product.getLikedUsers().remove(user); // 찜 취소
        } else {
            product.getLikedUsers().add(user); // 찜 추가
        }

        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getLikedProducts(User user) {
        List<Product> likedProducts = productRepository.findLikedProductsByUserId(user.getId());
        return likedProducts.stream()
                .map(product -> convertToDTO(product, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return convertToDTO(product, null);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO dto, User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new SecurityException("작성자만 수정할 수 있습니다.");
        }

        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(dto.getCategory());

        return convertToDTO(productRepository.save(product), seller);
    }

    @Transactional
    public void deleteProduct(Long id, User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new SecurityException("작성자만 삭제할 수 있습니다.");
        }

        productRepository.delete(product);
    }



    @Transactional
    public void requestPurchase(Long productId, User buyer) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (!product.getStatus().equals("판매 중")) {
            throw new IllegalStateException("구매할 수 없는 상태의 상품입니다.");
        }

        // 상품 상태 변경
        product.setStatus("예약 중");
        product.setBuyer(buyer);

        // 구매 신청 내역 생성
        Transaction transaction = new Transaction(
                product,
                buyer,                 // 구매자
                product.getSeller(),   // 판매자
                "구매 신청"             // 상태
        );

        // 연관 관계 설정
        product.getTransactions().add(transaction);

        // 저장
        transactionRepository.save(transaction); // 거래 내역 저장
        productRepository.save(product);         // 상품 상태 저장
    }


    @Transactional
    public void processPurchaseRequest(Long productId, boolean approve, User seller) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new SecurityException("권한이 없습니다.");
        }

        if (approve) {
            product.setStatus("판매 완료");

            Transaction transaction = new Transaction(
                    product,
                    product.getBuyer(),
                    seller,
                    "승인" // status 설정
            );

            // 양방향 연관 관계 설정
            product.getTransactions().add(transaction);

            transactionRepository.save(transaction);
        } else {
            product.setStatus("판매 중");
            product.setBuyer(null);
        }
        productRepository.save(product);
    }



    @Transactional(readOnly = true)
    public List<Transaction> getTransactions(User user) {
        // 사용자 ID로 거래 내역 조회
        return transactionRepository.findByBuyerIdOrSellerId(user.getId(), user.getId());
    }

    @Transactional
    public void updateStatus(Long productId, String status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        product.setStatus(status); // 상품 상태 업데이트
        productRepository.save(product); // 상태 저장
    }


    private ProductResponseDTO convertToDTO(Product product, User currentUser) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setTitle(product.getTitle());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setStatus(product.getStatus());
        dto.setCategory(product.getCategory());
        dto.setSellerUsername(product.getSeller().getUsername());
        dto.setSellerId(product.getSeller().getId()); // 추가
        dto.setBuyerId(product.getBuyer() != null ? product.getBuyer().getId() : null);
        dto.setCreatedAt(product.getCreatedAt());
        dto.setLikedByUser(currentUser != null && product.getLikedUsers().contains(currentUser)); // 찜 여부
        return dto;
    }

}
