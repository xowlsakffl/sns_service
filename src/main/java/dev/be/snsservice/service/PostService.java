package dev.be.snsservice.service;

import dev.be.snsservice.exception.ErrorCode;
import dev.be.snsservice.exception.SnsApplicationException;
import dev.be.snsservice.model.AlarmArgs;
import dev.be.snsservice.model.AlarmType;
import dev.be.snsservice.model.Comment;
import dev.be.snsservice.model.Post;
import dev.be.snsservice.model.entity.*;
import dev.be.snsservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostEntityRepository postEntityRepository;
    private final UserEntityRepository userEntityRepository;
    private final LikeEntityRepository likeEntityRepository;
    private final CommentEntityRepository commentEntityRepository;
    private final AlarmEntityRepository alarmEntityRepository;

    @Transactional
    public void create(String title, String body, String username){
        UserEntity userEntity = userEntityRepository.findByUsername(username).orElseThrow(() -> new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));

        postEntityRepository.save(PostEntity.of(title, body, userEntity));
    }

    @Transactional
    public Post modify(String title, String body, String username, Integer postId){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);
        // post permission
        if(postEntity.getUser() != userEntity){
            throw new SnsApplicationException(ErrorCode.INVALID_PERMISSION, String.format("%s has no permission with %s", username, postId));
        }

        postEntity.setTitle(title);
        postEntity.setBody(body);

        return Post.fromEntity(postEntityRepository.save(postEntity));
    }

    @Transactional
    public void delete(String username,Integer postId){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);

        if(postEntity.getUser() != userEntity){
            throw new SnsApplicationException(ErrorCode.INVALID_PERMISSION, String.format("%s has no permission with %s", username, postId));
        }

        likeEntityRepository.deleteAllByPost(postEntity);
        commentEntityRepository.deleteAllByPost(postEntity);
        postEntityRepository.delete(postEntity);
    }

    public Page<Post> list(Pageable pageable){
        return postEntityRepository.findAll(pageable).map(Post::fromEntity);
    }

    public Page<Post> my(String username, Pageable pageable){
        UserEntity userEntity = userEntityRepository.findByUsername(username).orElseThrow(() -> new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));

        return postEntityRepository.findAllByUser(userEntity, pageable).map(Post::fromEntity);
    }

    @Transactional
    public void like(Integer postId, String username){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);

        // check liked
        likeEntityRepository.findByUserAndPost(userEntity, postEntity).ifPresent(it -> {
            throw new SnsApplicationException(ErrorCode.ALREADY_LIKED, String.format("username %s already like post %d", username, postId));
        });

        likeEntityRepository.save(LikeEntity.of(userEntity, postEntity));

        alarmEntityRepository.save(AlarmEntity.of(postEntity.getUser(), AlarmType.NEW_LIKE_ON_POST, new AlarmArgs(userEntity.getId(), postEntity.getId())));
    }

    public long likeCount(Integer postId){
        PostEntity postEntity = getPostEntityOrException(postId);

        // count liked
        return likeEntityRepository.countByPost(postEntity);
    }

    @Transactional
    public void comment(Integer postId, String username, String comment){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);

        // comment save
        commentEntityRepository.save(CommentEntity.of(userEntity, postEntity, comment));

        alarmEntityRepository.save(AlarmEntity.of(postEntity.getUser(), AlarmType.NEW_COMMENT_ON_POST, new AlarmArgs(userEntity.getId(), postEntity.getId())));
    }

    public Page<Comment> getComments(Integer postId, Pageable pageable){
        PostEntity postEntity = getPostEntityOrException(postId);
        return commentEntityRepository.findAllByPost(postEntity, pageable).map(Comment::fromEntity);
    }

    private PostEntity getPostEntityOrException(Integer postId){
        return postEntityRepository.findById(postId).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.POST_NOT_FOUND, String.format("%s not found", postId)));
    }

    private UserEntity getUserEntityOrException(String username){
        return userEntityRepository.findByUsername(username).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));
    }
}
