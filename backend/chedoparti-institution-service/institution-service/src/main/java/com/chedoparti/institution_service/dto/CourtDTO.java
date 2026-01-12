package com.chedoparti.institution_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourtDTO {

    private Long id;
    private String fieldType;
    private double pricePerHour;
    private boolean availability;
    private InstitutionDTO institution;

}
