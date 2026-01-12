package com.chedoparti.user_service.repository;

import com.chedoparti.user_service.entity.Role;
import com.chedoparti.user_service.enums.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
