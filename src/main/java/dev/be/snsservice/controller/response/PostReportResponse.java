package dev.be.snsservice.controller.response;

import dev.be.snsservice.model.PostReport;
import dev.be.snsservice.model.ReportStatus;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostReportResponse {
    private Integer id;
    private Integer postId;
    private Integer reporterId;
    private String reporterUsername;
    private ReportStatus status;
    private String reason;
    private Integer processedByUserId;
    private Timestamp registeredAt;
    private Timestamp updatedAt;

    public static PostReportResponse fromReport(PostReport report) {
        return new PostReportResponse(
                report.getId(),
                report.getPostId(),
                report.getReporterId(),
                report.getReporterUsername(),
                report.getStatus(),
                report.getReason(),
                report.getProcessedByUserId(),
                report.getRegisteredAt(),
                report.getUpdatedAt()
        );
    }
}
