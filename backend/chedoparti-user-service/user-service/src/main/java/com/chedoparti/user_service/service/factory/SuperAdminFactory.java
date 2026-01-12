package com.chedoparti.user_service.service.factory;

import com.chedoparti.user_service.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SuperAdminFactory implements UserFactory {
    @Override
    public User createUser(String username, String password) {
        return null;
    }
}
