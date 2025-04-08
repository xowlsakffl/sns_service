package dev.be.snsservice.service;

import dev.be.snsservice.exception.ErrorCode;
import dev.be.snsservice.exception.SnsApplicationException;
import dev.be.snsservice.model.Alarm;
import dev.be.snsservice.model.User;
import dev.be.snsservice.model.entity.UserEntity;
import dev.be.snsservice.repository.AlarmEntityRepository;
import dev.be.snsservice.repository.UserCacheRepository;
import dev.be.snsservice.repository.UserEntityRepository;
import dev.be.snsservice.util.JwtTokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserEntityRepository userEntityRepository;
    private final AlarmEntityRepository alarmEntityRepository;
    private final BCryptPasswordEncoder encoder;
    private final UserCacheRepository userCacheRepository;

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.token.expired-time-ms}")
    private Long expiredTimeMs;

    public User loadUserByUsername(String username) {
        return userCacheRepository.getUser(username).orElseGet(() ->
            userEntityRepository.findByUsername(username).map(User::fromEntity).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("username is %s", username)))
        );
    }

    @Transactional
    public User join(String username, String password){
        // 회원가입 username이 이미 있는지
        Optional<UserEntity> user = userEntityRepository.findByUsername(username);
        if(user.isPresent()){
            throw new SnsApplicationException(ErrorCode.DUPLICATED_USERNAME, String.format("%s is duplicated", username));
        }

        // 회원가입 진행
        UserEntity userEntity = userEntityRepository.save(UserEntity.of(username, encoder.encode(password)));

        return User.fromEntity(userEntity);
    }

    public String login(String username, String password){
        // 회원가입 여부 체크
        User user = loadUserByUsername(username);
        userCacheRepository.setUser(user);

        // 비밀번호 체크
        if(!encoder.matches(password, user.getPassword())){
            throw new SnsApplicationException(ErrorCode.INVALID_PASSWORD);
        }

        // 토큰 생성

        return JwtTokenUtils.generateToken(username, secretKey, expiredTimeMs);
    }

    public Page<Alarm> alarmList(Integer userId, Pageable pageable) {
        return alarmEntityRepository.findAllByUserId(userId, pageable).map(Alarm::fromEntity);
    }
}
