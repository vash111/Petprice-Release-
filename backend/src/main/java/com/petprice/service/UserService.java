package com.petprice.service;

import com.petprice.constant.Role;
import com.petprice.dto.UserDto;
import com.petprice.entity.User;
import com.petprice.repository.ReviewCommentRepository;
import com.petprice.repository.UserRepository;
import com.petprice.repository.VolunteerRepository;
import com.petprice.repository.VolunteerReviewRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ReviewCommentRepository reviewCommentRepository;
    private final VolunteerReviewRepository volunteerReviewRepository;
    private final VolunteerRepository volunteerRepository;


    // 일반 회원가입
    public User registerGeneralUser(UserDto userDto) {
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setUsername(userDto.getName());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setRole(Role.ADMIN);
        user.setRoadAddr(userDto.getRoadAddr());
        user.setJibunAddr(userDto.getJibunAddr());
        user.setZipNo(userDto.getZipNo());
        return userRepository.save(user);
    }

    // 소셜 회원가입
    public static User createSocialUser(String email, String username) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setRole(Role.SOCIAL_USER);
        return user;
    }

    // 회원 정보 업데이트
    public void updateUser(User user, UserDto userDto) {
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setRoadAddr(userDto.getRoadAddr());
        user.setJibunAddr(userDto.getJibunAddr());
        user.setZipNo(userDto.getZipNo());
        userRepository.save(user);
    }

    // 이메일로 회원 조회
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // 로그인 검증
    public boolean validateUserLogin(String email, String rawPassword) {
        User user = getUserByEmail(email);
        if (user == null || user.isDeleted()) { // 'isDeleted'가 true이면 로그인 차단
            return false; // 탈퇴한 사용자는 로그인할 수 없습니다.
        }
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    //임시비밀번호 발급
    public void generateTemporaryPassword(String name, String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .filter(u -> u.getUsername().equals(name))
                .orElseThrow(() -> new Exception("입력한 정보와 일치하는 사용자가 없습니다."));

        // 임시 비밀번호 생성
        String tempPassword = RandomStringUtils.randomAlphanumeric(8);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setTempPassword(true);
        userRepository.save(user);

        // 이메일 제목
        String subject = "PetPrice 임시 비밀번호 발급 안내";

        // 이메일 내용 (HTML)
        String content = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }" +
                ".header { text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 10px 10px 0 0; }" +
                ".content { padding: 20px; text-align: center; }" +
                ".footer { text-align: center; font-size: 0.9em; color: #777; margin-top: 20px; }" +
                ".btn { display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }" +
                ".btn:hover { background-color: #45a049; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>PetPrice 비밀번호 재설정 안내</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>안녕하세요, <strong>" + user.getUsername() + "</strong>님!</p>" +
                "<p>아래는 임시 비밀번호입니다. 임시 비밀번호를 사용하여 로그인한 후 반드시 비밀번호를 변경해주세요.</p>" +
                "<p style='font-size: 1.2em; font-weight: bold; color: #4CAF50;'>" + tempPassword + "</p>" +
                "<a href='http://localhost:8080/' class='btn'>로그인 페이지로 이동</a>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>이 이메일은 자동으로 발송되었습니다. 궁금한 사항이 있다면 <a href='mailto:support@petprice.com'>support@petprice.com</a>으로 문의해주세요.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        // 이메일 발송
        emailService.sendEmail(user.getEmail(), subject, content, true); // true: HTML 이메일 발송
    }

    //비밀번호 변경
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setTempPassword(false); // 임시 비밀번호 해제
        userRepository.save(user);
    }

    // 회원 소프트 삭제
    @Transactional
    public void softDeleteUser(User user) {
        user.setIsDeleted(true); // 삭제 상태로 설정
        userRepository.save(user); // 상태 저장
    }


}