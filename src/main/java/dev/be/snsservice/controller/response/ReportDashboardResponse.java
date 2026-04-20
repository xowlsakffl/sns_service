package dev.be.snsservice.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportDashboardResponse {
    private long totalReports;
    private long pendingReports;
    private long acceptedReports;
    private long rejectedReports;

    private long spamReports;
    private long abuseReports;
    private long sexualReports;
    private long hateReports;
    private long etcReports;

    private long blindedPosts;
    private long todayReports;
}
