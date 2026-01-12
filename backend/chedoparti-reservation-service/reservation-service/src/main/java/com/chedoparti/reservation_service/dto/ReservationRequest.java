package com.chedoparti.reservation_service.dto;

import com.chedoparti.reservation_service.enums.PaymentMethod;
import com.chedoparti.reservation_service.enums.RecurrenceFrequency;
import com.chedoparti.reservation_service.enums.ReservationType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservationRequest {
    @NotNull(message = "User ID is required")
    private String userId;
    
    @NotNull(message = "Court ID is required")
    private String courtId;
    
    @FutureOrPresent(message = "Reservation date must be in the present or future")
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @NotNull(message = "Reservation type is required")
    private ReservationType reservationType = ReservationType.INDIVIDUAL;
    
    @Positive(message = "Number of players must be positive")
    private Integer numberOfPlayers = 1;
    
    private String notes;
    
    private boolean recurring = false;
    
    private RecurrenceFrequency recurrenceFrequency;
    
    private LocalDate recurrenceEndDate;
    
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;
    
    private PaymentMethod paymentMethod;
    
    private String promoCode;
    
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    private String discountReason;
    
    private String currency = "USD";
}
