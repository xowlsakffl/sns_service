package dev.be.snsservice.fixture;

import dev.be.snsservice.model.entity.PostEntity;
import dev.be.snsservice.model.entity.UserEntity;

public class PostEntityFixture {

    public static PostEntity get(String userName, Integer postId) {
        UserEntity user = new UserEntity();
        user.setId(1);
        user.setUsername(userName);

        PostEntity result = new PostEntity();
        result.setUser(user);
        result.setId(postId);

        return result;
    }
}
