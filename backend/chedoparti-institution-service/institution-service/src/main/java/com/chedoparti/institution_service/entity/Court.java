package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "courts")
public class Court {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fieldType;
    private double pricePerHour;
    private boolean availability;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;

}
