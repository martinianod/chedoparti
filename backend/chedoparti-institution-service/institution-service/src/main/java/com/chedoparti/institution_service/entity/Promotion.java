package com.chedoparti.institution_service.entity;

import com.chedoparti.institution_service.enums.EPromotionType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Nombre de la promoción
    private String description; // Descripción breve
    private Double discountPercentage; // Porcentaje de descuento
    private LocalDate startDate; // Fecha de inicio de la promoción
    private LocalDate endDate; // Fecha de fin de la promoción
    private EPromotionType promotionType; // Tipo de promoción (por volumen, por horario, etc.)

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;



}

