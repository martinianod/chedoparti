package com.chedoparti.user_service.util;

import com.chedoparti.user_service.entity.Permission;
import com.chedoparti.user_service.entity.Role;
import com.chedoparti.user_service.enums.ERole;
import com.chedoparti.user_service.repository.PermissionRepository;
import com.chedoparti.user_service.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) throws Exception {

        // Crear y guardar permisos
       /* Permission createSportsEvent = new Permission();
        createSportsEvent.setName("Crear encuentros deportivos");
        createSportsEvent.setDescription("Permite a los administradores de grupos de amigos crear nuevos eventos deportivos.");
        permissionRepository.save(createSportsEvent);

        Permission reserveCourt = new Permission();
        reserveCourt.setName("Reservar turno de cancha");
        reserveCourt.setDescription("Permite a los amigos/jugadores reservar turnos de cancha.");
        permissionRepository.save(reserveCourt);

        Permission manageTournaments = new Permission();
        manageTournaments.setName("Gestionar torneos");
        manageTournaments.setDescription("Permite a los administradores de instituciones gestionar torneos y eventos deportivos.");
        permissionRepository.save(manageTournaments);

        Permission advertiseClasses = new Permission();
        advertiseClasses.setName("Publicitar clases");
        advertiseClasses.setDescription("Permite a los entrenadores publicitar sus clases y eventos deportivos.");
        permissionRepository.save(advertiseClasses);

        // Crear y guardar roles con permisos asociados
        Role adminRole = new Role();
        adminRole.setName(ERole.ROLE_GROUP_ADMIN);
        adminRole.setDescription("Rol para administradores de grupos de amigos.");
        adminRole.getPermissions().add(createSportsEvent);
        //adminRole.getPermissions().add(reserveCourt);
        roleRepository.save(adminRole);

        Role playerRole = new Role();
        playerRole.setName(ERole.ROLE_USER);
        playerRole.setDescription("Rol para amigos y jugadores.");
        playerRole.getPermissions().add(reserveCourt);
        roleRepository.save(playerRole);

        Role institutionAdminRole = new Role();
        institutionAdminRole.setName(ERole.ROLE_INSTITUTION_ADMIN);
        institutionAdminRole.setDescription("Rol para administradores de instituciones (canchas, torneos).");
        institutionAdminRole.getPermissions().add(manageTournaments);
        roleRepository.save(institutionAdminRole);

        Role coachRole = new Role();
        coachRole.setName(ERole.ROLE_TRAINER);
        coachRole.setDescription("Rol para entrenadores que ofrecen clases y eventos deportivos.");
        coachRole.getPermissions().add(advertiseClasses);
        roleRepository.save(coachRole);*/

        // Otros roles y permisos según sea necesario

        // Puedes agregar más roles y permisos según la estructura definida
    }
}
