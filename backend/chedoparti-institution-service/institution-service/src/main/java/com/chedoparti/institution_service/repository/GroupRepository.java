package com.chedoparti.institution_service.repository;

import com.chedoparti.institution_service.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCoachId(Long coachId);
    List<Group> findByCoachIdAndIsArchived(Long coachId, boolean isArchived);
    List<Group> findByCoachIdAndSport(Long coachId, String sport);
}
