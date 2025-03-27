package dev.be.snsservice.service;

import dev.be.snsservice.exception.SnsApplicationException;
import dev.be.snsservice.model.User;
import dev.be.snsservice.model.entity.UserEntity;
import dev.be.snsservice.repository.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserEntityRepository userEntityRepository;

    public User join(String username, String password){
        // 회원가입 userName이 이미 있는지
        Optional<UserEntity> userEntity = userEntityRepository.findByUserName(username);

        // 회원가입 진행
        userEntityRepository.save(new UserEntity());

        return new User();
    }

    public String login(String username, String password){
        // 회원가입 여부 체크
        UserEntity userEntity = userEntityRepository.findByUserName(username).orElseThrow(SnsApplicationException::new);

        // 비밀번호 체크
        if(!userEntity.getPassword().equals(password)){
            throw new SnsApplicationException();
        }

        // 토큰 생성

        return "";
    }
}
