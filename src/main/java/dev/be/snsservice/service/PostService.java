package dev.be.snsservice.service;

import dev.be.snsservice.exception.ErrorCode;
import dev.be.snsservice.exception.SnsApplicationException;
import dev.be.snsservice.model.Post;
import dev.be.snsservice.model.entity.PostEntity;
import dev.be.snsservice.model.entity.UserEntity;
import dev.be.snsservice.repository.PostEntityRepository;
import dev.be.snsservice.repository.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostEntityRepository postEntityRepository;
    private final UserEntityRepository userEntityRepository;

    @Transactional
    public void create(String title, String body, String username){
        UserEntity userEntity = userEntityRepository.findByUsername(username).orElseThrow(() -> new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));

        postEntityRepository.save(PostEntity.of(title, body, userEntity));
    }

    @Transactional
    public Post modify(String title, String body, String username, Integer postId){
        UserEntity userEntity = userEntityRepository.findByUsername(username).orElseThrow(() -> new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));
        // post exist
        PostEntity postEntity = postEntityRepository.findById(postId).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.POST_NOT_FOUND, String.format("%s not found", postId)));
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
        UserEntity userEntity = userEntityRepository.findByUsername(username).orElseThrow(() -> new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));
        // post exist
        PostEntity postEntity = postEntityRepository.findById(postId).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.POST_NOT_FOUND, String.format("%s not found", postId)));

        if(postEntity.getUser() != userEntity){
            throw new SnsApplicationException(ErrorCode.INVALID_PERMISSION, String.format("%s has no permission with %s", username, postId));
        }

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

    }
}
