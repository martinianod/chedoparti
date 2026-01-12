package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "opening_hour")
public class OpeningHour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dayOfWeek;
    private String openTime;
    private String closeTime;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;

}

