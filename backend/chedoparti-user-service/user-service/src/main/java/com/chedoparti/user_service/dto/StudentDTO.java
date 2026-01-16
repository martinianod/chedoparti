package com.chedoparti.user_service.dto;

import lombok.Data;

@Data
public class StudentDTO {
    private Long id;
    private String name;
    private String email;
    private String level;
    private String sport;
    private Boolean isMember;
    private Long coachId;
    private Long institutionId;
}
