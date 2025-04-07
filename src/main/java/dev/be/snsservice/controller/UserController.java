package dev.be.snsservice.controller;

import dev.be.snsservice.controller.request.UserJoinRequest;
import dev.be.snsservice.controller.request.UserLoginRequest;
import dev.be.snsservice.controller.response.AlarmResponse;
import dev.be.snsservice.controller.response.Response;
import dev.be.snsservice.controller.response.UserJoinResponse;
import dev.be.snsservice.controller.response.UserLoginResponse;
import dev.be.snsservice.exception.ErrorCode;
import dev.be.snsservice.exception.SnsApplicationException;
import dev.be.snsservice.model.User;
import dev.be.snsservice.service.UserService;
import dev.be.snsservice.util.ClassUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/join")
    public Response<UserJoinResponse> join(@RequestBody UserJoinRequest request){
        System.out.println("Request Name: " + request.getName());
        System.out.println("Request Password: " + request.getPassword());

        User user = userService.join(request.getName(), request.getPassword());
        return Response.success(UserJoinResponse.fromUser(user));
    }

    @PostMapping("/login")
    public Response<UserLoginResponse> login(@RequestBody UserLoginRequest request){
        String token = userService.login(request.getName(), request.getPassword());
        return Response.success(new UserLoginResponse(token));
    }

    @GetMapping("/alarm")
    public Response<Page<AlarmResponse>> alarm(Pageable pageable, Authentication authentication){
        User user = ClassUtils.getSafeCastInstance(authentication.getPrincipal(), User.class).orElseThrow(() -> new SnsApplicationException(ErrorCode.INTERNAL_SERVER_ERROR, "Casting to User class failed"));
        return Response.success(userService.alarmList(user.getId(), pageable).map(AlarmResponse::fromAlarm));
    }
}
