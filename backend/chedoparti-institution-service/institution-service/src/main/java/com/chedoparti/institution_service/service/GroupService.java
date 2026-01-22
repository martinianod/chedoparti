package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.GroupDTO;
import com.chedoparti.institution_service.entity.Group;
import com.chedoparti.institution_service.repository.GroupRepository;
import com.chedoparti.institution_service.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private InstitutionRepository institutionRepository;

    public List<GroupDTO> findByCoach(Long coachId, Boolean includeArchived, String sport) {
        List<Group> groups;
        
        if (sport != null) {
            groups = groupRepository.findByCoachIdAndSport(coachId, sport);
        } else if (includeArchived != null && !includeArchived) {
            groups = groupRepository.findByCoachIdAndIsArchived(coachId, false);
        } else {
            groups = groupRepository.findByCoachId(coachId);
        }
        
        return groups.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public GroupDTO findById(Long id) {
        return groupRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public GroupDTO create(GroupDTO dto) {
        Group group = new Group();
        group.setName(dto.getName());
        group.setSport(dto.getSport());
        group.setCoachId(dto.getCoachId());
        group.setStudentIds(dto.getStudentIds() != null ? dto.getStudentIds() : new HashSet<>());
        group.setArchived(false);
        
        if (dto.getInstitutionId() != null) {
            institutionRepository.findById(dto.getInstitutionId())
                .ifPresent(group::setInstitution);
        }
        
        return toDTO(groupRepository.save(group));
    }

    public GroupDTO update(Long id, GroupDTO dto) {
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        
        if (dto.getName() != null) group.setName(dto.getName());
        if (dto.getSport() != null) group.setSport(dto.getSport());
        if (dto.getStudentIds() != null) group.setStudentIds(dto.getStudentIds());
        
        return toDTO(groupRepository.save(group));
    }

    public GroupDTO archive(Long id) {
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setArchived(true);
        return toDTO(groupRepository.save(group));
    }

    public GroupDTO restore(Long id) {
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setArchived(false);
        return toDTO(groupRepository.save(group));
    }

    public GroupDTO duplicate(Long id) {
        Group original = groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        
        Group duplicate = new Group();
        duplicate.setName(original.getName() + " (Copia)");
        duplicate.setSport(original.getSport());
        duplicate.setCoachId(original.getCoachId());
        duplicate.setStudentIds(new HashSet<>());
        duplicate.setArchived(false);
        duplicate.setInstitution(original.getInstitution());
        
        return toDTO(groupRepository.save(duplicate));
    }

    public GroupDTO addStudent(Long groupId, Long studentId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        group.getStudentIds().add(studentId);
        return toDTO(groupRepository.save(group));
    }

    public GroupDTO removeStudent(Long groupId, Long studentId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        group.getStudentIds().remove(studentId);
        return toDTO(groupRepository.save(group));
    }

    public GroupDTO reorderStudents(Long groupId, List<Long> studentIds) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setStudentIds(new HashSet<>(studentIds));
        return toDTO(groupRepository.save(group));
    }

    private GroupDTO toDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setSport(group.getSport());
        dto.setCoachId(group.getCoachId());
        dto.setStudentIds(group.getStudentIds());
        dto.setArchived(group.isArchived());
        if (group.getInstitution() != null) {
            dto.setInstitutionId(group.getInstitution().getId());
        }
        return dto;
    }
}
