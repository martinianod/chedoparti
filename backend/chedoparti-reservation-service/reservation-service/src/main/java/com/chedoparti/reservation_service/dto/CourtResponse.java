package com.chedoparti.reservation_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtResponse {
    private String id;
    private String name;
    private String sportType;
    private String institutionId;
    private String institutionName;
    private boolean indoor;
    private String surfaceType;
    private Integer capacity;
    private String amenities;
    private BigDecimal basePricePerHour;
    private boolean active;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
