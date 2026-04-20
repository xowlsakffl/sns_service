package dev.be.snsservice.service;

import dev.be.snsservice.exception.ErrorCode;
import dev.be.snsservice.exception.SnsApplicationException;
import dev.be.snsservice.model.AlarmArgs;
import dev.be.snsservice.model.AlarmType;
import dev.be.snsservice.model.Comment;
import dev.be.snsservice.model.Post;
import dev.be.snsservice.model.PostReport;
import dev.be.snsservice.model.ReportStatus;
import dev.be.snsservice.model.UserRole;
import dev.be.snsservice.model.entity.AlarmEntity;
import dev.be.snsservice.model.entity.CommentEntity;
import dev.be.snsservice.model.entity.LikeEntity;
import dev.be.snsservice.model.entity.PostEntity;
import dev.be.snsservice.model.entity.PostReportEntity;
import dev.be.snsservice.model.entity.UserEntity;
import dev.be.snsservice.repository.AlarmEntityRepository;
import dev.be.snsservice.repository.CommentEntityRepository;
import dev.be.snsservice.repository.LikeEntityRepository;
import dev.be.snsservice.repository.PostEntityRepository;
import dev.be.snsservice.repository.PostReportEntityRepository;
import dev.be.snsservice.repository.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final long AUTO_BLIND_REPORT_THRESHOLD = 3L;

    private final PostEntityRepository postEntityRepository;
    private final UserEntityRepository userEntityRepository;
    private final LikeEntityRepository likeEntityRepository;
    private final CommentEntityRepository commentEntityRepository;
    private final AlarmEntityRepository alarmEntityRepository;
    private final PostReportEntityRepository postReportEntityRepository;
    private final AlarmService alarmService;

    @Transactional
    public void create(String title, String body, String username){
        UserEntity userEntity = getUserEntityOrException(username);
        postEntityRepository.save(PostEntity.of(title, body, userEntity));
    }

    @Transactional
    public Post modify(String title, String body, String username, Integer postId){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);

        if(!postEntity.getUser().getId().equals(userEntity.getId())){
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

        if(!postEntity.getUser().getId().equals(userEntity.getId())){
            throw new SnsApplicationException(ErrorCode.INVALID_PERMISSION, String.format("%s has no permission with %s", username, postId));
        }

        likeEntityRepository.deleteAllByPost(postEntity);
        commentEntityRepository.deleteAllByPost(postEntity);
        postEntityRepository.delete(postEntity);
    }

    public Page<Post> list(Pageable pageable){
        return postEntityRepository.findAllByBlindedFalse(pageable).map(Post::fromEntity);
    }

    public Page<Post> my(String username, Pageable pageable){
        UserEntity userEntity = getUserEntityOrException(username);
        return postEntityRepository.findAllByUser(userEntity, pageable).map(Post::fromEntity);
    }

    @Transactional
    public void like(Integer postId, String username){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);

        if (postEntity.isBlinded()) {
            throw new SnsApplicationException(ErrorCode.POST_BLINDED, String.format("post %d is blinded", postId));
        }

        likeEntityRepository.findByUserAndPost(userEntity, postEntity).ifPresent(it -> {
            throw new SnsApplicationException(ErrorCode.ALREADY_LIKED, String.format("username %s already like post %d", username, postId));
        });

        likeEntityRepository.save(LikeEntity.of(userEntity, postEntity));

        AlarmEntity alarmEntity = alarmEntityRepository.save(AlarmEntity.of(postEntity.getUser(), AlarmType.NEW_LIKE_ON_POST, new AlarmArgs(userEntity.getId(), postEntity.getId())));
        alarmService.send(alarmEntity.getId(), postEntity.getUser().getId());
    }

    public long likeCount(Integer postId){
        PostEntity postEntity = getPostEntityOrException(postId);
        return likeEntityRepository.countByPost(postEntity);
    }

    @Transactional
    public void comment(Integer postId, String username, String comment){
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity userEntity = getUserEntityOrException(username);

        if (postEntity.isBlinded()) {
            throw new SnsApplicationException(ErrorCode.POST_BLINDED, String.format("post %d is blinded", postId));
        }

        commentEntityRepository.save(CommentEntity.of(userEntity, postEntity, comment));

        AlarmEntity alarmEntity = alarmEntityRepository.save(AlarmEntity.of(postEntity.getUser(), AlarmType.NEW_COMMENT_ON_POST, new AlarmArgs(userEntity.getId(), postEntity.getId())));
        alarmService.send(alarmEntity.getId(), postEntity.getUser().getId());
    }

    public Page<Comment> getComments(Integer postId, Pageable pageable){
        PostEntity postEntity = getPostEntityOrException(postId);
        return commentEntityRepository.findAllByPost(postEntity, pageable).map(Comment::fromEntity);
    }

    @Transactional
    public void report(Integer postId, String reporterUsername, String reason) {
        PostEntity postEntity = getPostEntityOrException(postId);
        UserEntity reporter = getUserEntityOrException(reporterUsername);

        if (postEntity.getUser().getId().equals(reporter.getId())) {
            throw new SnsApplicationException(ErrorCode.INVALID_REQUEST, "can not report own post");
        }

        if (postReportEntityRepository.existsByPostAndReporterAndStatus(postEntity, reporter, ReportStatus.PENDING)) {
            throw new SnsApplicationException(ErrorCode.ALREADY_REPORTED, "already reported this post");
        }

        postReportEntityRepository.save(PostReportEntity.of(postEntity, reporter, reason));

        long pendingCount = postReportEntityRepository.countByPostAndStatus(postEntity, ReportStatus.PENDING);
        if (pendingCount >= AUTO_BLIND_REPORT_THRESHOLD && !postEntity.isBlinded()) {
            postEntity.blind();
        }
    }

    public Page<PostReport> reportList(String username, Pageable pageable) {
        getAdminUserEntityOrThrow(username);
        return postReportEntityRepository.findAll(pageable).map(PostReport::fromEntity);
    }

    @Transactional
    public void acceptAndBlind(Integer reportId, String adminUsername) {
        UserEntity admin = getAdminUserEntityOrThrow(adminUsername);
        PostReportEntity report = getPostReportEntityOrException(reportId);

        report.setStatus(ReportStatus.ACCEPTED);
        report.setProcessedByUser(admin);

        if (!report.getPost().isBlinded()) {
            report.getPost().blind();
        }
    }

    @Transactional
    public void rejectReport(Integer reportId, String adminUsername) {
        UserEntity admin = getAdminUserEntityOrThrow(adminUsername);
        PostReportEntity report = getPostReportEntityOrException(reportId);

        report.setStatus(ReportStatus.REJECTED);
        report.setProcessedByUser(admin);
    }

    private PostEntity getPostEntityOrException(Integer postId){
        return postEntityRepository.findById(postId).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.POST_NOT_FOUND, String.format("%s not found", postId)));
    }

    private PostReportEntity getPostReportEntityOrException(Integer reportId) {
        return postReportEntityRepository.findById(reportId).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.REPORT_NOT_FOUND, String.format("%s not found", reportId)));
    }

    private UserEntity getUserEntityOrException(String username){
        return userEntityRepository.findByUsername(username).orElseThrow(() ->
                new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not found", username)));
    }

    private UserEntity getAdminUserEntityOrThrow(String username) {
        UserEntity userEntity = getUserEntityOrException(username);
        if (userEntity.getRole() != UserRole.ADMIN) {
            throw new SnsApplicationException(ErrorCode.INVALID_PERMISSION, String.format("%s is not admin", username));
        }
        return userEntity;
    }
}
