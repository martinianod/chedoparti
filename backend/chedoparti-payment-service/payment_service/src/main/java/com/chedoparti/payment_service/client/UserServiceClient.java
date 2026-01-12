package com.chedoparti.payment_service.client;

import com.chedoparti.payment_service.config.FeignConfig;
import com.chedoparti.payment_service.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service", configuration = FeignConfig.class)
public interface UserServiceClient {
    @GetMapping("/users/{id}")
    UserResponse getUserById(@PathVariable("id") UUID id);
}
