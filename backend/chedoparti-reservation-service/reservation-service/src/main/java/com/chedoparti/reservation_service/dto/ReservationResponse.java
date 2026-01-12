package com.chedoparti.reservation_service.dto;

import com.chedoparti.reservation_service.enums.PaymentMethod;
import com.chedoparti.reservation_service.enums.RecurrenceFrequency;
import com.chedoparti.reservation_service.enums.ReservationStatus;
import com.chedoparti.reservation_service.enums.ReservationType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ReservationResponse {
    private String id;
    private String userId;
    private String userName; // Nombre del usuario que hizo la reserva
    private String courtId;
    private String courtName; // Nombre de la cancha
    private String institutionId;
    private String institutionName; // Nombre de la institución
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private ReservationStatus status;
    private ReservationType reservationType;
    private Integer numberOfPlayers;
    private String notes;
    private boolean recurring;
    private RecurrenceFrequency recurrenceFrequency;
    private LocalDate recurrenceEndDate;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private PaymentMethod paymentMethod;
    private String paymentStatus;
    private String cancellationReason;
    private String cancelledBy;
    private LocalDateTime cancellationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String currency;
    private BigDecimal discountAmount;
    private String discountReason;
    private String promoCode;
    private boolean automaticLock;
    private String paymentReceiptUrl;
    private String externalEventId;
}
