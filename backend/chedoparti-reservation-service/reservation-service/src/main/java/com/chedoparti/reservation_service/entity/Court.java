package com.chedoparti.reservation_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courts")
public class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String sportType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;
    
    @Column(name = "is_indoor")
    private boolean indoor = false;
    
    private String surfaceType;
    private Integer capacity;
    
    @Lob
    @Column(length = 1000)
    private String amenities; // JSON string of amenities
    
    @Column(name = "base_price_per_hour", precision = 10, scale = 2)
    private BigDecimal basePricePerHour;
    
    @Column(name = "is_active")
    private boolean active = true;
    
    @Column(length = 1000)
    private String imageUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
