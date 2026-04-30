package dev.be.snsservice.configuration;

import dev.be.snsservice.model.AlarmArgs;
import dev.be.snsservice.model.AlarmType;
import dev.be.snsservice.model.ReportReasonType;
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
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalDemoDataInitializer implements CommandLineRunner {

    private final UserEntityRepository userEntityRepository;
    private final PostEntityRepository postEntityRepository;
    private final CommentEntityRepository commentEntityRepository;
    private final LikeEntityRepository likeEntityRepository;
    private final AlarmEntityRepository alarmEntityRepository;
    private final PostReportEntityRepository postReportEntityRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userEntityRepository.count() > 0 || postEntityRepository.count() > 0) {
            return;
        }

        UserEntity admin = createUser("admin", "admin1234!", UserRole.ADMIN);
        UserEntity demo = createUser("demo", "password123!", UserRole.USER);
        UserEntity luna = createUser("luna", "password123!", UserRole.USER);
        UserEntity minho = createUser("minho", "password123!", UserRole.USER);
        UserEntity jisu = createUser("jisu", "password123!", UserRole.USER);
        UserEntity haein = createUser("haein", "password123!", UserRole.USER);

        List<PostEntity> posts = new ArrayList<>();
        posts.add(createPost(demo, "서울 야경 사진 스팟 추천", "한강이랑 남산 말고도 야경 예쁜 곳 많더라. 최근에 다녀온 곳 중에 사진 잘 나오는 스팟 정리해봤어."));
        posts.add(createPost(luna, "회사 근처 점심 루틴 공유", "월수금은 샐러드, 화목은 국밥으로 버티는 중. 다들 평일 점심 어떻게 해결하는지 궁금하다."));
        posts.add(createPost(minho, "주말 러닝 10km 기록", "비 오기 전에 뛰고 왔는데 페이스가 꽤 안정적이었다. 다음 목표는 하프마라톤."));
        posts.add(createPost(jisu, "React 상태 관리 정리 노트", "요즘은 무조건 큰 도구부터 넣기보다 화면 범위와 갱신 주기를 먼저 보는 편이 낫다고 느꼈다."));
        posts.add(createPost(haein, "집에서 브런치 해먹기", "에그인헬이 생각보다 쉬워서 자주 해먹는다. 토마토 소스만 괜찮으면 실패 확률이 낮다."));
        posts.add(createPost(demo, "이번 달 읽은 책 3권", "실무 글쓰기, 데이터 모델링, 인터랙션 디자인 책을 번갈아 읽었다. 정리해보니 공통점이 선명했다."));
        posts.add(createPost(luna, "퇴근 후 전시 후기", "사람이 너무 많지 않아서 오히려 좋았다. 조용하게 보고 나오기 괜찮았던 전시."));
        posts.add(createPost(minho, "사이드 프로젝트 배포 삽질", "도메인, 환경변수, 캐시 무효화 세 군데에서 계속 막혔다. 결국 로그를 끝까지 읽는 게 제일 빨랐다."));
        posts.add(createPost(jisu, "노트북 파우치 추천", "가볍고 충전기까지 같이 들어가는 걸 찾고 있는데, 너무 두꺼우면 들고 다니기 불편하더라."));
        posts.add(createPost(haein, "벚꽃 시즌 카메라 세팅", "아이폰도 충분하지만 노출만 조금 고정하면 결과가 안정적이었다."));
        posts.add(createPost(demo, "재택근무 집중 루틴", "오전엔 알림을 닫고, 점심 전에 가장 어려운 일 하나만 끝내는 방식이 생각보다 오래 간다."));
        posts.add(createPost(luna, "오늘의 플레이리스트", "출근길에는 템포 빠른 곡, 밤에는 잔잔한 인디로 넘어가는 식으로 듣고 있다."));
        postEntityRepository.saveAll(posts);

        commentEntityRepository.saveAll(List.of(
                CommentEntity.of(luna, posts.get(0), "응봉산도 괜찮아. 해 질 때 올라가면 색감 좋아."),
                CommentEntity.of(minho, posts.get(0), "북악스카이웨이 쪽도 찍기 좋았어."),
                CommentEntity.of(demo, posts.get(2), "10km 꾸준히 뛰는 거 자체가 대단하다."),
                CommentEntity.of(jisu, posts.get(3), "상태 범위 먼저 보는 거 동의. 괜히 전역부터 열면 복잡해져."),
                CommentEntity.of(haein, posts.get(4), "에그인헬은 빵만 있어도 한 끼 끝나지."),
                CommentEntity.of(minho, posts.get(7), "배포 이슈는 결국 로그가 답이라는 말이 맞다."),
                CommentEntity.of(luna, posts.get(10), "오전 집중 블록은 나도 써먹어봐야겠다."),
                CommentEntity.of(jisu, posts.get(11), "플레이리스트 공유해줘. 요즘 들을 게 부족했어.")
        ));

        likeEntityRepository.saveAll(List.of(
                LikeEntity.of(luna, posts.get(0)),
                LikeEntity.of(minho, posts.get(0)),
                LikeEntity.of(jisu, posts.get(0)),
                LikeEntity.of(haein, posts.get(1)),
                LikeEntity.of(demo, posts.get(2)),
                LikeEntity.of(luna, posts.get(2)),
                LikeEntity.of(minho, posts.get(3)),
                LikeEntity.of(haein, posts.get(3)),
                LikeEntity.of(jisu, posts.get(4)),
                LikeEntity.of(demo, posts.get(4)),
                LikeEntity.of(minho, posts.get(5)),
                LikeEntity.of(jisu, posts.get(5)),
                LikeEntity.of(haein, posts.get(5)),
                LikeEntity.of(demo, posts.get(6)),
                LikeEntity.of(minho, posts.get(7)),
                LikeEntity.of(luna, posts.get(8)),
                LikeEntity.of(jisu, posts.get(9)),
                LikeEntity.of(haein, posts.get(10)),
                LikeEntity.of(minho, posts.get(10)),
                LikeEntity.of(demo, posts.get(11))
        ));

        alarmEntityRepository.saveAll(List.of(
                AlarmEntity.of(demo, AlarmType.NEW_COMMENT_ON_POST, new AlarmArgs(luna.getId(), posts.get(0).getId())),
                AlarmEntity.of(demo, AlarmType.NEW_LIKE_ON_POST, new AlarmArgs(minho.getId(), posts.get(0).getId())),
                AlarmEntity.of(demo, AlarmType.NEW_COMMENT_ON_POST, new AlarmArgs(jisu.getId(), posts.get(5).getId())),
                AlarmEntity.of(demo, AlarmType.NEW_LIKE_ON_POST, new AlarmArgs(haein.getId(), posts.get(10).getId())),
                AlarmEntity.of(demo, AlarmType.NEW_COMMENT_ON_POST, new AlarmArgs(minho.getId(), posts.get(10).getId())),
                AlarmEntity.of(demo, AlarmType.NEW_LIKE_ON_POST, new AlarmArgs(luna.getId(), posts.get(11).getId()))
        ));

        postReportEntityRepository.saveAll(List.of(
                createReport(posts.get(7), luna, ReportReasonType.SPAM, "동일한 배포 홍보 문구가 반복적으로 올라옵니다.", ReportStatus.PENDING, null),
                createReport(posts.get(9), minho, ReportReasonType.ETC, "사진 본문과 상관없는 링크가 포함되어 있습니다.", ReportStatus.REJECTED, admin),
                createReport(posts.get(1), jisu, ReportReasonType.ABUSE, "댓글에서 공격적인 반응을 유도할 수 있어 보여요.", ReportStatus.ACCEPTED, admin)
        ));
    }

    private UserEntity createUser(String username, String rawPassword, UserRole role) {
        UserEntity entity = UserEntity.of(username, passwordEncoder.encode(rawPassword));
        entity.setRole(role);
        return userEntityRepository.save(entity);
    }

    private PostEntity createPost(UserEntity user, String title, String body) {
        return PostEntity.of(title, body, user);
    }

    private PostReportEntity createReport(
            PostEntity post,
            UserEntity reporter,
            ReportReasonType reasonType,
            String reasonDetail,
            ReportStatus status,
            UserEntity processedBy
    ) {
        PostReportEntity entity = PostReportEntity.of(post, reporter, reasonType, reasonDetail);
        entity.setStatus(status);
        entity.setProcessedByUser(processedBy);
        return entity;
    }
}
