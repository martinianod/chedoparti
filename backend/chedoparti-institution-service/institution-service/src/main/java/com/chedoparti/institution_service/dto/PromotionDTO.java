package com.chedoparti.institution_service.dto;

import com.chedoparti.institution_service.entity.Institution;
import com.chedoparti.institution_service.enums.EPromotionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionDTO {
    private Long id;
    private String name; // Nombre de la promoción
    private String description; // Descripción breve
    private Double discountPercentage; // Porcentaje de descuento
    private LocalDate startDate; // Fecha de inicio de la promoción
    private LocalDate endDate; // Fecha de fin de la promoción
    private EPromotionType promotionType; // Tipo de promoción (por volumen, por horario, etc.)
    private Institution institution;
}
