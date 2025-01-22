package com.petprice.service;

import com.petprice.dto.VolunteerParticipantDTO;
import com.petprice.dto.VolunteerRequestDTO;
import com.petprice.dto.VolunteerResponseDTO;
import com.petprice.entity.User;
import com.petprice.entity.Volunteer;
import com.petprice.entity.VolunteerParticipant;
import com.petprice.repository.VolunteerParticipantRepository;
import com.petprice.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VolunteerService {

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private VolunteerParticipantRepository participantRepository;

    public VolunteerResponseDTO createVolunteer(VolunteerRequestDTO requestDTO, User user) {
        Volunteer volunteer = new Volunteer();
        volunteer.setTitle(requestDTO.getTitle());
        volunteer.setContent(requestDTO.getContent());
        volunteer.setStartDate(requestDTO.getStartDate());
        volunteer.setEndDate(requestDTO.getEndDate());
        volunteer.setRegion(requestDTO.getRegion());
        volunteer.setContact(requestDTO.getContact());
        volunteer.setMaxParticipants(requestDTO.getMaxParticipants());

        volunteer.setUser(user);

        return convertToResponseDTO(volunteerRepository.save(volunteer), "Pending");
    }

    @Transactional
    public VolunteerResponseDTO updateVolunteer(Long id, VolunteerRequestDTO requestDTO, User user) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 봉사활동 글을 찾을 수 없습니다."));

        if (!volunteer.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        volunteer.setTitle(requestDTO.getTitle());
        volunteer.setContent(requestDTO.getContent());
        volunteer.setStartDate(requestDTO.getStartDate());
        volunteer.setEndDate(requestDTO.getEndDate());
        volunteer.setRegion(requestDTO.getRegion());
        volunteer.setContact(requestDTO.getContact());
        volunteer.setMaxParticipants(requestDTO.getMaxParticipants());

        return convertToResponseDTO(volunteerRepository.save(volunteer), "Pending");
    }

    public void deleteVolunteer(Long id, User user) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 봉사활동 글을 찾을 수 없습니다."));

        if (!volunteer.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        volunteerRepository.delete(volunteer);
    }

    @Transactional
    public Page<VolunteerResponseDTO> getVolunteers(PageRequest pageRequest, String region, LocalDate date, Long userId) {
        return volunteerRepository.findVolunteers(region, date, userId, pageRequest)
                .map(volunteer -> convertToResponseDTO(volunteer, "Pending"));
    }

    @Transactional
    public void applyForVolunteer(Long volunteerId, User user) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("봉사활동을 찾을 수 없습니다."));

        // maxParticipants가 0이 아닌 경우에만 참가 제한을 확인
        if (volunteer.getMaxParticipants() > 0 &&
                volunteer.getCurrentParticipants() >= volunteer.getMaxParticipants()) {
            throw new RuntimeException("참가 인원이 가득 찼습니다.");
        }

        // 이미 신청한 사용자인지 확인
        if (participantRepository.existsByVolunteerIdAndUserId(volunteerId, user.getId())) {
            throw new RuntimeException("이미 신청하셨습니다.");
        }

        // 새로운 참가자 추가
        VolunteerParticipant participant = new VolunteerParticipant();
        participant.setVolunteer(volunteer);
        participant.setUser(user);
        volunteer.getParticipants().add(participant);

        // 현재 참가자 수 증가
        volunteer.setCurrentParticipants(volunteer.getCurrentParticipants() + 1);

        participantRepository.save(participant);
        volunteerRepository.save(volunteer);
    }

    @Transactional(readOnly = true)
    public VolunteerResponseDTO findVolunteerById(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 봉사활동 글을 찾을 수 없습니다."));
        return convertToResponseDTO(volunteer, "Pending");
    }

    @Transactional
    public List<VolunteerParticipant> getParticipants(Long volunteerId, User user) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("봉사활동을 찾을 수 없습니다."));

        if (!volunteer.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("참가자 조회 권한이 없습니다.");
        }

        return participantRepository.findParticipantsByVolunteerId(volunteerId);
    }

    @Transactional
    public void updateParticipantStatus(Long volunteerId, Long participantId, String status, User user) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("봉사활동을 찾을 수 없습니다."));

        if (!volunteer.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("참가자 상태 변경 권한이 없습니다.");
        }

        VolunteerParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("참가자를 찾을 수 없습니다."));

        participant.setStatus(status);
        participantRepository.save(participant);
    }

    private VolunteerResponseDTO convertToResponseDTO(Volunteer volunteer, String status) {
        return new VolunteerResponseDTO(
                volunteer.getId(),
                volunteer.getTitle(),
                volunteer.getContent(),
                volunteer.getStartDate(),
                volunteer.getEndDate(),
                volunteer.getRegion(),
                volunteer.getContact(),
                volunteer.getMaxParticipants(),
                volunteer.getCurrentParticipants(),
                volunteer.getUser() != null ? volunteer.getUser().getUsername() : "Unknown",
                status
        );
    }

    @Transactional
    public List<VolunteerResponseDTO> getMyVolunteerPosts(User user) {
        List<Volunteer> volunteers = volunteerRepository.findByUserId(user.getId());
        return volunteers.stream()
                .map(volunteer -> convertToResponseDTO(volunteer, "Pending"))
                .toList();
    }

    @Transactional
    public List<VolunteerResponseDTO> getAppliedVolunteers(User user) {
        List<VolunteerParticipant> applications = participantRepository.findByUserId(user.getId());
        return applications.stream()
                .map(app -> convertToResponseDTO(app.getVolunteer(), app.getStatus()))
                .toList();
    }

    //참가 신청자 정보
    @Transactional
    public List<VolunteerParticipantDTO> getParticipantsAsDTO(Long volunteerId, User user) {
        List<VolunteerParticipant> participants = getParticipants(volunteerId, user);
        return participants.stream()
                .map(participant -> VolunteerParticipantDTO.builder()
                        .id(participant.getId())
                        .username(participant.getUser().getUsername())
                        .phoneNumber(participant.getUser().getPhoneNumber())
                        .status(participant.getStatus())
                        .build())
                .toList();
    }

    @Transactional
    public List<VolunteerResponseDTO> getAcceptedVolunteerActivities(User user) {
        List<VolunteerParticipant> participants = participantRepository.findAcceptedParticipantsByUserId(user.getId());
        return participants.stream()
                .map(participant -> convertToResponseDTO(participant.getVolunteer(), participant.getStatus()))
                .toList();
    }
}
