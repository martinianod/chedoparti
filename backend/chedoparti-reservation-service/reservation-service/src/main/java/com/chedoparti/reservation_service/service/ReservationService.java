package com.chedoparti.reservation_service.service;

import com.chedoparti.reservation_service.dto.ReservationDTO;
import com.chedoparti.reservation_service.entity.Reservation;
import com.chedoparti.reservation_service.enums.ReservationStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationService {
    Reservation createReservation(String userId, String courtId, LocalDateTime startTime, LocalDateTime endTime);
    List<Reservation> getReservationsByUser(String userId);
    List<Reservation> getReservationsByInstitution(String institutionId);
    void cancelReservation(String reservationId);
    void updateReservationStatus(String reservationId, ReservationStatus status);
    List<ReservationDTO> getAllReservations();
}
