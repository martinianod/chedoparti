package com.chedoparti.user_service.service.factory;

import com.chedoparti.user_service.enums.ERole;
import com.chedoparti.user_service.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
@Slf4j
public class UserFactoryProvider {

    private final Map<ERole, UserFactory> factoryMap = new EnumMap<>(ERole.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private GroupAdminFactory groupAdminFactory;

    @Autowired
    private TrainerFactory trainerFactory;

    @Autowired
    private SuperAdminFactory superAdminFactory;

    @Autowired
    private InstitutionAdminFactory institutionAdminFactory;

    @Autowired
    private UserFactoryImpl userFactory;

    @PostConstruct
    public void init() {
        roleRepository.findAll().forEach(role -> {
            switch (role.getName()) {
                case ROLE_GROUP_ADMIN:
                    factoryMap.put(ERole.ROLE_GROUP_ADMIN, groupAdminFactory);
                    break;
                case ROLE_TRAINER:
                    factoryMap.put(ERole.ROLE_TRAINER, trainerFactory);
                    break;
                case ROLE_SUPER_ADMIN:
                    factoryMap.put(ERole.ROLE_SUPER_ADMIN, superAdminFactory);
                    break;
                case ROLE_INSTITUTION_ADMIN:
                    factoryMap.put(ERole.ROLE_INSTITUTION_ADMIN, institutionAdminFactory);
                    break;
                case ROLE_USER:
                    factoryMap.put(ERole.ROLE_USER, userFactory);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown role: " + role.getName());
            }
        });
    }

    public UserFactory getFactory(ERole role) {
        UserFactory factory = factoryMap.get(role);
        if (factory == null) {
            throw new IllegalArgumentException("Unknown role: " + role);
        }
        return factory;
    }
}
