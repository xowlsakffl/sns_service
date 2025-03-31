package dev.be.snsservice.controller.response;

import dev.be.snsservice.model.User;
import dev.be.snsservice.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginResponse {

    private String token;
}
