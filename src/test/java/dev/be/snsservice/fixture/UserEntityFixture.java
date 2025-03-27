package dev.be.snsservice.fixture;

import dev.be.snsservice.model.entity.UserEntity;

public class UserEntityFixture {

    public static UserEntity get(String userName, String password) {
        UserEntity entity = new UserEntity();
        entity.setId(1);
        entity.setUsername(userName);
        entity.setPassword(password);

        return entity;
    }
}
