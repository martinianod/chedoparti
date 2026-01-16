package com.chedoparti.user_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String level;
    private String sport;
    private Boolean isMember;
    private Long coachId;
    private Long institutionId;
}
