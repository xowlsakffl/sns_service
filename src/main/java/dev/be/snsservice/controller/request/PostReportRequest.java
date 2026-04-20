package dev.be.snsservice.controller.request;

import dev.be.snsservice.model.ReportReasonType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PostReportRequest {

    @NotNull(message = "reasonType is required")
    private ReportReasonType reasonType;

    @Size(max = 500, message = "reasonDetail must be at most 500 characters")
    private String reasonDetail;
}
