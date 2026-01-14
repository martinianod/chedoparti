package com.chedoparti.institution_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TournamentDTO {
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
    private Long institutionId;
}
