package com.dorriss.vey.common.exception;

import com.dorriss.vey.common.response.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice(basePackages = {"com.dorriss.vey"})
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(
            ApiException ex, HttpServletRequest request) {
        ErrorCode ec = ex.getErrorCode();
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec.getCode(), ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));

        ErrorCode ec = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity.status(ec.getStatus())
                .body(
                        buildError(
                                ec.getCode(),
                                ec.getDefaultMessage(),
                                request.getRequestURI(),
                                errors));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }

        ErrorCode ec = ErrorCode.VALIDATION_ERROR;
        ApiResponse<Object> body =
                buildError(ec.getCode(), ec.getDefaultMessage(), extractPath(request), errors);
        return new ResponseEntity<>(body, ec.getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        ErrorCode ec = ErrorCode.MALFORMED_JSON;
        ApiResponse<Object> body =
                buildError(ec.getCode(), ec.getDefaultMessage(), extractPath(request), null);
        return new ResponseEntity<>(body, ec.getStatus());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("DataIntegrityViolation: {}", ex.getMessage());
        ErrorCode ec = ErrorCode.DUPLICATE_RESOURCE;
        return ResponseEntity.status(ec.getStatus())
                .body(
                        buildError(
                                ec.getCode(),
                                ec.getDefaultMessage(),
                                request.getRequestURI(),
                                null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error:", ex);
        ErrorCode ec = ErrorCode.UNEXPECTED_ERROR;
        return ResponseEntity.status(ec.getStatus())
                .body(
                        buildError(
                                ec.getCode(),
                                ec.getDefaultMessage(),
                                request.getRequestURI(),
                                null));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex,
            Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        HttpStatus status = HttpStatus.resolve(statusCode.value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        ErrorCode ec = mapErrorCode(status);

        ApiResponse<Object> resp =
                buildError(ec.getCode(), ec.getDefaultMessage(), extractPath(request), null);
        return new ResponseEntity<>(resp, headers, status);
    }

    private ApiResponse<Object> buildError(
            int code, String message, String path, Map<String, String> errors) {
        return ApiResponse.<Object>builder()
                .code(code)
                .message(message)
                .result(null)
                .errors(errors)
                .timestamp(Instant.now())
                .path(path)
                .build();
    }

    private String extractPath(WebRequest request) {
        String desc = request.getDescription(false);
        if (desc == null) {
            return null;
        }
        return desc.startsWith("uri=") ? desc.substring(4) : desc;
    }

    private ErrorCode mapErrorCode(HttpStatus status) {
        int s = status.value();

        switch (s) {
            case 400:
                return ErrorCode.REQUEST_FAILED;
            case 401:
                return ErrorCode.UNAUTHENTICATED;
            case 403:
                return ErrorCode.FORBIDDEN_ACTION;
            case 404:
                return ErrorCode.RESOURCE_NOT_FOUND;
            case 415:
                return ErrorCode.UNSUPPORTED_MEDIA_TYPE;
            case 429:
                return ErrorCode.TOO_MANY_REQUESTS;
            default:
                if (status.is4xxClientError()) {
                    return ErrorCode.REQUEST_FAILED;
                }
                return ErrorCode.UNEXPECTED_ERROR;
        }
    }
}
