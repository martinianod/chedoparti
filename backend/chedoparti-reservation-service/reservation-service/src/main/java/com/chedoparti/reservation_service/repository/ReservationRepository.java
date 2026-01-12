package com.chedoparti.reservation_service.repository;

import com.chedoparti.reservation_service.entity.Reservation;
import com.chedoparti.reservation_service.entity.User;
import com.chedoparti.reservation_service.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByCourtId(String courtId);
    List<Reservation> findByCourtInstitutionId(String institutionId);
    List<Reservation> findByStatus(ReservationStatus status);
}
