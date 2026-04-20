package dev.be.snsservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    DUPLICATED_USERNAME(HttpStatus.CONFLICT, "Username is duplicated"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    INVALID_PASSWORD(HttpStatus.NOT_FOUND, "Password is invalid"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid token"),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "Post not found"),
    INVALID_PERMISSION(HttpStatus.UNAUTHORIZED, "Invalid permission"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    ALREADY_REPORTED(HttpStatus.CONFLICT, "User already reported this post"),
    POST_BLINDED(HttpStatus.FORBIDDEN, "Post is blinded"),
    REPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "Report not found"),

    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"),
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurs in database"),
    ALREADY_LIKED(HttpStatus.CONFLICT, "User already liked"),
    ALARM_CONNECT_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "alarm connect error"),
    ;

    private final HttpStatus status;
    private final String message;
}
