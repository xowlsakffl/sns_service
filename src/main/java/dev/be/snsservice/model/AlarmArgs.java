package dev.be.snsservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlarmArgs {

    // 알람 발생시킨 사람
    private Integer fromUserId;
    private Integer targetId;
}
