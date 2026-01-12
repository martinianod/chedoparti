package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "promotion_applications")
public class PromotionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ManyToOne
    @JoinColumn(name = "reservation_id")

    private Long reservationId;
    private Double discountApplied; // Monto de descuento aplicado
    private LocalDateTime appliedAt; // Cuándo se aplicó la promoción

}
