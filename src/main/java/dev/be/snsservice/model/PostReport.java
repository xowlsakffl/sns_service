package dev.be.snsservice.model;

import dev.be.snsservice.model.entity.PostReportEntity;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostReport {
    private Integer id;
    private Integer postId;
    private Integer reporterId;
    private String reporterUsername;
    private ReportStatus status;
    private String reason;
    private Integer processedByUserId;
    private Timestamp registeredAt;
    private Timestamp updatedAt;

    public static PostReport fromEntity(PostReportEntity entity) {
        return new PostReport(
                entity.getId(),
                entity.getPost().getId(),
                entity.getReporter().getId(),
                entity.getReporter().getUsername(),
                entity.getStatus(),
                entity.getReason(),
                entity.getProcessedByUser() != null ? entity.getProcessedByUser().getId() : null,
                entity.getRegisteredAt(),
                entity.getUpdatedAt()
        );
    }
}
