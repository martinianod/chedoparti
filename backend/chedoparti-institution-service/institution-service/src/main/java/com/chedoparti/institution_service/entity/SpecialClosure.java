package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "special_closure")
public class SpecialClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String reason;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;

}

