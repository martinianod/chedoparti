package com.chedoparti.reservation_service.repository;

import com.chedoparti.reservation_service.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourtRepository extends JpaRepository<Court, String> {
}
