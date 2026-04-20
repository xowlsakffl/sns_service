package dev.be.snsservice.controller.response;

import dev.be.snsservice.model.Post;
import dev.be.snsservice.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.sql.Timestamp;

@Getter
@AllArgsConstructor
public class PostResponse {
    private Integer id;
    private String title;
    private String body;
    private UserResponse user;
    private boolean blinded;
    private Timestamp blindedAt;
    private Timestamp registeredAt;
    private Timestamp updatedAt;
    private Timestamp deletedAt;

    public static PostResponse fromPost(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getBody(),
                UserResponse.fromUser(post.getUser()),
                post.isBlinded(),
                post.getBlindedAt(),
                post.getRegisteredAt(),
                post.getUpdatedAt(),
                post.getDeletedAt()
        );
    }
}
