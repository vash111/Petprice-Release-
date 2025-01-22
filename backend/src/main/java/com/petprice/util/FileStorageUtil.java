package com.petprice.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class FileStorageUtil {

    public static String saveImage(MultipartFile file, String uploadDir) {
        // 파일 확장자 검사
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!List.of("jpg", "jpeg", "png", "gif").contains(extension)) {
            throw new RuntimeException("허용되지 않는 파일 형식입니다: " + extension);
        }

        // 디렉토리 생성 및 파일 저장
        File dir = new File(uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("업로드 디렉토리를 생성할 수 없습니다: " + uploadDir);
        }
        String fileName = System.currentTimeMillis() + "_" + originalFilename;
        File saveFile = new File(dir, fileName);

        try {
            file.transferTo(saveFile);
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 중 오류 발생: " + e.getMessage(), e);
        }

        // 이미지 URL 반환
        return "http://localhost:8080/images/" + fileName; // URL 형식으로 반환
    }


    public static String saveFile(MultipartFile file, String uploadDir) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
        }

        // 업로드 디렉토리가 없으면 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일 저장
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        file.transferTo(filePath.toFile());

        return filePath.toString(); // 저장된 파일 경로 반환
    }
}
