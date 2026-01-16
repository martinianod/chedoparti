package com.chedoparti.user_service.repository;

import com.chedoparti.user_service.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCoachId(Long coachId);
    List<Student> findByCoachIdAndLevel(Long coachId, String level);
    List<Student> findByCoachIdAndSport(Long coachId, String sport);
}
