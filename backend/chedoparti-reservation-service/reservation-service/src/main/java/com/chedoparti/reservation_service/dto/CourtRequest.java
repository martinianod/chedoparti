package com.chedoparti.reservation_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Sport type is required")
    private String sportType;
    
    @NotBlank(message = "Institution ID is required")
    private String institutionId;
    
    @NotNull(message = "Price per hour is required")
    @Positive(message = "Price per hour must be positive")
    private BigDecimal pricePerHour;
    
    @NotBlank(message = "Opening time is required")
    private String openingTime;
    
    @NotBlank(message = "Closing time is required")
    private String closingTime;
}
