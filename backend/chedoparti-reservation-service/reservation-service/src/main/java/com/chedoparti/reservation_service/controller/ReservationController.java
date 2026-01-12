package com.chedoparti.reservation_service.controller;

import com.chedoparti.reservation_service.dto.ReservationDTO;
import com.chedoparti.reservation_service.dto.ReservationRequest;
import com.chedoparti.reservation_service.dto.ReservationResponse;
import com.chedoparti.reservation_service.enums.ReservationStatus;
import com.chedoparti.reservation_service.entity.Reservation;
import com.chedoparti.reservation_service.service.ReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reservations")
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {

        this.reservationService = reservationService;
    }

    @GetMapping("/")
    public ResponseEntity<List<ReservationDTO>> getAllReservations(){
        log.info("Request received: Get all reservations");
        try {
            List<ReservationDTO> reservations = reservationService.getAllReservations();
            log.debug("Successfully retrieved {} reservations", reservations.size());
            return ResponseEntity.ok().body(reservations);
        } catch (Exception e) {
            log.error("Error retrieving reservations: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getReservationsByUser(@PathVariable String userId) {
        log.info("Request received: Get reservations for user ID: {}", userId);
        try {
            List<Reservation> userReservations = reservationService.getReservationsByUser(userId);
            log.debug("Found {} reservations for user ID: {}", userReservations.size(), userId);
            return ResponseEntity.ok().body(userReservations);
        } catch (Exception e) {
            log.error("Error retrieving reservations for user ID {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/")
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequest request) {
        log.info("Request received: Create reservation - User: {}, Court: {}, Date: {}", 
                request.getUserId(), request.getCourtId(), request.getDate());
        
        try {
            // Convert ReservationRequest to the parameters needed by the service
            String userId = request.getUserId();
            String courtId = request.getCourtId();
            LocalDateTime startTime = LocalDateTime.of(request.getDate(), request.getStartTime());
            LocalDateTime endTime = LocalDateTime.of(request.getDate(), request.getEndTime());
            
            log.debug("Creating reservation - User: {}, Court: {}, Start: {}, End: {}", 
                    userId, courtId, startTime, endTime);
                    
            Reservation createdReservation = reservationService.createReservation(userId, courtId, startTime, endTime);
            log.info("Reservation created successfully - ID: {}", createdReservation.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
        } catch (Exception e) {
            log.error("Error creating reservation: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<Void> updateReservationStatus(
            @PathVariable String reservationId,
            @RequestParam ReservationStatus status)
    {
        log.info("Request received: Update reservation status - ID: {}, New Status: {}", reservationId, status);
        try {
            reservationService.updateReservationStatus(reservationId, status);
            log.info("Successfully updated reservation status - ID: {}, Status: {}", reservationId, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error updating reservation status - ID: {}, Error: {}", reservationId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<String> cancelReservation(@PathVariable String reservationId)
    {
        log.info("Request received: Cancel reservation - ID: {}", reservationId);
        try {
            reservationService.cancelReservation(reservationId);
            log.info("Successfully cancelled reservation - ID: {}", reservationId);
            return ResponseEntity.ok().body("Cancelled reservation successfully");
        } catch (Exception e) {
            log.error("Error cancelling reservation - ID: {}, Error: {}", reservationId, e.getMessage(), e);
            throw e;
        }
    }

}
