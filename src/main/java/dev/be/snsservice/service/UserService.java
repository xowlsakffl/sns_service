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
                userEntityRepository.findByUsername(username)
                        .map(User::fromEntity)
                        .map(user -> {
                            userCacheRepository.setUser(user);
                            return user;
                        })
                        .orElseThrow(() ->
                                new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("username is %s", username)))
        );
    }

    @Transactional
    public User join(String username, String password){
        Optional<UserEntity> user = userEntityRepository.findByUsername(username);
        if(user.isPresent()){
            throw new SnsApplicationException(ErrorCode.DUPLICATED_USERNAME, String.format("%s is duplicated", username));
        }

        UserEntity userEntity = userEntityRepository.save(UserEntity.of(username, encoder.encode(password)));

        return User.fromEntity(userEntity);
    }

    public String login(String username, String password){
        User user = loadUserByUsername(username);

        if(!encoder.matches(password, user.getPassword())){
            throw new SnsApplicationException(ErrorCode.INVALID_PASSWORD);
        }

        userCacheRepository.setUser(user);
        return JwtTokenUtils.generateToken(username, secretKey, expiredTimeMs);
    }

    public Page<Alarm> alarmList(Integer userId, Pageable pageable) {
        return alarmEntityRepository.findAllByUserId(userId, pageable).map(Alarm::fromEntity);
    }
}
