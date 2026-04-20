package dev.be.snsservice.controller.request;

import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public class UserLoginRequest {

    @NotBlank(message = "name is required")
    private String name;
    @NotBlank(message = "password is required")
    private String password;
}
