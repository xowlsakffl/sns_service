package dev.be.snsservice.controller;

import dev.be.snsservice.controller.request.UserJoinRequest;
import dev.be.snsservice.controller.request.UserLoginRequest;
import dev.be.snsservice.controller.response.Response;
import dev.be.snsservice.controller.response.UserJoinResponse;
import dev.be.snsservice.controller.response.UserLoginResponse;
import dev.be.snsservice.model.User;
import dev.be.snsservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/join")
    public Response<UserJoinResponse> join(@RequestBody UserJoinRequest request){
        User user = userService.join(request.getName(), request.getPassword());
        return Response.success(UserJoinResponse.fromUser(user));
    }

    @PostMapping("/login")
    public Response<UserLoginResponse> login(@RequestBody UserLoginRequest request){
        String token = userService.login(request.getName(), request.getPassword());
        return Response.success(new UserLoginResponse(token));
    }
}
