package com.chedoparti.payment_service.repository;

import com.chedoparti.payment_service.entity.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DebtRepository extends JpaRepository<Debt, UUID> {
}
