package com.chedoparti.user_service.service.factory;

import com.chedoparti.user_service.entity.User;

public interface UserFactory {
    User createUser(String username, String password);
}
