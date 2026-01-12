package com.chedoparti.reservation_service.exception;

import org.springframework.http.HttpStatus;

import java.util.List;

public class ValidationException extends BaseException {
    private final List<String> errors;

    public ValidationException(String message, List<String> errors) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
