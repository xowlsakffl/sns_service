package dev.be.snsservice.repository;

import dev.be.snsservice.model.ReportReasonType;
import dev.be.snsservice.model.ReportStatus;
import dev.be.snsservice.model.entity.PostEntity;
import dev.be.snsservice.model.entity.PostReportEntity;
import dev.be.snsservice.model.entity.UserEntity;
import java.sql.Timestamp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PostReportEntityRepository extends JpaRepository<PostReportEntity, Integer>, JpaSpecificationExecutor<PostReportEntity> {
    boolean existsByPostAndReporterAndStatus(PostEntity post, UserEntity reporter, ReportStatus status);
    long countByPostAndStatus(PostEntity post, ReportStatus status);
    long countByStatus(ReportStatus status);
    long countByReasonType(ReportReasonType reasonType);
    long countByRegisteredAtAfter(Timestamp registeredAt);
}
