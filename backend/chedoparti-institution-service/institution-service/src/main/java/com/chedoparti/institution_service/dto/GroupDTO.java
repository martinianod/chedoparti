package com.chedoparti.institution_service.dto;

import lombok.Data;
import java.util.Set;

@Data
public class GroupDTO {
    private Long id;
    private String name;
    private String sport;
    private Long coachId;
    private Set<Long> studentIds;
    private boolean isArchived;
    private Long institutionId;
}
