package com.chedoparti.institution_service.repository;

import com.chedoparti.institution_service.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByInstitutionId(Long institutionId);
    List<Tournament> findBySport(String sport);
    List<Tournament> findByStatus(String status);
}
