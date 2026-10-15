package com.vurbo.web;

import java.util.Objects;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ResponseStatusException.class)
	ResponseEntity<ApiError> status(ResponseStatusException exception) {
		String message = exception.getReason() == null ? "Não foi possível concluir o pedido." : exception.getReason();
		return ResponseEntity.status(exception.getStatusCode()).body(new ApiError(message));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getDefaultMessage())
				.filter(Objects::nonNull)
				.findFirst()
				.orElse("Dados inválidos.");
		return ResponseEntity.badRequest().body(new ApiError(message));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<ApiError> unreadable() {
		return ResponseEntity.badRequest().body(new ApiError("O pedido não está bem formado."));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	ResponseEntity<ApiError> conflict() {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("Esse registo já existe."));
	}
}
