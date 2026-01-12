package com.chedoparti.institution_service.dto;

import com.chedoparti.institution_service.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InstitutionDTO {
    private Long id;

    private String name;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private String website;

    private Address address;

    private Location location;

    private List<OpeningHour> openingHours;

    private List<SpecialClosure> specialClosures;

    private List<CourtDTO> courts;

    private List<PromotionDTO> promotions;

    private String images;  // URL de las imágenes (podría ser lista de URLs)
    private String socialMediaLinks; // Redes sociales
    private Double rating;
    private String facilities; // Servicios adicionales como vestuarios, cafetería, etc.
}
