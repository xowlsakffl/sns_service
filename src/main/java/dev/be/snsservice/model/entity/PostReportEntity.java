package dev.be.snsservice.model.entity;

import dev.be.snsservice.model.ReportReasonType;
import dev.be.snsservice.model.ReportStatus;
import java.sql.Timestamp;
import java.time.Instant;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "post_report", indexes = {
        @Index(name = "post_report_post_id_idx", columnList = "post_id"),
        @Index(name = "post_report_reporter_id_idx", columnList = "reporter_id")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private PostEntity post;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private UserEntity reporter;

    @ManyToOne
    @JoinColumn(name = "processed_by_user_id")
    private UserEntity processedByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_type", nullable = false)
    private ReportReasonType reasonType;

    @Column(name = "reason_detail", length = 500)
    private String reasonDetail;

    @Column(name = "registered_at")
    private Timestamp registeredAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @PrePersist
    void registeredAt() {
        this.registeredAt = Timestamp.from(Instant.now());
    }

    @PreUpdate
    void updatedAt() {
        this.updatedAt = Timestamp.from(Instant.now());
    }

    public static PostReportEntity of(PostEntity post, UserEntity reporter, ReportReasonType reasonType, String reasonDetail) {
        PostReportEntity entity = new PostReportEntity();
        entity.setPost(post);
        entity.setReporter(reporter);
        entity.setReasonType(reasonType);
        entity.setReasonDetail(reasonDetail);
        entity.setStatus(ReportStatus.PENDING);
        return entity;
    }
}
