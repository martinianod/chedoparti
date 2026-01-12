package com.chedoparti.payment_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class RefundNotFoundException extends RuntimeException{
    public RefundNotFoundException(String message) {
        super(message);
    }
}