package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private String website;

    @Embedded
    private Address address;

    @Embedded
    private Location location;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    private List<OpeningHour> openingHours;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    private List<SpecialClosure> specialClosures;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    private List<Court> courts;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    private List<Promotion> promotions;

    private String images;  // URL de las imágenes (podría ser lista de URLs)
    private String socialMediaLinks; // Redes sociales
    private Double rating;
    private String facilities; // Servicios adicionales como vestuarios, cafetería, etc.

}


