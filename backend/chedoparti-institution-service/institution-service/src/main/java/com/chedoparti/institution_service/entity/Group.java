package com.chedoparti.institution_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sport;
    private Long coachId;
    
    @ElementCollection
    @CollectionTable(name = "group_students", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "student_id")
    private Set<Long> studentIds = new HashSet<>();
    
    private boolean isArchived = false;

    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;
}
