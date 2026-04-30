package dev.be.snsservice.repository;

import dev.be.snsservice.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Repository
@RequiredArgsConstructor
public class UserCacheRepository {

    private final ObjectProvider<RedisTemplate<String, User>> userRedisTemplateProvider;
    private final static Duration USER_CACHE_TTL = Duration.ofDays(3);
    private final Map<String, User> localCache = new ConcurrentHashMap<>();

    public void setUser(User user) {
        String key = getKey(user.getUsername());
        RedisTemplate<String, User> redisTemplate = userRedisTemplateProvider.getIfAvailable();

        if (redisTemplate != null) {
            try {
                log.info("Set User to Redis {}({})", key, user);
                redisTemplate.opsForValue().set(key, user, USER_CACHE_TTL);
            } catch (Exception exception) {
                log.warn("Redis unavailable. Fallback to local cache for {}", key, exception);
            }
        }

        localCache.put(key, user);
    }

    public Optional<User> getUser(String username) {
        String key = getKey(username);
        RedisTemplate<String, User> redisTemplate = userRedisTemplateProvider.getIfAvailable();

        if (redisTemplate != null) {
            try {
                User data = redisTemplate.opsForValue().get(key);
                log.info("Get User from Redis {}", data);

                if (data != null) {
                    localCache.put(key, data);
                    return Optional.of(data);
                }
            } catch (Exception exception) {
                log.warn("Redis unavailable. Read user from local cache for {}", key, exception);
            }
        }

        return Optional.ofNullable(localCache.get(key));
    }

    private String getKey(String username) {
        return "UID:" + username;
    }
}
