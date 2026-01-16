package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "tournaments")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sport;
    private String category;
    private String gender;
    private String ageRange;
    private LocalDate date;
    private String inscription;
    private String status;
    private Integer participants;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;
}
