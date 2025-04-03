package dev.be.snsservice.fixture;

import dev.be.snsservice.model.entity.UserEntity;

public class UserEntityFixture {

    public static UserEntity get(String userName, String password, Integer userId) {
        UserEntity entity = new UserEntity();
        entity.setId(userId);
        entity.setUsername(userName);
        entity.setPassword(password);

        return entity;
    }
}
