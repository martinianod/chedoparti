package com.chedoparti.reservation_service.service;

import com.chedoparti.reservation_service.dto.ReservationDTO;
import com.chedoparti.reservation_service.entity.Court;
import com.chedoparti.reservation_service.entity.Reservation;
import com.chedoparti.reservation_service.entity.User;
import com.chedoparti.reservation_service.enums.ReservationStatus;
import com.chedoparti.reservation_service.mapper.ReservationMapper;
import com.chedoparti.reservation_service.repository.CourtRepository;
import com.chedoparti.reservation_service.repository.ReservationRepository;
import com.chedoparti.reservation_service.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;

    public ReservationServiceImpl(ReservationRepository reservationRepository, 
                                 CourtRepository courtRepository,
                                 UserRepository userRepository,
                                 ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.courtRepository = courtRepository;
        this.userRepository = userRepository;
        this.reservationMapper = reservationMapper;
    }

    @Override
    public Reservation createReservation(String userId, String courtId, LocalDateTime startTime, LocalDateTime endTime) {
        // Fetch user and court entities
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new EntityNotFoundException("Court not found with id: " + courtId));

        // Create and save reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setCourt(court);
        reservation.setDate(startTime.toLocalDate());
        reservation.setStartTime(startTime.toLocalTime());
        reservation.setEndTime(endTime.toLocalTime());
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getReservationsByUser(String userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Override
    public List<Reservation> getReservationsByInstitution(String institutionId) {
        return reservationRepository.findByCourtInstitutionId(institutionId);
    }

    @Override
    public void cancelReservation(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + reservationId));
        
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            log.warn("Reservation {} is already cancelled", reservationId);
            return;
        }
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        log.info("Cancelled reservation with id: {}", reservationId);
    }

    @Override
    public void updateReservationStatus(String reservationId, ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + reservationId));
        
        reservation.setStatus(status);
        reservationRepository.save(reservation);
        log.info("Updated status of reservation {} to {}", reservationId, status);
    }

    @Override
    public List<ReservationDTO> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findAll();
        return reservationMapper.toDtos(reservations);
    }
}
